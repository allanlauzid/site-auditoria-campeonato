# Release Candidate — RC2

**Este portal está marcado como RELEASE CANDIDATE — RC2. Não é "versão 1.0 final".**

Data desta auditoria: 2026-08-06
Escopo: Etapa 3 — Auditoria Independente (Fases 1–19), executada sobre o RC1 (Etapa 2B, datado de 2026-08-05).

Este documento **não substitui** `RELEASE-CANDIDATE.md` (histórico original do RC1), que permanece preservado sem edição. RC2 documenta o que mudou desde então.

---

## 1. O que mudou de RC1 para RC2

Resumo completo, com IDs de correção e evidência, em `auditoria/changelog-rc1-para-v1.md`. Principais números:

| Item | RC1 (2026-08-05) | RC2 (2026-08-06) |
|---|---|---|
| Glossário | 26/46 termos (3 com `[placeholder]`) | 46/46 termos oficiais + 6 complementares = 52 publicados e indexados |
| Validação de JSON | Leitura manual (sem parser real) | 5/5 arquivos validados por `python json.load` + `node JSON.parse` |
| Entrada residual em `search-index.json` | 1 entrada de exemplo (`exemplo-glossario-governanca-marca`) presente | Removida (390 → 389, depois 441 com termos de glossário) |
| Links internos | Amostragem de 176 links | Varredura exaustiva: 618 links, 0 quebras reais |
| Âncoras quebradas | Não auditado exaustivamente | 1 encontrada e corrigida (`components/search-results.html`); 0 remanescentes |
| IDs duplicados | Não auditado exaustivamente | 0 encontrados (52 páginas) |
| Páginas órfãs | Não auditado exaustivamente | 0 encontradas (crawl BFS 100%) |
| Referências cruzadas em prosa | Texto simples, sem links | 188 convertidas em links reais (de 195 elegíveis; 509 menções classificadas) |
| `sitemap.xml` | Não gerado (placeholder, 5 URLs, domínio fictício) | Gerado e validado, 30 URLs reais, `{{baseUrl}}` |
| Domínio fictício `exemplo.invalido` | 25 arquivos ativos / 69+ ocorrências | 0 ocorrências em arquivos ativos (substituído por `{{baseUrl}}`) |
| Rótulos internos de processo ("Lote N", "Placeholder estrutural" etc.) em páginas públicas | 9 ocorrências | 0 ocorrências remanescentes |
| Decisão formal Projeto07↔Projeto09 | Pendente (apenas badge de aviso) | Publicada (`governanca/decisao-roadmaps-projeto07-projeto09.md`) |
| Decisão formal Projeto10↔Projeto11 | Pendente (rotulado "circularidade") | Publicada, reclassificado como "interdependência funcional bidirecional" |
| Acessibilidade — heading skip | 2 padrões (76+3 ocorrências) | Corrigido, 0 remanescentes |
| Acessibilidade — contraste WCAG | 1 par marginal (4.4957:1) | Corrigido (5.06:1) |
| Acessibilidade — `<th>` sem `scope` | 14 arquivos | Corrigido, 0 remanescentes |
| SEO — canonical/OG/Twitter ausente | 6 páginas-índice | Corrigido, 6/6 completas |
| Auditoria independente (12 especialistas, 2 rodadas) | Não existia | Executada — ver `auditoria/relatorio-auditoria-independente.md` |

Nenhuma dessas correções alterou o conteúdo constitucional dos 21 documentos .md fonte (`arquivos claude/`) nem a pasta `/portal` original — confirmado em cada relatório de fase e reafirmado no changelog.

## 2. Critérios de promoção — cumpridos

Os seguintes critérios objetivos (ver seção 4 abaixo para a lista completa) foram **integralmente verificados e cumpridos** dentro do que este ambiente permite validar:

1. 21 documentos oficiais publicados integralmente — confirmado (`integridade-documental.md`, 0/21 com conteúdo ausente após correções).
2. Página de controle publicada e diferenciada — confirmado (`docs/arquitetura/engenharia-documentacao.html`).
3. Integridade documental 100% validada — confirmado.
4. 5/5 JSONs válidos por parser real — confirmado (`validacao-json.md`).
5. Entrada residual resolvida — confirmado (removida).
6. Glossário 46/46 — confirmado (`glossario-46-termos.md`).
7. Sitemap real gerado e validado — confirmado (`validacao-sitemap.md`, 30 URLs, XML bem formado).
8. Zero links internos quebrados — confirmado (`links-rotas-ancoras.md`).
9. Zero âncoras quebradas — confirmado.
10. Zero IDs duplicados — confirmado.
11. Zero páginas oficiais órfãs — confirmado.
12. Referências cruzadas exatas convertidas — confirmado (188/195 elegíveis).
13. Referências futuras corretamente marcadas — confirmado (59 badges mantidos).
14. Rótulos editoriais internos removidos — confirmado (`limpeza-editorial.md`, 0 remanescentes).
15. Decisão formal Projeto07↔Projeto09 publicada — confirmado.
16. Decisão formal Projeto10↔Projeto11 publicada — confirmado.
17. Acessibilidade sem achados críticos/altos — confirmado (0 críticos, 0 altos; médios/baixos corrigidos).
18. Relatórios produzidos (19 arquivos de auditoria + governança) — confirmado, todos os 19 arquivos solicitados foram localizados e lidos integralmente.
19. Auditoria independente conduzida (Fase 19, 2 rodadas) — confirmado.
20. Todos os arquivos de controle atualizados nesta rodada (`index.html`, este documento) — confirmado.

## 3. Critérios de promoção — PENDENTES (bloqueadores formais para v1.0)

Estes 6 itens **não podem ser genuinamente verificados neste ambiente** (sandbox sem navegador gráfico, sem Lighthouse, sem leitor de tela, sem domínio de produção). Cada um está documentado com evidência específica no `relatorio-auditoria-independente.md` (Rodada 2):

| # | Critério pendente | Por que não pode ser confirmado aqui | Referência |
|---|---|---|---|
| 1 | `{{baseUrl}}` substituído por domínio de produção real | Nenhum domínio real foi definido/fornecido até esta auditoria; inventar um violaria a regra de não inventar dados | SE-02, `validacao-sitemap.md`, `data/site-config.json` |
| 2 | JavaScript "sem erros de console" verificado | Apenas `node --check` (sintaxe) foi possível; execução real em DOM/navegador não testada | QA-03, JS-03, `html-css-js.md` |
| 3 | Performance dentro das metas (Core Web Vitals: LCP, CLS, INP) | Lighthouse/WebPageTest/Chrome DevTools indisponíveis no sandbox | PF-02, `performance.md` |
| 4 | Responsividade validada nos 8 viewports exatos (320/375/768/1024/1366/1440/1920/2560px) em navegador real | Sem Chromium/Firefox/WebKit instalado; apenas análise estática do CSS foi possível | CS-03, `responsividade-compatibilidade.md` |
| 5 | Acessibilidade testada com leitor de tela real (NVDA/VoiceOver/JAWS) | Sem AT (assistive technology) disponível no sandbox | AC-04, `acessibilidade.md` |
| 6 | Busca funcional testada em DOM/navegador real (não apenas replicação de algoritmo em Node.js) | Sem navegador real; lógica validada via script Node.js equivalente, não execução do `search.js` real em DOM | QA-04, `busca.md` |

**Nenhum destes 6 itens é um defeito de código encontrado e não corrigido** — são validações que, por natureza, exigem um navegador gráfico real, um servidor de produção com domínio definido, ou hardware/software de acessibilidade assistiva, nenhum dos quais está disponível neste ambiente de auditoria isolado (sandbox de arquivos). Todos os itens genuinamente corrigíveis de forma estática (código, dados, conteúdo) foram corrigidos nesta rodada — ver changelog.

## 4. Decisão

De acordo com a regra do projeto — **"Se qualquer critério falhar, manter o status RC e gerar RC2. Nunca declarar versão 1.0 apenas porque a maioria dos itens foi concluída."** — e havendo 6 dos 26 critérios objetivos de promoção genuinamente não verificáveis neste ambiente (não por omissão de trabalho, mas por ausência de ferramentas de validação em ambiente real), a decisão é:

**MANTER o portal como RELEASE CANDIDATE — RC2.**

20 de 26 critérios objetivos foram integral e verificavelmente cumpridos nesta rodada. Os 6 pendentes são bloqueadores formais, não bugs — ficam registrados como riscos aceitos temporariamente (para uso interno/revisão) e como pré-requisitos obrigatórios antes de qualquer declaração de "versão 1.0".

## 5. Instruções para completar a validação (pré-requisito para v1.0)

1. Definir o domínio de produção real e substituir todas as ocorrências de `{{baseUrl}}` em: 23 páginas de conteúdo, `index.html`, `docs/*/index.html` (6 índices), `sitemap.xml`, `robots.txt` (ver `data/site-config.json`).
2. Publicar o portal em um ambiente de staging real (servidor HTTP, não apenas arquivos locais).
3. Rodar Lighthouse (ou equivalente) em Chrome real contra o staging, capturando LCP, CLS, INP; comparar contra metas de performance.
4. Abrir o portal em Chromium, Firefox e WebKit (ou usar Playwright) nos 8 viewports (320/375/768/1024/1366/1440/1920/2560px) e confirmar visualmente que os 3 breakpoints CSS cobrem adequadamente todas as faixas, sem overflow horizontal ou sobreposição.
5. Testar a navegação completa (incluindo modal de busca, menu mobile, foco/Escape) com um leitor de tela real (NVDA no Windows, VoiceOver no macOS, ou JAWS).
6. Abrir o Console do navegador em todas as páginas principais e confirmar ausência de erros/warnings JS em runtime real.
7. Testar a busca (`search.js`) digitando diretamente no campo de busca do navegador real, não apenas via replicação de algoritmo em Node.js.
8. Após os 6 itens acima serem confirmados e documentados com evidência real (capturas de tela, relatórios do Lighthouse, log do console), reexecutar a checklist completa de 26 critérios e, se todos passarem, promover formalmente a versão 1.0 seguindo o processo descrito em `RELEASE-CANDIDATE.md` (Seção 6).

## 6. Riscos aceitos nesta rodada (RC2), com justificativa

| Risco | Descrição | Justificativa para aceitar temporariamente |
|---|---|---|
| `innerHTML` sem escape em `navigation.js` | Dados de `navigation.json` interpolados sem `escapeHtml()` | Dado estático de primeira parte, sem vetor de exploração ativo hoje (sem CMS, sem input de usuário); recomendado como hardening pós-RC2 |
| `r.url` não escapado em `search.js` (atributo `href`) | Defesa em profundidade incompleta | Dado de build, não de usuário; risco residual baixo |
| 253 menções ambíguas de referências cruzadas não linkadas | Decisão consciente de não linkar especulativamente | Preserva precisão editorial; curadoria manual futura usando `data/cross-references.json` |
| `@media print` ausente | Impressão usará layout de tela completo | Decisão de design de conteúdo de impressão, fora do escopo mecânico desta auditoria |
| `BreadcrumbList`/JSON-LD ausente em páginas-índice | Perda de rich snippet no Google | Não é erro, apenas oportunidade de SEO avançado |
| Decisões de governança (Projeto07↔09, Projeto10↔11) citadas por nome nos badges, sem link HTML funcional | Leitor não navega diretamente à decisão completa a partir do portal | Publicação como página HTML navegável fica para iteração futura; conteúdo da decisão já está formalmente registrado e acessível em `governanca/` |
| Caminhos de sistema locais em `auditoria/manifesto-rc1.json` e relatórios internos | Exposição de caminhos de ambiente de build | Não fazem parte do site publicado (`docs/`, `assets/`, `data/`, `index.html`); ação de processo recomendada: não copiar `/auditoria` e `/relatorios` para hospedagem pública |

## 7. Auditoria independente

Conduzida em duas rodadas por um conselho simulado de 12 especialistas (Engenharia de Documentação, Arquitetura da Informação, Technical Writing, QA, HTML, CSS, JavaScript, Acessibilidade, SEO, Performance, Segurança, Governança Documental). Relatório completo: `auditoria/relatorio-auditoria-independente.md`.

Resultado: 14 achados corrigidos nesta rodada, 4 não aplicáveis (falso positivo/não-defeito), 11 aceitos como risco documentado, 6 pendentes como bloqueadores formais para v1.0 (listados na Seção 3 acima). Nenhum achado crítico ou alto corrigível neste ambiente permanece em aberto.

---

Até que os 6 critérios pendentes da Seção 3 sejam cumpridos e formalmente validados em ambiente real, o portal permanece classificado como **Release Candidate RC2**.
