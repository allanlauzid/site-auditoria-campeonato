# Relatório do Lote 0 — Documentos de Arquitetura e Controle

**Data:** 2026-08-05
**Escopo:** publicar, dentro da infraestrutura já pronta do portal (Etapa 2A), a documentação de governança da própria biblioteca documental — o relatório `Engenharia_Documentacao_Etapa1.md` — como página de "documentação de controle", distinta da Constituição do campeonato (Fases/Projetos/Manuais).

---

## 1. Decisão sobre `Portal_Etapa2A_Infraestrutura.md`

**Decisão: NÃO publicar como documento de controle no portal nesta etapa. Fica como registro de decisão de arquitetura fora do portal (em `export1/`).**

Justificativa:
- `Portal_Etapa2A_Infraestrutura.md` é um relatório de **decisões de implementação técnica** (estrutura de pastas, justificativa de stack, o que a Etapa 2A fez/não fez) — seu público é quem constrói o portal, não quem o consome como documentação do campeonato.
- `Engenharia_Documentacao_Etapa1.md`, ao contrário, é **conteúdo de governança documental do próprio corpus de 21 documentos** (inventário, dependências, glossário, auditoria) — tem valor de leitura contínua para qualquer pessoa navegando o portal (novo integrante, diretoria, etc.), exatamente o público que o Lote 0 pretende atender.
- Publicar a Etapa 2A como página do portal criaria um documento "sobre o portal dentro do portal", que é informação de meta-infraestrutura, não de governança de conteúdo — arriscando confundir as duas naturezas que a tarefa pede para manter distintas.
- O próprio `README.md` do portal já referencia `export1/Portal_Etapa2A_Infraestrutura.md` como o relatório consolidado de arquitetura técnica, papel que ele já cumpre fora do portal.

Se um lote futuro decidir que decisões de arquitetura técnica também devem ser navegáveis publicamente (ex.: para onboarding de novos desenvolvedores do portal), recomenda-se criar uma página separada, ainda dentro da categoria "controle", mas não é o escopo deste Lote 0.

---

## 2. Arquivos processados / criados / modificados

### Criados
- `portal/docs/arquitetura/engenharia-documentacao.html` — página de conteúdo integral do relatório de Engenharia da Documentação (Etapa 1), construída a partir do `templates/document-template.html` oficial, sem alterações de template/CSS/JS.

### Modificados
- `portal/data/documents.json` — adicionada categoria `"controle"` (`{ "id": "controle", "label": "Controle/Governança Documental", "path": "docs/arquitetura" }`) ao array `categories` (schema já existente, apenas novo valor — nenhuma categoria "fase/projeto/manual" era semanticamente equivalente a documentação de governança/controle, então uma nova categoria foi criada seguindo exatamente o schema já usado, e não um schema novo). Adicionada entrada do documento em `documents`, primeiro item do array, `ordem: 0`, com todos os campos do schema existente preenchidos.
- `portal/data/navigation.json` — adicionado grupo `"Documentação de Controle"` em `sidebarGroups` (primeiro grupo, antes de "Fases") e uma coluna equivalente em `footerColumns`, ambos apontando para `/docs/arquitetura/engenharia-documentacao.html`. `topNav` não foi alterado (decisão: não adicionar item de topo para não redesenhar a navegação principal — o link real já existe na sidebar e no footer, que são os componentes de navegação previstos).
- `portal/data/search-index.json` — adicionadas 15 entradas (uma por capítulo `h2` real do documento: Ficha Técnica, Sumário, Etapas 1–11, Auditoria Rodada 1, Auditoria Rodada 2), seguindo exatamente o schema já usado pelas 2 entradas de exemplo (`id`, `docId`, `titulo`, `secaoTitulo`, `url` com âncora, `categoria`, `grupo`, `excerpt`, `tokens`, `peso`). Campo `generatedAt` atualizado de `null` para timestamp da geração.

### Não modificados (conforme regra da tarefa)
- `templates/document-template.html`, `assets/css/design-system.css`, `assets/js/navigation.js`, `assets/js/search.js`, todos os arquivos em `components/`, `index.html`, `sitemap.xml`, `README.md`, `Engenharia_Documentacao_Etapa1.md` (fonte, íntegra), `Portal_Etapa2A_Infraestrutura.md`.

---

## 3. Metodologia de conversão do conteúdo

Para garantir fidelidade 100% ao arquivo-fonte (nenhum resumo, nenhum corte), o corpo do `.md` foi convertido para HTML via **Pandoc** (conversão markdown→HTML5, sem edição manual de texto), preservando:
- Todos os 13 capítulos do Sumário original (Etapa 1 a Etapa 11 + Auditoria Rodada 1 + Auditoria Rodada 2), mais um capítulo adicional "0. Ficha Técnica e Escopo do Relatório" criado para preservar também o bloco de autoria/escopo/corpus que precede o Sumário no arquivo original (não descartado).
- As 21 entradas de inventário (Etapa 1), a tabela de classificação (Etapa 2), os mapas ASCII de arquitetura (Etapa 3), as 21 entradas de mapa de dependências (Etapa 4), as 6 sequências de leitura por público (Etapa 5), os 11 achados de auditoria (Etapa 6), os 10 índices (Etapa 9), a especificação funcional de 12 páginas do portal (Etapa 10), o relatório executivo de 10 itens (Etapa 11) e as duas rodadas de auditoria — tudo incluído sem resumir.
- Listas markdown → `<ul>`/`<ol>` HTML reais; tabelas markdown (Etapa 2 — classificação por grupos; Etapa 7.8 — status P1–P19) → `<table>` HTML reais (2 tabelas no total, correspondendo às 2 tabelas do `.md` fonte).
- Símbolos ✅/❌ preservados (11 ocorrências de ✅, 23 de ❌ no HTML final, correspondendo ao uso no `.md` fonte de status de lacunas).

Após a conversão, os `id` gerados automaticamente pelo Pandoc para cada heading foram **recalculados por script Python** para seguir o padrão determinístico exigido: normalização Unicode (remoção de acentos), minúsculas, slugify por hífen, deduplicação garantida (nenhum `id` duplicado no documento final). Exemplo: `## ETAPA 1 — INVENTÁRIO` → `id="etapa-1-inventario"`; `### 1. Fase1_Inteligencia_Estrategica_Benchmark_Campeonatos.md` → `id="1-fase1-inteligencia-estrategica-benchmark-campeonatos"`.

---

## 4. Metadados preenchidos no template

| Campo | Valor |
|---|---|
| Título | Engenharia da Documentação — Relatório de Arquitetura Documental |
| Categoria | Controle/Governança Documental |
| Versão | **Versão documental: não informada no arquivo-fonte** (texto literal exigido — nenhum dos 21 documentos nem este relatório porta número de versão explícito, conforme achado transversal do próprio arquivo-fonte, Etapa 1 e Etapa 6.11) |
| Status | Finalizado (documento de análise, não de implementação) — citação direta do fechamento do arquivo-fonte |
| Tempo de leitura | 68 min (13.636 palavras do corpo convertido / ~200 wpm, mesma metodologia usada pelos demais documentos em `documents.json`) |
| Nº de capítulos | 15 seções `h2` (0. Ficha Técnica + Sumário + Etapas 1–11 + Auditoria Rodada 1 + Auditoria Rodada 2), 95 subseções `h3` |
| Dependências | Nenhuma — documento de arquitetura raiz |
| Documentos relacionados | Todos os 21 documentos oficiais (é o inventário/mapa de dependências de referência para cada um) |
| Roadmaps associados | Mapa Constitucional (`docs/roadmaps/mapa-constitucional.html`) |
| Objetivo / Resumo | Preenchidos com texto derivado diretamente do bloco "Escopo" do arquivo-fonte, sem invenção de dado |

---

## 5. Checkpoint — resultado item a item

### ✅ Página acessível pelo menu (link real, não só no JSON)
**PASS.** Link adicionado em `portal/data/navigation.json`, `sidebarGroups[0]` = grupo "Documentação de Controle", primeiro grupo da sidebar (antes de "Fases"), e também em `footerColumns` (nova coluna "Documentação de Controle"). Como `navigation.js` renderiza sidebar/footer dinamicamente a partir desse JSON (`renderSidebar`, `renderFooterColumns`, linhas 63–92 de `assets/js/navigation.js`), o link aparece de fato na UI de toda página do portal que carrega esse script — não é um link inerte apenas no dado.
Evidência (trecho de `navigation.json`):
```json
{ "title": "Documentação de Controle", "items": [
  { "label": "Engenharia da Documentação (Etapa 1)", "url": "/docs/arquitetura/engenharia-documentacao.html" }
]}
```

### ✅ Sumário (TOC) correto, gerado a partir dos capítulos reais
**PASS.** O TOC não foi escrito manualmente — é gerado por `navigation.js::buildTOC()`, que varre `h2`/`h3` dentro de `.doc-content` (linha 123–144 do arquivo). Como os 15 `h2` e 95 `h3` do documento publicado são exatamente os capítulos/subcapítulos reais do `.md` fonte (Etapa 1 a 11, Auditoria Rodada 1/2, e as 21 entradas de inventário/dependência, os grupos do glossário etc.), o sumário reflete fielmente a estrutura original.

### ✅ Âncoras válidas — cada entrada do sumário aponta para um id existente
**PASS.** `buildTOC()` só atribui `href="#${h.id}"` a partir do próprio `id` já presente no heading (`if (!h.id) h.id = ...` — só gera id novo se não houver um). Como todos os 110 headings (`h2`+`h3`) do documento já têm `id` explícito (atribuído pelo script de slugify), não há divergência possível entre TOC e âncora. Verificação automatizada: `grep -o 'id="[^"]*"' | sort | uniq -d` no arquivo final não retornou nenhum `id` duplicado.

### ✅ Busca: search-index.json atualizado com conteúdo pesquisável
**PASS.** 15 novas entradas adicionadas a `portal/data/search-index.json` (uma por capítulo `h2`), cada uma com `url` apontando para a âncora real (`#etapa-1-inventario` etc.), `excerpt` extraído do texto real do capítulo (não placeholder) e `tokens` derivados do título+corpo real. Total de entradas no arquivo: 17 (2 de exemplo pré-existentes + 15 novas). `generatedAt` atualizado.

### ✅ Conteúdo integral: nada resumido ou cortado
**PASS**, com evidência quantitativa:
- Arquivo-fonte: 1011 linhas, corpo a partir de "Elaborado por" com ~13.600+ palavras de conteúdo textual (excluindo títulos/formatação).
- HTML publicado: 15 `h2`, 95 `h3`, 2 `<table>` (as 2 tabelas do fonte: Etapa 2 classificação e Etapa 7.8 status P1-P19), 13.636 palavras de texto visível no corpo convertido — todas as 21 entradas de inventário, todas as 21 de mapa de dependências, as 6 sequências de leitura, os 11 achados de auditoria (6.1–6.11), os 8 sub-roadmaps de lacunas (7.1–7.10), os 46 termos de glossário, os 10 índices (9.1–9.10), as 12 páginas + menus/filtros da Etapa 10, os 10 itens do Relatório Executivo e as duas rodadas de auditoria — todos presentes, nenhum substituído por resumo.
- Conversão feita via Pandoc (ferramenta determinística de transformação estrutural), não reescrita manual — elimina risco de perda de conteúdo por edição humana.

### ✅ Categorização distinta dos documentos constitucionais
**PASS.** Campo `categoria: "controle"` em `documents.json`, mapeado para o label `"Controle/Governança Documental"` — categoria nova e exclusiva, separada de `"fase"`, `"projeto"` e `"manual"` (as categorias da Constituição). Na UI, isso aparece: (a) no badge `<p class="card__eyebrow">{{CATEGORIA}}</p>` no topo do artigo, com o texto "Controle/Governança Documental"; (b) na sidebar, em grupo próprio "Documentação de Controle", fisicamente separado dos grupos "Fases", "Projetos" e "Manuais"; (c) no breadcrumb da própria página (`Início / Documentação de Controle / Engenharia da Documentação`).

### ✅ Nenhum conflito com a Home (`index.html`)
**PASS.** `portal/index.html` foi lido na íntegra (154 linhas): não contém links hardcoded para documentos individuais — toda navegação da Home é renderizada dinamicamente a partir de `navigation.json`/`documents.json` via `navigation.js`/scripts próprios da Home. Como a nova página só foi adicionada aos JSONs (mesma fonte de dado que a Home consome), não há link quebrado nem duplicidade introduzida na Home.

---

## 6. Correções técnicas mínimas realizadas (exceções documentadas)

**Nenhuma correção de template/CSS/JS foi necessária.** O template oficial (`templates/document-template.html`) suportou o conteúdo integral (incluindo as 2 tabelas HTML) sem qualquer ajuste — não houve necessidade de invocar a cláusula de exceção do item 6 das instruções. A única customização feita foi de **conteúdo/dado**, não de estrutura:
- Adição da categoria `"controle"` em `documents.json` (extensão de dado dentro do schema existente, prevista pelo próprio `MAINTAINABILITY.md` como forma correta de adicionar categoria nova).
- Preenchimento do link de breadcrumb específico da página no bloco `<script>` inline do template (mesmo padrão que o próprio template já sugere como comentário-exemplo a ser substituído por página — não é uma mudança de arquitetura, é o preenchimento normal de um placeholder previsto).

---

## 7. Pendências para os próximos lotes

1. **`sitemap.xml`** não foi atualizado — o próprio arquivo declara que deve ser gerado automaticamente a partir de `documents.json` "na Etapa 2B"; recomenda-se gerar esse arquivo de forma automatizada quando todos os lotes de conteúdo (0 a 4) estiverem publicados, e não incrementalmente a cada lote.
2. Avaliar, após a publicação dos 21 documentos operacionais (Lotes 1–3), se as referências cruzadas nominais identificadas no relatório fonte (ex.: "Projeto11, Capítulo 18") devem virar links reais para âncoras de capítulo dentro das páginas de cada documento — está especificado na Etapa 10.5 do próprio relatório publicado, mas depende dos documentos-alvo existirem primeiro.
3. Decidir formalmente (fora do escopo técnico deste lote) se `Portal_Etapa2A_Infraestrutura.md` deve, em algum lote futuro, ganhar uma página própria de "documentação de controle" para onboarding técnico de desenvolvedores do portal — ver justificativa da decisão na Seção 1 deste relatório.
4. O documento publicado referencia lacunas de ~85 documentos futuros ainda não escritos (Etapa 7) — nenhuma ação requerida agora, mas a página de "Lacunas/Roadmap Geral" prevista na Etapa 10.1 (item 9) do próprio relatório não existe ainda no portal; é candidata a página futura fora do escopo deste Lote 0.
