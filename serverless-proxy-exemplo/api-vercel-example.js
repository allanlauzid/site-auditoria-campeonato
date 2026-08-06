/**
 * api-vercel-example.js — Exemplo de proxy serverless para Vercel Functions
 * ou Netlify Functions (Node.js runtime).
 *
 * NÃO faz parte do deploy do site estático portal-v1/. Publique este arquivo
 * como uma função separada (ver README.md desta pasta):
 *   - Vercel:  copie para api/gemini.js
 *   - Netlify: copie para netlify/functions/gemini.js (adapte o handler
 *              conforme o formato esperado pela Netlify, se necessário)
 *
 * A chave da API do Gemini é lida de process.env.GEMINI_API_KEY (variável de
 * ambiente configurada no painel do provedor — NUNCA hardcoded aqui).
 */

const ALLOWED_ORIGIN = "https://www.seudominio.com.br";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function resolveAllowedOrigin(origin) {
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
  return origin === ALLOWED_ORIGIN || isLocalDev ? origin : ALLOWED_ORIGIN;
}

/**
 * Formato padronizado de erro devolvido ao frontend:
 *   { erro: true, codigo: "AUTH_ERROR" | "RATE_LIMIT" | "SERVER_ERROR" |
 *            "SAFETY_BLOCKED" | "EMPTY_RESPONSE" | "INVALID_REQUEST" |
 *            "REQUEST_TOO_LARGE",
 *     mensagem: "..." }
 * A "mensagem" é só texto de apoio para debug do proxy — nunca inclua aqui
 * detalhes sensíveis (chave, stack, URLs internas); o frontend decide o texto
 * final exibido ao usuário a partir do "codigo".
 */
function sendError(res, status, codigo, mensagem) {
  res.status(status).json({ erro: true, codigo, mensagem });
}

function buildPrompt(pergunta, contextoPagina, historico) {
  const contexto = contextoPagina || {};
  const historicoTexto = Array.isArray(historico)
    ? historico
        .slice(-10)
        .map((m) => `${m.papel === "usuario" ? "Usuário" : "Assistente"}: ${m.texto}`)
        .join("\n")
    : "";

  return [
    "Você é o assistente de documentação do Portal do Campeonato Brasileiro de Kettlebell Sport.",
    "Responda em português do Brasil, de forma objetiva, com base no contexto da página abaixo.",
    "Se a resposta não estiver no contexto, diga que não encontrou a informação nesta página.",
    "",
    `Página atual: ${contexto.titulo || "desconhecida"} (${contexto.url || ""})`,
    `Categoria: ${contexto.categoria || "n/a"}`,
    "Conteúdo da página (trecho):",
    contexto.conteudo || "(sem conteúdo capturado)",
    "",
    historicoTexto ? `Histórico da conversa:\n${historicoTexto}\n` : "",
    `Pergunta do usuário: ${pergunta}`,
  ].join("\n");
}

/**
 * Handler no formato (req, res) usado por Vercel Node Functions.
 * Para Netlify Functions, adapte para o formato (event, context) => { statusCode, headers, body }
 * seguindo a mesma lógica de negócio abaixo.
 */
export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const allowOrigin = resolveAllowedOrigin(origin);

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    sendError(res, 405, "INVALID_REQUEST", "Método não permitido.");
    return;
  }

  const { pergunta, contextoPagina, historico } = req.body || {};
  if (!pergunta || typeof pergunta !== "string") {
    sendError(res, 400, "INVALID_REQUEST", "Campo 'pergunta' é obrigatório.");
    return;
  }

  // Limite de tamanho da requisição — evita estourar limites da API do
  // Gemini ou do próprio proxy.
  const MAX_PERGUNTA_CHARS = 2000;
  const MAX_CONTEXTO_CHARS = 6000;
  const contextoLen = JSON.stringify(contextoPagina || {}).length;
  if (pergunta.length > MAX_PERGUNTA_CHARS || contextoLen > MAX_CONTEXTO_CHARS) {
    sendError(res, 413, "REQUEST_TOO_LARGE", "Pergunta ou contexto de página excede o tamanho máximo aceito.");
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendError(res, 500, "SERVER_ERROR", "Proxy mal configurado: GEMINI_API_KEY ausente no ambiente.");
    return;
  }

  const prompt = buildPrompt(pergunta, contextoPagina, historico);

  let geminiRes;
  try {
    geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
      }),
    });
  } catch (err) {
    console.error("Erro inesperado ao chamar a API do Gemini:", err);
    sendError(res, 500, "SERVER_ERROR", "Erro inesperado ao consultar o assistente.");
    return;
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    console.error("Erro da API do Gemini:", geminiRes.status, errText);

    if (geminiRes.status === 401 || geminiRes.status === 403) {
      sendError(res, 401, "AUTH_ERROR", "Falha de autenticação com a API do Gemini.");
      return;
    }
    if (geminiRes.status === 429) {
      sendError(res, 429, "RATE_LIMIT", "Limite de requisições da API do Gemini excedido.");
      return;
    }
    if (geminiRes.status === 400) {
      sendError(res, 413, "REQUEST_TOO_LARGE", "Requisição rejeitada pela API do Gemini (tamanho/formato).");
      return;
    }
    sendError(res, 502, "SERVER_ERROR", "A API do Gemini está indisponível no momento.");
    return;
  }

  let data;
  try {
    data = await geminiRes.json();
  } catch (err) {
    console.error("Resposta da API do Gemini não é um JSON válido:", err);
    sendError(res, 502, "SERVER_ERROR", "Resposta inesperada da API do Gemini.");
    return;
  }

  // Bloqueio por filtro de segurança do Gemini: promptFeedback.blockReason
  // (prompt inteiro bloqueado) ou candidates[0].finishReason === "SAFETY".
  const blockReason = data?.promptFeedback?.blockReason;
  const finishReason = data?.candidates?.[0]?.finishReason;
  if (blockReason || finishReason === "SAFETY") {
    sendError(res, 200, "SAFETY_BLOCKED", `Conteúdo bloqueado pelo filtro de segurança (${blockReason || finishReason}).`);
    return;
  }

  const resposta = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

  if (!resposta.trim()) {
    sendError(res, 200, "EMPTY_RESPONSE", "A API do Gemini não retornou texto.");
    return;
  }

  res.status(200).json({ resposta });
}
