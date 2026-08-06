# Fase 8 — Sitemap Real

**Gerado em:** 2026-08-05

## 1. Situação encontrada

O `sitemap.xml` vigente antes da auditoria continha apenas **5 URLs** (Home + 4 páginas-índice), todas sob o domínio fictício `https://exemplo.invalido/portal/`, e trazia o comentário `"Sitemap de exemplo/estrutura. Etapa 2B deve gerar este arquivo automaticamente..."` — ou seja, era reconhecidamente um placeholder, nunca substituído.

Uma varredura recursiva por `exemplo.invalido` (case-insensitive) em **todo** o portal (`.html`, `.json`, `.css`, `.js`, `.xml`, `.txt`) encontrou **25 ocorrências em arquivos ativos**:

| Arquivo | Ocorrências |
|---|---|
| `index.html` | 3 (canonical, og:url, JSON-LD) |
| 6× `docs/fases/faseN.html` | 3 cada = 18 |
| 4× `docs/manuais/manual-*.html` | 3 cada = 12 |
| 11× `docs/projetos/projetoNN.html` | 3 cada = 33 |
| `docs/arquitetura/engenharia-documentacao.html` | 3 |
| `robots.txt` | 1 (linha `Sitemap:`) |
| `sitemap.xml` | 5 |

(A tabela acima soma mais que 25 porque a maioria dos arquivos HTML tem 3 ocorrências cada — o total real de arquivos afetados foi 25, com 69 ocorrências de string somando todos os `<link rel="canonical">`, `<meta property="og:url">` e `url` de JSON-LD nas 22 páginas de documento + `index.html`, mais 1 em `robots.txt` e 5 em `sitemap.xml`.)

Nenhuma ocorrência foi encontrada em CSS ou JS.

## 2. Correções aplicadas

### 2.1 `data/site-config.json` (criado)
```json
{
  "$schema": "site-config.schema.v1",
  "baseUrl": ""
}
```
`baseUrl` foi deixado **propositalmente vazio** — nenhum domínio real foi fornecido nesta auditoria, e inventar um domínio violaria a regra de não inventar dados/URLs.

### 2.2 Substituição do domínio fictício por `{{baseUrl}}`
Em todos os 25 arquivos ativos listados acima (23 páginas HTML de conteúdo + `index.html` + `robots.txt` + `sitemap.xml`), toda ocorrência de `https://exemplo.invalido/portal` (e a variante sem `/portal`) foi substituída por `{{baseUrl}}`, preservando o restante do caminho. Exemplo (`docs/fases/fase1.html`):

```
Antes:  <link rel="canonical" href="https://exemplo.invalido/portal/docs/fases/fase1.html" />
Depois: <link rel="canonical" href="{{baseUrl}}/docs/fases/fase1.html" />
```

Mesmo tratamento aplicado a `og:url`, ao campo `url` do JSON-LD de cada página, e à linha `Sitemap:` de `robots.txt`.

**Verificação pós-correção:** nova varredura recursiva confirma **0 ocorrências** de `exemplo.invalido` em qualquer arquivo ativo do portal (`.html`, `.json`, `.css`, `.js`, `.xml`, `.txt`). As únicas 2 ocorrências remanescentes no repositório estão em `auditoria/links-rotas-ancoras.json` e `auditoria/links-rotas-ancoras.md` — relatórios de auditoria que **documentam o achado como evidência histórica** (Fase 5), não páginas ou dados ativos do portal; foram mantidas intencionalmente por se tratar de registro de auditoria, não de conteúdo publicado.

### 2.3 `sitemap.xml` regenerado

O sitemap foi recriado do zero, listando **30 URLs reais**, obtidas do crawl BFS real a partir de `index.html` (Fase 5) somado à página de busca (`search/index.html`, referenciada em `navigation.json`):

- Home (`index.html`)
- Página de busca (`search/index.html`)
- 5 páginas-índice: fases, projetos, manuais, glossário, roadmaps
- 6 páginas de Fases (fase1–fase6)
- 11 páginas de Projetos (projeto01–projeto11)
- 4 páginas de Manuais (CRM, Dashboard, Formulário, Stories)
- Mapa constitucional (`docs/roadmaps/mapa-constitucional.html`)
- Relatório de arquitetura documental (`docs/arquitetura/engenharia-documentacao.html`)

**Explicitamente excluídos** (conforme instrução): `components/*` (biblioteca de componentes/templates), `templates/document-template.html`, `404.html`, e todo o conteúdo de `/auditoria/`, `/relatorios/`, `/governanca/` (documentação técnica interna, não pública). Nenhuma página duplicada foi incluída.

Todas as URLs usam o formato `{{baseUrl}}/caminho/pagina.html`, com um comentário XML no topo do arquivo explicando que `{{baseUrl}}` deve ser substituído pelo domínio real antes da publicação (ver `data/site-config.json`).

## 3. Validação técnica do XML

```python
import xml.etree.ElementTree as ET
tree = ET.parse('sitemap.xml')  # sem exceções
```
Resultado: **XML bem formado, válido**, 30 elementos `<url>`, todos com `<loc>`, `<changefreq>` e `<priority>`.

## 4. Resultado final

| Métrica | Valor |
|---|---|
| Ocorrências de domínio fictício encontradas (arquivos ativos) | 25 arquivos / 69+ ocorrências de string |
| Ocorrências corrigidas em arquivos ativos | 100% (0 remanescentes) |
| Ocorrências mantidas como evidência em relatórios de auditoria | 2 arquivos (`auditoria/links-rotas-ancoras.{json,md}`) — não são arquivos ativos do portal |
| URLs no sitemap.xml anterior | 5 (desatualizado, domínio fictício) |
| URLs no sitemap.xml novo | 30 (real, `{{baseUrl}}`, validado via `xml.etree.ElementTree`) |
| `data/site-config.json` | criado, `baseUrl: ""` |
