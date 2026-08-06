# Auditoria RC1 — Fase 15: Performance

**Método**: 100% análise estática real (não simulada) — `du -k`/`ls -la` reais para tamanho de arquivo, `grep -c` real para contagem de tags, leitura direta do HTML/CSS para bloqueio de renderização. **Nenhuma ferramenta de medição de runtime (Lighthouse/WebPageTest/Chrome DevTools) estava disponível no sandbox — não simulada, não fingida.**

## Tamanho dos assets (medição real, `du -k`)
| Arquivo | Tamanho |
|---|---|
| `assets/css/design-system.css` | 28 KB |
| `assets/js/navigation.js` | 12 KB |
| `assets/js/search.js` | 8 KB |
| `data/search-index.json` | 380 KB |
| `data/cross-references.json` | 284 KB |
| `data/glossario.json` | 20 KB |
| `data/roadmaps.json` | 28 KB |
| `data/documents.json` | 12 KB |
| `data/navigation.json` | 8 KB |

CSS+JS totais por página: **~48 KB** não-comprimido (sem gzip/brotli — servidor estático não configurável neste ambiente para testar compressão real). `search-index.json` (380 KB) só é buscado sob demanda (`fetch` disparado ao digitar na busca ou abrir `/search/`), não bloqueia o carregamento inicial das páginas de conteúdo — arquitetura correta.

## Páginas HTML (medição real, `du -k`, 31 páginas)
Variam de 4 KB (`404.html`, `search/index.html`) a 140 KB (`docs/arquitetura/engenharia-documentacao.html`, o documento mais longo do corpus). Mediana em torno de 40-48 KB. Não há CSS/JS inline volumoso nem duplicação de bibliotecas.

## Página típica (`docs/fases/fase1.html`, 40 KB)
- `<link>`: 3 (favicon, stylesheet, canonical)
- `<script>`: 4 (1 JSON-LD inline + `navigation.js` + `search.js`, ambos `type="module"` + 1 script inline pequeno)
- `<img>`: 1 (logo do header, `loading="eager"`, correto por estar acima da dobra e ser pequeno — 28×28px)

## `loading="lazy"` em imagens
**Achado: não aplicável.** Cada página tem exatamente 1 `<img>` (o logo do cabeçalho), corretamente `loading="eager"` (elemento pequeno, sempre visível, acima da dobra). Não há galerias/imagens de conteúdo no portal atual — portanto não há candidatas a lazy-loading. Nenhum achado.

## Fontes
**Achado positivo, nenhuma ação necessária.** `design-system.css` usa exclusivamente pilhas de fontes do sistema (`--font-body`: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`; `--font-display`: `"Iowan Old Style", "Palatino Linotype", Georgia...`). **Zero `@font-face` customizado**, portanto zero requisições de fonte externa, zero risco de FOIT/FOUT, `font-display` não é aplicável (não há fonte para baixar).

## Bloqueio de renderização
- CSS: 1 `<link rel="stylesheet">` síncrono no `<head>` — comportamento padrão esperado, arquivo pequeno (28 KB), sem `@import` aninhado.
- JS: ambos os scripts usam `type="module"`, que é **deferido nativamente pelo browser** (equivalente a `defer`, não bloqueia o parsing do HTML). Nenhum `<script>` síncrono bloqueante no `<head>`. Boa prática já implementada.

## Duplicação de CSS/JS entre páginas
Nenhuma — há um único `design-system.css` e dois arquivos JS compartilhados via caminho absoluto (`/assets/...`), sem cópias por página. Cacheável pelo navegador entre navegações (mesma URL).

## Resumo por severidade
- Crítico: 0
- Alto: 0
- Médio: 0
- Baixo: 0
- Recomendação: 1 (considerar compressão gzip/brotli e cache-control no servidor de produção — não testável/configurável neste sandbox de arquivos estáticos)

## Pendência formal
**Core Web Vitals reais (LCP, CLS, INP) NÃO foram medidos.** Não há navegador gráfico, Lighthouse, WebPageTest ou Chrome DevTools disponíveis neste ambiente sandboxed. Esta é uma pendência formal explícita: a medição real de LCP/CLS/INP deve ser feita em ambiente com navegador (Chrome/Lighthouse CI) antes da publicação pública, idealmente após a resolução do domínio real (`{{baseUrl}}`) e deploy em ambiente de staging.
