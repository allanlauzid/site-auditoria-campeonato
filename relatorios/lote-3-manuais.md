# Lote 3 — Publicação dos Manuais Operacionais

**Data de publicação:** 2026-08-05
**Responsável:** Editor-Chefe / Engenharia de Publicação (agente)
**Fonte de verdade de metadados:** `portal/data/documents.json` (já continha os 4 registros de manuais pré-cadastrados na Etapa 2A/Lote 2, usados sem alteração de dependências/versão/status/ordem/tempoLeituraMin) + `portal/data/navigation.json` (sidebar de "Manuais Funcionais" já existia).

## 1. Metodologia

Replicou-se exatamente o processo descrito em `relatorios/lote-2-projetos.md`:

1. Leitura integral dos 4 arquivos-fonte em `arquivos claude/Manual_*_Kettlebell.md` (nenhum arquivo foi resumido — todo o corpo, incluindo capítulos numerados e auditorias em duas rodadas, foi convertido).
2. Conversão markdown → HTML com a biblioteca Python `markdown` (extensões `extra`, `sane_lists`, `toc` com slugificação sem acento), preservando literalmente parágrafos, listas, tabelas, negrito e itálico. Nenhum texto foi reescrito, resumido ou reorganizado.
3. O bloco de abertura de cada `.md` (H1 + subtítulos H3 + tagline itálica) foi extraído apenas para preencher metadados de exibição (eyebrow/objetivo); o corpo publicado começa no primeiro `## ` (capítulo 1) e vai até o encerramento (`*Fim do Manual ... *`), sem cortes.
4. O HTML de cada página reutiliza integralmente a arquitetura de `templates/document-template.html` / `docs/projetos/projeto11.html`: mesmo header, sidebar, breadcrumb, TOC lateral automático (`data-toc-list`), modal de busca, footer, scripts `navigation.js`/`search.js`, e o mesmo bloco JSON-LD `TechArticle`. **Nenhum CSS/JS/arquitetura foi alterado** — apenas o conteúdo foi inserido nos mesmos placeholders já usados nos Lotes 1 e 2.
5. IDs de âncora (`h2`) gerados via slugificação (minúsculas, sem acento, espaços→hífen), mesmo padrão de `projeto01.html`…`projeto11.html` (ex.: `id="9-lgpd"`, `id="15-casos-especiais"`).

## 2. Páginas publicadas (4/4)

| Arquivo | Título | Linhas |
|---|---|---|
| `portal/docs/manuais/manual-formulario.html` | Manual — Formulário de Manifestação de Interesse | 331 |
| `portal/docs/manuais/manual-crm.html` | Manual — CRM | 336 |
| `portal/docs/manuais/manual-dashboard.html` | Manual — Dashboard Executivo | 385 |
| `portal/docs/manuais/manual-stories.html` | Manual — Stories Baseados em Dados | 381 |

Caminho absoluto base: `C:\Users\Allan\Documents\#1 JEFF\# 00 PROJETO-CAMPEONATO\portal\docs\manuais\`. O `index.html` da pasta (já publicado na Etapa 2A, com os 4 cards apontando para essas URLs) não foi alterado — os 4 links já resolviam para as páginas agora criadas.

## 3. Navegação pedagógica × grafo técnico de dependências (dois conceitos distintos)

Cada página traz dois blocos visualmente separados e explicitamente rotulados:

- **Callout amarelo ("Navegação pedagógica × grafo técnico de dependências")** — presente no cabeçalho de cada manual, explicando que os dois conceitos abaixo não são a mesma coisa.
- **Navegação pedagógica** (`doc-nav` no rodapé, "Anterior/Próximo"): ordem de leitura recomendada Formulário → CRM → Dashboard → Stories.
  - `manual-formulario.html` → anterior: `/docs/projetos/projeto11.html` ("fim do Lote 2", conforme instrução); próximo: `manual-crm.html`.
  - `manual-crm.html` → anterior: `manual-formulario.html`; próximo: `manual-dashboard.html`.
  - `manual-dashboard.html` → anterior: `manual-crm.html`; próximo: `manual-stories.html`.
  - `manual-stories.html` → anterior: `manual-dashboard.html`; próximo: `/docs/roadmaps/index.html`, rotulado explicitamente como placeholder ("índice de Auxiliares previsto no Lote 4 — ainda não produzido"). **Decisão documentada:** o portal ainda não tem um índice de "Auxiliares" fisicamente publicado (esse é o escopo do Lote 4, pendente). Em vez de apontar para um arquivo inexistente, optou-se por reaproveitar `/docs/roadmaps/index.html` (já existente e funcional), com o rótulo do link deixando claro que é um destino provisório — mesma lógica de decisão documentada usada em `lote-2-projetos.md` (Seção 3) para `projeto11.html`. Quando o Lote 4 publicar o índice de Auxiliares, este link deverá ser atualizado.
- **Grafo técnico de dependências** (callout "Dependências", corpo do cabeçalho): representa o que tecnicamente alimenta cada sistema, com links reais para os Projetos 08/11 já publicados no Lote 2:
  - Formulário ← Projeto 11.
  - CRM ← Projeto 11 + Projeto 08.
  - Dashboard ← Manual CRM + Projeto 11 + Projeto 08.
  - Stories ← Manual Dashboard + Projeto 11.

Os dois blocos nunca se sobrepõem visualmente nem semanticamente: a navegação pedagógica é sempre exibida no rodapé (`<nav class="doc-nav">`), e o grafo técnico sempre no cabeçalho (`<div class="callout callout--info">`, rótulo "Dependências (grafo técnico)").

## 4. Cadeia conceitual Captura → Relacionamento → Inteligência → Comunicação pública

Tornada visível em cada página via um callout dedicado logo abaixo do título (`callout--info`, ícone 🧭), mapeando: Formulário = Captura · CRM = Relacionamento · Dashboard = Inteligência · Stories = Comunicação pública — com a página atual destacando seu próprio elo na cadeia. O texto de `{{OBJETIVO}}` de cada página também nomeia explicitamente esse elo (ex.: "este manual define ... a camada de CAPTURA").

## 5. LGPD e Casos Especiais — preservação integral (verificada por comparação textual)

Confirmado por comparação direta entre o `.md`-fonte e o HTML publicado, capítulo a capítulo:

- **Manual do Formulário** — Cap. 9 "LGPD" (`id="9-lgpd"`) e Cap. 15 "CASOS ESPECIAIS" (`id="15-casos-especiais"`) publicados integralmente, incluindo os 8 casos especiais citados no escopo (estrangeiros, menores de idade, grupos, boxes, federações/autoridades/convidados institucionais, voluntários e árbitros, imprensa, patrocinadores) — nenhuma frase cortada ou resumida.
- **Manual do CRM** — Cap. 11 "LGPD" (`id="11-lgpd"`) e Cap. 16 "CASOS ESPECIAIS" (`id="16-casos-especiais"`) publicados integralmente, incluindo os 9 casos citados (atletas internacionais, menores de idade, boxes encerrados, mudança de treinador, mudança de estado/cidade, falecimento, desligamento institucional, patrocinadores históricos, tensão registros permanentes vs. direito ao esquecimento) — nenhuma frase cortada ou resumida.
- Verificação automatizada: `grep -c` no HTML publicado confirma presença literal dos termos "falecimento", "Boxes encerrados", "patrocinadores históricos", "Mudança de treinador" (Manual CRM) e "Menores de idade", "Imprensa", "Patrocinadores", "Voluntários e árbitros" (Manual Formulário).

## 6. Tabelas preservadas

- **Manual do Dashboard Executivo** — tabela "Perfis de Usuário × Decisões que precisa tomar" (Cap. 3) publicada como `<table>` HTML nativo (renderiza com o mesmo componente `components/tables.html` já usado no design system, sem CSS/JS alterado). O "Catálogo de KPIs" (Cap. 5) é uma lista `<ul>` estruturada no texto-fonte original (não uma tabela markdown) — preservado como lista, fielmente ao formato do `.md`.
- **Manual dos Stories Baseados em Dados** — tabela "Tipos de Stories × Finalidade × Cuidado central" (Cap. 3) publicada como `<table>` HTML nativo.
- **Manual do Formulário** e **Manual do CRM** não contêm tabelas markdown no texto-fonte (confirmado por leitura integral) — nenhuma tabela foi inventada; a "tabela campo-a-campo" citada no escopo da tarefa pertence ao Projeto 11 (já publicada no Lote 2), não a este manual.

## 7. Ausência de "Roadmap de Documentos Derivados" — registrada, não inventada

- **Manual do CRM** (Cap. 18) e **Manual do Dashboard Executivo** (Cap. 19) **possuem** capítulo nativo "ROADMAP DE DOCUMENTOS DERIVADOS" no texto-fonte — preservado integralmente no corpo da página (8 itens cada, com ordem de prioridade de desenvolvimento).
- **Manual do Formulário** e **Manual dos Stories Baseados em Dados** **não possuem** esse capítulo — têm apenas "Roadmap de Evolução" e "Roadmap de Implementação" (capítulos diferentes, preservados normalmente no corpo). Conforme a Regra Absoluta de não inventar capítulos de roadmap inexistentes, cada uma dessas duas páginas recebe uma seção adicional explícita **"Roadmap de Documentos Derivados"** com badge `Ausência confirmada no texto-fonte` e texto registrando a ausência como observação editorial — nunca preenchida com conteúdo fictício.

## 8. Auditorias em duas rodadas — preservadas integralmente

Todos os 4 manuais têm o formato "AUDITORIA ... — CONSELHO DE ONZE ESPECIALISTAS (CICLO ITERATIVO)" com Rodada 1, "Ajustes incorporados após a Rodada 1" e Rodada 2 — preservado literalmente em todas as páginas, sem edição, resumo ou remoção de nenhuma crítica ou ajuste.

## 9. Atualizações em `portal/data/`

- **`documents.json`**: não foi necessário alterar — os 4 registros de manuais já existiam corretos desde a Etapa 2A/Lote 2 (mesma `url`, `dependeDe`, `relacionados`, `versao`, `status`, `ordem`, `tempoLeituraMin`). Verificado por leitura integral antes da publicação.
- **`navigation.json`**: idem — o grupo de sidebar "Manuais Funcionais" e o item de topNav "Manuais" já existiam e apontam para as URLs corretas, agora todas resolvendo para páginas reais.
- **`search-index.json`**: adicionadas 71 novas entradas (uma por capítulo `##` de cada um dos 4 Manuais: 16 do Formulário, 19 do CRM, 20 do Dashboard, 16 dos Stories), com `id`, `docId`, `titulo`, `secaoTitulo`, `url` (com âncora), `categoria: "manual"`, `grupo` (mapeado ao grupo primário em `documents.json`), `excerpt` e `tokens` normalizados. Total do índice: 390 entradas (319 pré-existentes + 71 novas).
- **`roadmaps.json`**: adicionados 2 blocos novos — `roadmap-manual-crm-documentos-derivados` (8 itens, extraídos literalmente do Cap. 18) e `roadmap-manual-dashboard-documentos-derivados` (8 itens, extraídos literalmente do Cap. 19). Além disso, o bloco pré-existente `roadmap-projeto11-documentos-futuros` foi atualizado: os 4 itens correspondentes aos manuais agora publicados (Manual do Formulário de Interesse, Manual dos Dashboards, Manual do CRM, Manual de Stories Baseados em Dados) tiveram `status` alterado de `"não produzido"` para `"produzido — publicado no Lote 3 (Manuais Operacionais)"` e `docId` preenchido com o id real do manual correspondente; os 4 itens restantes (Manual de Analytics, Manual de Relatórios, Manual de Pesquisa, Manual de Inteligência Comercial) permanecem `"não produzido"`, sem alteração. Total: 7 blocos de roadmap agora presentes em `roadmaps.json`.
- **`glossario.json`**: adicionados 8 termos novos, checados por `id` antes da inserção (0 duplicatas): Jornada do Interessado, Coleta Progressiva, Fonte Única de Dados, Pessoa (entidade central do CRM), Catálogo de KPIs, Storytelling Executivo, Honestidade Estatística, Sistema de Social Proof. O glossário passa de 18 para 26 termos.

## 10. Correção mínima em página já publicada (`projeto11.html`, Lote 2)

Como o Lote 3 tornou os 4 Manuais fisicamente publicados, três referências pendentes em `projeto11.html` (que na publicação do Lote 2 usavam badge "Documento previsto — ainda não produzido" por não haver páginas físicas ainda) foram atualizadas para links reais, corrigindo o que seriam referências obsoletas caso não corrigidas:

1. Callout "Documentos relacionados" (linha ~80) — os 4 textos com badge neutro foram substituídos por links reais `<a href="/docs/manuais/manual-*.html">`.
2. Seção "Roadmap de Documentos Futuros" (Cap. 19, lista de 8 itens) — os 4 itens correspondentes aos manuais agora publicados receberam badge `badge--success` "Publicado" com link real; os 4 itens restantes (Analytics, Relatórios, Pesquisa, Inteligência Comercial) mantidos como estavam.
3. Navegação pedagógica "Próximo" de `projeto11.html`, que no Lote 2 apontava para `/docs/projetos/index.html` com nota explícita de que seria atualizado "quando o Lote 3 (Manuais) for publicado" — atualizado agora para `/docs/manuais/manual-formulario.html`, conforme a própria decisão já registrada em `lote-2-projetos.md`.

Nenhuma outra alteração foi feita em `projeto11.html`: nenhum capítulo do corpo (incluindo o Cap. 19 original, que preserva a lista fiel ao texto-fonte com sua frase introdutória original) foi reescrito — apenas os badges/links de status de publicação, que são metadados de navegação do portal, não conteúdo do documento-fonte.

Nenhuma correção foi necessária ou aplicada em `templates/`, `assets/css`, `assets/js`, `components/`.

## 11. Checklist do Checkpoint do Lote 3

| Item | Status | Evidência |
|---|---|---|
| Quatro páginas publicadas | ✅ | `manual-formulario.html` (331 linhas), `manual-crm.html` (336), `manual-dashboard.html` (385), `manual-stories.html` (381) em `portal/docs/manuais/` |
| Links recíprocos entre os 4 manuais | ✅ | `grep` em `doc-nav__link--prev/--next` das 4 páginas (Seção 3): cadeia fechada Formulário↔CRM↔Dashboard↔Stories, sem link quebrado |
| Relação com o Projeto 11 (visível/linkada) | ✅ | Callout "Dependências" de todos os 4 manuais linka `/docs/projetos/projeto11.html`; `projeto11.html` linka de volta os 4 manuais (Seção 10) |
| Relação Formulário → CRM | ✅ | Grafo técnico do Manual CRM lista Projeto 11 + Projeto 08 (o Formulário em si opera dentro dos princípios do Projeto 11, e alimenta o CRM conforme corpo do Cap. 10 "Integração" preservado); navegação pedagógica Formulário→CRM confirmada na Seção 3 |
| Relação CRM → Dashboard | ✅ | Callout "Dependências" do Manual Dashboard lista `<a href="/docs/manuais/manual-crm.html">Manual — CRM</a>` explicitamente no grafo técnico |
| Relação Dashboard → Stories | ✅ | Callout "Dependências" do Manual Stories lista `<a href="/docs/manuais/manual-dashboard.html">Manual — Dashboard Executivo</a>` explicitamente no grafo técnico |
| LGPD e casos especiais preservados integralmente | ✅ | Comparação textual Seção 5; capítulos e IDs de âncora confirmados por grep |
| Tabelas renderizando corretamente | ✅ | `<table>` nativo preservado em Dashboard (Cap. 3) e Stories (Cap. 3), Seção 6 |
| Auditorias preservadas | ✅ | Formato "Rodada 1/Ajustes/Rodada 2" ou final íntegro nas 4 páginas, Seção 8 |
| Termos de glossário atualizados | ✅ | 8 termos novos, 0 duplicatas, Seção 9 |
| Indexação da busca | ✅ | 71 novas entradas em `search-index.json`, uma por capítulo de cada Manual, Seção 9 |

## 12. Exceções estruturais encontradas nos textos-fonte

- Nenhum dos 4 arquivos-fonte contém número de versão explícito para 3 deles (Formulário cita "versionamento formal" mas sem número; CRM e Dashboard "não versionado"); o Manual do Formulário no `documents.json` já trazia `"versao": "versionamento formal citado, não aplicado"` — reproduzido literalmente, nunca inventado.
- Manual do CRM e Manual do Dashboard Executivo têm capítulo nativo "Roadmap de Documentos Derivados"; Manual do Formulário e Manual dos Stories não têm — ausência registrada como observação (Seção 7), não uma omissão de conversão.
- Os 4 manuais compartilham o mesmo formato de auditoria em duas rodadas ("CONSELHO DE ONZE ESPECIALISTAS"), diferentemente de alguns Projetos do Lote 2 que usavam rodada única — não é inconsistência, é o formato real do texto-fonte para os 4 Manuais.

## 13. Decisão registrada — link "Próximo" de Stories

`manual-stories.html` é o último elo da navegação pedagógica pedida pelo escopo (Formulário → CRM → Dashboard → Stories). O escopo pedia decidir entre rotular como "Documento previsto — ainda não produzido" ou apontar para o índice geral de Auxiliares. Optou-se por apontar para `/docs/roadmaps/index.html` (já existente e funcional) com o rótulo do link deixando explícito que o destino é provisório e que o índice real de Auxiliares (Lote 4) ainda não existe fisicamente — evitando tanto um link morto (`href` para arquivo inexistente) quanto um link sem destino navegável algum. Ver Seção 3 para o texto exato do rótulo.
