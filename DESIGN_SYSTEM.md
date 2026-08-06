# Design System — Portal CBKS

Fonte única: `assets/css/design-system.css`. Tudo abaixo é implementado lá,
com comentários de seção correspondentes (§1 a §23).

## Paleta

Inspirada (não copiada literalmente) na Constituição Visual do Projeto03:
Ferro `#2B2E30`, Terracota Queimada `#B5502C`, Osso `#EDE7DD`, Carvão `#141414`,
mais os apoios Cinza-Ferro `#6B6F73` e Verde-Oliva `#7A8073`.

Adaptação para contexto documental: a paleta de campanha (alto impacto
emocional) foi traduzida em papéis semânticos de leitura prolongada —
fundo "Osso" levemente clareado (`--color-osso-soft #F5F1E9`) em vez de
branco puro (mantém o princípio "nunca branco puro, que soa clínico",
citado no Projeto03), texto em Carvão (contraste AA+), Terracota reservada
a links/destaque/CTA (não a blocos grandes de cor, que cansariam a leitura).

Tema escuro usa Carvão como fundo e uma Terracota clareada (`#D97A52`) para
manter contraste AA sobre fundo escuro (a Terracota original é escura demais
para texto/link sobre `#141414`).

## Tokens

| Categoria | Tokens | Uso |
|---|---|---|
| Cor | `--color-bg`, `--color-text`, `--color-accent`, `--color-border`, estados (success/warning/danger/info) | Papéis semânticos, nunca cor bruta direto no componente |
| Tipografia | `--font-display` (serifada, títulos), `--font-body` (sistema, texto), `--font-mono` (código) | Contraste display/corpo típico de portais editoriais (Stripe/React Docs) |
| Escala tipográfica | `--fs-100`..`--fs-800` | Escala modular 12→48px |
| Espaçamento | `--space-1`..`--space-9` | Escala de 4px, todo espaçamento do sistema deriva daqui |
| Grid/layout | `--sidebar-width`, `--toc-width`, `--page-max-width`, `--content-max-width` | Grid de 3 colunas (sidebar/main/toc) do `.page-shell` |
| Forma | `--radius-sm/md/lg/full` | Consistência de arredondamento |
| Sombra | `--shadow-sm/md/lg` | 3 níveis de elevação |
| Transição | `--transition-fast/base/slow` | 120/200/320ms, todas `ease` |
| Z-index | `--z-dropdown`..`--z-toast` | Escala única evita conflito de empilhamento entre componentes |

## Tipografia

- Display (`--font-display`): serifada, usada em `h1`–`h6`. Remete a "documento
  institucional/constitucional" sem ser decorativa.
- Corpo (`--font-body`): stack de sistema (`-apple-system`, Segoe UI, Roboto...)
  — zero custo de carregamento de fonte, alta legibilidade em qualquer SO.
- `--content-max-width: 78ch` limita a largura de parágrafos para conforto de
  leitura (linha ideal ~70-80 caracteres), independente da largura da coluna.

## Componentes (ver `components/*.html` para marcação completa)

Header, Sidebar, Footer, Breadcrumb, Cards, Callouts, Tabelas, Code block,
Badges, TOC/scroll-spy, Tabs, Accordion, Dropdown, Modal, Search bar/results,
Timeline, Roadmap grid, Document navigator, Glossary inline tooltip.
Cada um tem uma seção numerada correspondente em `design-system.css`.

## Responsividade

3 breakpoints (ver §23 do CSS):
- **Desktop (≥1200px)**: grid de 3 colunas completo (sidebar + main + TOC).
- **Desktop estreito/tablet grande (960–1199px)**: TOC recolhido, sidebar+main.
- **Tablet/mobile (<960px)**: apenas main; sidebar vira painel overlay
  (`.is-open`) acionado pelo botão hambúrguer; nav superior é escondida
  (fica só logo + ações) para não competir com o hambúrguer.
- **Mobile estreito (<720px)**: ajustes finos de padding, `.doc-nav` empilha,
  `.card-grid` vira coluna única, títulos reduzem um degrau na escala.

## Tema claro/escuro

Controlado por `[data-theme]` no `<html>`, persistido em `localStorage`
(`kbs-portal-theme`) por `navigation.js`. Fallback automático via
`prefers-color-scheme` quando o usuário não escolheu manualmente.
