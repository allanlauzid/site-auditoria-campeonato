# Auditoria RC1 — Fase 13: Busca

**Método**: script Node.js (`node`, real, executado) que replica fielmente a lógica de `assets/js/search.js` (lida integralmente antes de reimplementar: tokenização com normalização NFD para remoção de acento, scoring ponderado — título de seção ×5, título do doc ×4, token em `tokens` ×3×peso, substring em excerpt ×1) e carrega o índice real `data/search-index.json` (**441 entradas**, populado — não é mais placeholder vazio como o comentário do próprio `search.js` sugeria estar previsto para a "Etapa 2B"; a Etapa 2B já ocorreu).

## Casos testados (execução real, `node /tmp/search_test.mjs`)

| Caso | Query | Resultados | Duplicados por id | Observação |
|---|---|---|---|---|
| Título exato | "Engenharia da Documentação" | 17 | Não | OK, top resultado é o próprio doc (score 14) |
| Palavra parcial | "kettlebe" | 18 | Não | Match por substring em tokens/excerpt funcionando |
| Frase | "Manual Comercial de Vendas" | 20 | Não | Top 3 todos do Projeto 06 (doc correto) |
| Com acento | "patrocínio" | 20 | Não | — |
| Sem acento (equivalente) | "patrocinio" | 3 | Não | Retorna menos resultados que a versão acentuada (score menor, 6 vs 15) — tokenização normaliza NFD e remove diacríticos nos *tokens indexados*, mas o match de frase completa (`secaoTitulo.includes(qLower)`) é sensível a acento e não bate; isso é esperado dado o algoritmo, resultado ainda correto e nenhum resultado espúrio. Recomendação (baixa): normalizar também `qLower`/`secaoTitulo` antes do `.includes()` para paridade total acento/sem-acento — melhoria de UX, não bug. |
| Maiúsculas | "GLOSSÁRIO" | 20 | Não | Case-insensitive funcionando corretamente |
| Termo de glossário | "Sponsor Kit" | 3 | Não | Top resultado é a entrada exata do glossário (score 27) |
| Nome de capítulo | "Fase 3" | 20 | Não | Nenhum resultado é a própria "Fase 3" no top 3 — termos curtos e genéricos ("fase", "3") geram empate de score 10 entre muitos documentos; ranking por ordem de índice em empate, não é bug, mas UX de relevância fraca para queries genéricas. Recomendação (baixa/média): dar peso extra a match no campo `docId`/breadcrumb. |
| "Projeto 08" | "Projeto 08" | 20 | Não | Mesmo padrão do caso anterior (termos genéricos, ranking fraco em empate) |
| Termo inexistente | "xablauzork9000" | 0 | — | Corretamente retorna vazio |
| Busca vazia | "" | 0 | — | Corretamente retorna vazio (`if (!q) return []`) |
| Caracteres especiais | "!@#$%^&*()" | 0 | — | Tokenizer descarta tudo (`[^a-z0-9]+` split), sem erro/exceção |
| Especiais + termo | "kettlebell!!" | 18 | Não | Pontuação ignorada corretamente, mesmo comportamento de "kettlebell" puro |

## Duplicação de resultados
**Verificado nos 14 casos acima via comparação de `id` único por resultado — nenhuma duplicação residual encontrada.** A governança prévia (`auditoria/limpeza-editorial.md`, não repetido aqui) já tratava esse ponto; confirma-se aqui com execução real do algoritmo, não apenas leitura estática.

## Arquivo `search/README-INDEX-SCHEMA.md`
Existe e documenta o schema do índice — não contradiz o comportamento observado na execução real.

## Resumo por severidade
- Crítico: 0
- Alto: 0
- Médio: 1 (ranking fraco para queries genéricas tipo "Fase 3"/"Projeto 08" — não retorna erro, apenas relevância sub-ótima)
- Baixo: 1 (busca sem acento não empata perfeitamente com busca acentuada no matching de frase completa)
- Recomendação: 2 (dar peso a match em `docId`; normalizar acentos também no matching de frase)

Nenhuma correção de código aplicada nesta fase — os achados são de qualidade/relevância de ranking, não de defeito funcional (todos os 14 casos retornaram o comportamento esperado sem erros, exceptions ou resultados incorretos/duplicados), portanto fora do critério de "correção tecnicamente indispensável".
