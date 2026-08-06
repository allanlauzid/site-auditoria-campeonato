/**
 * worker.js — Exemplo de proxy serverless para Cloudflare Workers.
 *
 * NÃO faz parte do deploy do site estático portal-v1/. Publique este arquivo
 * como um Worker separado (ver README.md desta pasta) e cole a URL publicada
 * em portal-v1/data/site-config.json (campo "geminiProxyEndpoint").
 *
 * A chave da API do Gemini é lida de env.GEMINI_API_KEY (variável de
 * ambiente/secret configurada no painel do Cloudflare — NUNCA hardcoded
 * aqui). Se você está lendo este arquivo em um repositório e vê uma chave
 * real escrita abaixo, isso é um erro de segurança grave — reporte e
 * remova imediatamente.
 */

// Ajuste para o domínio real do portal em produção antes de publicar.
const ALLOWED_ORIGIN = "https://www.seudominio.com.br";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Formato padronizado de erro devolvido ao frontend:
 *   { erro: true, codigo: "AUTH_ERROR" | "RATE_LIMIT" | "SERVER_ERROR" |
 *            "SAFETY_BLOCKED" | "EMPTY_RESPONSE" | "INVALID_REQUEST" |
 *            "REQUEST_TOO_LARGE",
 *     mensagem: "..." }
 * A "mensagem" aqui é só um texto de apoio para debug no proxy — o frontend
 * (gemini-assistant.js) decide o texto final exibido ao usuário a partir do
 * "codigo", então nunca inclua aqui detalhes sensíveis (chave, stack, URLs
 * internas) — mesmo que o frontend hoje não os leia, a resposta HTTP pode ser
 * vista via devtools.
 */
function errorResponse(status, codigo, mensagem, headers) {
  return new Response(JSON.stringify({ erro: true, codigo, mensagem }), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

function corsHeaders(origin) {
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
  const allowOrigin = origin === ALLOWED_ORIGIN || isLocalDev ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function buildPrompt(pergunta, contextoPagina, historico) {
  const contexto = contextoPagina || {};
  const historicoTexto = Array.isArray(historico)
    ? historico
        .slice(-10) // limita histórico enviado ao modelo
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return errorResponse(405, "INVALID_REQUEST", "Método não permitido.", headers);
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return errorResponse(400, "INVALID_REQUEST", "JSON inválido no corpo da requisição.", headers);
    }

    const { pergunta, contextoPagina, historico } = body || {};
    if (!pergunta || typeof pergunta !== "string") {
      return errorResponse(400, "INVALID_REQUEST", "Campo 'pergunta' é obrigatório.", headers);
    }

    // Limite de tamanho da requisição (pergunta + contexto da página) — evita
    // estourar limites de tamanho da API do Gemini ou do próprio proxy.
    const MAX_PERGUNTA_CHARS = 2000;
    const MAX_CONTEXTO_CHARS = 6000;
    const contextoLen = JSON.stringify(contextoPagina || {}).length;
    if (pergunta.length > MAX_PERGUNTA_CHARS || contextoLen > MAX_CONTEXTO_CHARS) {
      return errorResponse(413, "REQUEST_TOO_LARGE", "Pergunta ou contexto de página excede o tamanho máximo aceito.", headers);
    }

    if (!env.GEMINI_API_KEY) {
      return errorResponse(500, "SERVER_ERROR", "Proxy mal configurado: GEMINI_API_KEY ausente no ambiente.", headers);
    }

    const prompt = buildPrompt(pergunta, contextoPagina, historico);

    let geminiRes;
    try {
      geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
        }),
      });
    } catch (err) {
      console.error("Erro inesperado ao chamar a API do Gemini:", err);
      return errorResponse(500, "SERVER_ERROR", "Erro inesperado ao consultar o assistente.", headers);
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      console.error("Erro da API do Gemini:", geminiRes.status, errText);

      if (geminiRes.status === 401 || geminiRes.status === 403) {
        return errorResponse(401, "AUTH_ERROR", "Falha de autenticação com a API do Gemini.", headers);
      }
      if (geminiRes.status === 429) {
        return errorResponse(429, "RATE_LIMIT", "Limite de requisições da API do Gemini excedido.", headers);
      }
      if (geminiRes.status === 400) {
        return errorResponse(413, "REQUEST_TOO_LARGE", "Requisição rejeitada pela API do Gemini (tamanho/formato).", headers);
      }
      return errorResponse(502, "SERVER_ERROR", "A API do Gemini está indisponível no momento.", headers);
    }

    let data;
    try {
      data = await geminiRes.json();
    } catch (err) {
      console.error("Resposta da API do Gemini não é um JSON válido:", err);
      return errorResponse(502, "SERVER_ERROR", "Resposta inesperada da API do Gemini.", headers);
    }

    // Bloqueio por filtro de segurança do Gemini: pode vir como
    // promptFeedback.blockReason (bloqueio do prompt inteiro) ou como
    // candidates[0].finishReason === "SAFETY" (bloqueio da geração).
    const blockReason = data?.promptFeedback?.blockReason;
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (blockReason || finishReason === "SAFETY") {
      return errorResponse(200, "SAFETY_BLOCKED", `Conteúdo bloqueado pelo filtro de segurança (${blockReason || finishReason}).`, headers);
    }

    const resposta = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

    if (!resposta.trim()) {
      return errorResponse(200, "EMPTY_RESPONSE", "A API do Gemini não retornou texto.", headers);
    }

    return new Response(JSON.stringify({ resposta }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  },
};
