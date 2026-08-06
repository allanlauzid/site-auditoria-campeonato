/**
 * search.js — ES module
 * Motor de busca client-side operando sobre /data/search-index.json.
 *
 * Algoritmo: tokenização simples + ranking por soma ponderada de:
 *  - match exato de termo completo no título da seção   (peso 5)
 *  - match de token no campo "tokens"                    (peso 3 * entry.peso)
 *  - match parcial (substring) no excerpt                (peso 1)
 * Resultados ordenados por score desc, empate por ordem de índice.
 *
 * Suporta filtro por categoria (fase/projeto/manual/glossario) e por docId
 * (busca "dentro de um documento"), usado pelo document-navigator.
 *
 * Sem dependências externas. Índice ainda vazio/exemplo nesta etapa —
 * arquitetura e algoritmo já são funcionais e serão exercitados de verdade
 * quando o índice for populado na Etapa 2B.
 */

const INDEX_URL = "/data/search-index.json";

let cachedIndex = null;

async function loadIndex() {
  if (cachedIndex) return cachedIndex;
  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error(`search-index.json HTTP ${res.status}`);
    const json = await res.json();
    cachedIndex = json.entries || [];
  } catch (err) {
    console.error("[search.js] Falha ao carregar search-index.json:", err);
    cachedIndex = [];
  }
  return cachedIndex;
}

function tokenize(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Executa a busca.
 * @param {string} query
 * @param {{categoria?: string, docId?: string, limit?: number}} options
 * @returns {Promise<Array>} lista de entradas com campo _score e _matchedTokens
 */
export async function search(query, options = {}) {
  const { categoria = null, docId = null, limit = 20 } = options;
  const q = query.trim();
  if (!q) return [];

  const index = await loadIndex();
  const queryTokens = tokenize(q);
  const qLower = q.toLowerCase();

  const scored = [];

  for (const entry of index) {
    if (categoria && entry.categoria !== categoria) continue;
    if (docId && entry.docId !== docId) continue;

    let score = 0;
    const matchedTokens = new Set();

    // 1. match exato de frase completa no título da seção
    if (entry.secaoTitulo && entry.secaoTitulo.toLowerCase().includes(qLower)) {
      score += 5;
    }
    if (entry.titulo && entry.titulo.toLowerCase().includes(qLower)) {
      score += 4;
    }

    // 2. match token a token no campo tokens
    const entryTokens = entry.tokens || [];
    for (const qt of queryTokens) {
      if (entryTokens.includes(qt)) {
        score += 3 * (entry.peso || 1);
        matchedTokens.add(qt);
      }
    }

    // 3. match parcial no excerpt
    if (entry.excerpt) {
      const excerptLower = entry.excerpt.toLowerCase();
      for (const qt of queryTokens) {
        if (qt.length >= 3 && excerptLower.includes(qt)) {
          score += 1;
          matchedTokens.add(qt);
        }
      }
    }

    if (score > 0) {
      scored.push({ ...entry, _score: score, _matchedTokens: Array.from(matchedTokens) });
    }
  }

  scored.sort((a, b) => b._score - a._score);
  return scored.slice(0, limit);
}

/**
 * Envolve termos correspondentes em <mark class="search-highlight"> dentro de um texto.
 */
export function highlight(text, query) {
  if (!text || !query) return text;
  const tokens = tokenize(query).filter((t) => t.length >= 2);
  if (tokens.length === 0) return text;
  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi");
  return text.replace(pattern, '<mark class="search-highlight">$1</mark>');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Renderiza resultados dentro de um container (.search-results).
 */
export function renderResults(container, results, query) {
  if (!container) return;
  if (results.length === 0) {
    container.innerHTML = `<div class="search-results__empty">Nenhum resultado para "${escapeHtml(query)}". O índice ainda está em fase de estrutura (Etapa 2A) — conteúdo real é adicionado na Etapa 2B.</div>`;
    return;
  }
  container.innerHTML = results.map((r) => `
    <a class="search-results__item" href="${r.url}">
      <div class="search-results__item-title">${highlight(escapeHtml(r.titulo + " — " + r.secaoTitulo), query)}</div>
      <div class="search-results__item-path">${escapeHtml(r.url)}</div>
      <div class="search-results__item-excerpt">${highlight(escapeHtml(r.excerpt || ""), query)}</div>
    </a>
  `).join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * Liga a busca a um input.search-bar__input e a um container.search-results,
 * com debounce simples. Também abre/fecha um modal de busca (Ctrl/Cmd+K).
 */
export function initSearchBar(inputSelector = "[data-search-input]", resultsSelector = "[data-search-results]") {
  const input = document.querySelector(inputSelector);
  const results = document.querySelector(resultsSelector);
  if (!input || !results) return;

  let debounceTimer = null;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const value = input.value;
    debounceTimer = setTimeout(async () => {
      const found = await search(value);
      renderResults(results, found, value);
    }, 150);
  });

  // atalho de teclado Cmd/Ctrl+K para focar a busca
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const modal = document.getElementById("search-modal");
      if (modal) modal.dataset.open = "true";
      input.focus();
    }
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => initSearchBar());
}
