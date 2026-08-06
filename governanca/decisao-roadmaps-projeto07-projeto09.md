# Decisão de Governança Documental — Roadmaps sobrepostos Projeto 07 ↔ Projeto 09

**Status:** Decisão formal, Fase 10 do RC1 (Etapa 3.4 desta auditoria).
**Escopo:** Esta decisão organiza a interface do portal (dados de roadmap, agrupamento visual). **Não altera, funde, resume nem reorganiza nenhum dos 21 arquivos .md fonte** em `arquivos claude/`. Os roadmaps de Projeto 07 e Projeto 09 permanecem publicados integralmente e sem edição em suas páginas-fonte (`docs/projetos/projeto07.html`, `docs/projetos/projeto09.html`), exatamente como o achado original de auditoria (`relatorios/lote-2-projetos.md`, Seção "Roadmaps sobrepostos") já determinava.

## 1. Contexto

`relatorios/lote-2-projetos.md` (linha 69) já registrou, no RC1 original, que os roadmaps de documentos futuros do Projeto 07 (16 itens, Capítulo 20) e do Projeto 09 (17 itens, Capítulo 20) se sobrepõem tematicamente, e que **nenhuma consolidação foi feita** naquele momento — as duas listas completas permaneceram publicadas integralmente, cada uma em sua própria página.

Extração exata (via `data/roadmaps.json`) dos itens em comum, comparando os títulos citados literalmente pelo relatório original com os títulos reais gravados no roadmap de cada projeto:

| Item sobreposto (nome canônico proposto) | Nome no roadmap do Projeto 07 | Nome no roadmap do Projeto 09 |
|---|---|---|
| Manual do Cerimonial | Manual do Cerimonial | Manual do Cerimonial |
| Manual de Hospitalidade | Manual de Hospitalidade | Manual de Hospitalidade |
| Manual do Staff | Manual do Staff | Manual do Staff |
| Manual do Voluntário | Manual do Voluntário | Manual do Voluntário |
| Manual de Credenciamento | Manual de Credenciamento | Manual de Credenciamento |
| Manual de Segurança | Manual de Segurança | Manual de Segurança |
| Manual de Arena | Manual de Arena | Manual da Arena |
| Manual da Arbitragem | Manual da Arbitragem | Manual da Coordenação Técnica / Arbitragem |
| Manual Operacional do Evento | Manual Operacional do Evento | Manual Operacional do Evento |

Nove itens no total, confirmando (e detalhando com nome exato de cada roadmap-fonte) o achado do relatório original, que já citava "pelo menos 9 itens" mas nomeava explicitamente 8 — o nono item (`Manual Operacional do Evento`) é adicionado nesta decisão por correspondência de título idêntico nos dois roadmaps, verificada por leitura estrutural de `data/roadmaps.json`.

## 2. Decisão

1. **Projeto 07 (Sistema de Experiência do Evento) é a fonte de princípios de EXPERIÊNCIA.** Qualquer manual futuro derivado deste roadmap deve tratar vivência, emoção, hospitalidade e jornada de públicos como sua camada de princípio dominante.
2. **Projeto 09 (Sistema Operacional do Evento) é a fonte de princípios de OPERAÇÃO.** Qualquer manual futuro derivado deste roadmap deve tratar logística, comando, fluxo e execução como sua camada de princípio dominante.
3. **Os 9 manuais sobrepostos identificados na Seção 1 são tratados, daqui em diante, como um manual único com dupla filiação** — ou seja, quando cada um desses 9 manuais futuros for produzido, ele nascerá como **um único documento**, e não como dois documentos concorrentes, pertencendo simultaneamente ao roadmap do Projeto 07 e ao roadmap do Projeto 09.
4. **Cada manual futuro sobreposto deve indicar explicitamente, em seu próprio texto (quando vier a ser escrito), os princípios herdados de ambos os Projetos** (07 — Experiência; 09 — Operação), reconhecendo a dupla origem em vez de escolher artificialmente apenas uma.
5. **Os roadmaps de cada Projeto permanecem preservados integralmente nos seus documentos-fonte .md.** Esta decisão de governança é uma camada de *interface do portal* (agrupamento de dados/visualização), não uma edição de conteúdo-fonte. `Projeto07_Sistema_Experiencia_Evento_Kettlebell.md` e `Projeto09_Sistema_Operacional_Evento_Kettlebell.md` continuam, cada um, com sua lista completa e original de 16 e 17 itens, sem qualquer alteração.
6. **A interface do portal deve agrupar os 9 itens equivalentes por uma identidade canônica** (um `idCanonico` por manual sobreposto), **sem apagar a origem/filiação de cada roadmap** — a página do portal deve continuar mostrando que o item aparece no roadmap do Projeto 07 *e* no roadmap do Projeto 09, com seus nomes e descrições originais preservados lado a lado.

## 3. Consequência nos dados do portal

`data/roadmaps.json` foi editado (preservando o schema JSON pré-existente) para que, nos 9 itens identificados, cada ocorrência (no roadmap do Projeto 07 e no roadmap do Projeto 09) receba:

- `idCanonico`: identificador único compartilhado pelas duas ocorrências (ex.: `manual-cerimonial-canonico`).
- `aliases`: os dois nomes de título usados nos dois documentos-fonte (quando diferem, ex.: "Manual de Arena" / "Manual da Arena").
- `documentosOrigem`: `["projeto07", "projeto09"]`.
- `status`: mantido `"não produzido"` (nenhum dos 9 manuais foi escrito).
- `dependencias`: lista dos dois Projetos de origem (`projeto07`, `projeto09`), refletindo que o manual futuro herdará princípios de ambos.
- `documento_unico`: `true`.

Nenhum outro item dos roadmaps (os não sobrepostos) foi alterado.

## 4. Não-ação explícita

Esta decisão **não** apaga, resume, renomeia ou reordena os 21 arquivos .md fonte. **Não** cria os 9 manuais futuros (eles continuam "não produzidos"). **Não** decide qual dos dois roadmaps "vence" — declara explicitamente que nenhum vence, e que o item pertence aos dois por natureza dupla (experiência + operação).
