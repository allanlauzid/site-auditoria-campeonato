/**
 * gemini-assistant.js — ES module
 *
 * Frontend do assistente de IA (Gemini) do portal. Este arquivo NUNCA guarda
 * nem envia uma chave de API do Gemini — ele apenas chama um proxy serverless
 * próprio (geminiProxyEndpoint, lido de /data/site-config.json). O proxy
 * (código de exemplo em portal-v1/serverless-proxy-exemplo/) é quem guarda a
 * GEMINI_API_KEY como variável de ambiente e chama a API do Gemini de fato.
 *
 * Regras de segurança seguidas aqui:
 *  - Nenhuma chave/API key em qualquer literal deste arquivo.
 *  - Nenhuma escrita em localStorage/sessionStorage: o histórico da conversa
 *    vive só em memória (variável JS), perdido ao recarregar a página — isso
 *    é aceitável e intencional (nunca persistir conteúdo de conversa/IA no
 *    navegador).
 *  - Nenhum innerHTML com texto vindo da API ou do usuário: toda inserção de
 *    texto no DOM usa textContent (ver renderMessage()), evitando XSS.
 *
 * Duas "montagens" desta mesma lógica coexistem na página:
 *  - variant="modal"  → painel modal (botão flutuante, todas as páginas exceto home)
 *  - variant="inline" → janela embutida no hero (somente index.html)
 * Cada uma tem seu próprio estado de conversa independente.
 */

const SITE_CONFIG_URL = "/data/site-config.json";
const MAX_CONTEXT_CHARS = 4000;
const FETCH_TIMEOUT_MS = 20000;

/* ------------------------------------------------------------------ *
 * 1. CONFIGURAÇÃO
 * ------------------------------------------------------------------ */
let cachedConfig = null;

async function loadSiteConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch(SITE_CONFIG_URL);
    if (!res.ok) throw new Error(`site-config.json HTTP ${res.status}`);
    cachedConfig = await res.json();
  } catch (err) {
    console.error("[gemini-assistant.js] Falha ao carregar site-config.json:", err);
    cachedConfig = { geminiProxyEndpoint: "" };
  }
  return cachedConfig;
}

/* ------------------------------------------------------------------ *
 * 2. EXTRAÇÃO DO CONTEXTO DA PÁGINA ATUAL
 * ------------------------------------------------------------------ */
function extractPageContext() {
  const titleEl = document.querySelector("main h1") || document.querySelector("h1");
  const title = titleEl ? titleEl.textContent.trim() : document.title;

  const categoriaEl = document.querySelector(".doc-content > header .card__eyebrow, main .card__eyebrow");
  const categoria = categoriaEl ? categoriaEl.textContent.trim() : "";

  const mainEl = document.querySelector("main");
  let bodyText = "";
  if (mainEl) {
    const clone = mainEl.cloneNode(true);
    clone.querySelectorAll("script, style, nav, footer, .gemini-hero-window, .gemini-modal-overlay, [data-gemini-root]").forEach((el) => el.remove());
    bodyText = clone.textContent.replace(/\s+/g, " ").trim();
  }
  if (bodyText.length > MAX_CONTEXT_CHARS) {
    bodyText = bodyText.slice(0, MAX_CONTEXT_CHARS) + "…";
  }

  return {
    url: window.location.pathname,
    titulo: title,
    categoria,
    conteudo: bodyText,
  };
}

/* ------------------------------------------------------------------ *
 * 3. RENDERIZAÇÃO SEGURA DE MENSAGENS (sem innerHTML de texto externo)
 * ------------------------------------------------------------------ */
function renderMessage(container, role, text) {
  const bubble = document.createElement("div");
  bubble.className = `gemini-message gemini-message--${role}`;
  bubble.textContent = text; // nunca innerHTML — evita XSS
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

/**
 * Renderiza uma bolha de erro (.gemini-message--error), com um botão
 * "Tentar novamente" que reenvia a última pergunta. O retry é sempre manual
 * (nunca automático) e nunca deixa o campo de entrada travado.
 */
function renderErrorMessage(container, text, onRetry) {
  const bubble = document.createElement("div");
  bubble.className = "gemini-message gemini-message--error";

  const p = document.createElement("p");
  p.style.margin = "0";
  p.textContent = text;
  bubble.appendChild(p);

  if (typeof onRetry === "function") {
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "gemini-message__retry";
    retryBtn.textContent = "Tentar novamente";
    retryBtn.addEventListener("click", () => onRetry());
    bubble.appendChild(retryBtn);
  }

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

/* ------------------------------------------------------------------ *
 * 3b. TRATAMENTO CENTRAL DE ERROS
 * ------------------------------------------------------------------ *
 * Mapeia o resultado de uma tentativa de fala com o proxy — seja uma
 * exceção de fetch (rede/timeout) ou uma resposta HTTP com corpo de erro
 * padronizado ({ erro: true, codigo, mensagem }) — para uma mensagem
 * amigável em português, sem detalhes técnicos sensíveis. Nunca expõe
 * stack traces, URLs internas ou qualquer menção a chave de API.
 */
const ERROR_MESSAGES_BY_CODE = {
  AUTH_ERROR:
    "O serviço do assistente está com um problema de configuração no momento. A equipe já foi avisada; tente novamente mais tarde.",
  RATE_LIMIT:
    "O assistente recebeu muitas perguntas em pouco tempo. Aguarde um momento e tente novamente.",
  SERVER_ERROR:
    "O assistente está indisponível no momento. Tente novamente em instantes.",
  SAFETY_BLOCKED:
    "Não foi possível gerar uma resposta para essa pergunta. Tente reformular.",
  EMPTY_RESPONSE:
    "O assistente não encontrou o que responder. Tente reformular a pergunta.",
  REQUEST_TOO_LARGE:
    "Sua pergunta (ou o conteúdo desta página) é longa demais para o assistente processar. Tente encurtar a pergunta.",
  INVALID_REQUEST:
    "Não foi possível processar essa solicitação. Tente reformular a pergunta.",
};

const GENERIC_ERROR_MESSAGE =
  "Não foi possível concluir sua solicitação agora. Tente novamente em instantes.";

const NETWORK_ERROR_MESSAGE =
  "Não foi possível falar com o assistente agora. Verifique sua conexão e tente novamente.";

const TIMEOUT_ERROR_MESSAGE =
  "O assistente demorou demais para responder. Tente novamente em instantes.";

const NOT_CONFIGURED_ERROR_MESSAGE =
  "Assistente ainda não configurado. Configure o endpoint do proxy em data/site-config.json.";

/**
 * Resolve a mensagem amigável a exibir para um erro ocorrido ao consultar o
 * assistente.
 *  - Se `errorInfo.kind === "abort"` → timeout explícito (AbortController).
 *  - Se `errorInfo.kind === "network"` → falha de fetch (sem resposta HTTP;
 *    rede indisponível, proxy fora do ar, CORS bloqueado no browser, etc.).
 *  - Se `errorInfo.kind === "http"` → resposta HTTP recebida; tenta ler o
 *    corpo padronizado { erro, codigo, mensagem } e mapear por `codigo`,
 *    com fallback por status HTTP e, por fim, fallback genérico.
 */
function resolveErrorMessage(errorInfo) {
  if (errorInfo.kind === "abort") {
    return TIMEOUT_ERROR_MESSAGE;
  }
  if (errorInfo.kind === "network") {
    return NETWORK_ERROR_MESSAGE;
  }
  if (errorInfo.kind === "http") {
    const codigo = errorInfo.codigo;
    if (codigo && ERROR_MESSAGES_BY_CODE[codigo]) {
      return ERROR_MESSAGES_BY_CODE[codigo];
    }
    // Fallback por status HTTP, caso o corpo não venha no formato esperado.
    switch (errorInfo.status) {
      case 401:
      case 403:
        return ERROR_MESSAGES_BY_CODE.AUTH_ERROR;
      case 413:
        return ERROR_MESSAGES_BY_CODE.REQUEST_TOO_LARGE;
      case 429:
        return ERROR_MESSAGES_BY_CODE.RATE_LIMIT;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES_BY_CODE.SERVER_ERROR;
      default:
        return GENERIC_ERROR_MESSAGE;
    }
  }
  return GENERIC_ERROR_MESSAGE;
}

function clearEmptyState(container) {
  const empty = container.querySelector(".gemini-messages__empty");
  if (empty) empty.remove();
}

function renderEmptyState(container) {
  if (container.children.length > 0) return;
  const p = document.createElement("p");
  p.className = "gemini-messages__empty";
  p.textContent = "Pergunte algo sobre esta página ou sobre o portal.";
  container.appendChild(p);
}

/* ------------------------------------------------------------------ *
 * 4. FETCH COM TIMEOUT
 * ------------------------------------------------------------------ */
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ *
 * 5. FOCO PRESO (apenas para variant="modal")
 * ------------------------------------------------------------------ */
function trapFocus(overlay, panel) {
  function handleKeydown(event) {
    if (event.key !== "Tab") return;
    const focusable = panel.querySelectorAll(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  overlay.addEventListener("keydown", handleKeydown);
}

/* ------------------------------------------------------------------ *
 * 6. INSTÂNCIA DO ASSISTENTE (compartilhada por modal e inline)
 * ------------------------------------------------------------------ */
function initInstance(root) {
  const variant = root.dataset.geminiVariant || "modal";
  const messagesEl = root.querySelector("[data-gemini-messages]");
  const statusEl = root.querySelector("[data-gemini-status]");
  const form = root.querySelector("[data-gemini-form]");
  const input = root.querySelector("[data-gemini-input]");
  const sendBtn = root.querySelector("[data-gemini-send]");

  if (!messagesEl || !form || !input || !sendBtn) return;

  /** Histórico em memória apenas — nunca localStorage/sessionStorage. */
  const historico = [];
  let isSending = false;

  renderEmptyState(messagesEl);

  function setStatus(text) {
    if (!statusEl) return;
    if (!text) {
      statusEl.hidden = true;
      statusEl.textContent = "";
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = "";
    const label = document.createElement("span");
    label.textContent = text;
    const dots = document.createElement("span");
    dots.className = "gemini-status__dots";
    dots.innerHTML = "<span></span><span></span><span></span>"; // markup estático, sem dado externo
    statusEl.appendChild(label);
    statusEl.appendChild(dots);
  }

  function setSending(sending) {
    isSending = sending;
    sendBtn.disabled = sending;
    input.disabled = sending;
    setStatus(sending ? "Assistente está digitando" : "");
  }

  /**
   * Envia `pergunta` ao proxy e trata a resposta/erro. Não mexe no histórico
   * de mensagens do usuário nem no input — isso é responsabilidade de quem
   * chama (handleSubmit na primeira tentativa, o botão "Tentar novamente"
   * nas seguintes). Qualquer erro aqui é tratado e nunca propaga para fora,
   * então uma falha nunca quebra o estado da conversa nem trava o painel.
   */
  async function sendPergunta(pergunta) {
    setSending(true);

    const config = await loadSiteConfig();
    const endpoint = (config.geminiProxyEndpoint || "").trim();

    if (!endpoint) {
      renderErrorMessage(messagesEl, NOT_CONFIGURED_ERROR_MESSAGE, null);
      setSending(false);
      return;
    }

    let errorInfo = null;
    let resposta = null;

    try {
      const res = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pergunta,
            contextoPagina: extractPageContext(),
            historico,
          }),
        },
        FETCH_TIMEOUT_MS
      );

      let data = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error("[gemini-assistant.js] Resposta do proxy não é um JSON válido:", parseErr);
        errorInfo = { kind: "http", status: res.status, codigo: null };
      }

      if (!errorInfo) {
        if (!res.ok || data?.erro) {
          errorInfo = { kind: "http", status: res.status, codigo: data?.codigo || null };
        } else {
          const texto = typeof data?.resposta === "string" ? data.resposta.trim() : "";
          if (!texto) {
            errorInfo = { kind: "http", status: res.status, codigo: "EMPTY_RESPONSE" };
          } else {
            resposta = texto;
          }
        }
      }
    } catch (err) {
      const isAbort = err && err.name === "AbortError";
      console.error("[gemini-assistant.js] Erro ao consultar o assistente:", err);
      errorInfo = { kind: isAbort ? "abort" : "network" };
    }

    if (errorInfo) {
      renderErrorMessage(messagesEl, resolveErrorMessage(errorInfo), () => {
        sendPergunta(pergunta);
      });
    } else {
      renderMessage(messagesEl, "assistant", resposta);
      historico.push({ papel: "assistente", texto: resposta });
    }

    setSending(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSending) return;
    const pergunta = input.value.trim();
    if (!pergunta) return;

    clearEmptyState(messagesEl);
    renderMessage(messagesEl, "user", pergunta);
    historico.push({ papel: "usuario", texto: pergunta });
    input.value = "";
    autoGrow(input);

    await sendPergunta(pergunta);
  }

  function autoGrow(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  form.addEventListener("submit", handleSubmit);
  input.addEventListener("input", () => autoGrow(input));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  if (variant === "modal") {
    const overlay = root.closest(".modal-overlay");
    if (overlay) {
      trapFocus(overlay, root);
      // Foca o campo de entrada sempre que o modal é aberto (observa data-open).
      const observer = new MutationObserver(() => {
        if (overlay.dataset.open === "true") {
          window.requestAnimationFrame(() => input.focus());
        }
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ["data-open"] });
    }
  }
}

/* ------------------------------------------------------------------ *
 * BOOTSTRAP — inicializa toda instância presente na página (botão
 * flutuante/modal e/ou janela inline do hero).
 * ------------------------------------------------------------------ */
export function initGeminiAssistant() {
  const roots = document.querySelectorAll("[data-gemini-root]");
  roots.forEach((root) => initInstance(root));
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initGeminiAssistant);
}
