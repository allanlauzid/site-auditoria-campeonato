# Auditoria RC1 — Fase 17: Segurança e Privacidade

**Método**: manual/estático — `grep` real em todo o portal (HTML/CSS/JS/JSON/TXT/XML) para os padrões solicitados; leitura completa dos 2 arquivos JS.

## `innerHTML`/`outerHTML`/`document.write` com dados dinâmicos
Ver detalhamento completo em `html-css-js.md`. Resumo:
- **`search.js`**: escapa corretamente (`escapeHtml()`) todos os campos textuais antes de `innerHTML`. Único ponto não escapado é `r.url` em atributo `href`, dado de primeira parte (gerado pelo build, não input de usuário) — risco residual **baixo**, recomendação de hardening não aplicada (sem vetor de exploração ativo).
- **`navigation.js`**: **achado médio** — `renderTopNav`, `renderSidebar`, `renderFooterColumns`, `renderBreadcrumb` interpolam dados de `navigation.json` em `innerHTML` sem `escapeHtml`. Dado é estático e de primeira parte hoje; risco é teórico (defesa em profundidade), não corrigido automaticamente porque exigiria testar as 31 páginas após a mudança — recomendado como item de hardening pós-RC1, não bloqueador de publicação, dado que não há vetor de injeção de conteúdo externo neste portal (sem CMS, sem formulário público, sem comentários).
- **`document.write`**: 0 ocorrências em todo o portal.

## `eval()`
**0 ocorrências** em todo o portal (grep completo em `.js`).

## URLs não sanitizadas no DOM
Todas as URLs interpoladas (`item.url`, `l.url`, `step.url`, `r.url`) vêm de arquivos JSON estáticos de primeira parte (`data/navigation.json`, `data/search-index.json`) gerados no build do próprio portal, não de query string, `location.hash` ou input de usuário livre — sem vetor de URL não confiável identificado.

## `target="_blank"` sem `rel="noopener"`/`"noreferrer"`
**0 ocorrências de `target="_blank"` em todo o portal** (grep completo em todas as 53 páginas/fragmentos HTML). Não há links externos abrindo em nova aba — portanto **nenhuma correção necessária** (não havia o que corrigir).

## Scripts de terceiros / CDN externos
**0 ocorrências** de `<script src="http...">` ou qualquer `src`/`href` externo em todo o portal (grep de `https?://` em atributos `src`/`href` de todas as páginas HTML). O portal é 100% self-hosted, sem dependência de CDN externo — confirmado, consistente com a documentação do próprio `README.md` ("Não usou nenhuma biblioteca ou framework externo").

## Caminhos de sistema locais expostos em arquivos públicos
**Achado (baixo, apenas em artefatos internos de auditoria — não no site publicado)**: `auditoria/manifesto-rc1.json` contém caminhos absolutos do ambiente de build (`/sessions/vibrant-fervent-davinci/mnt/...`) nos campos `caminho` de cada entrada do manifesto, e `relatorios/lote-2-projetos.md`/`relatorios/lote-3-manuais.md` citam `C:\Users\Allan\Documents\...`. **Nenhum desses arquivos faz parte do site publicado** (não estão em `docs/`, `index.html`, `assets/`, `data/`, `sitemap.xml`) — são artefatos de auditoria/relatório interno, cujo propósito é justamente documentar a proveniência dos arquivos de origem. **Ação recomendada, não aplicada**: garantir que a pasta `auditoria/` e `relatorios/` **não sejam copiadas para o servidor de produção público** junto com `docs/`/`assets/`/`data/`/`index.html` — é uma instrução de processo de deploy, não uma edição de arquivo (editar o manifesto removeria a rastreabilidade que ele existe para prover).

## Dados pessoais reais
Varredura por padrão de e-mail (`grep -oE` regex de e-mail) e telefone em todo HTML/JSON público: **0 ocorrências**. Nenhum dado pessoal identificável exposto no conteúdo publicado.

## Recomendação de headers de segurança
Site estático sem servidor configurável neste ambiente de auditoria. Recomendação formal registrada em `README.md` (seção "Recomendação de segurança — headers HTTP", adicionada nesta auditoria): CSP restrita (`default-src 'self'`, viável dado zero scripts de terceiros), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restritiva, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` — a aplicar na camada de hospedagem/CDN de produção.

## `localStorage`
Uso único: chave `kbs-portal-theme` (preferência de tema claro/escuro). Não armazena dados sensíveis ou identificáveis.

## Resumo por severidade
- Crítico: 0
- Alto: 0
- Médio: 1 (innerHTML sem escape em navigation.js — risco teórico, sem vetor de exploração ativo, documentado como hardening pós-RC1)
- Baixo: 1 (caminhos locais em artefatos internos de auditoria — não publicados, ação de processo de deploy recomendada)
- Recomendação: 1 (headers HTTP de segurança — adicionada nota formal em README.md nesta auditoria)

**Nenhum risco alto ou crítico ficou sem correção ou justificativa formal** — os dois achados de menor severidade têm justificativa técnica explícita registrada acima (ausência de vetor de exploração ativo / arquivos não publicados).
