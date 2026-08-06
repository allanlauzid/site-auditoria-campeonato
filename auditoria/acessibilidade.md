# Auditoria RC1 — Fase 11: Acessibilidade

Escopo: 31 páginas publicadas (páginas de conteúdo + índices + 404 + busca) e 19 fragmentos de `components/` + 1 template.

Ferramentas: `html5validator` 0.4.2 (Python, usa `vnu.jar`/OpenJDK 11 real, instalado e executado com sucesso — **automatizado**) para semântica ARIA e uso de atributos; estrutura de headings/landmarks/labels/tabelas/links via **manual/estático (Python `html.parser`, script customizado)**; contraste calculado com fórmula WCAG de luminância relativa real (**manual/estático, Python**).

## 1. `lang` no `<html>`
**Automatizado (html5validator) + manual/estático.** Todas as 31 páginas publicadas têm `<html lang="pt-BR">`. Nenhum achado.

## 2. Landmarks (header/nav/main/footer)
**Manual/estático.** `<main>` presente em 100% das páginas de conteúdo (via inclusão de `templates/document-template.html`); um único `<main>` por página. `<header>`/`<footer>` vêm de `components/header.html` e `components/footer.html`. Nenhum achado.

## 3. Hierarquia de heading (exatamente 1 `<h1>`, sem saltos)
**Manual/estático — CORRIGIDO.**
- Achado (médio): 5 páginas-índice (`docs/fases/index.html`, `docs/glossario/index.html`, `docs/manuais/index.html`, `docs/projetos/index.html`, `docs/roadmaps/index.html`) pulavam de `<h1>` direto para `<h3 class="card__title">` nos cards, sem `<h2>` intermediário.
  **Corrigido**: os `<h3 class="card__title">` foram promovidos a `<h2 class="card__title">` (seletor CSS é por classe, não por tag — confirmado em `design-system.css:276`, alteração segura). 6+52+4+11+3 = 76 ocorrências corrigidas.
- Achado (médio): `index.html` pulava de `<h2 id="roadmap-title">` para `<h3>`... `<h4 class="timeline__title">` (salto h2→h4).
  **Corrigido**: os 3 `<h4 class="timeline__title">` foram rebaixados para `<h3 class="timeline__title">` (seletor CSS por classe, `design-system.css:465`, alteração segura).
- Todas as 31 páginas têm exatamente 1 `<h1>`. Após as correções, nenhuma página publicada apresenta salto de nível.

## 4. Skip links
**Manual/estático.** `.skip-link` definido em `design-system.css:494-495` com `:focus` que traz o link para a viewport. Presente via `components/header.html`/template em todas as páginas montadas. Recomendação (baixa): script de varredura não detecta o skip-link em arquivos de página isolados porque ele é injetado via include — comportamento esperado, não é defeito.

## 5. `:focus-visible` no CSS
**Manual/estático.** Presente e correto: `design-system.css:205` — `a:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible { ... }`. Nenhum achado.

## 6. `tabindex` mal usado
**Manual/estático.** Nenhum `tabindex` positivo (>0) encontrado em nenhuma página ou componente. Nenhum achado.

## 7. ARIA
**Automatizado (html5validator).**
- Achado real corrigido por análise cruzada: o validador aponta `header.html:31` (`aria-controls="primary-sidebar"`) como erro ("must point to an element in the same document") quando o fragmento é validado isoladamente. **Falso positivo do validador de fragmento** — `header.html` e `sidebar.html` são includes que compõem a mesma página final; confirmado por grep que `id="primary-sidebar"` existe em `sidebar.html:10` e que páginas montadas (ex. `docs/fases/fase1.html`) contêm ambos os arquivos concatenados (`primary-sidebar` aparece 2x). Não corrigido porque não é defeito — documentado para não repetir a leitura errada em auditorias futuras.
- `aria-expanded`/`aria-controls` em botões de menu, `aria-pressed` no toggle de tema, `aria-selected` em tabs, `aria-current="page"` em navegação — todos presentes e consistentes com os elementos alvo (checado por script Python cruzando todos os `id=` do portal).
- Nenhum atributo `aria-*` inválido ou redundante encontrado.

## 8. Labels em inputs de busca
**Manual/estático — revisão de achado.** Varredura inicial (parser sem suporte a `<label for>`) sinalizou 25 ocorrências de "input sem aria-label". Checagem manual do HTML real mostrou que todos os inputs de busca (`modal-search-input`, `global-search-input`, `page-search-input`) têm `<label for="..." class="visually-hidden">Buscar na documentação</label>` associado corretamente. **Falso positivo do parser, não é defeito.**

## 9. Links com texto acessível
**Manual/estático.** Nenhum link com texto isolado do tipo "clique aqui"/"saiba mais"/"veja mais" encontrado nas 31 páginas + componentes.

## 10. Contraste de cores (WCAG, luminância relativa real)
**Manual/estático — cálculo Python com a fórmula oficial WCAG (sRGB → luminância relativa → razão `(L1+0.05)/(L2+0.05)`).** Pares extraídos de `design-system.css` (tema claro `:root` e tema escuro `:root[data-theme="dark"]`):

| Par | Tema | Razão | AA texto normal (≥4.5) | AA texto grande/UI (≥3.0) |
|---|---|---|---|---|
| texto/fundo (carvão/osso-soft) | claro | 16.35:1 | PASS | PASS |
| **texto-muted/fundo (cinza-ferro/osso-soft)** | claro | **4.4957:1** | **FAIL (marginal)** | PASS |
| link/fundo (terracota-dark/osso-soft) | claro | 6.48:1 | PASS | PASS |
| accent-contrast/accent (branco/terracota botão) | claro | 5.06:1 | PASS | PASS |
| texto/bg-elevated (carvão/branco) | claro | 18.42:1 | PASS | PASS |
| warning/danger/success/info fg-bg | claro | 5.42–7.04:1 | PASS | PASS |
| texto/fundo (osso-soft/carvão) | escuro | 16.35:1 | PASS | PASS |
| texto-muted/fundo (A9ADAF/carvão) | escuro | 8.14:1 | PASS | PASS |
| link/fundo (E6926E/carvão) | escuro | 7.63:1 | PASS | PASS |
| accent-contrast/accent (carvão/D97A52) | escuro | 6.01:1 | PASS | PASS |
| warning/danger/success/info fg-bg | escuro | 5.99–8.09:1 | PASS | PASS |
| focus-ring (#1D6FB8) / fundo claro | claro | 4.64:1 | — (indicador não-textual, ok) | — |
| focus-ring (#1D6FB8) / fundo escuro | escuro | 3.52:1 | — | — |

**Achado (médio) CORRIGIDO**: `--color-cinza-ferro` (`--color-text-muted` no tema claro) tinha razão 4.4957:1 contra o fundo `--color-osso-soft`, abaixo do mínimo AA de 4.5:1 para texto normal (é usada inclusive em `small { font-size: 12px }`, texto pequeno, não qualifica como "grande"). **Corrigido**: `#6B6F73` → `#63676B` em `assets/css/design-system.css:40`, nova razão = 5.06:1 (verificado por recálculo Python), mudança visualmente imperceptível.

## 11. `prefers-reduced-motion`
**Manual/estático.** Presente e correto: `design-system.css:14-17`, zera `animation-duration`/`transition-duration` e desativa `scroll-behavior: smooth`. Nenhum achado.

## 12. Tabelas `<th>`/`scope`
**Manual/estático — CORRIGIDO.** Achado (baixo): 14 arquivos com `<th>` sem atributo `scope`. Confirmado por inspeção que 100% dos `<th>` do portal estão em `<thead>` (cabeçalhos de coluna, nenhum em `<tbody>` como cabeçalho de linha) — `scope="col"` é correto para todos. **Corrigido**: script Python adicionou `scope="col"` a todos os `<th>` sem esse atributo nos 14 arquivos: `docs/arquitetura/engenharia-documentacao.html`, `docs/fases/fase1.html`, `docs/fases/fase2.html`, `docs/fases/fase6.html`, `docs/manuais/manual-dashboard.html`, `docs/manuais/manual-stories.html`, `docs/projetos/projeto02.html`, `docs/projetos/projeto03.html`, `docs/projetos/projeto04.html`, `docs/projetos/projeto05.html`, `docs/projetos/projeto06.html`, `docs/projetos/projeto09.html`, `docs/projetos/projeto10.html`, `docs/projetos/projeto11.html`.

## Resumo por severidade
- Crítico: 0
- Alto: 0
- Médio: 3 achados (heading skip ×2 padrões, contraste text-muted) — **todos corrigidos**
- Baixo: 1 achado (th sem scope, 14 arquivos) — **corrigido**
- Recomendação: 2 (falsos positivos documentados: aria-controls cross-file, label-for não capturado pelo parser inicial)

## Pendência formal
Nenhum teste com leitor de tela real (NVDA/VoiceOver/JAWS) ou navegador gráfico foi possível neste ambiente (sem GUI/AT instalados). Recomenda-se validação manual com leitor de tela antes da publicação pública, especialmente do modal de busca (foco preso/`Escape`) e do menu mobile.
