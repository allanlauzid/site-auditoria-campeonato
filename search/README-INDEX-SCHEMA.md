# Schema do Índice de Busca — `data/search-index.json`

## Estrutura

```json
{
  "generatedAt": "ISO-8601 timestamp ou null (não gerado ainda)",
  "version": 1,
  "entries": [
    {
      "id": "string única (docId + slug da seção)",
      "docId": "id do documento em data/documents.json",
      "titulo": "título do documento",
      "secaoTitulo": "título da seção/capítulo (h2/h3)",
      "url": "caminho absoluto + #âncora da seção",
      "categoria": "fase | projeto | manual | glossario",
      "grupo": "grupo temático primário (ver documents.json.groups)",
      "excerpt": "trecho de texto da seção (~160-240 caracteres) usado no preview do resultado",
      "tokens": ["lista", "de", "palavras-chave", "normalizadas", "minúsculas", "sem", "acento"],
      "peso": "número inteiro — relevância da seção (1 = comum, 3 = capítulo central, 5 = título de documento)"
    }
  ]
}
```

## Como o índice deve ser gerado (Etapa 2B)

1. Para cada página de documento publicada (`docs/**/*.html`), percorrer os
   `h2`/`h3` do `.doc-content` (mesma lógica de `navigation.js::buildTOC`).
2. Para cada heading, capturar o texto até o próximo heading de mesmo nível
   ou superior como `excerpt` (truncado).
3. Tokenizar o texto completo da seção (título + excerpt) com a mesma função
   de normalização usada em `assets/js/search.js::tokenize` (minúsculas, sem
   acento, split por não-alfanumérico) e usar os tokens mais informativos
   (remover stopwords em português) como `tokens`.
4. Atribuir `peso` maior a: título do documento (5), capítulos citados no
   glossário ou em roadmaps (3-4), demais capítulos (1-2).
5. Concatenar todas as entradas num único array `entries` e salvar com
   `generatedAt` atualizado.

## Algoritmo de busca (implementado em `assets/js/search.js`)

Ranking por soma ponderada:
- +5 se a query aparece literalmente no `secaoTitulo`.
- +4 se aparece literalmente no `titulo`.
- +3 × `peso` para cada token da query presente em `tokens`.
- +1 para cada token (≥3 caracteres) presente como substring do `excerpt`.

Resultados ordenados por score decrescente, limitados por `options.limit`
(padrão 20). Suporta filtro por `categoria` e por `docId` (busca restrita a
um único documento — usada por um eventual "buscar neste documento").
