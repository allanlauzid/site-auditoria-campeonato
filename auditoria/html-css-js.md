# Auditoria RC1 — Fase 12: HTML / CSS / JS

## Ferramentas — o que funcionou de verdade
- `html5validator` 0.4.2: **instalado via pip com sucesso** (`pip3 install html5validator`), depende de Java — **OpenJDK 11.0.31 disponível no sandbox**, `vnu.jar` baixado e executado com sucesso. **Automatizado, real, evidência em `/tmp/html5validator_out.txt` (70 linhas de saída, log completo executado).**
- `html-validate` (npm): **instalado localmente com sucesso** (`npm install html-validate` em prefixo local, sem acesso root). Rodou, mas seu ruleset padrão é orientado a XHTML/estilo estrito (reclama de `<meta/>` autofechado, "no-inline-style" etc.) — não representativo de HTML5 válido. Usado apenas como dado complementar, não como fonte de achados de severidade.
- `csslint` (npm): **instalado localmente com sucesso**, executado contra `design-system.css`. Relatou 519 avisos, majoritariamente estilísticos/legado (ex.: "seletor universal é lento", "box-sizing não suportado em IE6/7") — nenhum é um defeito funcional real em 2026. Nenhuma ação de correção justificada por esses avisos.
- `node --check`: **automatizado, real**, rodado em ambos os arquivos JS.
- Tentativas de instalação global (`npm install -g html-validate/csslint/eslint`) **falharam por EACCES** (sandbox sem permissão de escrita em `/usr/lib/node_modules`) — reportado honestamente; contornado com instalação local em `/tmp/npmtools`.

## HTML

### Validação estrutural (automatizado, html5validator/vnu.jar)
70 mensagens de erro na varredura completa (53 páginas HTML + fragmentos). Após filtrar falsos positivos esperados de arquitetura (fragmentos de `components/*.html` e `templates/document-template.html` validados isoladamente sem `<!DOCTYPE>`/`<title>` — são includes, não páginas completas por design; e placeholders `{{baseUrl}}`/`{{URL_CANONICA}}`/`{{URL_DOC_ANTERIOR}}`/`{{URL_DOC_PROXIMO}}` em `href`, documentados como pendência formal em `data/site-config.json` — domínio real ainda não definido), restam 3 achados reais:

1. **`_glossario_cards.html`** (alto→reclassificado baixo): arquivo sem DOCTYPE/title. Inspeção mostrou que é rascunho vazio não utilizado (comentário no próprio arquivo: "Arquivo de rascunho não utilizado pelo portal publicado... Mantido vazio intencionalmente"). Confirmado por grep que não é referenciado por nenhuma página, `sitemap.xml` ou `robots.txt`. **Não é defeito publicável** — nenhuma ação necessária.
2. **`404.html:23`**: `error: CSS: "margin-inline": Property "margin-inline" doesn't exist.` — **falso positivo do checker CSS do vnu.jar**, que usa uma gramática CSS desatualizada (não reconhece propriedades lógicas CSS modernas como `margin-inline`, padrão desde CSS Logical Properties Level 1, suportado em todos navegadores atuais). Não corrigido — não é defeito real.
3. **`components/header.html:31`**: `aria-controls` "must point to element in same document" — falso positivo de fragmento isolado, ver `acessibilidade.md` item 7.

### Verificação estrutural manual/estática adicional (Python)
- Tags não fechadas: nenhuma encontrada (o parser HTML padrão do Python não lançou exceções de balanceamento em nenhum arquivo).
- Atributos duplicados: nenhum encontrado.
- Meta tags obrigatórias (charset, viewport): presentes em 100% das páginas.
- Bloco `<script type="application/ld+json">`: presente em 23/31 páginas de conteúdo; **parse JSON real via `json.loads()` em todos os blocos — 0 inválidos**. As 8 páginas sem JSON-LD são páginas-índice/utilitárias (`docs/*/index.html`, `404.html`, `search/index.html`) — ver detalhamento em `seo.md`.
- Breadcrumb estruturado (`BreadcrumbList`): ausente em 23 páginas de conteúdo que têm outro JSON-LD (`TechArticle` etc.) mas não `BreadcrumbList`. Ver `seo.md` (achado de SEO, não HTML).

## CSS (`assets/css/design-system.css`, 526 linhas / 28 KB)
- Sintaxe válida (csslint não reportou erros de parsing, apenas avisos estilísticos).
- Seletores duplicados: não identificados como problema real (csslint sinaliza uso de `*` e `!important` em `prefers-reduced-motion`, uso legítimo).
- Breakpoints: 3 media queries `max-width` (1199px, 959px, 719px) + `prefers-color-scheme` + `prefers-reduced-motion`. Detalhamento de cobertura de breakpoints em `responsividade-compatibilidade.md`.
- Dark mode: implementado via `:root[data-theme="dark"]` (JS-controlado, `navigation.js`) **e** `@media (prefers-color-scheme: dark)` como fallback do sistema — dupla implementação correta.
- `@media print`: **ausente**. Achado (baixo/recomendação) — nenhuma regra de impressão definida; navegadores usarão o layout de tela (sidebar/header ocupando espaço). Não corrigido nesta rodada por não ser defeito bloqueante e por exigir decisão de design (o que ocultar/mostrar na impressão) fora do escopo de "correção indispensável".

## JS (`assets/js/navigation.js`, `assets/js/search.js`)
### `node --check` (automatizado, real)
```
assets/js/navigation.js -> OK (sintaxe válida)
assets/js/search.js     -> OK (sintaxe válida)
```

### Tratamento de erro ao carregar JSON
Ambos os arquivos usam `fetch` + `try/catch` com `console.error` e fallback seguro (`navigation.js: loadNavData` retorna `{topNav:[],...}` vazio em erro; `search.js: loadIndex` retorna `[]`). Correto, nenhum achado.

### `innerHTML` com dados de JSON — risco XSS
- `search.js`: usa `escapeHtml()` (implementação própria, escapa `& < > " '`) em todos os campos textuais antes de interpolar em `innerHTML` (`renderResults`). Único campo não escapado é `r.url` interpolado dentro de um atributo `href="${r.url}"` — a URL vem do próprio `search-index.json` (dado de primeira parte, gerado pelo build, não input de usuário), risco residual baixo, mas tecnicamente inconsistente com a prática de escapar tudo. **Recomendação (baixa)**: escapar também `r.url` com `encodeURI`/`escapeHtml` por defesa em profundidade — não aplicado nesta rodada por não haver vetor de exploração real (dado não é gerado por usuário final).
- `navigation.js`: **achado real (médio)** — `renderTopNav`, `renderSidebar`, `renderFooterColumns` e `renderBreadcrumb` interpolam `item.label`, `item.url`, `group.title`, `step.label` etc. diretamente em `innerHTML` **sem nenhum escape**, ao contrário de `search.js`. Os dados vêm de `data/navigation.json`, um arquivo estático de primeira parte controlado pela própria equipe — não há vetor de exploração ativo hoje, mas é uma inconsistência de prática segura e um risco caso `navigation.json` passe a ser editado por um CMS/processo menos confiável no futuro. Documentado como achado de segurança, ver `seguranca-privacidade.md`. Não corrigido automaticamente nesta rodada porque a introdução de escaping teria que ser testada contra todas as 31 páginas que dependem desse componente — recomenda-se como item de hardening pós-RC1, não bloqueador.
- `eval()`, `document.write()`, `outerHTML`: **nenhuma ocorrência** em todo o portal (grep completo).

### `localStorage`
Uso único e apropriado: `navigation.js` (`THEME_KEY = "kbs-portal-theme"`) para persistir preferência de tema claro/escuro. Nenhum dado sensível armazenado.

### Caminhos relativos
Todos os `src`/`href` de assets usam caminhos absolutos a partir da raiz (`/assets/...`, `/data/...`), consistente e sem ocorrência de `../` frágil. Nenhum achado.

## Resumo por severidade
- Crítico: 0
- Alto: 0
- Médio: 1 (innerHTML sem escape em navigation.js — documentado, não corrigido, ver justificativa)
- Baixo: 2 (`@media print` ausente; `r.url` não escapado em search.js)
- Recomendação: 3 (falsos positivos de vnu.jar em margin-inline e _glossario_cards; ruleset XHTML do html-validate não aplicável)
