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
 *  - variant="modal"  → painel ANCORADO ao botão flutuante, canto inferior
 *    direito (todas as páginas exceto home). Apesar do nome histórico da
 *    variante ("modal", reaproveitado de data-gemini-variant e da classe
 *    .modal/.modal-overlay do design system), ele NÃO é modal de verdade:
 *    não escurece nem bloqueia o resto da página (ver .gemini-modal-overlay
 *    no design-system.css) e usa role="dialog" com aria-modal="false" no
 *    HTML. Fecha com o botão "X", clicando de novo no fab (toggle) ou com
 *    Escape — mas NÃO ao clicar fora (ver initModal() em navigation.js).
 *  - variant="inline" → janela embutida no hero (somente index.html)
 * Cada uma tem seu próprio estado de conversa independente.
 */

import { salvarConversa, listarConversas, carregarConversa, excluirConversa } from "./supabase-client.js";

const SITE_CONFIG_URL = "/data/site-config.json";
const DOCUMENTS_URL = "/data/documents.json";
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
 * 2. EXTRAÇÃO DO CONTEXTO DE UMA PÁGINA (atual OU buscada via fetch)
 * ------------------------------------------------------------------ *
 * extractContentFromDocument() é a função genérica: aceita qualquer
 * `Document` (window.document para a página atual, ou o resultado de
 * `new DOMParser().parseFromString(html, "text/html")` para o HTML de um
 * documento buscado via fetch — ver fetchTopicContext() mais abaixo).
 * extractPageContext() é só um atalho que chama a genérica com a página
 * atual, mantendo o comportamento padrão/default de sempre (analisar a
 * página que o usuário está vendo agora).
 */
function extractContentFromDocument(doc, urlOverride) {
  const titleEl = doc.querySelector("main h1") || doc.querySelector("h1");
  const title = titleEl ? titleEl.textContent.trim() : doc.title;

  const categoriaEl = doc.querySelector(".doc-content > header .card__eyebrow, main .card__eyebrow");
  const categoria = categoriaEl ? categoriaEl.textContent.trim() : "";

  const mainEl = doc.querySelector("main");
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
    url: urlOverride || (doc === window.document ? window.location.pathname : ""),
    titulo: title,
    categoria,
    conteudo: bodyText,
  };
}

function extractPageContext() {
  return extractContentFromDocument(window.document);
}

/* ------------------------------------------------------------------ *
 * 2b. ÍNDICE DE TÓPICOS (data/documents.json) — usado pelo filtro de
 * tópico do painel (ver initFilterUI() mais abaixo). Cache em memória,
 * compartilhado por todas as instâncias do assistente na página.
 * ------------------------------------------------------------------ */
let cachedDocumentsIndex = null;

async function loadDocumentsIndex() {
  if (cachedDocumentsIndex) return cachedDocumentsIndex;
  try {
    const res = await fetch(DOCUMENTS_URL);
    if (!res.ok) throw new Error(`documents.json HTTP ${res.status}`);
    cachedDocumentsIndex = await res.json();
  } catch (err) {
    console.error("[gemini-assistant.js] Falha ao carregar documents.json:", err);
    cachedDocumentsIndex = { categories: [], documents: [] };
  }
  return cachedDocumentsIndex;
}

/**
 * Busca (fetch) o HTML de um documento do índice, faz parse via DOMParser e
 * reaproveita extractContentFromDocument() para extrair título/categoria/
 * conteúdo — a MESMA extração usada para a página atual, só que aplicada a
 * um Document "arbitrário" (o HTML buscado) em vez de window.document.
 */
async function fetchTopicContext(doc) {
  const res = await fetchWithTimeout(doc.url, {}, FETCH_TIMEOUT_MS);
  if (!res.ok) throw new Error(`Falha ao buscar ${doc.url}: HTTP ${res.status}`);
  const html = await res.text();
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const extracted = extractContentFromDocument(parsed, doc.url);
  return {
    url: doc.url,
    titulo: doc.titulo || extracted.titulo,
    categoria: doc.categoria || extracted.categoria,
    conteudo: extracted.conteudo,
  };
}

/**
 * Monta o contexto "Site inteiro": não é o texto integral dos ~22
 * documentos (estouraria MAX_CONTEXTO_CHARS do proxy) — é uma lista
 * compacta "Título — Categoria — Grupo" de cada documento do índice,
 * truncada com reticências caso ainda assim ultrapasse o limite.
 */
function buildSiteWideContext(documentsIndex) {
  const categoryLabelById = new Map(
    (documentsIndex.categories || []).map((c) => [c.id, c.label])
  );
  const linhas = (documentsIndex.documents || []).map((d) => {
    const categoriaLabel = categoryLabelById.get(d.categoria) || d.categoria || "";
    return `${d.titulo} — ${categoriaLabel} — ${d.grupoPrimario || ""}`;
  });
  let conteudo = linhas.join("\n");
  if (conteudo.length > MAX_CONTEXT_CHARS) {
    conteudo = conteudo.slice(0, MAX_CONTEXT_CHARS) + "…";
  }
  return {
    url: "site-inteiro",
    titulo: "Site inteiro (resumo agregado de todos os documentos)",
    categoria: "todas",
    conteudo,
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
  const newBtn = root.querySelector("[data-gemini-new]");
  const saveBtn = root.querySelector("[data-gemini-save]");
  const historyBtn = root.querySelector("[data-gemini-history]");
  const saveFeedbackEl = root.querySelector("[data-gemini-save-feedback]");
  const chatViewEl = root.querySelector("[data-gemini-view-chat]");
  const historyViewEl = root.querySelector("[data-gemini-view-history]");
  const historyListEl = root.querySelector("[data-gemini-history-list]");
  const filterToggleBtn = root.querySelector("[data-gemini-filter-toggle]");
  const filterPanelEl = root.querySelector("[data-gemini-filter-panel]");
  const filterChipEl = root.querySelector("[data-gemini-filter-chip]");

  if (!messagesEl || !form || !input || !sendBtn) return;

  /** Histórico em memória apenas — nunca localStorage/sessionStorage. */
  const historico = [];
  let isSending = false;
  /** Estado da conversa atual: null até a primeira vez que salvar/carregar. */
  let conversaAtualId = null;
  let saveFeedbackTimer = null;

  /* ---------------------------------------------------------------- *
   * FILTRO DE TÓPICO — estado da CONVERSA atual (variável JS de sessão,
   * nunca localStorage). null = comportamento padrão (analisa a página
   * atual). { tipo: "site" } = resumo agregado do site inteiro.
   * { tipo: "topico", doc } = conteúdo de um documento específico do
   * índice (documents.json), buscado via fetch mesmo que o usuário não
   * esteja naquela página.
   * ---------------------------------------------------------------- */
  let filtroAtivo = null;
  /** Cache em memória do conteúdo já buscado por id de tópico — evita
   *  refazer fetch a cada pergunta enquanto o mesmo filtro está ativo. */
  const topicContextCache = new Map();
  let siteWideContextCache = null;

  renderEmptyState(messagesEl);
  updateSaveButtonState();
  initFilterUI();

  /* ---------------------------------------------------------------- *
   * NOVA CONVERSA / SALVAR / HISTÓRICO
   * ---------------------------------------------------------------- */
  function updateSaveButtonState() {
    if (!saveBtn) return;
    saveBtn.disabled = historico.length === 0;
  }

  function showSaveFeedback(text, isError) {
    if (!saveFeedbackEl) return;
    if (saveFeedbackTimer) {
      clearTimeout(saveFeedbackTimer);
      saveFeedbackTimer = null;
    }
    saveFeedbackEl.hidden = false;
    saveFeedbackEl.textContent = text;
    saveFeedbackEl.classList.toggle("gemini-save-feedback--error", !!isError);
    saveFeedbackTimer = window.setTimeout(() => {
      saveFeedbackEl.hidden = true;
      saveFeedbackEl.textContent = "";
      saveFeedbackTimer = null;
    }, 2000);
  }

  function clearMessagesUI() {
    messagesEl.innerHTML = "";
    renderEmptyState(messagesEl);
  }

  function novaConversa() {
    historico.length = 0;
    conversaAtualId = null;
    clearMessagesUI();
    updateSaveButtonState();
    showView("chat");
    // Reseta o filtro de tópico de volta ao padrão (página atual).
    filtroAtivo = null;
    updateFilterChip();
    closeFilterPanel();
  }

  async function salvarConversaAtual() {
    if (!saveBtn || saveBtn.disabled || isSending) return;
    saveBtn.disabled = true;
    const resultado = await salvarConversa({ id: conversaAtualId, mensagens: historico });
    updateSaveButtonState();
    if (resultado.sucesso) {
      conversaAtualId = resultado.id;
      showSaveFeedback("Conversa salva", false);
    } else {
      showSaveFeedback(resultado.erro || "Não foi possível salvar a conversa agora.", true);
    }
  }

  /**
   * Salvamento AUTOMÁTICO (autosave), disparado logo após cada resposta do
   * assistente ser recebida com sucesso. Fire-and-forget: não bloqueia a UI,
   * não mostra popup/feedback visual algum (isso é exclusivo do clique
   * manual no botão "Salvar", ver salvarConversaAtual acima) e qualquer
   * erro é apenas logado no console — nunca interrompe a conversa nem
   * trava o campo de entrada. Reaproveita a mesma lógica de INSERT/UPDATE
   * (upsert por id) de salvarConversa: primeira vez → id null → INSERT;
   * vezes seguintes → id presente → UPDATE.
   */
  async function autoSalvarConversa() {
    if (historico.length === 0) return;
    try {
      const resultado = await salvarConversa({ id: conversaAtualId, mensagens: historico });
      if (resultado.sucesso) {
        conversaAtualId = resultado.id;
        updateSaveButtonState();
      } else {
        console.warn("[gemini-assistant.js] Autosave falhou:", resultado.erro);
      }
    } catch (err) {
      console.error("[gemini-assistant.js] Erro inesperado no autosave:", err);
    }
  }

  function showView(view) {
    if (!chatViewEl || !historyViewEl) return;
    const isHistory = view === "history";
    chatViewEl.hidden = isHistory;
    historyViewEl.hidden = !isHistory;
    if (historyBtn) {
      historyBtn.setAttribute("aria-pressed", String(isHistory));
      historyBtn.title = isHistory ? "Voltar para a conversa" : "Histórico";
    }
  }

  function formatarDataHora(isoString) {
    const data = new Date(isoString);
    if (Number.isNaN(data.getTime())) return { data: "", hora: "" };
    const dataFormatada = data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const horaFormatada = data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { data: dataFormatada, hora: horaFormatada };
  }

  /**
   * Substitui temporariamente o conteúdo de um item da lista de histórico
   * por uma confirmação inline ("Excluir esta conversa? [Confirmar]
   * [Cancelar]"). Ao confirmar, chama excluirConversa(id); se der certo,
   * remove o item da lista e, se a conversa excluída era a que está aberta
   * no momento (conversaAtualId), reseta o chat para uma conversa nova
   * vazia.
   */
  function pedirConfirmacaoExclusao(itemEl, id) {
    const conteudoOriginal = Array.from(itemEl.children);
    itemEl.innerHTML = "";

    const confirmWrap = document.createElement("div");
    confirmWrap.className = "gemini-history__confirm";

    const texto = document.createElement("span");
    texto.className = "gemini-history__confirm-text";
    texto.textContent = "Excluir esta conversa?";

    const confirmarBtn = document.createElement("button");
    confirmarBtn.type = "button";
    confirmarBtn.className = "gemini-history__confirm-btn gemini-history__confirm-btn--danger";
    confirmarBtn.textContent = "Confirmar";

    const cancelarBtn = document.createElement("button");
    cancelarBtn.type = "button";
    cancelarBtn.className = "gemini-history__confirm-btn";
    cancelarBtn.textContent = "Cancelar";

    function restaurarItem() {
      itemEl.innerHTML = "";
      conteudoOriginal.forEach((el) => itemEl.appendChild(el));
    }

    cancelarBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      restaurarItem();
    });

    confirmarBtn.addEventListener("click", async (event) => {
      event.stopPropagation();
      confirmarBtn.disabled = true;
      cancelarBtn.disabled = true;
      const resultado = await excluirConversa(id);
      if (!resultado.sucesso) {
        showSaveFeedback(resultado.erro || "Não foi possível excluir essa conversa agora.", true);
        restaurarItem();
        return;
      }
      itemEl.remove();
      if (id === conversaAtualId) {
        novaConversa();
      }
    });

    confirmWrap.appendChild(texto);
    confirmWrap.appendChild(confirmarBtn);
    confirmWrap.appendChild(cancelarBtn);
    itemEl.appendChild(confirmWrap);
  }

  async function abrirHistorico() {
    if (historyViewEl && !historyViewEl.hidden) {
      showView("chat");
      return;
    }
    showView("history");
    if (!historyListEl) return;
    historyListEl.innerHTML = "";
    const carregando = document.createElement("p");
    carregando.className = "gemini-history__empty";
    carregando.textContent = "Carregando histórico...";
    historyListEl.appendChild(carregando);

    const resultado = await listarConversas({ limite: 50 });
    historyListEl.innerHTML = "";

    if (!resultado.sucesso) {
      const erro = document.createElement("p");
      erro.className = "gemini-history__empty";
      erro.textContent = resultado.erro || "Não foi possível carregar o histórico agora.";
      historyListEl.appendChild(erro);
      return;
    }

    if (!resultado.dados || resultado.dados.length === 0) {
      const vazio = document.createElement("p");
      vazio.className = "gemini-history__empty";
      vazio.textContent = "Nenhuma conversa salva ainda.";
      historyListEl.appendChild(vazio);
      return;
    }

    /* Agrupa por data (dd/mm/aaaa), preservando a ordem já vinda do backend
       (mais recentes primeiro). */
    const grupos = new Map();
    resultado.dados.forEach((conversa) => {
      const { data, hora } = formatarDataHora(conversa.criado_em);
      if (!grupos.has(data)) grupos.set(data, []);
      grupos.get(data).push({ ...conversa, hora });
    });

    grupos.forEach((itens, dataLabel) => {
      const grupoEl = document.createElement("div");
      grupoEl.className = "gemini-history__group";

      const dataEl = document.createElement("p");
      dataEl.className = "gemini-history__date";
      dataEl.textContent = dataLabel;
      grupoEl.appendChild(dataEl);

      const listaEl = document.createElement("ul");
      listaEl.className = "gemini-history__items";

      itens.forEach((conversa) => {
        const itemEl = document.createElement("li");
        itemEl.className = "gemini-history__row";

        const btnEl = document.createElement("button");
        btnEl.type = "button";
        btnEl.className = "gemini-history__item";

        const tituloEl = document.createElement("span");
        tituloEl.className = "gemini-history__item-title";
        tituloEl.textContent = conversa.titulo || "Conversa sem título";

        const horaEl = document.createElement("span");
        horaEl.className = "gemini-history__item-time";
        horaEl.textContent = conversa.hora;

        btnEl.appendChild(tituloEl);
        btnEl.appendChild(horaEl);
        btnEl.addEventListener("click", () => carregarConversaNaTela(conversa.id));

        const deleteBtnEl = document.createElement("button");
        deleteBtnEl.type = "button";
        deleteBtnEl.className = "gemini-history__item-delete";
        deleteBtnEl.setAttribute("aria-label", "Excluir esta conversa");
        deleteBtnEl.title = "Excluir conversa";
        deleteBtnEl.innerHTML =
          '<svg class="icon icon-delete" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false"><line x1="5" y1="7" x2="19" y2="7"/><path d="M7.5 7 V5.5 H16.5 V7"/><path d="M6.5 7 L7.5 20 H16.5 L17.5 7"/><line x1="10" y1="10" x2="10" y2="17"/><line x1="14" y1="10" x2="14" y2="17"/></svg>'; // markup estático, sem dado externo — mesmo padrão de setStatus()
        deleteBtnEl.addEventListener("click", (event) => {
          event.stopPropagation();
          pedirConfirmacaoExclusao(itemEl, conversa.id);
        });

        itemEl.appendChild(btnEl);
        itemEl.appendChild(deleteBtnEl);
        listaEl.appendChild(itemEl);
      });

      grupoEl.appendChild(listaEl);
      historyListEl.appendChild(grupoEl);
    });
  }

  async function carregarConversaNaTela(id) {
    const resultado = await carregarConversa(id);
    if (!resultado.sucesso || !resultado.dados) {
      showSaveFeedback(resultado.erro || "Não foi possível carregar essa conversa agora.", true);
      return;
    }

    historico.length = 0;
    (resultado.dados.mensagens || []).forEach((m) => historico.push(m));
    conversaAtualId = resultado.dados.id;

    messagesEl.innerHTML = "";
    if (historico.length === 0) {
      renderEmptyState(messagesEl);
    } else {
      historico.forEach((m) => {
        const role = m.papel === "usuario" ? "user" : "assistant";
        renderMessage(messagesEl, role, m.texto);
      });
    }
    updateSaveButtonState();
    showView("chat");
  }

  /* ---------------------------------------------------------------- *
   * FILTRO DE TÓPICO — UI (botão retrátil + lista agrupada + chip)
   * ---------------------------------------------------------------- */
  function initFilterUI() {
    if (!filterToggleBtn || !filterPanelEl) return;
    filterToggleBtn.addEventListener("click", toggleFilterPanel);
    updateFilterChip();
  }

  function toggleFilterPanel() {
    if (filterPanelEl.hidden) {
      openFilterPanel();
    } else {
      closeFilterPanel();
    }
  }

  function closeFilterPanel() {
    if (!filterPanelEl) return;
    filterPanelEl.hidden = true;
    if (filterToggleBtn) filterToggleBtn.setAttribute("aria-expanded", "false");
  }

  async function openFilterPanel() {
    filterPanelEl.hidden = false;
    if (filterToggleBtn) filterToggleBtn.setAttribute("aria-expanded", "true");
    await renderFilterPanel();
  }

  async function renderFilterPanel() {
    filterPanelEl.innerHTML = "";
    const carregando = document.createElement("p");
    carregando.className = "gemini-filter-panel__empty";
    carregando.textContent = "Carregando tópicos...";
    filterPanelEl.appendChild(carregando);

    const documentsIndex = await loadDocumentsIndex();
    filterPanelEl.innerHTML = "";

    if (!documentsIndex.documents || documentsIndex.documents.length === 0) {
      const erro = document.createElement("p");
      erro.className = "gemini-filter-panel__empty";
      erro.textContent = "Não foi possível carregar a lista de tópicos agora.";
      filterPanelEl.appendChild(erro);
      return;
    }

    const list = document.createElement("ul");
    list.className = "gemini-filter-list";

    // Opção fixa "Site inteiro", sempre no topo, com destaque visual.
    const siteWideItem = document.createElement("li");
    const siteWideBtn = document.createElement("button");
    siteWideBtn.type = "button";
    siteWideBtn.className = "gemini-filter-item gemini-filter-item--sitewide";
    siteWideBtn.textContent = "Site inteiro";
    siteWideBtn.addEventListener("click", () => selectFilter({ tipo: "site" }));
    siteWideItem.appendChild(siteWideBtn);
    list.appendChild(siteWideItem);

    // Grupos por categoria, na ordem/rótulos definidos em documents.json.
    (documentsIndex.categories || []).forEach((categoria) => {
      const docsDaCategoria = documentsIndex.documents.filter((d) => d.categoria === categoria.id);
      if (docsDaCategoria.length === 0) return;

      const groupItem = document.createElement("li");
      groupItem.className = "gemini-filter-group";

      const groupLabel = document.createElement("p");
      groupLabel.className = "gemini-filter-group__label";
      groupLabel.textContent = categoria.label;
      groupItem.appendChild(groupLabel);

      const groupList = document.createElement("ul");
      groupList.className = "gemini-filter-group__items";

      docsDaCategoria.forEach((doc) => {
        const docItem = document.createElement("li");
        const docBtn = document.createElement("button");
        docBtn.type = "button";
        docBtn.className = "gemini-filter-item";
        docBtn.textContent = doc.titulo;
        docBtn.addEventListener("click", () => selectFilter({ tipo: "topico", doc }));
        docItem.appendChild(docBtn);
        groupList.appendChild(docItem);
      });

      groupItem.appendChild(groupList);
      list.appendChild(groupItem);
    });

    filterPanelEl.appendChild(list);
  }

  function selectFilter(filtro) {
    filtroAtivo = filtro;
    updateFilterChip();
    closeFilterPanel();
  }

  function updateFilterChip() {
    if (!filterChipEl) return;
    filterChipEl.innerHTML = "";
    if (!filtroAtivo) {
      filterChipEl.hidden = true;
      return;
    }
    filterChipEl.hidden = false;

    const label = document.createElement("span");
    label.className = "gemini-filter-chip__label";
    label.textContent =
      filtroAtivo.tipo === "site" ? "Filtro: Site inteiro" : `Filtro: ${filtroAtivo.doc.titulo}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "gemini-filter-chip__remove";
    removeBtn.setAttribute("aria-label", "Remover filtro e voltar para a página atual");
    removeBtn.title = "Remover filtro";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => {
      filtroAtivo = null;
      updateFilterChip();
    });

    filterChipEl.appendChild(label);
    filterChipEl.appendChild(removeBtn);
  }

  /**
   * Resolve o contexto a enviar ao proxy de acordo com o filtro ativo:
   *  - sem filtro (padrão) → conteúdo da página atual (extractPageContext).
   *  - "site" → resumo agregado do site inteiro (cacheado após a 1ª vez).
   *  - "topico" → conteúdo do documento buscado via fetch (cacheado por id
   *    enquanto o filtro permanecer o mesmo). Em caso de falha de rede, o
   *    filtro é desfeito (volta para a página atual) e uma mensagem amigável
   *    é mostrada, sem travar a conversa.
   */
  async function resolveContextoAtual() {
    if (!filtroAtivo) return extractPageContext();

    if (filtroAtivo.tipo === "site") {
      if (!siteWideContextCache) {
        const documentsIndex = await loadDocumentsIndex();
        siteWideContextCache = buildSiteWideContext(documentsIndex);
      }
      return siteWideContextCache;
    }

    if (filtroAtivo.tipo === "topico") {
      const id = filtroAtivo.doc.id;
      if (topicContextCache.has(id)) return topicContextCache.get(id);
      try {
        const contexto = await fetchTopicContext(filtroAtivo.doc);
        topicContextCache.set(id, contexto);
        return contexto;
      } catch (err) {
        console.error("[gemini-assistant.js] Falha ao buscar conteúdo do tópico filtrado:", err);
        filtroAtivo = null;
        updateFilterChip();
        renderErrorMessage(
          messagesEl,
          "Não foi possível carregar o conteúdo desse tópico agora. Voltando a usar a página atual como contexto.",
          null
        );
        return extractPageContext();
      }
    }

    return extractPageContext();
  }

  if (newBtn) newBtn.addEventListener("click", novaConversa);
  if (saveBtn) saveBtn.addEventListener("click", salvarConversaAtual);
  if (historyBtn) historyBtn.addEventListener("click", abrirHistorico);

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
      const contextoPagina = await resolveContextoAtual();
      const res = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pergunta,
            contextoPagina,
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
      updateSaveButtonState();
      // Fire-and-forget: não usa await para não bloquear a UI; erros são
      // tratados dentro de autoSalvarConversa (console.warn/error apenas).
      autoSalvarConversa();
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
    updateSaveButtonState();
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
