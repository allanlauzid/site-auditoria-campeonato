# Inventário Completo — Auditoria RC1 (portal-v1-auditoria)

Data: 2026-08-05
Escopo: árvore completa de `portal-v1-auditoria` (cópia de trabalho do RC1, `portal` original preservado intocado).

## 1. Contagem geral

- Total de arquivos rastreados (excluindo a própria pasta `auditoria/`): 77
- Distribuição por extensão: html=52, md=13, json=6, svg=2, js=2, xml=1, txt=1, css=1

Observação: os 13 `.md` contados aqui são os documentos de controle do próprio portal (README.md, RELEASE-CANDIDATE.md, ACCESSIBILITY.md, DESIGN_SYSTEM.md, MAINTAINABILITY.md, PERFORMANCE.md e relatórios em `/relatorios`), não os 21 `.md` fonte de "arquivos claude" (esses ficam fora da árvore do portal e foram hasheados separadamente no manifesto).

## 2. Classificação por tipo

- Páginas públicas de entrada: `index.html`, `404.html`
- Páginas de índice: `docs/fases/index.html`, `docs/projetos/index.html`, `docs/manuais/index.html`, `docs/roadmaps/index.html`, `search/index.html`
- Páginas de conteúdo: 6 fases, 11 projetos, 4 manuais, 1 glossário, 1 roadmap (mapa-constitucional), 1 arquitetura (engenharia-documentacao) = 24 páginas de conteúdo
- Componentes (pattern library): 19 arquivos em `/components`
- Template: `templates/document-template.html`
- Assets: `assets/css/design-system.css`, `assets/js/navigation.js`, `assets/js/search.js`, `assets/icons/*.svg` (2 arquivos)
- Dados: 5 JSONs em `/data`
- Documentação técnica/controle: README.md, RELEASE-CANDIDATE.md, ACCESSIBILITY.md, DESIGN_SYSTEM.md, MAINTAINABILITY.md, PERFORMANCE.md
- Relatórios: conteúdo de `/relatorios`
- Configuração: robots.txt, sitemap.xml

Nenhum arquivo foi classificado como "residual" ou "potencialmente obsoleto" fora dos itens discutidos na seção 4 (componentes não referenciados).

## 3. Reachability real (crawl de links a partir de index.html)

Foi feito um crawl real (não estimado) seguindo `href` de `<a>` em todas as páginas HTML navegáveis (excluindo `/components` e `/templates`, que não são páginas de navegação pública), resolvendo tanto links relativos quanto absolutos (`/docs/...`).

- Páginas alcançáveis a partir de `index.html`: 29 de 31 páginas HTML de navegação candidatas.
- Páginas HTML **não alcançáveis** a partir de `index.html` seguindo links:
  - `404.html` — esperado, página de erro não deve ter link de entrada normal (é servida por configuração de hosting, não por navegação).
  - `search/index.html` — página de busca não está linkada por `<a href>` direto a partir do fluxo principal; é acessada via componente de busca (search-bar/JS), não por link estático. Merece nota para a Etapa 3.3 (verificar se há pelo menos um link visível de acesso à busca, ex. no header).
- Nenhum link quebrado foi detectado durante o crawl (0 hrefs resolvidos para caminho inexistente em disco).

## 4. Componentes não referenciados

De 19 arquivos em `/components`, o grep por nome de arquivo em todo o portal mostrou:
- 11 componentes sem nenhuma menção ao nome do arquivo em outro lugar do portal: accordion, buttons, callouts, cards, code-block, dropdown, index-list, roadmap, search-results, tabs, timeline.
- Ao restringir a checagem ao nome-base (sem extensão) também presente em algum outro arquivo (indicando ao menos referência textual/comentário), apenas 2 ficam sem qualquer menção: `buttons.html` e `callouts.html`.

Interpretação: os componentes em `/components` funcionam como **biblioteca de padrões (pattern library)** de referência visual/estrutural — não são incluídos via fetch/include em tempo de execução (não há mecanismo de include estático no portal), e várias páginas HTML de conteúdo (fase1–fase6, engenharia-documentacao, document-template) contêm comentários `<!-- COMPONENTE: ... -->` remetendo a padrões de `/components`, mas sem apontar diretamente para o arquivo. Isso é consistente com o padrão observado no restante do portal. `buttons.html` e `callouts.html` não têm nem esse tipo de menção — candidatos a "arquivo sem referência" mais forte, mas não são código morto crítico (fazem parte do design system documentado em DESIGN_SYSTEM.md). Não removidos nesta fase (Fase 1 é só preservação/inventário) — registrados para decisão na Etapa 3.3.

## 5. Assets não referenciados

Nenhum asset (`design-system.css`, `navigation.js`, `search.js`, ícones SVG) ficou sem referência — todos são citados por `<link>`/`<script>`/`href` em pelo menos uma página.

## 6. Duplicados por hash idêntico

Nenhum arquivo duplicado por conteúdo (hash SHA-256 idêntico) foi encontrado entre os 77 arquivos da árvore.

## 7. Consistência de nomenclatura

Verificação real (não estimada) de padrões:
- Fases: `fase1.html` a `fase6.html` — nomenclatura consistente (sem hífen, numeração simples de 1 dígito), e é o padrão usado de forma uniforme em `data/documents.json` e `data/navigation.json`. Não há mistura com formato `fase-1-x.html`.
- Projetos: `projeto01.html` a `projeto11.html` — nomenclatura consistente com zero-padding de 2 dígitos, também uniforme em ambos os JSONs de dados.
- Manuais: `manual-crm.html`, `manual-dashboard.html`, `manual-formulario.html`, `manual-stories.html` — padrão `manual-<slug>.html` consistente.

Nenhuma inconsistência de nomenclatura foi detectada nesta auditoria.

## 8. Achados a levar para próximas etapas

1. `components/buttons.html` e `components/callouts.html`: nenhuma referência textual em todo o portal — avaliar remoção ou adicionar menção nas páginas de fase/documentação (decisão de conteúdo, não de bug).
2. `search/index.html`: não alcançável por link direto a partir de `index.html` — verificar em Etapa 3.3 se o cabeçalho/search-bar realmente aponta para essa página em tempo de uso real (JS dinâmico pode cobrir isso, mas o crawl estático de `<a href>` não encontrou link).
3. `404.html`: comportamento esperado, sem ação necessária.
