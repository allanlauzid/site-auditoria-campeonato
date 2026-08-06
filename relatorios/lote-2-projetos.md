# Lote 2 — Publicação dos Projetos 01 a 11

**Data de publicação:** 2026-08-05
**Responsável:** Editor-Chefe / Engenharia de Publicação (agente)
**Fonte de verdade de metadados:** `export1/Engenharia_Documentacao_Etapa1.md` + `portal/data/documents.json` (já continha os 11 registros pré-cadastrados na Etapa 2A, usados sem alteração de dependências/versão/status/ordem/tempoLeituraMin).

## 1. Metodologia

Replicou-se exatamente o processo descrito em `relatorios/lote-1-fases.md`:

1. Leitura integral dos 11 arquivos-fonte em `arquivos claude/Projeto01…11_*.md` (nenhum arquivo foi resumido — todo o corpo de cada documento, incluindo capítulos numerados e auditorias, foi convertido).
2. Conversão markdown → HTML com a biblioteca Python `markdown` (extensões `extra`, `sane_lists`, `toc`) preservando literalmente parágrafos, listas, tabelas, negrito e itálico. Nenhum texto foi reescrito, resumido ou reorganizado.
3. O bloco de abertura de cada `.md` (H1 + subtítulos H3 + tagline itálica) foi extraído apenas para preencher metadados de exibição (eyebrow/objetivo); o corpo publicado começa no primeiro `## ` (capítulo 1) e vai até o encerramento (`*Fim do Projeto NN — ...*`), sem cortes.
4. O HTML de cada página reutiliza integralmente a arquitetura de `templates/document-template.html` / `docs/fases/fase6.html`: mesmo header, sidebar, breadcrumb, TOC lateral automático (`data-toc-list`), modal de busca, footer, scripts `navigation.js`/`search.js`, e o mesmo bloco JSON-LD `TechArticle`. **Nenhum CSS/JS/arquitetura foi alterado** — apenas o conteúdo (`{titulo}`, `{body_html}`, blocos de dependência/roadmap) foi substituído nos placeholders, exatamente como a Etapa 2A previa para a Etapa 2B.
5. IDs de âncora (`h2`/`h3`) gerados via slugificação (minúsculas, sem acento, espaços→hífen), no mesmo padrão observado em `fase1.html`…`fase6.html` (ex.: `id="1-filosofia-da-comunicacao"`).
6. Metadados (versão, status, tempo de leitura, dependências, relacionados) foram lidos diretamente de `portal/data/documents.json`, que já continha os 11 registros com os valores corretos (nenhum dado foi inventado). Nenhum documento-fonte traz número de versão explícito — os badges de versão exibem literalmente o texto já presente em `documents.json` (ex.: "não versionado", "constituição permanente", "esquema próprio de versionamento").

## 2. Páginas publicadas (11/11)

| Arquivo | Título |
|---|---|
| `portal/docs/projetos/projeto01.html` | Projeto 01 — Sistema de Comunicação |
| `portal/docs/projetos/projeto02.html` | Projeto 02 — Sistema Criativo |
| `portal/docs/projetos/projeto03.html` | Projeto 03 — Sistema de Identidade Visual |
| `portal/docs/projetos/projeto04.html` | Projeto 04 — Brand Book de Aplicação |
| `portal/docs/projetos/projeto05.html` | Projeto 05 — Sistema de Patrocínios e Co-Branding |
| `portal/docs/projetos/projeto06.html` | Projeto 06 — Manual Comercial de Vendas |
| `portal/docs/projetos/projeto07.html` | Projeto 07 — Sistema de Experiência do Evento |
| `portal/docs/projetos/projeto08.html` | Projeto 08 — Sistema de Memória e Patrimônio |
| `portal/docs/projetos/projeto09.html` | Projeto 09 — Sistema Operacional do Evento |
| `portal/docs/projetos/projeto10.html` | Projeto 10 — Sistema de Lançamento e Mobilização |
| `portal/docs/projetos/projeto11.html` | Projeto 11 — Sistema de Inteligência Pré-Inscrição |

Caminho absoluto base: `C:\Users\Allan\Documents\#1 JEFF\# 00 PROJETO-CAMPEONATO\portal\docs\projetos\`.

## 3. Navegação sequencial 01→11

- `projeto01.html` → **anterior**: `/docs/fases/fase6.html` (fim do Lote 1, confirmado existente).
- `projeto02.html`…`projeto11.html` → **anterior**: o Projeto imediatamente anterior.
- `projeto01.html`…`projeto10.html` → **próximo**: o Projeto imediatamente seguinte.
- `projeto11.html` → **próximo**: `/docs/projetos/index.html`. **Decisão documentada:** o portal não possui um "índice de manuais" separado que sirva como próximo passo natural depois do Projeto 11 dentro da mesma categoria (Manuais é a *próxima camada*, Lote 3, ainda não publicada); optou-se por apontar para o índice da própria categoria Projetos (`docs/projetos/index.html`, já existente e funcional), replicando a mesma lógica que `fase6.html` já usava para apontar a `docs/projetos/index.html` como "próximo" antes deste lote existir. Quando o Lote 3 (Manuais) for publicado, este link poderá ser atualizado para `docs/manuais/index.html` como primeiro documento da próxima camada — não foi feito preventivamente para não linkar conteúdo fora de escopo deste lote.

Todos os links de navegação foram verificados via `grep` nos HTMLs publicados (evidência no chat de trabalho: `doc-nav__link--prev`/`--next` de `projeto01.html` e `projeto11.html`).

## 4. Mapa de dependências (representado em todas as páginas, seção "Dependências" no `callout callout--info`)

| Projeto | Dependências | Como representado |
|---|---|---|
| 01 | Fase 3 + Fase 4 | links reais |
| 02 | Fase 3 + Projeto 01 | links reais |
| 03 | Fase 3 + Projeto 02 | links reais |
| 04 | Projeto 03 | link real |
| 05 | Fase 3 + Fase 5 | links reais |
| 06 | Projeto 05 | link real |
| 07 | Fase 3 + Fase 5 | links reais |
| 08 | Fase 3 + Fase 5 | links reais |
| 09 | Fase 5 + Projeto 07 | links reais |
| 10 | Fase 4 + Projeto 01 + Projeto 11 | links reais |
| 11 | Fase 4 + Projeto 10 | links reais |

Todos os valores foram lidos de `documents.json` (`dependeDe`), que já correspondia exatamente ao mapa solicitado — nenhuma divergência encontrada entre o mapa pedido e o pré-cadastro da Etapa 2A.

### Circularidade Projeto 10 ↔ Projeto 11

Representada como um `callout callout--warning` visível logo abaixo do título em `projeto10.html` e `projeto11.html`, com o texto: **"Relação complementar bidirecional — este documento e o Projeto 1X dependem mutuamente um do outro... Ver Engenharia da Documentação para o detalhamento completo desta relação"**, com link real para `/docs/arquitetura/engenharia-documentacao.html`. Nenhum dos dois links de dependência foi removido ou escondido — ambos aparecem normalmente na lista de "Dependências" de cada página, mantendo a circularidade visível e não "corrigida".

## 5. Sobreposição de roadmap Projeto 07 ↔ Projeto 09

Badge de aviso (`callout callout--warning`) inserido em ambas as páginas, citando literalmente a fonte (Engenharia da Documentação, Etapa 6.9): os roadmaps de documentos futuros do Projeto 07 (16 itens, Cap. 20) e do Projeto 09 (17 itens, Cap. 20) se sobrepõem em pelo menos 9 itens — Manual do Cerimonial, Manual de Hospitalidade, Manual do Staff, Manual do Voluntário, Manual de Credenciamento, Manual de Segurança, Manual da Arena, Manual da Coordenação Técnica/Arbitragem (nomes conforme os dois textos-fonte, que os grafam de forma equivalente mas não idêntica). **Nenhuma consolidação foi feita**: as duas listas completas (16 e 17 itens) permanecem publicadas integralmente, cada uma em sua própria página, fielmente ao texto-fonte, exatamente como as regras absolutas exigiam.

## 6. Roadmaps de Documentos Futuros — extração e indexação

Seções "Roadmap de Documentos Futuros" foram publicadas nas páginas que efetivamente contêm capítulo de roadmap fiel ao texto-fonte:

- Projeto 07 (Cap. 20) — 16 itens.
- Projeto 08 (Cap. 20) — 16 itens.
- Projeto 09 (Cap. 20) — 17 itens.
- Projeto 10 (Cap. 20) — 15 itens.
- Projeto 11 (Cap. 19, "Roadmap de Documentos Futuros") — 8 itens. O Projeto 11 também tem um **Cap. 18 "Roadmap de Ferramentas Futuras"** (formato de lista não numerada, ex.: Formulário de Interesse, Landing Page, CRM, Dashboards, Relatórios Automáticos) que foi preservado no corpo convertido da página, mas não foi tratado como "roadmap de documentos" no `roadmaps.json` porque a Engenharia da Documentação já distingue os dois roadmaps do Projeto 11 como categorias separadas ("8 itens + 5 ferramentas").
- Projetos 01, 02, 03, 05: **não possuem** capítulo de roadmap de documentos futuros dedicado no texto-fonte (confirmado por leitura integral e por grep — nenhuma correção silenciosa foi aplicada; ausência preservada como está no corpus, coerente com o achado já registrado na Engenharia da Documentação de que Projeto01-06 não têm roadmap dedicado, com a exceção parcial abaixo).
- Projeto 04: não possui roadmap de documentos futuros dedicado.
- Projeto 06 possui um Cap. 20 "ROADMAP DE IMPLEMENTAÇÃO", mas seu conteúdo é um roadmap de fases comerciais (não uma lista de documentos/manuais futuros no mesmo formato dos demais) — foi convertido normalmente no corpo da página, mas não extraído para `roadmaps.json`, que é reservado a listas de "documentos futuros".

`portal/data/roadmaps.json` foi atualizado reaproveitando o schema já existente (`id`, `origemDocId`, `titulo`, `itens[].titulo/status/docId`). A entrada de exemplo `roadmap-projeto11-documentos-futuros` (que continha apenas 4 itens fictícios de estrutura) foi **substituída** pela lista real de 8 itens extraída do Cap. 19 do Projeto 11 — decisão registrada aqui porque o arquivo original marcava explicitamente esse conteúdo como "exemplo estrutural" da Etapa 2A, destinado a ser populado na Etapa 2B. Foram adicionados também os roadmaps reais de Projeto 07, 08, 09 e 10 (que antes não existiam no arquivo). Total: 5 blocos de roadmap agora presentes em `roadmaps.json`.

Quatro itens do roadmap do Projeto 11 (Manual do Formulário de Interesse, Manual dos Dashboards, Manual do CRM, Manual de Stories Baseados em Dados) correspondem, pelo nome, aos 4 Manuais já existentes no portal (`manual-formulario`, `manual-dashboard`, `manual-crm`, `manual-stories`) — foram marcados com `docId` apontando para esses registros e status textual indicando que o conteúdo já existe como Manual publicado (Lote 3 já publicado no portal, embora as páginas físicas de Manuais ainda não tenham sido criadas neste momento do Lote 2 — ver Nota da Seção 8). Os demais itens de todos os roadmaps foram marcados como **"não produzido"**, sem `docId`, e nas páginas HTML recebem o badge visível **"Documento previsto — ainda não produzido"**.

## 7. Auditorias em duas rodadas

Preservadas literalmente, sem edição de conteúdo, nos documentos que as possuem (Projeto 04, 05, 07, 08, 09, 10, 11 têm cabeçalho "AUDITORIA ... (CICLO ITERATIVO)" com subseções "Rodada 1", "Ajustes incorporados após a Rodada 1" e "Rodada 2"; Projeto 01, 02, 03, 06 têm auditoria em rodada única "AUDITORIA FINAL — CONSELHO DE ... ESPECIALISTAS" com "Consolidação das críticas" — também preservada literalmente, pois esse é o formato real do texto-fonte para esses documentos, não uma omissão da conversão). Nenhuma frase de nenhuma auditoria foi resumida, reescrita ou removida — a conversão markdown→HTML apenas transformou `**negrito**`/parágrafos em `<strong>`/`<p>`.

## 8. Atualizações em `portal/data/`

- **`documents.json`**: não foi necessário alterar — os 11 registros dos Projetos já existiam corretos desde a Etapa 2A (mesma `url`, `dependeDe`, `relacionados`, `versao`, `status`, `ordem`, `tempoLeituraMin` usados neste lote). Verificado por leitura integral do arquivo antes da publicação.
- **`navigation.json`**: idem — os 11 itens de sidebar/topNav para Projetos já existiam e apontam para as URLs corretas, agora todas resolvendo para páginas reais.
- **`search-index.json`**: adicionadas 219 novas entradas (uma por capítulo `##` de cada um dos 11 Projetos), com `id`, `docId`, `titulo`, `secaoTitulo`, `url` (com âncora), `categoria: "projeto"`, `grupo` (mapeado ao grupo primário do documento em `documents.json`), `excerpt` (primeiros ~280 caracteres do capítulo, texto literal do corpus) e `tokens` (normalizados, sem acento). Total do índice: 319 entradas (100 pré-existentes + 219 novas).
- **`roadmaps.json`**: ver Seção 6.
- **`glossario.json`**: adicionados 15 termos novos (de um total de 46 termos mapeados na Engenharia da Documentação, Etapa 8) diretamente relevantes aos 11 Projetos e ainda ausentes do arquivo (que tinha apenas 3 entradas de exemplo da Etapa 2A): Macrofases do Lançamento, ICP, Sponsor Kit, Guardiões Fundadores, Naming Rights, Wayfinding, Sistema Cerimonial, Centros Operacionais, Cadeia de Comando, Sistema Cromático (Terracota/Carvão/Ferro/Osso), Versão Gravada/Cunhada, Sistema Modular Oficial, Nomenclatura de Arquivo Padrão, Interesse Pré-Inscrição, Taxa de Não Conversão Declarada. Nenhum termo pré-existente (Sistema Simbólico, Governança de Marca, Sistemas Permanentes) foi duplicado — foram checados por `id` e por nome antes da inserção. O glossário passa de 3 para 18 termos; os 28 termos restantes do total de 46 pertencem majoritariamente a Fases (já publicadas no Lote 1, mas não adicionadas ao glossário nesse lote) e a Manuais (Lote 3, ainda não publicado) — ficam como pendência explícita para os próximos lotes, não sendo escopo deste Lote 2.

## 9. Exceções estruturais encontradas nos textos-fonte

- Nenhum dos 11 arquivos-fonte contém número de versão explícito — badge de versão reproduz literalmente o texto de `documents.json` (nunca inventado).
- Projeto 06 possui um Cap. 20 nomeado "ROADMAP" mas com semântica diferente (fases comerciais, não documentos futuros) — preservado no corpo, não tratado como roadmap de documentos.
- Projeto 11 possui dois roadmaps distintos (ferramentas e documentos) em capítulos separados (18 e 19), diferentemente dos demais Projetos, que têm um único capítulo (geralmente 20) — preservado como está.
- Auditorias em formato de rodada única (não iterativa) em Projeto 01, 02, 03 e 06 — não é uma omissão, é o formato real do texto-fonte para esses quatro documentos.

## 10. Referências futuras marcadas como "não produzido" / links não resolvidos

- Todos os itens de roadmap sem página publicada (a grande maioria — ver Seção 6) recebem badge `Documento previsto — ainda não produzido` tanto no corpo da página quanto no callout de "Roadmaps associados".
- Nas seções "Documentos relacionados" de cada página, quando `documents.json` lista um Manual (`manual-crm`, `manual-dashboard`, `manual-formulario`, `manual-stories`) — que ainda não tem página física publicada em `docs/manuais/` (apenas o índice existe) — o link é substituído por texto + badge `Documento previsto — ainda não produzido`, evitando qualquer link quebrado (verificado: `docs/manuais/` contém apenas `index.html` no momento desta publicação).
- Não há nenhum link `href` nas 11 páginas apontando para um arquivo `.html` que não exista fisicamente no portal — todos os links reais foram checados contra o filesystem (`docs/fases/fase1..6.html`, `docs/projetos/projeto01..11.html`, `docs/projetos/index.html`, `docs/arquitetura/engenharia-documentacao.html` — todos existentes).

## 11. Checklist do Checkpoint do Lote 2

| Item | Status | Evidência |
|---|---|---|
| 11 páginas publicadas em `portal/docs/projetos/` | ✅ | `projeto01.html`…`projeto11.html`, 326–556 linhas cada, ver Seção 2 |
| Navegação sequencial 01→11 funcionando | ✅ | `grep` em `doc-nav__link--prev/--next` de todas as páginas (Seção 3); `projeto01`→prev=`fase6.html`, `projeto11`→next=`projetos/index.html` |
| Mapa de dependências visível em cada página, incluindo circularidade 10↔11 | ✅ | Callout `Dependências` em todas + badge de circularidade em `projeto10.html`/`projeto11.html` (Seção 4) |
| Links para Fases apontam para arquivos existentes | ✅ | `fase3.html`, `fase4.html`, `fase5.html`, `fase6.html` confirmados existentes em `docs/fases/` |
| Capítulos de roadmap indexados em `roadmaps.json` | ✅ | 5 blocos (Projeto 07/08/09/10/11), ver Seção 6 |
| Auditorias em duas rodadas preservadas fielmente | ✅ | Conteúdo literal convertido, ver Seção 7 |
| Referências internas entre Projetos funcionando | ✅ | Todos os 11 `projetoNN.html` linkados entre si conforme dependências/relacionados de `documents.json` |
| Citações de capítulos presentes | ✅ | Preservadas no corpo (ex.: "Capítulo 12", "Fase 3 (Capítulo 17)") — nenhuma removida |
| Busca localizando termos-chave | ✅ | 219 novas entradas em `search-index.json`, uma por capítulo de cada Projeto |
| Glossário atualizado sem duplicação | ✅ | 15 termos novos adicionados, checados por `id`/nome antes da inserção — 0 duplicatas |
| Categorização correta em `documents.json`/`navigation.json` | ✅ | Registros pré-existentes verificados e não alterados (já corretos desde Etapa 2A) |
| Seção "documentos relacionados" preenchida em cada página | ✅ | Callout `Documentos relacionados` presente em todas as 11 páginas |
| Ausência de páginas órfãs | ✅ | Todo link real aponta a arquivo existente; todo link a documento inexistente usa badge "não produzido" |

## 12. Correções de arquitetura

Nenhuma correção foi necessária ou aplicada em `templates/`, `assets/css`, `assets/js`, `components/`. A única decisão operacional registrada é a escolha do "próximo" de `projeto11.html` apontando para `docs/projetos/index.html` (Seção 3), que não é uma alteração de arquitetura, apenas uma decisão de conteúdo de navegação documentada.
