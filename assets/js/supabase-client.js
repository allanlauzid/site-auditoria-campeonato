/**
 * supabase-client.js — ES module
 *
 * Cliente Supabase usado exclusivamente para persistir o histórico de
 * conversas do Assistente CBKS (tabela pública "conversas"). As credenciais
 * (supabaseUrl/supabaseAnonKey) vêm de /data/site-config.json — nunca são
 * hardcoded aqui. supabaseAnonKey é a chave PÚBLICA/publishable do projeto
 * (prefixo sb_publishable_), protegida pelas políticas de Row Level Security
 * (RLS) da tabela, não pelo sigilo da própria chave. É seguro expô-la no
 * frontend. Isso é completamente diferente da GEMINI_API_KEY (secreta,
 * usada só pelo proxy serverless em api/gemini.js).
 *
 * O histórico de conversas salvo aqui é PÚBLICO por decisão de produto: o
 * portal não tem login, então qualquer visitante pode ver a lista de
 * conversas salvas por qualquer visitante.
 */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SITE_CONFIG_URL = "/data/site-config.json";
const TABELA = "conversas";
const TITULO_MAX_CHARS = 60;
const TITULO_FALLBACK = "Conversa sem título";

let clientPromise = null;
let cachedConfig = null;

async function loadSiteConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch(SITE_CONFIG_URL);
    if (!res.ok) throw new Error(`site-config.json HTTP ${res.status}`);
    cachedConfig = await res.json();
  } catch (err) {
    console.error("[supabase-client.js] Falha ao carregar site-config.json:", err);
    cachedConfig = {};
  }
  return cachedConfig;
}

/**
 * Retorna (criando se necessário) a instância singleton do client Supabase.
 * Se as credenciais não estiverem configuradas, retorna null — quem chama
 * deve tratar esse caso graciosamente (ver funções abaixo).
 */
async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const config = await loadSiteConfig();
      const url = (config.supabaseUrl || "").trim();
      const key = (config.supabaseAnonKey || "").trim();
      if (!url || !key) {
        console.error("[supabase-client.js] supabaseUrl/supabaseAnonKey ausentes em site-config.json.");
        return null;
      }
      try {
        return createClient(url, key);
      } catch (err) {
        console.error("[supabase-client.js] Falha ao criar client Supabase:", err);
        return null;
      }
    })();
  }
  return clientPromise;
}

/**
 * Gera um título automático a partir da primeira mensagem do usuário no
 * array de mensagens ({ papel: "usuario"|"assistente", texto }).
 */
export function gerarTituloAutomatico(mensagens) {
  const primeiraDoUsuario = (mensagens || []).find(
    (m) => m && m.papel === "usuario" && typeof m.texto === "string" && m.texto.trim()
  );
  if (!primeiraDoUsuario) return TITULO_FALLBACK;
  const texto = primeiraDoUsuario.texto.trim().replace(/\s+/g, " ");
  if (texto.length <= TITULO_MAX_CHARS) return texto;
  return texto.slice(0, TITULO_MAX_CHARS).trim() + "...";
}

/**
 * Salva (INSERT se id ausente, UPDATE se id presente) uma conversa.
 * Retorna { sucesso: true, id } ou { sucesso: false, erro }.
 */
export async function salvarConversa({ id = null, titulo = null, mensagens = [] } = {}) {
  const client = await getClient();
  if (!client) {
    return { sucesso: false, erro: "Histórico indisponível no momento. Tente novamente mais tarde." };
  }

  const tituloFinal = titulo && titulo.trim() ? titulo.trim() : gerarTituloAutomatico(mensagens);

  try {
    if (!id) {
      const { data, error } = await client
        .from(TABELA)
        .insert({ titulo: tituloFinal, mensagens })
        .select("id")
        .single();
      if (error) throw error;
      return { sucesso: true, id: data.id };
    }

    const { error } = await client
      .from(TABELA)
      .update({ titulo: tituloFinal, mensagens, atualizado_em: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return { sucesso: true, id };
  } catch (err) {
    console.error("[supabase-client.js] Falha ao salvar conversa:", err);
    return { sucesso: false, erro: "Não foi possível salvar a conversa agora. Tente novamente." };
  }
}

/**
 * Lista conversas salvas (mais recentes primeiro).
 * Retorna { sucesso, dados: [{ id, titulo, criado_em }], erro }.
 */
export async function listarConversas({ limite = 50 } = {}) {
  const client = await getClient();
  if (!client) {
    return { sucesso: false, dados: [], erro: "Histórico indisponível no momento. Tente novamente mais tarde." };
  }

  try {
    const { data, error } = await client
      .from(TABELA)
      .select("id, titulo, criado_em")
      .order("criado_em", { ascending: false })
      .limit(limite);
    if (error) throw error;
    return { sucesso: true, dados: data || [], erro: null };
  } catch (err) {
    console.error("[supabase-client.js] Falha ao listar conversas:", err);
    return { sucesso: false, dados: [], erro: "Não foi possível carregar o histórico agora. Tente novamente." };
  }
}

/**
 * Exclui uma conversa por id (DELETE na tabela "conversas").
 * Retorna { sucesso: true } ou { sucesso: false, erro }.
 */
export async function excluirConversa(id) {
  const client = await getClient();
  if (!client) {
    return { sucesso: false, erro: "Histórico indisponível no momento. Tente novamente mais tarde." };
  }
  if (!id) {
    return { sucesso: false, erro: "Conversa inválida." };
  }

  try {
    const { error } = await client.from(TABELA).delete().eq("id", id);
    if (error) throw error;
    return { sucesso: true, erro: null };
  } catch (err) {
    console.error("[supabase-client.js] Falha ao excluir conversa:", err);
    return { sucesso: false, erro: "Não foi possível excluir essa conversa agora. Tente novamente." };
  }
}

/**
 * Carrega uma conversa completa por id.
 * Retorna { sucesso, dados, erro }.
 */
export async function carregarConversa(id) {
  const client = await getClient();
  if (!client) {
    return { sucesso: false, dados: null, erro: "Histórico indisponível no momento. Tente novamente mais tarde." };
  }
  if (!id) {
    return { sucesso: false, dados: null, erro: "Conversa inválida." };
  }

  try {
    const { data, error } = await client.from(TABELA).select("*").eq("id", id).single();
    if (error) throw error;
    return { sucesso: true, dados: data, erro: null };
  } catch (err) {
    console.error("[supabase-client.js] Falha ao carregar conversa:", err);
    return { sucesso: false, dados: null, erro: "Não foi possível carregar essa conversa agora. Tente novamente." };
  }
}
