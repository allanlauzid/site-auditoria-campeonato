# Acessibilidade — Portal CBKS

Meta: WCAG 2.1 nível AA. Decisões por área:

## Contraste
- Texto padrão Carvão `#141414` sobre Osso-soft `#F5F1E9`: contraste ≈ 18.5:1 (AAA).
- Terracota-dark `#8F3E21` usada para links sobre fundo claro: contraste ≈ 6.2:1 (AA para texto normal).
- Tema escuro usa Terracota clareada `#D97A52` sobre Carvão `#141414` (contraste ≈ 7.8:1) em vez da
  Terracota original de campanha, que falharia AA sobre fundo escuro.
- Estados (success/warning/danger/info) usam pares fundo-claro/texto-escuro dedicados, nunca a cor
  pura de destaque sobre fundo neutro, para preservar contraste em ambos os temas.

## Semântica e hierarquia
- Um único `<h1>` por página (título do documento/seção).
- `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` semânticos em toda página.
- `<nav aria-label="...">` distinto para navegação principal, sidebar, breadcrumb e TOC —
  leitores de tela distinguem os 4 blocos de navegação sem ambiguidade.

## Navegação por teclado
- `.skip-link` ("Pular para o conteúdo") como primeiro elemento focável de cada página.
- Todos os elementos interativos (`button`, `a`, `input`, `[tabindex]`) têm `:focus-visible`
  com anel de foco de 3px (`--color-focus-ring`), cor escolhida por contraste, não pela paleta de marca.
- Tabs seguem o padrão WAI-ARIA de setas esquerda/direita (`navigation.js::initTabs`).
- Modal fecha com `Escape` e não deixa foco "vazar" por trás do overlay (`aria-modal="true"`).
- Accordion e Dropdown usam `aria-expanded`/`aria-controls`/`aria-haspopup` corretamente.

## Leitor de tela
- Ícones puramente decorativos (`aria-hidden="true"`) nunca carregam informação sozinhos —
  sempre acompanhados de texto visível ou `aria-label` no elemento interativo pai.
- `role="tooltip"` no glossário inline, acionado por hover E foco (não só mouse).
- `aria-live="polite"` nos resultados de busca, para leitura incremental sem interromper o usuário.
- `aria-current="page"` em links de navegação/sidebar/breadcrumb para indicar posição atual.

## Formulários (busca)
- `<label>` associado a todo `<input>` (usando `.visually-hidden` quando o rótulo visual é redundante
  com um ícone, mas nunca omitido do DOM).

## Pendências conhecidas para Etapa 2B
- Auditoria de contraste deve ser refeita com o conteúdo real (textos longos, tabelas densas).
- Testar com leitor de tela real (NVDA/VoiceOver) sobre páginas de documento completas.
