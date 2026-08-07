/**
 * navigation.js — ES module
 * Responsabilidades: injetar header/sidebar/footer a partir de /data/navigation.json,
 * controlar tema claro/escuro, menu mobile, scroll-spy do TOC, sumário automático,
 * breadcrumb dinâmico e navegação por teclado.
 *
 * Carregado via <script type="module" src="/assets/js/navigation.js"></script>.
 * Não depende de nenhuma lib externa.
 */

const DATA_URL = "/data/navigation.json";
const THEME_KEY = "kbs-portal-theme";

/* ------------------------------------------------------------------ *
 * 1. TEMA CLARO/ESCURO
 * ------------------------------------------------------------------ */
export function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) root.setAttribute("data-theme", saved);

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-action='toggle-theme']");
    if (!toggle) return;
    const current = root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    toggle.setAttribute("aria-pressed", String(next === "dark"));
  });
}

/* ------------------------------------------------------------------ *
 * 2. CARREGAMENTO DE DADOS DE NAVEGAÇÃO
 * ------------------------------------------------------------------ */
async function loadNavData() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`navigation.json HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[navigation.js] Falha ao carregar navigation.json:", err);
    return { topNav: [], sidebarGroups: [], footerColumns: [] };
  }
}

/* ------------------------------------------------------------------ *
 * 3. RENDER: TOPO
 * ------------------------------------------------------------------ */
function renderTopNav(container, items) {
  if (!container) return;
  const currentPath = window.location.pathname;
  container.innerHTML = items.map((item) => {
    const isCurrent = currentPath.endsWith(item.url.replace(/^\//, ""));
    return `<li><a href="${item.url}"${isCurrent ? ' aria-current="page"' : ""}>${item.label}</a></li>`;
  }).join("");
}

/* ------------------------------------------------------------------ *
 * 4. RENDER: SIDEBAR
 * ------------------------------------------------------------------ */
function renderSidebar(container, groups) {
  if (!container) return;
  const currentPath = window.location.pathname;
  container.innerHTML = groups.map((group) => `
    <div class="sidebar__group">
      <div class="sidebar__group-title">${group.title}</div>
      <nav aria-label="${group.title}">
        ${group.items.map((item) => {
          const isCurrent = currentPath.endsWith(item.url.replace(/^\//, ""));
          return `<a class="sidebar__link" href="${item.url}"${isCurrent ? ' aria-current="page"' : ""}>${item.label}</a>`;
        }).join("")}
      </nav>
    </div>
  `).join("");
}

/* ------------------------------------------------------------------ *
 * 5. RENDER: FOOTER
 * ------------------------------------------------------------------ */
function renderFooterColumns(container, columns) {
  if (!container) return;
  container.innerHTML = columns.map((col) => `
    <div>
      <div class="site-footer__col-title">${col.title}</div>
      <ul>
        ${col.links.map((l) => `<li><a href="${l.url}">${l.label}</a></li>`).join("")}
      </ul>
    </div>
  `).join("");
}

/* ------------------------------------------------------------------ *
 * 6. MENU MOBILE (abre/fecha sidebar em telas < 960px)
 * ------------------------------------------------------------------ */
function initMobileMenu() {
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-action='toggle-sidebar']");
    const sidebar = document.querySelector(".page-shell__sidebar");
    if (toggle && sidebar) {
      const isOpen = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      return;
    }
    // fecha ao clicar fora
    if (sidebar && sidebar.classList.contains("is-open") &&
        !sidebar.contains(event.target) && !event.target.closest("[data-action='toggle-sidebar']")) {
      sidebar.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelector(".page-shell__sidebar")?.classList.remove("is-open");
    }
  });
}

/* ------------------------------------------------------------------ *
 * 7. SUMÁRIO AUTOMÁTICO (TOC) A PARTIR DE h2/h3 DO CONTEÚDO
 * ------------------------------------------------------------------ */
export function buildTOC(contentSelector = ".doc-content", tocSelector = "[data-toc-list]") {
  const content = document.querySelector(contentSelector);
  const tocList = document.querySelector(tocSelector);
  if (!content || !tocList) return;

  const headings = Array.from(content.querySelectorAll("h2, h3"));
  if (headings.length === 0) {
    tocList.closest(".toc")?.setAttribute("hidden", "");
    return;
  }

  headings.forEach((h, i) => {
    if (!h.id) h.id = `sec-${i}-${slugify(h.textContent)}`;
  });

  tocList.innerHTML = headings.map((h) => {
    const indentClass = h.tagName === "H3" ? ' style="margin-left:0.75rem"' : "";
    return `<li${indentClass}><a href="#${h.id}">${h.textContent}</a></li>`;
  }).join("");

  initScrollSpy(headings, tocList);
}

function slugify(text) {
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ------------------------------------------------------------------ *
 * 8. SCROLL SPY — destaca item ativo do TOC via IntersectionObserver
 * ------------------------------------------------------------------ */
function initScrollSpy(headings, tocList) {
  if (!("IntersectionObserver" in window)) return;
  const links = tocList.querySelectorAll("a");
  const linkFor = (id) => tocList.querySelector(`a[href="#${id}"]`);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = linkFor(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
      }
    });
  }, { rootMargin: "-20% 0px -70% 0px" });

  headings.forEach((h) => observer.observe(h));
}

/* ------------------------------------------------------------------ *
 * 9. BREADCRUMB DINÂMICO (a partir de data-breadcrumb no <body> ou trilha manual)
 * ------------------------------------------------------------------ */
export function renderBreadcrumb(trail, containerSelector = "[data-breadcrumb]") {
  const el = document.querySelector(containerSelector);
  if (!el || !Array.isArray(trail)) return;
  el.setAttribute("aria-label", "Trilha de navegação");
  el.innerHTML = trail.map((step, i) => {
    const isLast = i === trail.length - 1;
    const sep = i > 0 ? '<span class="breadcrumb__sep" aria-hidden="true">/</span>' : "";
    const node = isLast
      ? `<span aria-current="page">${step.label}</span>`
      : `<a href="${step.url}">${step.label}</a>`;
    return sep + node;
  }).join("");
}

/* ------------------------------------------------------------------ *
 * 10. ACCORDION / TABS genéricos (delegação de evento, funciona para
 *     qualquer instância desses componentes na página)
 * ------------------------------------------------------------------ */
function initAccordion() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".accordion__trigger");
    if (!trigger) return;
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    if (panel) panel.dataset.open = String(!expanded);
  });
}

function initTabs() {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest(".tabs__tab");
    if (!tab) return;
    const tabList = tab.closest(".tabs__list");
    const tabsRoot = tab.closest("[data-tabs]");
    if (!tabList || !tabsRoot) return;

    tabList.querySelectorAll(".tabs__tab").forEach((t) => t.setAttribute("aria-selected", "false"));
    tab.setAttribute("aria-selected", "true");

    tabsRoot.querySelectorAll(".tabs__panel").forEach((p) => { p.hidden = true; });
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    if (panel) panel.hidden = false;
  });

  // navegação por teclado (setas) nas abas
  document.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
    const tab = event.target.closest(".tabs__tab");
    if (!tab) return;
    const tabs = Array.from(tab.closest(".tabs__list").querySelectorAll(".tabs__tab"));
    const idx = tabs.indexOf(tab);
    const next = event.key === "ArrowRight" ? tabs[(idx + 1) % tabs.length] : tabs[(idx - 1 + tabs.length) % tabs.length];
    next.focus();
    next.click();
  });
}

/* ------------------------------------------------------------------ *
 * 11. MODAL genérico
 * ------------------------------------------------------------------ *
 * O painel do Assistente CBKS (#gemini-modal) reaproveita esta mesma
 * infraestrutura de data-open/data-action, mas NÃO é um modal de verdade:
 * é um painel ancorado ao botão flutuante (ver .gemini-modal-overlay no
 * design-system.css). Duas diferenças de comportamento em relação ao modal
 * de busca (#search-modal, que continua 100% modal/centralizado):
 *   1. Clique no botão flutuante funciona como TOGGLE (abre/fecha), não só abre.
 *   2. Clique fora do painel NÃO fecha (só o botão "X" e a tecla Escape fecham).
 * Escape continua fechando qualquer overlay aberto, gemini incluído — é um
 * atalho de teclado padrão, diferente de "clicar fora".
 */
function initModal() {
  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-action='open-modal']");
    if (opener) {
      const modal = document.getElementById(opener.dataset.target);
      if (modal) {
        const isGeminiPanel = modal.id === "gemini-modal";
        const alreadyOpen = modal.dataset.open === "true";
        if (isGeminiPanel && alreadyOpen) {
          // Clicar de novo no fab com o painel aberto: fecha (toggle).
          modal.dataset.open = "false";
        } else {
          // Evita dois painéis flutuantes abertos ao mesmo tempo (ex.: abrir
          // a busca enquanto o assistente está aberto fecha o assistente).
          document.querySelectorAll(".modal-overlay[data-open='true']").forEach((m) => {
            if (m !== modal) m.dataset.open = "false";
          });
          modal.dataset.open = "true";
          modal.querySelector(".modal")?.focus();
        }
      }
    }
    const closer = event.target.closest("[data-action='close-modal']");
    if (closer) {
      const overlay = event.target.closest(".modal-overlay");
      if (overlay) overlay.dataset.open = "false";
    } else if (event.target.classList.contains("modal-overlay") && event.target.id !== "gemini-modal") {
      // Clique no backdrop fecha — exceto para o painel ancorado do
      // assistente, que não tem "fora"/"dentro" no sentido de modal.
      event.target.dataset.open = "false";
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal-overlay[data-open='true']").forEach((m) => { m.dataset.open = "false"; });
    }
  });
}

/* ------------------------------------------------------------------ *
 * 12. DROPDOWN genérico
 * ------------------------------------------------------------------ */
function initDropdown() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action='toggle-dropdown']");
    document.querySelectorAll(".dropdown__menu[data-open='true']").forEach((menu) => {
      if (!trigger || menu.id !== trigger.dataset.target) menu.dataset.open = "false";
    });
    if (trigger) {
      const menu = document.getElementById(trigger.dataset.target);
      if (menu) menu.dataset.open = String(menu.dataset.open !== "true");
    }
  });
}

/* ------------------------------------------------------------------ *
 * BOOTSTRAP
 * ------------------------------------------------------------------ */
export async function initNavigation() {
  initTheme();
  initMobileMenu();
  initAccordion();
  initTabs();
  initModal();
  initDropdown();

  const data = await loadNavData();
  renderTopNav(document.querySelector("[data-topnav]"), data.topNav || []);
  renderSidebar(document.querySelector("[data-sidebar]"), data.sidebarGroups || []);
  renderFooterColumns(document.querySelector("[data-footer-columns]"), data.footerColumns || []);
  buildTOC();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initNavigation);
}
