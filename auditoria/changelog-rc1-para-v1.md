# Changelog Consolidado — RC1 → RC2 (Etapa 3, Fase 18)

Data de geração: 2026-08-05
Fonte: consolidação de todas as correções aplicadas e documentadas nas Fases 1–17 desta auditoria (arquivos lidos integralmente em `auditoria/*.md`).

Regra geral válida para **todas** as entradas abaixo, salvo indicação contrária: impacto no conteúdo constitucional = **nenhum** (apenas HTML/JSON/CSS de publicação); confirmação de que o Markdown fonte original (`arquivos claude/`, 21 arquivos) **não foi alterado** = **confirmado** em todos os itens.

---

## A. Correções técnicas

| ID | Problema | Severidade | Arquivo(s) | Componente/linha | Correção aplicada | Justificativa | Teste executado | Resultado |
|---|---|---|---|---|---|---|---|---|
| T-01 | Entrada residual de exemplo (dado fictício da Etapa 2A) em `search-index.json` | Baixo | `data/search-index.json` | entrada `id: "exemplo-glossario-governanca-marca"` | Entrada removida | `docId` não correspondia a nenhum documento real; `_comment` do próprio arquivo confirmava origem de placeholder | `python json.load` / `node JSON.parse` antes e depois | 390 → 389 entradas, ambos os parsers OK |
| T-02 | Âncora quebrada em exemplo estático do componente de busca | Médio | `components/search-results.html` (linhas 7, 9) | `href="...#sistema-simbolico"` | Corrigido para `#17-sistema-simbolico` | Id real do heading em `fase3.html` inclui prefixo numérico `17-` | Crawl de âncoras (BeautifulSoup) | 0 âncoras quebradas remanescentes |
| T-03 | `sitemap.xml` desatualizado/placeholder (5 URLs, domínio fictício) | Alto | `sitemap.xml` | arquivo inteiro | Regerado com 30 URLs reais (crawl BFS), placeholder `{{baseUrl}}` | Sitemap antigo era reconhecidamente um placeholder ("Etapa 2B deve gerar automaticamente") | `xml.etree.ElementTree.parse` | XML bem formado, 30 `<url>` válidas |
| T-04 | Domínio fictício `exemplo.invalido` em 25 arquivos ativos (69+ ocorrências) | Alto | `index.html`, 23 páginas `docs/**`, `robots.txt`, `sitemap.xml` | canonical, og:url, JSON-LD `url`, `Sitemap:` | Substituído por placeholder `{{baseUrl}}`; `data/site-config.json` criado (`baseUrl: ""`) | Domínio de exemplo não deve aparecer em produção; nenhum domínio real foi fornecido (não inventado) | Varredura recursiva `grep` pós-correção | 0 ocorrências em arquivos ativos (2 remanescentes intencionais em relatórios de auditoria, como evidência histórica) |
| T-05 | 5 JSONs sem validação por parser real (apenas leitura manual no RC1) | Alto | `data/documents.json`, `navigation.json`, `search-index.json`, `roadmaps.json`, `glossario.json` | arquivos inteiros | Validados com `python json.load` e `node JSON.parse` | Exigência explícita da auditoria formal da Etapa 3 (item 4 dos critérios de promoção do RC1) | Execução real dos dois parsers | 5/5 válidos, 0 corrupção UTF-8 |
| T-06 | 5 páginas-índice com salto de heading (h1→h3 sem h2) | Médio | `docs/fases/index.html`, `docs/glossario/index.html`, `docs/manuais/index.html`, `docs/projetos/index.html`, `docs/roadmaps/index.html` | `<h3 class="card__title">` (76 ocorrências) | Promovido para `<h2 class="card__title">` | Seletor CSS é por classe, não por tag — alteração segura, confirmado em `design-system.css:276` | Reinspeção estrutural pós-correção | 0 saltos de heading remanescentes |
| T-07 | `index.html` com salto h2→h4 na timeline | Médio | `index.html` | 3× `<h4 class="timeline__title">` | Rebaixado para `<h3 class="timeline__title">` | Seletor por classe, `design-system.css:465` | Reinspeção estrutural | Corrigido |
| T-08 | Contraste WCAG marginal (texto-muted no tema claro) | Médio | `assets/css/design-system.css:40` | `--color-text-muted` | `#6B6F73` → `#63676B` | Razão original 4.4957:1 abaixo do mínimo AA (4.5:1) para texto normal | Cálculo real de luminância relativa WCAG (Python) | Nova razão 5.06:1, PASS |
| T-09 | `<th>` sem `scope` em 14 arquivos | Baixo | 14 páginas (fases, projetos, manuais, arquitetura) | todos os `<th>` de `<thead>` | Adicionado `scope="col"` | 100% dos `<th>` são cabeçalho de coluna (confirmado por inspeção) | Script Python de verificação pós-correção | 0 `<th>` sem `scope` remanescentes |
| T-10 | 6 páginas-índice sem canonical/OG/Twitter Card | Médio | `docs/fases/index.html`, `glossario/index.html`, `manuais/index.html`, `projetos/index.html`, `roadmaps/index.html`, `roadmaps/mapa-constitucional.html` | `<head>` | Adicionado bloco canonical + 6 OG + 3 Twitter Card (mesmo padrão `{{baseUrl}}`) | Páginas indexáveis (sem noindex) e presentes no sitemap precisam de metadados completos | Parser HTML real (Python `html.parser`) | 6/6 páginas com metadados completos |

## B. Correções editoriais de interface (rótulos internos removidos)

| ID | Problema | Severidade | Arquivo | Linha/local | Correção aplicada |
|---|---|---|---|---|---|
| E-01 | Rótulo interno "Lote 3" exposto em callout público | Baixo | `manual-crm.html`, `manual-dashboard.html`, `manual-formulario.html`, `manual-stories.html` | linha 76 (cada) | "Cadeia conceitual do Lote 3..." → "...do ecossistema de dados..." |
| E-02 | Rótulo interno "(fim do Lote 2)" em título de navegação | Baixo | `manual-formulario.html` | doc-nav, linha 268 | Sufixo removido |
| E-03 | Rótulo interno "(Lote 3)" em título de navegação | Baixo | `projeto11.html` | doc-nav, linha 400 | Sufixo removido |
| E-04 | Referência desatualizada a "Lote 4 — ainda não produzido" para página já publicada | Baixo | `manual-stories.html` | doc-nav, linha 322 | Simplificado, texto factual |
| E-05 | Rótulo interno "Lote 3" em texto de status | Baixo | `projeto11.html` | linha 377 | "Status atualizado no Lote 3" → "Status atual" |
| E-06 | Texto "Placeholder estrutural." visível ao usuário | Médio | `docs/roadmaps/index.html` | 2 cards | Substituído por descrição factual não inventada |
| E-07 | Texto "Placeholder estrutural — Etapa 2B" desatualizado (etapa já concluída) | Médio | `docs/glossario/index.html` | 3 ocorrências | Reescrito refletindo estado real |
| E-08 | Texto de erro 404 afirmando que conteúdo ainda não foi migrado (falso no RC1) | Médio | `404.html` | linhas 24–26 | Reescrito como mensagem 404 genérica e evergreen |
| E-09 | Texto de busca afirmando índice de exemplo (falso — 389/441 entradas reais) | Médio | `search/index.html` | linhas 24–28 | Reescrito afirmando corretamente o índice real |

## C. Atualização de índice (dados/busca)

| ID | Problema | Severidade | Arquivo | Correção aplicada |
|---|---|---|---|---|
| I-01 | Glossário com 26/46 termos oficiais, 3 com `[placeholder]` | Alto | `data/glossario.json` | Completado para 46 termos oficiais (Etapa 8) + 6 complementares = 52 entradas; placeholders removidos |
| I-02 | Glossário não publicado integralmente na página pública | Alto | `docs/glossario/index.html` | 52 cards publicados (id, categoria, definição, link de origem) |
| I-03 | Termos de glossário ausentes do índice de busca | Médio | `data/search-index.json` | 52 entradas novas (`glossario-termo-<id>`) adicionadas — índice de busca: 389 → 441 |
| I-04 | 253 menções ambíguas a documentos (não linkadas, sem estrutura de auditoria) | Recomendação | `data/cross-references.json` (novo) | Artefato gerado com os 509 itens classificados (exata/ambígua/futura), trilha de auditoria para curadoria manual futura |
| I-05 | 188 referências cruzadas exatas em prosa não convertidas em links | Médio | 15 arquivos de `docs/**` | Convertidas em `<a href="...#id-capitulo">` preservando texto visível, via manipulação de árvore DOM (não regex bruto) |

## D. Atualização de metadados

| ID | Problema | Severidade | Arquivo | Correção aplicada |
|---|---|---|---|---|
| M-01 | Comentário `_comment` de `documents.json` afirmando "nenhum conteúdo real migrado" | Baixo | `data/documents.json` | Comentário atualizado para refletir migração integral |
| M-02 | Comentário `_comment` de `search-index.json` afirmando "2 entradas de exemplo" | Baixo | `data/search-index.json` | Atualizado para refletir 389 (depois 441) entradas reais |
| M-03 | Comentário `_comment` de `glossario.json` afirmando "3 entradas de exemplo" | Baixo | `data/glossario.json` | Atualizado para refletir contagem real e status de completude |
| M-04 | `roadmaps.json`: status citando rótulo interno "Lote 3" | Baixo | `data/roadmaps.json` | 4 ocorrências: `"produzido — publicado no Lote 3..."` → `"produzido — publicado no portal"` |
| M-05 | Badge Home ainda "RC1" após conclusão da auditoria independente | — | `index.html` | Badge, texto de estado e callout atualizados para "Release Candidate RC2", com data 2026-08-05 e link para `RELEASE-CANDIDATE-RC2.md` |

## E. Decisão de governança

| ID | Problema | Severidade | Arquivo(s) | Correção aplicada |
|---|---|---|---|---|
| G-01 | Sobreposição de roadmap Projeto 07 ↔ Projeto 09 (9 itens) sem decisão formal | Médio | `governanca/decisao-roadmaps-projeto07-projeto09.md` (novo), `data/roadmaps.json`, `docs/projetos/projeto07.html`, `projeto09.html` | Decisão formal publicada: tratamento como manual único com dupla filiação; roadmaps-fonte nos .md mantidos intactos; `roadmaps.json` recebeu campos aditivos (`idCanonico`, `aliases`, etc.) em 18 itens |
| G-02 | Interdependência Projeto 10 ↔ Projeto 11 rotulada como "circularidade" sem decisão formal | Médio | `governanca/decisao-interdependencia-projeto10-projeto11.md` (novo), `data/documents.json`, `docs/projetos/projeto10.html`, `projeto11.html` | Reclassificada formalmente como "interdependência funcional bidirecional"; badges reescritos citando a decisão nominalmente |

## F. Melhoria de acessibilidade

Ver itens T-06, T-07, T-08, T-09 acima (heading, contraste, `scope`). Sem itens adicionais fora da tabela técnica.

## G. Melhoria de performance

| ID | Achado | Severidade | Ação |
|---|---|---|---|
| P-01 | Nenhum defeito de performance corrigível estaticamente foi encontrado (fontes de sistema, sem lazy-loading necessário, JS `type="module"` já deferido, sem duplicação de assets) | — | Nenhuma correção necessária; recomendação de compressão gzip/brotli registrada para a camada de hospedagem (não aplicável neste sandbox) |

## H. Melhoria de SEO

Ver item T-10 (canonical/OG/Twitter em 6 páginas-índice). Achados adicionais (JSON-LD ausente em páginas-índice, `BreadcrumbList` ausente) foram **documentados como recomendação**, não corrigidos nesta rodada (exigem modelagem de dados estruturados por página, fora do escopo de correção mecânica).

---

## Achados **não corrigidos** nesta auditoria (fora de escopo/dependem de ferramentas indisponíveis)

Estes itens NÃO são bugs corrigíveis neste ambiente — são riscos aceitos formalmente ou bloqueadores formais para v1.0, listados aqui para rastreabilidade (detalhamento completo em `relatorio-auditoria-independente.md` e `RELEASE-CANDIDATE-RC2.md`):

1. `{{baseUrl}}` não substituído por domínio de produção real (canonical, og:url, JSON-LD, sitemap.xml, robots.txt) — depende de decisão de negócio (domínio real), não de correção técnica.
2. Core Web Vitals (LCP/CLS/INP) reais não medidos — requer Lighthouse/navegador real, indisponível neste sandbox.
3. Teste cross-browser real (Chromium/Firefox/WebKit) nos 8 viewports solicitados — requer navegador real, indisponível.
4. Teste com leitor de tela real (NVDA/VoiceOver/JAWS) — requer ambiente com AT, indisponível.
5. "Sem erros de console" não é verificável sem navegador real — apenas `node --check` (sintaxe) foi possível.
6. `innerHTML` sem escape em `navigation.js` (risco teórico, sem vetor de exploração ativo hoje) — recomendado como hardening pós-RC2, não bloqueador.
7. `@media print` ausente — decisão de design de conteúdo de impressão, fora do escopo mecânico.
8. Ranking de busca sub-ótimo para queries genéricas (ex. "Fase 3") — melhoria de relevância, não defeito funcional.
9. 253 menções ambíguas de referências cruzadas não linkadas — decisão consciente para evitar linkagem especulativa.

## Confirmação de integridade da fonte

Confirmado nesta consolidação: nenhum dos 21 arquivos `.md` em `arquivos claude/` foi alterado em nenhuma fase (nenhuma ferramenta de escrita foi usada fora de `portal-v1-auditoria/`); a pasta `/portal` original (RC1 histórico) permanece intocada. Todas as correções acima têm impacto no conteúdo constitucional = **nenhum** — afetam exclusivamente HTML/JSON/CSS de publicação.
