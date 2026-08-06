# Decisão de Governança Documental — Interdependência Funcional Bidirecional Projeto 10 ↔ Projeto 11

**Status:** Decisão formal, Fase 10 do RC1 (Etapa 3.4 desta auditoria).
**Escopo:** Reclassifica, na camada de dados/interface do portal, a relação entre Projeto 10 e Projeto 11, hoje rotulada como "circularidade conceitual" / dependência mútua nos badges publicados e em `data/documents.json`. **Não altera nenhum .md fonte.**

## 1. Contexto

`data/documents.json` registra hoje:

- `projeto10.dependeDe = ["fase4", "projeto01", "projeto11"]`
- `projeto11.dependeDe = ["fase4", "projeto10"]`

Ou seja, Projeto 10 depende de Projeto 11 **e** Projeto 11 depende de Projeto 10 — uma dependência circular no sentido estrito do grafo. As páginas publicadas `docs/projetos/projeto10.html` e `docs/projetos/projeto11.html` já continham um badge de aviso (`callout callout--warning`) rotulando isso como "Relação complementar bidirecional" com o texto "circularidade conceitual mapeada".

## 2. Decisão

A relação Projeto 10 (Sistema de Lançamento e Mobilização) ↔ Projeto 11 (Sistema de Inteligência Pré-Inscrição) é classificada formalmente como **interdependência funcional bidirecional** — explicitamente **não um erro de arquitetura documental** e não uma dependência circular no sentido problemático (onde nenhum dos dois poderia ser lido/implementado primeiro).

1. **Projeto 10 fornece o ciclo de lançamento/mobilização** — arquitetura de campanha, jornada do atleta, storytelling, conteúdo, canais.
2. **Projeto 11 fornece a inteligência que tanto alimenta quanto é produzida pelo ciclo do Projeto 10** — a coleta de dados de interesse acontece durante o lançamento (Projeto 10), e a inteligência resultante (segmentação, indicadores, aprendizado) realimenta as decisões do próprio lançamento.
3. **Sequência de leitura recomendada:** Projeto 10 precede Projeto 11. Isso já é a ordem editorial publicada no portal (`ordem: 16` para projeto10, `ordem: 17` para projeto11 em `data/documents.json`) e é preservada nesta decisão.
4. **Execução operacional:** os dois sistemas operam de forma **iterativa/simultânea**, não sequencial — não existe um momento em que um "termina" antes do outro "começar"; ambos rodam em paralelo durante um ciclo de lançamento real.
5. **Rotulagem no grafo de dados do portal:** o rótulo de relação passa a ser **"complementa" / "interdependencia"**, em vez de tratado como "depende de" simples (que sugeriria bloqueio sequencial) ou "circular" (que sugere erro).
6. **Todos os links e referências cruzadas existentes entre Projeto 10 e Projeto 11 são preservados** — nenhuma âncora, `relacionados` ou citação nominal foi removida.

## 3. Consequência nos dados do portal

Arquivo de dados alterado: `data/documents.json`.

- Adicionado, em cada um dos dois registros (`projeto10` e `projeto11`), um novo campo `relacaoEspecial`:
  ```json
  "relacaoEspecial": {
    "tipo": "interdependencia_funcional_bidirecional",
    "com": "projeto11" /* ou "projeto10" */,
    "descricao": "Projeto 10 fornece o ciclo de lançamento/mobilização; Projeto 11 fornece a inteligência que alimenta e é alimentada por esse ciclo. Sequência de leitura recomendada: Projeto 10 → Projeto 11. Execução operacional: iterativa/simultânea, não sequencial.",
    "decisaoGovernanca": "governanca/decisao-interdependencia-projeto10-projeto11.md"
  }
  ```
- O campo `dependeDe` de ambos os documentos é **mantido como estava** (preserva o registro estrutural bruto do grafo, que é fato documental: os dois textos-fonte de fato se citam mutuamente), mas a interpretação exibida na interface deixa de tratar essa dependência mútua como "circularidade" problemática e passa a exibi-la, via `relacaoEspecial`, como interdependência funcional intencional.

## 4. Badges HTML atualizados

`docs/projetos/projeto10.html` e `docs/projetos/projeto11.html`: o texto do badge `callout callout--warning` existente ("Relação complementar bidirecional... circularidade conceitual mapeada...") foi mantido em sua constatação factual, mas passou a citar nominalmente esta decisão de governança formal, com o texto:

> "Relação complementar bidirecional — este documento e o Projeto XX operam em interdependência funcional bidirecional (ver decisão de governança: interdependência funcional bidirecional Projeto10↔Projeto11), não uma falha de arquitetura: Lançamento/Mobilização alimenta e é alimentado pela Inteligência Pré-Inscrição. Sequência de leitura recomendada: Projeto 10 → Projeto 11; execução operacional: iterativa/simultânea."

A página de governança (`governanca/decisao-interdependencia-projeto10-projeto11.md`) não é publicada como página HTML nesta rodada (fora do escopo desta tarefa pontual), por isso a citação no badge é textual (nome do documento), não um link funcional.

## 5. Não-ação explícita

Esta decisão não remove o `dependeDe` mútuo pré-existente (fato estrutural real do corpus, mantido para não perder rastreabilidade), não altera nenhum dos 21 arquivos .md fonte, e não afirma que a leitura pode ocorrer em qualquer ordem — mantém explicitamente Projeto 10 → Projeto 11 como sequência de leitura recomendada.
