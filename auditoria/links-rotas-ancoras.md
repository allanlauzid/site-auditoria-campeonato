# Fase 5 — Auditoria de Links, Rotas e Âncoras

**Gerado em:** 2026-08-05
**Metodologia:** Varredura completa (não amostragem) dos 52 arquivos `.html` do portal via parsing estruturado (BeautifulSoup), extraindo todos os `href`, `src`, `<link rel="canonical">`, `og:url` e `url` de JSON-LD. Crawl BFS real a partir de `index.html` seguindo apenas `<a href>` internos. Comparação cruzada com `data/navigation.json`, `sitemap.xml` e `data/search-index.json` (389 entradas).

## 1. Números gerais

| Métrica | Valor |
|---|---|
| Arquivos `.html` no portal | 52 |
| Páginas de conteúdo público (docs/ + index.html) | 29 |
| Links (`href`/`src`) verificados | 430 |
| Links quebrados encontrados | 3 (todos em `templates/document-template.html`, ver §2) |
| Links quebrados reais fora de template | 0 |
| Âncoras quebradas encontradas | 1 |
| Âncoras quebradas corrigidas | 1 |
| IDs duplicados na mesma página | 0 |
| IDs inválidos (espaço/caractere proibido) | 0 |
| Páginas de conteúdo órfãs (fora do crawl a partir de index.html) | 0 |
| Páginas ausentes de `navigation.json` | 0 |
| Páginas ausentes do `sitemap.xml` atual | 24 (sitemap será regerado na Fase 8) |
| Caminhos absolutos tipo `C:\` ou `/sessions/` | 0 |
| `href="#"` vazio sem função | 0 |
| URLs `javascript:` | 0 |
| Links para pastas não públicas (`/auditoria/`, `/relatorios/`) | 0 |
| Ocorrências de domínio fictício `exemplo.invalido` em HTML | 23 (tratamento centralizado na Fase 8) |

## 2. Links quebrados — análise

Os 3 únicos `href` que não resolveram a um arquivo real estão em `templates/document-template.html`:

```
{{URL_DOC_ANTERIOR}}
{{URL_DOC_PROXIMO}}
{{URL_CANONICA}}
```

**Classificação:** falso positivo. Este arquivo é um *template* de geração (não publicado, não listado em `navigation.json` nem em `sitemap.xml`); os placeholders `{{...}}` são substituídos em tempo de geração de cada página real. Nenhuma correção foi necessária — comportamento esperado e correto de um template.

**Resultado líquido de links quebrados reais em páginas publicadas: 0.**

## 3. Âncora quebrada — encontrada e corrigida

**Arquivo:** `components/search-results.html` (exemplo estático de referência visual do componente de busca, conforme comentário no topo do próprio arquivo).

- **Antes:** `href="/docs/fases/fase3.html#sistema-simbolico"` (e o mesmo valor repetido no `<div class="search-results__item-path">`)
- **Problema:** o heading real em `docs/fases/fase3.html` (linha 294) é `<h2 id="17-sistema-simbolico">17. SISTEMA SIMBÓLICO</h2>` — o id inclui o prefixo numérico do capítulo (`17-`), que não estava presente no link de exemplo.
- **Depois:** `href="/docs/fases/fase3.html#17-sistema-simbolico"` (e path correspondente atualizado)
- **Justificativa da correção:** embora seja um componente de referência/exemplo (não uma página de conteúdo real, e o resultado de busca real é montado dinamicamente por `search.js` a partir de `search-index.json`, que já usa os ids corretos), manter um link quebrado como modelo de marcação é um risco de propagação de erro para futuras implementações. Correção classificada como indispensável e óbvia (correspondência clara com o id real existente).

Nenhuma outra âncora `#id` — nem cruzando páginas, nem dentro da mesma página — resolveu para um id inexistente.

## 4. IDs — duplicados, inválidos e instáveis

- **Duplicados:** nenhuma das 52 páginas tem dois elementos com o mesmo `id`.
- **Inválidos:** uma primeira passada com regra "id deve começar com letra" sinalizou 411 ocorrências (ex.: `0-ficha-tecnica-e-escopo-do-relatorio`, `17-sistema-simbolico`, `11-projeto01-sistema-de-comunicacao-kettlebell`). Essa regra reflete a norma legada do HTML4 e **não** o HTML5, onde a única exigência é que o `id` seja não vazio e sem espaços em branco. Refeita a checagem com o critério correto (HTML5), **0 ids inválidos** foram confirmados.
- **Instáveis (hash aleatório):** nenhum id no portal usa hash gerado aleatoriamente (tipo `a3f9c2e1`); todos seguem padrão de slug legível e determinístico derivado do título do capítulo/seção (ex.: `3-fase3-plataforma-de-marca-kettlebell`), o que é o comportamento correto e estável.
- **Capítulos com âncora:** os headings H2/H3 relevantes de todas as páginas de fases/projetos/manuais analisadas têm `id` correspondente, permitindo deep-linking de capítulo (confirmado via amostra de `docs/fases/fase3.html` e cruzamento com `search-index.json`).

## 5. Crawl BFS a partir de `index.html`

Partindo de `index.html` e seguindo exclusivamente `<a href>` internos, o crawl alcançou **29 de 29 páginas de conteúdo público** (`docs/**` + `index.html`). **Zero páginas de conteúdo órfãs.**

Ficam fora do alcance do crawl, por desenho, e **não são consideradas órfãs de conteúdo**:
- `components/*.html` (22 arquivos) — biblioteca de componentes de referência visual, não são páginas de navegação pública;
- `templates/document-template.html` — template de geração, não publicado;
- `search/index.html` — ponto de entrada da busca client-side, acessado via JS/URL direta e referenciado em `navigation.json` (não via link de conteúdo);
- `404.html` — página de erro, acessada apenas via rota de erro do servidor.

**Páginas alcançadas apenas via `search-index.json` (não via `<a href>`):** nenhuma — todas as 389 entradas de `search-index.json` apontam para URLs de páginas que já são alcançáveis pelo crawl normal (`docs/**`); a busca aponta para âncoras de seção dentro de páginas já navegáveis, não para páginas adicionais.

## 6. Comparação com `navigation.json` (sidebar/menu)

Todas as 29 páginas de conteúdo estão presentes em `data/navigation.json`. O arquivo também referencia `/search/index.html`, `/DESIGN_SYSTEM.md` e `/README.md`, fora do escopo de páginas HTML de conteúdo. **Nenhuma página ausente da navegação.**

## 7. Comparação com `sitemap.xml` atual

O `sitemap.xml` vigente antes desta auditoria contém apenas **5 URLs** (as páginas-índice), todas sob o domínio fictício `https://exemplo.invalido`, e não referencia nenhuma das 24 páginas de conteúdo individual (fases 1-6, os 4 manuais, os 11 projetos, roadmaps/index e mapa-constitucional). Esse arquivo está desatualizado e será **totalmente regenerado na Fase 8**, com URLs reais e sem domínio fictício.

## 8. Sequência anterior/próximo (`doc-nav`)

23 das 29 páginas de conteúdo têm navegação `doc-nav` (anterior/próximo) funcional, com todos os `href` de `doc-nav__link--prev`/`--next` apontando para arquivos existentes — **0 quebras**. As 6 páginas sem `doc-nav` são páginas-índice de listagem (`docs/fases/index.html`, `docs/glossario/index.html`, `docs/manuais/index.html`, `docs/projetos/index.html`, `docs/roadmaps/index.html`) e `docs/roadmaps/mapa-constitucional.html` (página de referência autônoma) — nessas, navegação linear anterior/próximo não se aplica por natureza do conteúdo.

## 9. Outros achados (não corrigidos nesta fase, por escopo)

- **Domínio fictício `exemplo.invalido`:** 23 ocorrências em `<link rel="canonical">`, `<meta property="og:url">` e JSON-LD nas páginas de conteúdo. Não alteradas na Fase 5 — o tratamento é centralizado e completo (HTML + CSS + JS + JSON) na **Fase 8**, para evitar correção fragmentada e inconsistente.
- **`<link rel="canonical">` ausente:** 6 páginas-índice (`fases/index.html`, `glossario/index.html`, `manuais/index.html`, `projetos/index.html`, `roadmaps/index.html`, `roadmaps/mapa-constitucional.html`) não têm tag canonical. Achado de SEO registrado para acompanhamento; não é um link quebrado e está fora do escopo obrigatório desta fase.
- **Comentário desatualizado em `data/search-index.json`:** o campo `_comment` ainda descreve o arquivo como tendo "2 entradas de exemplo (dados fictícios)" pendentes da "Etapa 2B", mas o arquivo já contém 389 entradas reais e validadas (0 URLs/âncoras quebradas). Esse resíduo textual será tratado na **Fase 9** (Limpeza editorial).

## 10. Correções aplicadas nesta fase

| # | Arquivo | Tipo | Antes | Depois |
|---|---|---|---|---|
| 1 | `components/search-results.html` (linhas 7 e 9) | Âncora quebrada | `#sistema-simbolico` | `#17-sistema-simbolico` |

Nenhuma outra correção foi necessária — 0 links quebrados reais, 0 ids duplicados, 0 páginas órfãs.
