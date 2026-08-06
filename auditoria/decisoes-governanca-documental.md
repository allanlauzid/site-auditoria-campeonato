# Decisões de Governança Documental — Fase 10 (RC1, Etapa 3.4)

Consolida as duas decisões formais de governança produzidas nesta rodada. Nenhuma delas altera arquivos .md fonte (`arquivos claude/`) ou a pasta `/portal` original.

## B.1 — Roadmaps sobrepostos Projeto 07 ↔ Projeto 09

Documento completo: `governanca/decisao-roadmaps-projeto07-projeto09.md`.

**Resumo:** Projeto 07 é fonte de princípios de EXPERIÊNCIA; Projeto 09 é fonte de princípios de OPERAÇÃO. Os 9 manuais futuros identificados como sobrepostos entre os dois roadmaps (Manual Operacional do Evento, Manual do Cerimonial, Manual da Arbitragem/Coordenação Técnica, Manual do Staff, Manual do Voluntário, Manual de Hospitalidade, Manual de Segurança, Manual de Arena, Manual de Credenciamento) passam a ser tratados como manual único com dupla filiação. Os roadmaps-fonte nos .md permanecem intactos e completos (16 itens no Projeto 07, 17 no Projeto 09).

## B.2 — Interdependência funcional bidirecional Projeto 10 ↔ Projeto 11

Documento completo: `governanca/decisao-interdependencia-projeto10-projeto11.md`.

**Resumo:** A dependência mútua registrada entre Projeto 10 e Projeto 11 é reclassificada de "circularidade conceitual" para "interdependência funcional bidirecional" — não é um erro de arquitetura. Sequência de leitura recomendada: Projeto 10 → Projeto 11. Execução operacional: iterativa/simultânea.

## Arquivos de dados alterados como consequência

| Arquivo | Alteração |
|---|---|
| `data/roadmaps.json` | Nos 9 itens sobrepostos dos roadmaps de `projeto07` e `projeto09` (18 ocorrências no total, 9 × 2 documentos), adicionados os campos `idCanonico`, `aliases`, `documentosOrigem: ["projeto07","projeto09"]`, `dependencias: ["projeto07","projeto09"]`, `documento_unico: true`. Nenhum outro item do array foi alterado. Schema JSON pré-existente (`roadmaps.schema.v1`) preservado — os novos campos são aditivos. |
| `data/documents.json` | Nos registros `projeto10` e `projeto11`, adicionado o campo `relacaoEspecial` (`tipo: "interdependencia_funcional_bidirecional"`, `com`, `descricao`, `decisaoGovernanca`). O campo `dependeDe` pré-existente foi mantido (fato estrutural do corpus), mas passa a ser interpretado, na interface, à luz de `relacaoEspecial`. |
| `data/navigation.json` | Verificado — contém apenas rótulos de menu para Projeto 10/11, sem campo de relação/dependência; nenhuma alteração necessária. |

## Badges HTML alterados

| Página | Alteração |
|---|---|
| `docs/projetos/projeto10.html` | Badge `callout callout--warning` reescrito: mantém a constatação de relação complementar bidirecional, remove a linguagem de "circularidade conceitual" isolada e cita nominalmente a decisão de governança "interdependência funcional bidirecional Projeto10↔Projeto11", com a sequência de leitura recomendada e o modo de execução operacional. |
| `docs/projetos/projeto11.html` | Mesma alteração, espelhada, citando o Projeto 10. |

## Verificação

- `data/roadmaps.json` e `data/documents.json` validados por `json.load` (Python) após a edição — ambos parseiam sem erro.
- 18 itens tagueados em `roadmaps.json` (9 itens × 2 roadmaps de origem), conferindo com a tabela de 9 itens do documento B.1.
- Nenhum dos 21 arquivos .md em `arquivos claude/` foi tocado (nenhuma ferramenta de escrita foi usada fora de `portal-v1-auditoria/`).
- Nenhum arquivo em `/portal` (original) foi tocado.

## Limitação declarada

As páginas `governanca/decisao-roadmaps-projeto07-projeto09.md` e `governanca/decisao-interdependencia-projeto10-projeto11.md` não foram publicadas como páginas HTML no portal nesta rodada (fora do escopo desta tarefa pontual de governança). Os badges HTML citam as decisões pelo nome, sem link funcional, conforme instrução explícita da tarefa.
