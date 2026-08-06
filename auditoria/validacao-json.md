# Validação Formal de Dados JSON — Auditoria RC1

Data: 2026-08-05
Ferramentas: `python3 -c "json.load(...)"` e `node -e "JSON.parse(...)"` — parsing real executado nos 5 arquivos, não inspeção visual.

## 1. Sintaxe e codificação (resultado dos dois parsers)

| Arquivo | python json.load | node JSON.parse | UTF-8 decode |
|---|---|---|---|
| documents.json | OK | OK | OK |
| navigation.json | OK | OK | OK |
| search-index.json | OK | OK | OK |
| roadmaps.json | OK | OK | OK |
| glossario.json | OK | OK | OK |

Nenhum erro de sintaxe. Nenhum caractere de substituição (U+FFFD) encontrado em nenhum arquivo — confirma que não há corrupção de acentuação/UTF-8. Uma checagem inicial por padrão "Ã" isolado em `search-index.json` (113 ocorrências) foi investigada manualmente: são todas palavras legítimas em maiúsculas com acento (CLASSIFICAÇÃO, NÃO, VISÃO, MISSÃO, DECISÃO, EVOLUÇÃO etc.), não mojibake — falso positivo descartado.

## 2. documents.json

- 22 documentos (21 fontes .md + "engenharia-documentacao", que é o relatório de arquitetura da Etapa 1, também tratado como documento formal).
- Schema mínimo observado: id, slug, titulo, categoria, grupoPrimario, gruposSecundarios, ordem, versao, status, tempoLeituraMin, dependeDe, relacionados, url — presente em 100% das entradas, sem campos faltantes.
- IDs únicos: sim (22/22).
- Todas as 22 URLs apontam para arquivos HTML existentes em disco (checado com `os.path.isfile`).
- Nenhuma referência cruzada "dangling" em `relacionados` (todo id citado existe em `documents.json`).

## 3. navigation.json

- 40 referências de `url` no total, cobrindo topNav, sidebarGroups e footerColumns.
- Todas as 40 URLs (exceto externas/mailto) apontam para arquivos existentes em disco. Nenhuma quebrada.
- Observação de arquitetura (não é erro): o link de "Busca" (`/search/index.html`) só existe dentro de `footerColumns`, que é renderizado dinamicamente em runtime por `navigation.js` (função `renderFooterColumns`) a partir deste JSON — não existe como `<a href>` estático no HTML fonte de `index.html`. Por isso o crawl estático de reachability (Fase 2) reportou `search/index.html` como "não alcançável por link direto", mas na prática, em um navegador real com JS habilitado, o link é injetado e a página é alcançável. Registrado para verificação funcional na Etapa 3.5 (execução real de JS/DOM).

## 4. search-index.json — inclui a decisão sobre a entrada residual

- Contagem original: 390 entradas.
- Localizada a entrada `id: "exemplo-glossario-governanca-marca"` com `docId: "glossario"` — o único `docId` em todo o arquivo que **não corresponde** a nenhum id em `documents.json` (que não lista "glossario" como documento formal, pois o glossário é dado estruturado à parte, em `glossario.json`).
- O campo `_comment` do próprio `search-index.json` confirma a origem: *"Etapa 2A entrega o schema e 2 entradas de exemplo (dados fictícios de estrutura, não conteúdo real dos 21 .md). Etapa 2B irá gerar este arquivo automaticamente a partir do conteúdo real de cada página."* O `excerpt` da entrada era literalmente "Definição de exemplo de termo do glossário — placeholder estrutural."
- **Decisão**: removida a entrada `exemplo-glossario-governanca-marca` de `data/search-index.json`, por ser dado demonstrativo residual da Etapa 2A sem correspondência real em `documents.json` nem em conteúdo publicado.
- Nova contagem real: **389 entradas**.
- Revalidação pós-remoção: `python3 json.load` → OK (389 entradas); `node JSON.parse` → OK (389 entradas).
- Após a remoção, checagem de todas as 389 entradas restantes: 0 com `docId` inexistente em `documents.json`, 0 com `url` (ignorando âncora) apontando para arquivo inexistente em disco, IDs únicos (389/389), nenhum array `tokens` vazio.
- Nota separada: a ausência de entradas de busca com `docId: "glossario"` após a remoção significa que o glossário real (26 termos atuais em `glossario.json`) ainda não está indexado para busca — gap a ser tratado, se aplicável, em etapa de conteúdo/busca (Etapa 3.4/3.5), não corrigido aqui pois está fora do escopo da Fase 3 (validação formal + remoção do residual, não geração de novo conteúdo).

## 5. roadmaps.json

- 7 roadmaps, IDs únicos.
- Todos os `origemDocId` correspondem a documentos existentes em `documents.json`.
- Itens de roadmap com `docId: null` (documentos futuros, ainda não produzidos) são válidos pelo schema — representam itens do roadmap que ainda não têm documento correspondente, não erro de referência.

## 6. glossario.json

- 26 termos presentes atualmente (IDs únicos, 26/26).
- **Achado relevante, fora do escopo de correção desta Fase 3**: o próprio `_comment` do arquivo declara que a Etapa 2A entregou "apenas o schema e 3 entradas de exemplo" e que a Etapa 2B "populará os 46 termos reais". Contagem atual (26) está entre os 3 de exemplo e os 46 esperados — indica preenchimento parcial, não os 46 termos oficiais completos. Não há termos órfãos: todos os 26 têm `documentoOrigem` válido apontando para um documento existente em `documents.json`.
- 3 termos com definição ainda contendo a marca `[placeholder]` no texto: `sistema-simbolico`, `governanca-de-marca`, `sistemas-permanentes` — indicando que mesmo dentro dos 26 termos atuais, parte do conteúdo é substituto temporário, não definição final.
- Esta lacuna (26/46 termos, 3 com `[placeholder]`) é registrada aqui como achado factual da Fase 3 e encaminhada para tratamento na Etapa 3.4 ("Glossário 46/46"), conforme já previsto no plano de trabalho — nenhuma alteração de conteúdo foi feita neste JSON nesta fase, respeitando o escopo da tarefa (Fase 3 = validação formal + remoção do residual em search-index.json, não completude de glossário).

## 7. Resumo de resultado

- 5/5 arquivos válidos sintaticamente nos dois parsers (python e node).
- 5/5 sem corrupção de UTF-8.
- 0 referências cruzadas quebradas em documents.json, navigation.json, roadmaps.json, glossario.json.
- 1 entrada residual identificada e removida em search-index.json (390 → 389), com revalidação pós-remoção OK nos dois parsers.
- 1 achado de escopo (não corrigido aqui, por estar fora do mandato da Fase 3): glossario.json com 26/46 termos oficiais e 3 definições ainda em placeholder — encaminhado para Etapa 3.4.
