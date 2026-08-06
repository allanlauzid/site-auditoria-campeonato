# Fase 9 — Limpeza Editorial RC1

**Gerado em:** 2026-08-05
**Escopo:** páginas de conteúdo público (`docs/**`, `index.html`, `search/index.html`, `404.html`) e arquivos de dados públicos (`data/*.json`), **excluindo** `/auditoria` e `/relatorios` (documentação legítima do processo, não tocada).

## 1. Resíduos encontrados e corrigidos

| # | Arquivo | Resíduo encontrado | Correção aplicada |
|---|---|---|---|
| 1 | `docs/manuais/manual-crm.html` (linha 76) | Callout público "Cadeia conceitual do **Lote 3** (Captura → Relacionamento → Inteligência → Comunicação pública)" | "Cadeia conceitual do **ecossistema de dados** (...)" |
| 2 | `docs/manuais/manual-dashboard.html` (linha 76) | Idem | Idem |
| 3 | `docs/manuais/manual-formulario.html` (linha 76) | Idem | Idem |
| 4 | `docs/manuais/manual-stories.html` (linha 76) | Idem | Idem |
| 5 | `docs/manuais/manual-formulario.html` (doc-nav, linha 268) | Título de navegação expondo rótulo interno de lote: "Projeto 11 — Sistema de Inteligência Pré-Inscrição **(fim do Lote 2)**" | Removido o sufixo "(fim do Lote 2)" |
| 6 | `docs/projetos/projeto11.html` (doc-nav, linha 400) | "Manual — Formulário de Manifestação de Interesse **(Lote 3)**" | Removido o sufixo "(Lote 3)" |
| 7 | `docs/manuais/manual-stories.html` (doc-nav, linha 322) | "Roadmaps consolidados (índice de Auxiliares **previsto no Lote 4 — ainda não produzido**)" — desatualizado: a página `docs/roadmaps/index.html` já existe e está publicada (o `href` já apontava corretamente para ela) | Simplificado para "Roadmaps consolidados" |
| 8 | `docs/projetos/projeto11.html` (linha 377) | "Status atualizado no **Lote 3** (Manuais Operacionais): 4 dos 8 itens..." | "Status atual: 4 dos 8 itens..." (contagem verificada como correta — 4 badges "Publicado" confirmados no mesmo bloco) |
| 9 | `data/roadmaps.json` (4 ocorrências, linhas 424/430/436/460) | `"status": "produzido — publicado no Lote 3 (Manuais Operacionais)"` | `"status": "produzido — publicado no portal"` |
| 10 | `docs/roadmaps/index.html` (linhas 34–35) | Texto literal **"Placeholder estrutural."** visível ao usuário em 2 cards do índice de roadmaps | Substituído por descrição factual não inventada, baseada no próprio título do card: "Roadmap de manuais operacionais ainda não produzidos, listados no Capítulo 20 do Projeto 07/09" |
| 11 | `docs/glossario/index.html` (3 ocorrências) | "Placeholder estrutural — definição completa entra na **Etapa 2B**." (etapa já concluída — texto desatualizado e confuso ao leitor) | "Definição completa pendente de publicação nesta página-índice." |
| 12 | `404.html` (linhas 24–26) | Texto afirmando que "nesta etapa, apenas a infraestrutura do portal existe — o conteúdo dos 21 documentos é migrado na Etapa 2B" — **falso** no estado atual (RC1, conteúdo publicado) | Reescrito para mensagem de erro 404 genérica e evergreen, sem referência a etapas internas |
| 13 | `search/index.html` (linhas 24–28) | "Nesta etapa o índice contém apenas entradas de exemplo — a busca é funcional, mas o conteúdo pesquisável real só existe a partir da Etapa 2B." — **falso**: `search-index.json` já tem 389 entradas reais (verificado na Fase 5) | Reescrito afirmando corretamente que o índice contém as entradas reais dos 21 documentos + página de controle |
| 14 | `data/documents.json` (`_comment`) | "Etapa 2A: apenas metadados de exemplo/estrutura — nenhum conteúdo real dos .md foi migrado" — **falso**: os 22 registros (`documents[]`) já têm `url` real apontando para `/docs/**` | Comentário atualizado para refletir migração integral (RC1) |
| 15 | `data/search-index.json` (`_comment`) | "Etapa 2A entrega o schema e **2 entradas de exemplo (dados fictícios)**... Etapa 2B irá gerar este arquivo" — **falso**: arquivo já tem 389 entradas reais, validadas na Fase 5 (0 URLs/âncoras quebradas) | Comentário atualizado, refletindo as 389 entradas reais |
| 16 | `data/glossario.json` (`_comment`) | "Etapa 2A cria apenas o schema e **3 entradas de exemplo** — Etapa 2B populará os 46 termos reais" — desatualizado: arquivo já tem **26** termos reais (nem 3, nem 46) | Comentário corrigido para o número real (26/46), registrando que a população completa é trabalho em andamento (Etapa 3.4 desta auditoria, fora do escopo desta Fase 9) |
| 17 | `components/search-results.html` (via Fase 5) | Âncora `#sistema-simbolico` incorreta | Já corrigida na Fase 5 (ver `links-rotas-ancoras.md`) — não duplicada aqui |

**Total de arquivos corrigidos nesta fase: 12** (`docs/manuais/manual-crm.html`, `manual-dashboard.html`, `manual-formulario.html`, `manual-stories.html`, `docs/projetos/projeto11.html`, `docs/roadmaps/index.html`, `docs/glossario/index.html`, `404.html`, `search/index.html`, `data/roadmaps.json`, `data/documents.json`, `data/search-index.json`, `data/glossario.json` — 13 arquivos ao todo).

## 2. O que foi encontrado e **mantido** (com justificativa)

| Item | Local | Justificativa para manter |
|---|---|---|
| Comentário HTML `<!-- Etapa 2A — estrutura vazia com placeholders {{ }}. Etapa 2B substitui... -->` | Presente em todas as 22 páginas de documento + `templates/document-template.html` (topo do `<head>`) | É um **comentário HTML invisível ao usuário final** (`<!-- ... -->`), documentando para desenvolvedores como o template de geração funciona. Não é conteúdo editorial público; removê-lo não traz benefício e apagaria contexto útil de manutenção. |
| "Etapa 2B — Publicação de Conteúdo" / "Etapa 2B — esta etapa `Publicado`" / "Etapa 2B — Release Candidate RC1" | `index.html` (eyebrow, timeline, footer) | Não é um resíduo — é a linha do tempo do projeto documental, **corretamente marcada como concluída** ("esta etapa `Publicado`"), consistente com a realidade (21 documentos + página de controle publicados). Remover destruiria informação factual e correta de changelog público. |
| Placeholders `{{URL_DOC_ANTERIOR}}`, `{{URL_DOC_PROXIMO}}`, `{{URL_CANONICA}}` | `templates/document-template.html` | Arquivo de template de geração, não publicado nem listado em `navigation.json`/`sitemap.xml`. Placeholders são substituídos em tempo de geração de cada página real — comportamento correto de um template. |
| Badges `<span class="badge badge--neutral">Documento previsto — ainda não produzido</span>` (59 ocorrências, ver Fase 6) | Diversas páginas de Fases/Projetos | Uso correto e intencional: sinaliza claramente ao leitor que um documento futuro (ex.: "Manual do Cerimonial") ainda não existe. Exatamente o padrão que a auditoria deveria preservar. |
| `data/documents.json` categoria/status individuais de cada documento (`"status": "finalizado..."` etc.) | `data/documents.json` | Refletem estado real e específico de cada um dos 22 documentos, não são resíduos genéricos de lote. |
| Ocorrências de "Lote N" dentro de `/auditoria/` e `/relatorios/` | Todos os relatórios de auditoria já existentes (manifesto, inventário, integridade documental) | Documentação legítima do processo de produção do portal — parte do registro histórico de auditoria, fora do escopo de "limpeza" desta fase, conforme instrução explícita. |
| Atributos `placeholder="Buscar documentos, termos, capítulos..."` em campos `<input>` | `index.html`, `search/index.html`, todas as páginas com modal de busca | Uso técnico correto do atributo HTML `placeholder` (texto de dica dentro do campo de busca) — não é um resíduo editorial, é comportamento de UI padrão e esperado. |
| Domínio fictício `exemplo.invalido` remanescente em `auditoria/links-rotas-ancoras.{md,json}` | `/auditoria/` | Registro do achado da Fase 5/8 como evidência de auditoria — tratado em detalhe no relatório da Fase 8 (`validacao-sitemap.md`), mantido intencionalmente fora do escopo de "arquivo ativo do portal". |

## 3. Verificação pós-limpeza

- Nova varredura recursiva por `Lote 0/1/2/3/4` em páginas de conteúdo público: **0 ocorrências remanescentes** fora dos comentários HTML invisíveis e do changelog legítimo do `index.html`.
- Nova varredura por `placeholder`/`TODO`/`pendente`/`dados fictícios` em conteúdo público: **0 ocorrências problemáticas remanescentes** (restam apenas usos técnicos corretos do atributo HTML `placeholder`).
- Regeneração completa da varredura de links (Fase 5) sobre o portal pós-limpeza: **618 links verificados, 0 quebras reais** (as 26 sinalizações são todas placeholders `{{baseUrl}}`/`{{URL_...}}` esperados em canonical/og:url/JSON-LD e no template, mesmo padrão já documentado nas Fases 5 e 8), **0 âncoras quebradas**, **0 páginas de conteúdo órfãs**.
- `sitemap.xml` permanece válido (`xml.etree.ElementTree`, 30 URLs).

## 4. Itens fora do escopo desta fase (registrados para acompanhamento)

- **Glossário incompleto (26/46 termos):** achado real, mas sua população integral pertence à Etapa 3.4 (tarefa dedicada de Glossário), não a esta Fase 9 de limpeza editorial. O comentário do arquivo foi corrigido para refletir o número real e sinalizar o trabalho pendente, sem inventar os 20 termos faltantes.
- **253 menções ambíguas de referências cruzadas** (Fase 6) seguem sem link, aguardando eventual curadoria manual — não são "resíduo editorial" no sentido desta fase, e sim decisão de escopo já documentada em `referencias-cruzadas.md`.
