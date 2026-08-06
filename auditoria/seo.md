# Auditoria RC1 — Fase 14: SEO

**Método**: manual/estático — script Python com parser HTML real (`html.parser`, tolerante a ordem de atributos) extraindo `<title>`, meta description, canonical, Open Graph, Twitter Card, `lang`, favicon e blocos JSON-LD de todas as 31 páginas publicadas; `json.loads()` real em cada bloco JSON-LD; `xml.etree.ElementTree` real para validar `sitemap.xml`.

## Títulos únicos
**0 duplicatas** entre as 31 páginas (checado por dicionário título→lista de arquivos).

## Meta description
Presente e não vazia em 29/31 páginas. As 2 exceções (`404.html`, `search/index.html`) têm `<meta name="robots" content="noindex">` e `search/` está em `Disallow` no `robots.txt` — **ausência de description é comportamento correto para páginas não indexáveis, não é defeito.**

## Canonical
**Achado (médio) — CORRIGIDO.** 6 páginas (5 índices de categoria + `docs/roadmaps/mapa-constitucional.html`) não tinham `<link rel="canonical">`, `og:*` nem `twitter:card`, apesar de estarem indexáveis (sem `noindex`) e presentes no `sitemap.xml`. **Corrigido**: adicionado bloco completo (canonical + 6 tags Open Graph + 3 Twitter Card) reaproveitando o `<title>`/description já existentes em cada página, seguindo o padrão `{{baseUrl}}` já usado nas demais 23 páginas de conteúdo — mesmo formato, mesma pendência de substituição de domínio (ver abaixo). Arquivos alterados: `docs/fases/index.html`, `docs/glossario/index.html`, `docs/manuais/index.html`, `docs/projetos/index.html`, `docs/roadmaps/index.html`, `docs/roadmaps/mapa-constitucional.html`.
`404.html` e `search/index.html` permanecem sem canonical/OG — **correto por design** (noindex + disallow).

## `{{baseUrl}}` não resolvido
Placeholder presente em `canonical`, `og:url` e `sitemap.xml`/`robots.txt` em todas as páginas. **Não é um novo defeito** — já documentado explicitamente em `data/site-config.json` ("baseUrl vazio proposital: nenhum domínio real foi definido até o momento desta auditoria RC1"). Confirma-se aqui como **pendência formal pré-existente**, não contradita, apenas reafirmada: nenhum domínio de produção foi decidido; antes da publicação, será necessário substituir `{{baseUrl}}` em todas as ocorrências (canonical, og:url, JSON-LD `url`, `sitemap.xml`, `robots.txt`).

## JSON-LD (schema.org)
**Parse real (`json.loads`) em todos os blocos — 0 inválidos.** 23 páginas de conteúdo (fases, projetos, manuais, arquitetura) têm JSON-LD tipo `TechArticle`/similar, válido. As 8 páginas utilitárias/índice (6 índices de categoria + `404.html` + `search/index.html`) não têm nenhum bloco JSON-LD — achado (recomendação) para os 6 índices indexáveis (poderiam usar `CollectionPage`/`ItemList`), mas não aplicado nesta rodada por exigir decisão de modelagem de dados fora do escopo de correção mecânica.

## `BreadcrumbList`
**Achado (médio/recomendação) — não corrigido.** 23/23 páginas de conteúdo com JSON-LD têm apenas `TechArticle` (ou similar), nenhuma tem `BreadcrumbList` estruturado, apesar de a navegação visual (breadcrumb HTML via `components/breadcrumb.html`) existir na interface. Gera perda de rich snippet de breadcrumb no Google, mas não é erro/quebra — não corrigido automaticamente porque exigiria gerar a trilha de navegação (array de posições/URLs) por página, uma tarefa de geração de conteúdo estruturado específico por documento, não uma correção mecânica de defeito.

## Open Graph / Twitter Card completos
23 páginas de conteúdo já tinham OG+Twitter completos desde antes desta auditoria (confirmado, não repetido/contradito). 6 páginas corrigidas nesta fase (ver acima). 2 páginas noindex intencionalmente sem.

## Favicon
Referenciado (`<link rel="icon" href="/assets/icons/favicon.svg">`) em 100% das 31 páginas.

## `lang`
`lang="pt-BR"` em 100% das páginas.

## `robots.txt` (validado, leitura real)
```
User-agent: *
Allow: /
Disallow: /search/
Sitemap: {{baseUrl}}/sitemap.xml
```
Correto — bloqueia indexação da busca interna (padrão recomendado), aponta sitemap (com o mesmo placeholder `{{baseUrl}}` pendente, ver acima).

## `sitemap.xml` (validado com `xml.etree.ElementTree`, real)
**XML bem formado.** 30 URLs listadas (a página `_glossario_cards.html` corretamente NÃO está no sitemap, consistente com ser rascunho não publicado).

## Domínios fictícios
`grep -rniE "exemplo\.com|example\.com|placeholder\.com|lorem ipsum|test\.com|foo\.com|acme\.com"` em todo o portal (HTML/JSON/XML/TXT/JS/CSS): **0 ocorrências.** Nenhum domínio de exemplo remanescente.

## Resumo por severidade
- Crítico: 0
- Alto: 0
- Médio: 1 (6 páginas sem canonical/OG/Twitter) — **corrigido**
- Baixo: 0
- Recomendação: 2 (JSON-LD ausente em páginas-índice; BreadcrumbList ausente em 23 páginas de conteúdo)

## Pendência formal
Substituição de `{{baseUrl}}` por domínio de produção real em todas as páginas + `sitemap.xml` + `robots.txt` antes de qualquer publicação pública — já era uma pendência formal documentada pela equipe antes desta auditoria (`data/site-config.json`), reafirmada aqui.
