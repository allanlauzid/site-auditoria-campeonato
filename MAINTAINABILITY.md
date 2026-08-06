# Manutenibilidade — Portal CBKS

Princípio central: **dado fora de código**. Adicionar conteúdo não deve exigir
tocar em CSS, JS ou nos componentes — apenas em `data/*.json` e em uma nova
página HTML feita a partir do template.

## Como adicionar um novo documento

1. Copie `templates/document-template.html` para o caminho correto em
   `docs/<categoria>/<slug>.html` (ex.: `docs/manuais/manual-segmentacao.html`).
2. Substitua os placeholders `{{TITULO}}`, `{{RESUMO}}`, `{{OBJETIVO}}` etc.
3. Adicione uma entrada correspondente em `data/documents.json` (bloco
   `documents`), preenchendo `id`, `categoria`, `grupoPrimario`, `dependeDe`,
   `relacionados`, `url`.
4. Adicione o link em `data/navigation.json` (dentro do `sidebarGroups`
   correspondente) para que apareça na sidebar de toda a documentação.
5. (Etapa 2B/futuro) Rode o gerador de índice de busca para extrair seções
   do novo documento e anexar entradas em `data/search-index.json`
   (schema documentado nos comentários do próprio arquivo).

Nenhum desses passos exige editar `design-system.css`, `navigation.js`,
`search.js` ou qualquer arquivo em `components/`.

## Como adicionar uma nova categoria (ex.: "Playbooks")

1. Criar `docs/playbooks/index.html` (copiar de `docs/manuais/index.html` e
   trocar título/descrição/cards).
2. Adicionar `{ "id": "playbook", "label": "Playbooks", "path": "docs/playbooks" }`
   em `data/documents.json.categories`.
3. Adicionar um novo grupo em `data/navigation.json.sidebarGroups` e um item
   em `topNav` se a categoria merecer destaque no menu superior.

## Como adicionar um roadmap

1. Adicionar um objeto em `data/roadmaps.json.roadmaps`, com `origemDocId`
   apontando para o documento que o define e `itens` listando os documentos
   futuros (com `status`: `planejado` | `em-andamento` | `concluído`).
2. Se quiser uma página dedicada, copiar `docs/roadmaps/mapa-constitucional.html`
   como base.

## Como adicionar um termo ao glossário

1. Adicionar objeto em `data/glossario.json.termos` (`id`, `termo`, `definicao`,
   `documentoOrigem`, `documentosRelacionados`, `categoria`).
2. Usar o componente `components/glossary-inline.html` no texto de qualquer
   documento para linkar o termo com tooltip (`<a class="glossary-term" href="/docs/glossario/index.html#<id>">`).

## Por que isso escala para "centenas de documentos"

- A navegação inteira (topo, sidebar, footer) é renderizada a partir de UM
  arquivo JSON por `navigation.js` — adicionar 100 documentos não aumenta a
  complexidade de manutenção do HTML de navegação, só o tamanho do JSON.
- Os componentes HTML são fragmentos fixos e comentados — não crescem em
  variantes por documento; o que varia é conteúdo, injetado no template.
- O índice de busca é uma lista plana de entradas independentes — adicionar
  documentos é sempre um `append`, nunca uma reestruturação.
- A arquitetura de dependência (`dependeDe`, `relacionados`) já é a mesma
  usada na Etapa 1 (Engenharia da Documentação) — nenhuma remodelagem de
  dados é necessária ao crescer o corpus, só popular mais entradas.
