# Release Candidate — RC1

**Este portal está marcado como RELEASE CANDIDATE — RC1. Não é "versão 1.0 final".**

Data: 2026-08-05
Escopo desta marcação: Etapa 2B — publicação de conteúdo (Lotes 0, 1, 2, 3 e 4), sobre a infraestrutura definitiva já publicada na Etapa 2A.

---

## 1. Escopo publicado

- **21 documentos oficiais** do corpus constitucional: 6 Fases (`docs/fases/fase1.html`…`fase6.html`), 11 Projetos (`docs/projetos/projeto01.html`…`projeto11.html`), 4 Manuais (`docs/manuais/manual-crm.html`, `manual-dashboard.html`, `manual-formulario.html`, `manual-stories.html`).
- **1 página de controle/governança documental**: `docs/arquitetura/engenharia-documentacao.html` (conteúdo integral do relatório de Engenharia da Documentação, Etapa 1).
- **6 páginas de índice de categoria**: Fases, Projetos, Manuais, Glossário, Roadmaps, Mapa Constitucional.
- **Busca client-side** indexada com 441 entradas reais (`data/search-index.json`) — 389 originais + 52 entradas de termos do glossário adicionadas na Etapa 3.4.
- **Glossário completo**: 46 de 46 termos oficiais da Etapa 8 mapeados, mais 6 termos complementares do corpus (52 entradas totais em `data/glossario.json`) — ver `auditoria/glossario-46-termos.md`.
- **Roadmaps de documentos futuros**: 7 blocos indexados (`data/roadmaps.json`), cobrindo os capítulos de roadmap presentes nos Projetos 07, 08, 09, 10, 11 e nos Manuais CRM e Dashboard.

Detalhamento completo, com números, em `portal/relatorios/relatorio-publicacao-etapa-2b.md`.

## 2. Limitações conhecidas

- ~~**Glossário incompleto**: 26/46 termos publicados.~~ **Resolvido** — os 46 termos oficiais da Etapa 8 foram completados (ver `auditoria/glossario-46-termos.md`), com definição, documento de origem e relacionados fiéis à especificação `export1/Engenharia_Documentacao_Etapa1.md`. 6 entradas complementares pré-existentes (não numeradas na Etapa 8) foram mantidas e sinalizadas como tal.
- **`sitemap.xml` não gerado**: pendente desde o Lote 0, ainda não automatizado a partir de `documents.json`.
- **Contagem exata de badges "Documento previsto — ainda não produzido"** não foi automatizada por grep consolidado (limitação de método declarada no relatório de publicação).
- **1 entrada de exemplo residual** em `data/search-index.json` (`exemplo-glossario-governanca-marca`), herdada da Etapa 2A, nunca removida.
- **Referências cruzadas nominais em prosa** (ex.: "Fase 3, Capítulo 17") permanecem como texto simples, não como links de âncora reais entre capítulos — decisão consciente, dependente de todos os documentos-alvo existirem primeiro (agora existem; a conversão em si ainda não foi feita).
- **Validação de JSON** foi feita por leitura estrutural manual (sem parser real disponível neste ambiente de execução), não por execução de `JSON.parse`/`json.load`.

## 3. Pendências explícitas (não resolvidas nesta etapa, por decisão consciente)

### 3.1 Sobreposição de roadmap — Projeto 07 ↔ Projeto 09
Os roadmaps de documentos futuros do **Projeto 07** (Cap. 20, 16 itens) e do **Projeto 09** (Cap. 20, 17 itens) se sobrepõem em pelo menos 9 itens (Manual do Cerimonial, Manual de Hospitalidade, Manual do Staff, Manual do Voluntário, Manual de Credenciamento, Manual de Segurança, Manual da Arena, Manual da Coordenação Técnica/Arbitragem, entre outros grafados de forma equivalente mas não idêntica nos dois textos-fonte). **Não consolidada** — as duas listas completas permanecem publicadas integralmente, cada uma em sua própria página, com badge de aviso visível (`callout--warning`) em ambas, citando a fonte (Engenharia da Documentação, Etapa 6.9). Fonte: `portal/relatorios/lote-2-projetos.md`, Seção 5.

### 3.2 Circularidade — Projeto 10 ↔ Projeto 11
`Projeto 10 — Sistema de Lançamento e Mobilização` e `Projeto 11 — Sistema de Inteligência Pré-Inscrição` dependem mutuamente um do outro (`dependeDe` de cada um lista o outro). Representada visualmente como `callout--warning` em ambas as páginas ("Relação complementar bidirecional"), com link para a Engenharia da Documentação. **Não resolvida estruturalmente** — os dois links de dependência permanecem visíveis em ambas as páginas, a circularidade não foi "corrigida" ou escondida. Fonte: `portal/relatorios/lote-2-projetos.md`, Seção 4.

### 3.3 `Portal_Etapa2A_Infraestrutura.md` — ausência deliberada como conteúdo público
Este documento (decisões de arquitetura técnica do próprio portal) **não está e não deve estar** publicado como página navegável do portal nesta etapa. Permanece em `export1/Portal_Etapa2A_Infraestrutura.md`, fora da árvore pública. Decisão herdada do Lote 0 e reconfirmada no Lote 4 (`portal/relatorios/lote-4-auxiliares.md`, Seção 2).

### 3.4 Roadmaps de manuais futuros ainda não produzidos
Da lista de manuais futuros mapeados nos roadmaps do Projeto 07 (16), Projeto 08 (16), Projeto 09 (17), Projeto 10 (15) e dos Roadmaps de Documentos Derivados do Manual CRM (8) e Manual Dashboard (8), apenas os itens correspondentes aos 4 Manuais já publicados (Formulário, CRM, Dashboard, Stories) foram marcados como produzidos em `roadmaps.json`. **Todos os demais itens permanecem "não produzido"**, sem `docId`, e exibem o badge `Documento previsto — ainda não produzido` nas páginas onde aparecem.

### 3.5 Links não resolvidos / páginas incompletas
Nenhum link `<a href>` com destino a arquivo `.html` inexistente foi encontrado na amostragem de 176 links internos auditados (ver relatório de publicação, Seção 7). Nenhuma página incompleta (conteúdo cortado) foi identificada nas amostras lidas. Isso é declarado como resultado de amostragem, não de varredura 100% exaustiva de todo o portal.

## 4. Riscos

| Risco | Descrição | Mitigação atual |
|---|---|---|
| Glossário parcial pode gerar expectativa de busca não atendida | Um termo do vocabulário oficial pode não aparecer no Glossário nem na busca | Documentado explicitamente como pendência (item 2) |
| Ausência de `sitemap.xml` | Motores de busca/crawlers podem não descobrir todas as páginas automaticamente | Navegação interna (sidebar/footer) cobre 100% das páginas publicadas, mitigando o impacto prático |
| Validação de JSON não é prova formal | Um erro sutil de sintaxe em `data/*.json` poderia não ter sido detectado pela leitura manual | Recomendado parser real na Etapa 3 (ver relatório de publicação, Seção 11) |
| Rótulo de processo interno ("Lote 3") em texto público (Manuais) | Pequeno vazamento de linguagem de bastidor de publicação para o leitor final | Registrado como achado D1 da auditoria interna, correção proposta para Etapa 3 |

## 5. Instruções para auditoria da Etapa 3

1. Executar validação de JSON com parser real (Node.js `JSON.parse` ou Python `json.load`) sobre os 5 arquivos de `portal/data/`.
2. Gerar e validar `sitemap.xml` a partir de `documents.json` (22 URLs de conteúdo + 6 de índice, no mínimo).
3. Rodar verificação automatizada e exaustiva de links internos (não amostral) e de `id` duplicado em todas as 22 páginas de conteúdo + 6 de índice.
4. Revisar e decidir formalmente a resolução (ou não) da sobreposição Projeto07↔Projeto09 e da circularidade Projeto10↔Projeto11 — este RC1 apenas as torna visíveis, não as resolve.
5. Completar o Glossário (26 → 46 termos).
6. Decidir sobre a remoção/reescrita do rótulo "Lote N" em conteúdo público dos Manuais (achado D1).
7. Revisar a entrada de exemplo residual em `search-index.json` (achado D2).

## 6. Critérios objetivos para promoção a versão 1.0

A promoção de RC1 para uma versão declarada "1.0" deve exigir, no mínimo:
1. Todos os itens da Seção 5 (auditoria da Etapa 3) concluídos e documentados.
2. Glossário 46/46 termos publicados.
3. `sitemap.xml` gerado e validado.
4. Validação de JSON por parser real, com relatório de execução anexado (não mais leitura manual).
5. Verificação exaustiva (100%, não amostral) de links internos e ids duplicados em todas as páginas do portal, com relatório de zero ocorrências ou lista de correções aplicadas.
6. Decisão formal e documentada (não apenas sinalização visual) sobre a sobreposição Projeto07↔Projeto09 e a circularidade Projeto10↔Projeto11.
7. Aprovação explícita de uma auditoria independente da Etapa 3 (fora do próprio agente de publicação), revisando os achados D1–D6 deste RC1.

Até que os critérios acima sejam cumpridos e formalmente aprovados, o portal permanece classificado como **Release Candidate RC1**.
