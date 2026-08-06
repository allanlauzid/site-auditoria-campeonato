# Portal de Documentação — Campeonato Brasileiro de Kettlebell Sport

Infraestrutura técnica do portal de documentação (Etapa 2A). HTML5 + CSS3 +
JavaScript vanilla — nenhuma dependência externa (sem frameworks, sem libs de
build). Esta etapa constrói apenas a infraestrutura: nenhum dos 21 documentos
`.md` oficiais foi convertido em conteúdo real. Isso é trabalho da Etapa 2B.

## Estrutura de pastas e justificativa técnica

```
portal/
├── index.html            Home do portal — navegação demonstrável, sem conteúdo real dos docs.
├── 404.html               Página de erro — noindex, mesma casca visual do portal.
├── robots.txt              Diretivas de rastreamento + referência ao sitemap.
├── sitemap.xml             Mapa de URLs (exemplo — Etapa 2B gera a partir de data/documents.json).
├── README.md                Este arquivo.
├── DESIGN_SYSTEM.md          Documentação completa dos tokens e componentes visuais.
├── ACCESSIBILITY.md          Decisões de acessibilidade (WCAG AA) por componente.
├── PERFORMANCE.md            Estratégia de performance e carregamento.
├── MAINTAINABILITY.md        Como adicionar documento/categoria/roadmap sem alterar arquitetura.
│
├── assets/
│   ├── css/design-system.css   Único arquivo CSS — tokens + componentes (ver DESIGN_SYSTEM.md).
│   ├── js/navigation.js        ES module — header/sidebar/footer, tema, TOC, scroll-spy, tabs/accordion/modal/dropdown.
│   ├── js/search.js            ES module — motor de busca client-side sobre data/search-index.json.
│   ├── icons/                  SVGs de marca (logo-mark, favicon) — vetorial, leve, sem sprite externo.
│   ├── fonts/                  Reservado para fontes locais (self-hosted), caso a marca exija fonte customizada.
│   └── images/                 Reservado para imagens de conteúdo (og-default, ilustrações) — vazio nesta etapa.
│
├── templates/
│   └── document-template.html  Template oficial de qualquer documento futuro (placeholders {{ }}).
│
├── components/                 Fragmentos HTML semânticos reutilizáveis, cada um comentado com seu propósito
│                                e hooks de classe/data-attribute usados por navigation.js/search.js.
│                                Por que fragmentos HTML e não um sistema de templating server-side:
│                                o projeto é estático (sem servidor/build), então cada componente é uma
│                                referência canônica de marcação que é copiada para as páginas — evita
│                                duplicidade de definição de estrutura/ARIA entre páginas.
│
├── data/                       Fonte única de verdade para navegação, documentos, glossário, roadmaps e
│   ├── documents.json            índice de busca. Justificativa: separar dado de apresentação é o que
│   ├── navigation.json           permite adicionar um documento novo só editando JSON (ver MAINTAINABILITY.md),
│   ├── glossario.json            sem tocar em HTML/CSS/JS — pré-requisito para escalar a "centenas de documentos".
│   ├── roadmaps.json
│   └── search-index.json
│
├── docs/
│   ├── fases/index.html        Índice de categoria "Fase" — navegável, sem páginas individuais de conteúdo.
│   ├── projetos/index.html     Índice de categoria "Projeto".
│   ├── manuais/index.html      Índice de categoria "Manual".
│   ├── roadmaps/               Índice + mapa-constitucional.html (ASCII da arquitetura de 4 camadas).
│   └── glossario/index.html    Índice do glossário (46 termos — 3 de exemplo nesta etapa).
│                                Nota: docs/fases/fase1.html...fase6.html, docs/projetos/projetoNN.html e
│                                docs/manuais/manual-*.html NÃO existem ainda — por regra desta etapa,
│                                nenhuma página individual de conteúdo de documento pode ser criada.
│                                Os links para elas existem na navegação/índices e resolvem em 404.html
│                                até a Etapa 2B, que os populará usando templates/document-template.html.
│
└── search/index.html           Página de busca standalone (além do modal Ctrl+K acessível em qualquer página).
```

## Por que esta arquitetura

- **Sem build step**: qualquer navegador abre `index.html` diretamente. Módulos ES
  (`type="module"`) são suportados nativamente por todos os browsers relevantes
  hoje, então não é necessário bundler.
- **Dados fora do HTML**: `data/*.json` é a fonte de verdade de navegação, índice
  de documentos, glossário, roadmaps e busca. Isso é o que torna a arquitetura
  escalável para "centenas de documentos" sem reescrever HTML/CSS/JS a cada novo
  documento — só se edita JSON e se adiciona uma página usando o template.
- **CSS único, tokenizado**: `design-system.css` centraliza cores, tipografia,
  espaçamento e componentes via CSS Custom Properties, permitindo tema
  claro/escuro sem duplicar regras (ver DESIGN_SYSTEM.md).
- **Componentes como fragmentos comentados**: cada arquivo em `components/` é ao
  mesmo tempo documentação viva e a fonte de verdade de marcação/ARIA de um
  padrão de UI, evitando divergência entre páginas.

## O que esta etapa NÃO fez (por regra explícita)

- Não alterou nenhum dos 21 `.md` originais em `arquivos claude/`.
- Não converteu nenhum documento em página de conteúdo real.
- Não usou nenhuma biblioteca ou framework externo.

Ver o relatório consolidado em
`export1/Portal_Etapa2A_Infraestrutura.md` para a especificação completa,
o plano de implementação da Etapa 2B e o fluxograma de navegação.

## Recomendação de segurança — headers HTTP (RC1, Fase 17 da auditoria)

Este é um site 100% estático (HTML/CSS/JS vanilla, sem servidor configurável
dentro deste repositório/ambiente de auditoria). Os headers de segurança abaixo
**não podem ser aplicados via arquivo estático** (exceto `<meta>` equivalentes
parciais) e devem ser configurados na camada de hospedagem/CDN de produção
antes da publicação pública:

- `Content-Security-Policy`: recomendado `default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'` — o portal não usa nenhum CDN/script de terceiros (confirmado por auditoria, zero ocorrências), então uma CSP restrita é viável sem quebrar funcionalidade.
- `Referrer-Policy`: recomendado `strict-origin-when-cross-origin`.
- `Permissions-Policy`: recomendado desabilitar recursos não usados, ex. `camera=(), microphone=(), geolocation=()`.
- `X-Content-Type-Options: nosniff`.
- `Strict-Transport-Security` (se servido via HTTPS em produção, o que é obrigatório).

Ver `auditoria/seguranca-privacidade.md` para o detalhamento completo da
auditoria de segurança e privacidade da RC1.
