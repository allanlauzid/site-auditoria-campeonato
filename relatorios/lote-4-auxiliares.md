# Lote 4 — Reconciliação de Inventário e Documentos Auxiliares

**Data:** 2026-08-05
**Escopo:** reconciliar o inventário completo dos arquivos-fonte `.md` contra o que já foi publicado nos Lotes 0–3, decidir formalmente o status dos dois documentos de controle/técnicos, e confirmar a integridade estrutural do portal (ausência de duplicidade, indexação de busca, diferenciação auxiliar vs. constitucional).

---

## 1. Inventário reconciliado (23 arquivos .md descobertos)

`Glob("arquivos claude\*.md")` retornou **21 arquivos** (6 Fases + 11 Projetos + 4 Manuais). Somando os 2 relatórios de controle/técnicos citados no escopo da tarefa (`export1/Engenharia_Documentacao_Etapa1.md` e `export1/Portal_Etapa2A_Infraestrutura.md`, ambos fora da pasta `arquivos claude`), o universo total de documentos relevantes a este projeto é **23**.

| # | Arquivo | Categoria | Status | Lote de publicação |
|---|---|---|---|---|
| 1 | Fase1_Inteligencia_Estrategica_Benchmark_Campeonatos.md | Fase | Publicado | Lote 1 (`docs/fases/fase1.html`) |
| 2 | Fase2_Identidade_Estrategica_Kettlebell.md | Fase | Publicado | Lote 1 (`docs/fases/fase2.html`) |
| 3 | Fase3_Plataforma_de_Marca_Kettlebell.md | Fase | Publicado | Lote 1 (`docs/fases/fase3.html`) |
| 4 | Fase4_Arquitetura_Lancamento_Kettlebell.md | Fase | Publicado | Lote 1 (`docs/fases/fase4.html`) |
| 5 | Fase5_Ecossistema_Institucional_Kettlebell.md | Fase | Publicado | Lote 1 (`docs/fases/fase5.html`) |
| 6 | Fase6_Master_Plan_Implementacao_Kettlebell.md | Fase | Publicado | Lote 1 (`docs/fases/fase6.html`) |
| 7 | Projeto01_Sistema_de_Comunicacao_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto01.html`) |
| 8 | Projeto02_Sistema_Criativo_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto02.html`) |
| 9 | Projeto03_Sistema_Identidade_Visual_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto03.html`) |
| 10 | Projeto04_Brand_Book_Aplicacao_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto04.html`) |
| 11 | Projeto05_Sistema_Patrocinios_CoBranding_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto05.html`) |
| 12 | Projeto06_Manual_Comercial_Vendas_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto06.html`) |
| 13 | Projeto07_Sistema_Experiencia_Evento_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto07.html`) |
| 14 | Projeto08_Sistema_Memoria_Patrimonio_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto08.html`) |
| 15 | Projeto09_Sistema_Operacional_Evento_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto09.html`) |
| 16 | Projeto10_Sistema_Lancamento_Mobilizacao_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto10.html`) |
| 17 | Projeto11_Sistema_Inteligencia_PreInscricao_Kettlebell.md | Projeto | Publicado | Lote 2 (`docs/projetos/projeto11.html`) |
| 18 | Manual_CRM_Kettlebell.md | Manual | Publicado | Lote 3 (`docs/manuais/manual-crm.html`) |
| 19 | Manual_Dashboard_Executivo_Kettlebell.md | Manual | Publicado | Lote 3 (`docs/manuais/manual-dashboard.html`) |
| 20 | Manual_Formulario_Manifestacao_Interesse_Kettlebell.md | Manual | Publicado | Lote 3 (`docs/manuais/manual-formulario.html`) |
| 21 | Manual_Stories_Baseados_Dados_Kettlebell.md | Manual | Publicado | Lote 3 (`docs/manuais/manual-stories.html`) |
| 22 | export1/Engenharia_Documentacao_Etapa1.md | Controle/Governança | Publicado (como página de controle) | Lote 0 (`docs/arquitetura/engenharia-documentacao.html`) |
| 23 | export1/Portal_Etapa2A_Infraestrutura.md | Técnico interno | **Não publicável como conteúdo do portal** | Nenhum (mantido em `export1/` fora do portal) |

**Confirmação explícita:** os 21 documentos oficiais do corpus (6+11+4) foram totalmente cobertos pelos Lotes 1–3. Nenhum `.md` de `arquivos claude\` ficou sem página publicada. Verificado por Glob (21 arquivos) contra as 21 entradas de `documents.json` com `categoria` em `fase|projeto|manual`, todas com `url` apontando para arquivo `.html` existente (confirmado no Passo 4 deste mesmo lote).

## 2. Status dos dois documentos de controle/técnicos

### `Engenharia_Documentacao_Etapa1.md` — **Publicado (Lote 0, confirmado)**
Confirmado por leitura de `portal/relatorios/lote-0-arquitetura.md`: o documento foi convertido integralmente em `portal/docs/arquitetura/engenharia-documentacao.html`, categorizado como `"controle"` em `documents.json`, com grupo de sidebar próprio "Documentação de Controle", TOC, âncoras e entradas de busca — tratado como página de controle/governança documental, distinta da Constituição (Fases/Projetos/Manuais).

### `Portal_Etapa2A_Infraestrutura.md` — **Documento técnico interno, não publicável como conteúdo do portal**
Decisão herdada e confirmada do Lote 0 (Seção 1 de `lote-0-arquitetura.md`), reconfirmada neste Lote 4: o arquivo descreve decisões de implementação técnica do próprio portal (estrutura de pastas, stack, escopo da Etapa 2A) — seu público é quem constrói o portal, não quem o consome como documentação do campeonato. Publicá-lo como página navegável criaria um documento "sobre o portal dentro do portal" (meta-infraestrutura), misturando duas naturezas de conteúdo que a arquitetura documental exige manter separadas (governança de conteúdo vs. arquitetura de código). Permanece como registro de arquitetura em `export1/`, referenciado pelo link "Design System" / "Sobre este portal" do footer (`navigation.json`, coluna "Projeto"), que já aponta a arquivos de meta-documentação do repositório, não do corpus dos 21 documentos.

Este documento é a fonte primária deste próprio agente (as instruções desta tarefa apontam para ele como "Relatório de infraestrutura"), o que reforça sua natureza de documento de processo/engenharia, não de conteúdo do campeonato.

## 3. Confirmação — nenhum `.md` sem status
Todos os 23 arquivos relevantes (21 do corpus + 2 de controle/técnicos) têm status explícito na tabela da Seção 1: 22 publicados (21 conteúdo + 1 controle), 1 técnico interno não publicável. Nenhum arquivo permanece "pendente de decisão".

## 4. Ausência de páginas duplicadas
Cada um dos 21 documentos do corpus tem exatamente **uma** página HTML publicada (`docId` único em `documents.json`, `url` única, nenhuma reentrada). O documento de controle tem uma página própria e distinta. O documento técnico não gerou página alguma — logo, nenhuma duplicidade de conteúdo existe no portal. Confirmado por contagem: 21 páginas de documento + 1 página de controle = 22 páginas de conteúdo publicadas em `portal/docs/**/*.html` (fora índices de categoria, busca e mapa), batendo exatamente com as 22 entradas de `documents.json`.

## 5. Diferenciação entre documentos auxiliares e constitucionais
- **Constitucionais** (categorias `fase`, `projeto`, `manual`): os 21 documentos do corpus oficial, cada um com status próprio herdado do texto-fonte (ex.: "constituição permanente", "definitivo/constitucional", "Constituição Visual Oficial"), listados em grupos de sidebar dedicados ("Fases", "Projetos", "Manuais Funcionais").
- **Auxiliar/controle**: a Engenharia da Documentação (categoria `controle`), tratada como governança/leitura de apoio sobre o corpus, não como parte dele — grupo de sidebar próprio "Documentação de Controle", badge de categoria distinto ("Controle/Governança Documental").
- **Técnico interno, não publicado**: `Portal_Etapa2A_Infraestrutura.md`, que não é auxiliar de conteúdo do campeonato, mas de engenharia do próprio portal — por isso não recebeu nenhuma categoria em `documents.json` nem página.

## 6. Acessibilidade dos relatórios/auditorias
Os 4 relatórios de lote (`lote-0-arquitetura.md`, `lote-1-fases.md`, `lote-2-projetos.md`, `lote-3-manuais.md`) e este relatório (`lote-4-auxiliares.md`) residem em `portal/relatorios/`, fora da árvore `docs/` navegável pelo portal público — são registros de processo de publicação (auditoria do próprio trabalho editorial), não conteúdo do campeonato, e portanto não foram adicionados à navegação principal (`navigation.json`) nem à busca (`search-index.json`), consistente com a natureza de "log de engenharia" desses arquivos, análoga à decisão tomada para `Portal_Etapa2A_Infraestrutura.md`. Ficam acessíveis a qualquer pessoa com acesso ao sistema de arquivos do portal, mas não são "página pública" do site.

## 7. Confirmação de indexação da busca
`Glob("portal/data/*.json")` confirma a existência de `search-index.json` (único índice de busca do portal, consumido por `assets/js/search.js`). Não existe nenhum outro artefato do tipo `search-index-*.json` ou similar — um único arquivo central. Verificado neste lote: 390 entradas (`"id":` contado via grep), arquivo termina corretamente fechado na linha 9046 (chave de fechamento `}` presente), consistente com o total já declarado cumulativamente pelos Lotes 0–3 (17 + 84 + 219 + 71 = 391 nominalmente, com a mesma ressalva de idempotência de remoção/reinserção já documentada no Lote 1 — a contagem real final auditada agora é 390, sem entradas quebradas ou vazias observadas nas amostras lidas).

## 8. Nenhuma alteração de estrutura/CSS/JS
Nenhum arquivo em `templates/`, `assets/css/`, `assets/js/`, `components/` foi criado, removido ou alterado neste Lote 4. As únicas alterações de dado feitas neste lote (ver `relatorio-publicacao-etapa-2b.md`, Passo 3 e Passo 4) foram textuais/pontuais em `index.html` (Home) e correções técnicas mínimas descritas no relatório de publicação consolidado.
