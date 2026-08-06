# Performance — Portal CBKS

## Carregamento
- **Zero dependências externas**: nenhum request para CDN de framework/lib — elimina
  a maior fonte de latência e de quebra por indisponibilidade de terceiros.
- **CSS único e pequeno**: `design-system.css` é o único arquivo CSS do projeto
  (sem fragmentação em múltiplos `<link>`), reduzindo round-trips.
- **JS modular via ES Modules nativos** (`type="module"`): `navigation.js` e
  `search.js` são carregados sem bundler. Módulos nativos são cacheados e
  paralelizados pelo navegador; cada um tem responsabilidade única, o que
  permite no futuro dividir ainda mais (ex.: `toc.js`, `theme.js`) sem
  reescrever import/export.
- **Fontes de sistema por padrão**: `--font-body` usa stack de sistema (sem
  arquivo de fonte para baixar). `--font-display` também recorre a fontes
  já instaladas no SO antes de qualquer webfont — `assets/fonts/` fica
  reservado apenas se a marca exigir uma fonte customizada, e nesse caso
  deve-se usar `font-display: swap` e formatos `woff2`.

## Imagens
- `loading="eager"` apenas no logo do header (acima da dobra); qualquer imagem
  de conteúdo futura (`assets/images/`) deve usar `loading="lazy"` por padrão.
- Ícones são SVG inline/arquivo (`assets/icons/*.svg`), vetoriais e leves —
  preferíveis a fontes de ícone (que forçam baixar um glyph-set inteiro).

## Cache (estratégia sugerida para deploy — comentários, sem servidor configurado nesta etapa)
```
/assets/css/*        Cache-Control: public, max-age=31536000, immutable  (versionar por hash no nome do arquivo em produção)
/assets/js/*          Cache-Control: public, max-age=31536000, immutable
/data/*.json           Cache-Control: public, max-age=300, must-revalidate  (muda com frequência ao adicionar docs)
/docs/**/*.html         Cache-Control: public, max-age=3600, must-revalidate
/index.html, /404.html    Cache-Control: no-cache
```

## Busca
- `search.js` carrega `search-index.json` uma única vez por sessão (`cachedIndex`),
  evitando refetch a cada tecla digitada. Debounce de 150ms no input.
- Índice é um único JSON plano (não uma árvore aninhada), o que mantém o
  parse e a varredura O(n) simples — adequado até a ordem de milhares de
  entradas; se o corpus crescer muito além disso, migrar para chunks por
  categoria carregados sob demanda é o próximo passo natural (a estrutura
  de `docId`/`categoria` já suporta esse particionamento).

## Carregamento progressivo
- CSS crítico (design-system.css) é o único bloqueante de render — pequeno o
  suficiente para não ser um gargalo perceptível.
- Scripts JS estão no fim do `<body>` com `type="module"` (naturalmente
  `defer`), não bloqueando o parse do HTML.
