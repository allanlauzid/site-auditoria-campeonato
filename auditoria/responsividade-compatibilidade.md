# Auditoria RC1 — Fase 16: Responsividade e Compatibilidade

**Método**: 100% análise estática real do CSS (`assets/css/design-system.css`, leitura completa, 526 linhas) via inspeção manual das `@media` queries e grep real. **Nenhum teste em navegador real (Chromium/Firefox/WebKit) foi executado — sandbox sem GUI/navegador headless disponível.**

## Breakpoints solicitados vs. implementados

O CSS documenta a própria estratégia no comentário da seção 23: `Breakpoints: >=1200 desktop amplo · >=960 desktop · >=720 tablet · <720 mobile` — uma abordagem **desktop-first com 3 pontos de quebra** (`max-width: 1199px`, `max-width: 959px`, `max-width: 719px`), e não os 8 breakpoints numéricos solicitados (320/375/768/1024/1366/1440/1920/2560).

| Breakpoint solicitado | Coberto por regra CSS existente? |
|---|---|
| 320px (mobile pequeno) | Sim, indiretamente — cai dentro de `max-width:719px` (regra única para todo mobile, não diferenciada de 375px) |
| 375px (mobile padrão) | Sim, mesma regra `max-width:719px` |
| 768px (tablet) | Parcial — cai em `max-width:959px` (regra combinada "tablet+desktop pequeno", não uma faixa dedicada a 768px) |
| 1024px | Parcial — cai em `max-width:1199px` (esconde TOC lateral) |
| 1366px | Não há regra específica — usa o layout desktop padrão (>=1200px), sem otimização própria |
| 1440px | Idem — layout desktop padrão, `--page-max-width: 1440px` limita a largura útil do conteúdo (token de design), mas não há `@media` dedicado |
| 1920px | Idem — conteúdo centralizado por `--page-max-width`, sem overflow, mas sem breakpoint próprio |
| 2560px | Idem |

**Achado (médio/recomendação, não corrigido)**: o sistema usa 3 breakpoints largos em vez de granularidade explícita nos 8 pontos solicitados. Isso **não é necessariamente um defeito** — é uma estratégia válida e comum (3 faixas cobrem o espectro contanto que o layout seja fluido dentro de cada faixa, o que se confirma pelo uso extensivo de `clamp()`-like tokens, `grid-template-columns: minmax(0,1fr)`, e `--page-max-width` para limitar telas grandes). Não foi alterado porque re-projetar breakpoints é uma decisão de design/arquitetura CSS, fora do escopo de "correção indispensável de defeito claro" — documentado como recomendação para validação visual real (ver pendência abaixo), já que só um navegador real confirma se as 3 faixas realmente resultam em layout sem quebra nos 8 pontos exatos.

## Colapso de sidebar/menu mobile
**Confirmado no CSS (`design-system.css:508-517`)**: em `max-width:959px`, `.page-shell__sidebar` vira `display:none` por padrão e `.page-shell__sidebar.is-open` (classe alternada por `navigation.js:initMobileMenu`) assume `position:fixed`, ocupa a tela abaixo do header, com `overflow-y:auto`. Navegação superior (`.site-header__nav`) também oculta em mobile, presumivelmente substituída pelo menu hambúrguer (`toggle-sidebar`). Implementação coerente. Nenhum achado.

## `overflow-x` em tabelas
**Confirmado (`design-system.css:299`)**: `.table-wrap { overflow-x: auto; margin: ...}` — wrapper dedicado para rolagem horizontal de tabelas largas em telas pequenas. Presente e correto. Nenhum achado.

## `@media print`
**Achado (baixo, já registrado em `html-css-js.md`, não duplicado como novo aqui)**: ausente. Sem impacto de responsividade em tela, mas relevante para "compatibilidade" de saída — impressão usará o layout de tela completo (sidebar/header consumindo espaço). Não corrigido nesta rodada (decisão de design de conteúdo de impressão fora do escopo mecânico).

## Resumo por severidade
- Crítico: 0
- Alto: 0
- Médio: 1 (cobertura de breakpoint parcial frente aos 8 pontos solicitados — documentado, não corrigido, decisão de arquitetura)
- Baixo: 1 (`@media print` ausente, já contado em html-css-js.md)
- Recomendação: 1 (validar visualmente as 3 faixas de breakpoint nos 8 tamanhos exatos em navegador real)

## Pendência formal
**Nenhum teste real em Chromium, Firefox ou WebKit foi possível neste ambiente** (sem navegador instalado, sem Playwright/Puppeteer com binários baixados — sandbox sem acesso confirmado a download de binários de navegador). Recomenda-se fortemente rodar Playwright/Lighthouse com os 8 viewports solicitados (320/375/768/1024/1366/1440/1920/2560px) em ambiente com navegador real antes da publicação pública, para confirmar visualmente que as 3 faixas de `@media` cobrem adequadamente os 8 pontos e que não há overflow horizontal ou sobreposição de elementos.
