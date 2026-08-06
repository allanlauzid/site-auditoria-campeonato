# Fase 6 — Auditoria de Referências Cruzadas

**Gerado em:** 2026-08-05
**Metodologia:** Varredura de prosa (tags `<p>`, `<li>`, `<td>`, `<blockquote>`, excluindo `<nav>`, `.breadcrumb`, `.doc-nav` e texto já dentro de `<a>`) nas 29 páginas de conteúdo, casando os padrões "Fase N, Capítulo X", "Projeto NN, Capítulo X" e "Manual do/de X". Cada menção foi cruzada com o índice real de capítulos (heading `id` com prefixo numérico do capítulo) extraído de todos os 21 documentos + `engenharia-documentacao.html`.

## 1. Números gerais

| Métrica | Valor |
|---|---|
| Menções totais classificadas | 509 |
| Classificadas como **exata** (documento e capítulo/manual identificados sem ambiguidade) | 197 |
| — das quais, autorreferência (doc menciona a si mesmo — não convertida) | 2 |
| — elegíveis para conversão em link | 195 |
| **Links efetivamente inseridos no HTML** | 188 |
| Elegíveis não aplicadas mecanicamente (frase cruza fronteira de tag inline como `<strong>`, script conservador não quebrou formatação) | 7 |
| Classificadas como **ambígua** (não linkadas) | 253 |
| Classificadas como **documento futuro** (badge "Documento previsto — ainda não produzido" mantido) | 59 |
| Classificadas como **não resolvida** | 0 |

## 2. Critério de classificação

- **Exata:** o padrão "Fase N, Capítulo X" ou "Projeto NN, Capítulo X" resolve a exatamente um documento real e a exatamente um heading (H2/H3) com `id` cujo prefixo numérico bate com X; ou o padrão "Manual do/de X" resolve a exatamente um dos 4 manuais publicados (CRM, Dashboard, Formulário, Stories).
- **Documento futuro:** a menção "Manual do/de X" ocorre dentro de contexto que já traz o badge `<span class="badge badge--neutral">Documento previsto — ainda não produzido</span>` ou `<em>(Documento previsto — ainda não produzido)</em>` — ex.: "Manual do Cerimonial", "Manual do Staff", "Manual do Voluntário", "Manual de Credenciamento", "Manual de Hospitalidade". Esses badges já existiam no conteúdo (auditados, não criados nesta fase) e foram **mantidos exatamente como estão**, sem tentativa de linkagem.
- **Ambígua:** menções a substantivos genéricos que combinaram parcialmente com o padrão "Manual do/de X" mas sem resolução única e seguro (ex.: "Manual de Governança", "Manual de Segurança", "Manual de Relacionamento", "Manual de Sistema") — não correspondem a nenhum dos 4 manuais reais nem têm badge de documento futuro explícito no trecho capturado. **Não foram linkadas**, por exigência das regras da fase (evitar linkagem especulativa).
- **Não resolvida:** nenhuma ocorrência restou nessa categoria após classificação — todo padrão "Fase N/Projeto NN, Capítulo X" capturado ou apontou para capítulo real (exata) ou para documento/capítulo inexistente, sendo então reclassificado como ambígua/documento futuro conforme o caso.

## 3. Conversões aplicadas

A conversão foi feita **preservando integralmente o texto visível** — cada ocorrência elegível foi envolvida em `<a href="/caminho/documento.html#id-capitulo">` via manipulação da árvore DOM (não regex bruto sobre HTML), garantindo que apenas nós de texto puro fora de links existentes fossem alterados.

**188 links inseridos**, distribuídos em 15 arquivos:

| Arquivo | Links inseridos |
|---|---|
| `docs/manuais/manual-formulario.html` | 26 |
| `docs/projetos/projeto06.html` | 30 |
| `docs/manuais/manual-crm.html` | 20 |
| `docs/manuais/manual-stories.html` | 18 |
| `docs/projetos/projeto11.html` | 18 |
| `docs/projetos/projeto07.html` | 13 |
| `docs/projetos/projeto09.html` | 12 |
| `docs/projetos/projeto10.html` | 11 |
| `docs/manuais/manual-dashboard.html` | 10 |
| `docs/projetos/projeto05.html` | 10 |
| `docs/arquitetura/engenharia-documentacao.html` | 9 |
| `docs/projetos/projeto04.html` | 8 |
| `docs/fases/fase6.html` | 1 |
| `docs/projetos/projeto02.html` | 1 |
| `docs/projetos/projeto08.html` | 1 |

Exemplo real (arquivo `docs/manuais/manual-crm.html`):
```
Antes:  ...mesmo princípio já constitucional desde o Projeto 08, Capítulo 2)...
Depois: ...mesmo princípio já constitucional desde o
        <a href="/docs/projetos/projeto08.html#2-arquitetura-da-memoria">Projeto 08, Capítulo 2</a>)...
```

Após a inserção, a Fase 5 (links/âncoras) foi **reexecutada por completo** sobre o portal atualizado: total de links verificados subiu de 430 para 618 (os 188 novos), com **0 âncoras quebradas** e os mesmos 3 falsos positivos de template (`{{URL_...}}`) — nenhuma regressão introduzida.

## 4. O que foi mantido sem alteração

- **59 menções a manuais futuros** ("Manual do Cerimonial", "Manual do Staff", "Manual do Voluntário", "Manual de Credenciamento", "Manual de Hospitalidade" etc.) permanecem em texto simples com o badge "Documento previsto — ainda não produzido" já existente — comportamento correto, pois não há página real para apontar.
- **253 menções ambíguas** (ex.: "Manual de Segurança", "Manual de Governança", "Manual de Sistema") permanecem sem link — evita apontar para um alvo incerto. Ficam registradas em `data/cross-references.json` para eventual curadoria manual futura (fora do escopo desta auditoria automatizada).
- **2 autorreferências** ("Manual do CRM" mencionado dentro do próprio `manual-crm.html", "Manual do Formulário" dentro do próprio `manual-formulario.html`) não foram convertidas em link — linkar uma página para si mesma não agrega valor de navegação.

## 5. Artefato gerado

`data/cross-references.json` contém todos os 509 itens com: texto encontrado, documento e página de origem, documento e âncora alvo (quando resolvido), nível de confiança e status de conversão — servindo de trilha de auditoria completa e insumo para qualquer curadoria manual futura das menções ambíguas.
