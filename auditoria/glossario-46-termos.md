# Glossário — Completude 46/46 (Etapa 8)

**Fase:** Etapa 3.4 do RC1 — auditoria de completude do glossário.
**Fonte oficial:** `export1/Engenharia_Documentacao_Etapa1.md`, seção "ETAPA 8 — GLOSSÁRIO" (linhas 743-793), que lista textualmente os 46 termos oficiais numerados de 1 a 46.
**Arquivo de dados alterado:** `portal-v1-auditoria/data/glossario.json`.
**Páginas/arquivos publicados alterados:** `portal-v1-auditoria/docs/glossario/index.html`, `portal-v1-auditoria/data/search-index.json`, `portal-v1-auditoria/index.html` (contagem já estava correta em "46 termos"), `portal-v1-auditoria/RELEASE-CANDIDATE.md`.

## 1. Estado anterior

`data/glossario.json` continha 26 entradas, das quais 3 traziam definição prefixada por `[placeholder]` (sistema-simbolico, governanca-de-marca, sistemas-permanentes). Comparando os 26 termos existentes com a lista numerada da Etapa 8, constatou-se que:

- **20** dos 26 termos existentes correspondem diretamente a um dos 46 termos oficiais da Etapa 8 (mesmo conceito, nomenclatura já alinhada ou muito próxima).
- **6** dos 26 termos existentes (`jornada-do-interessado`, `coleta-progressiva`, `fonte-unica-de-dados`, `pessoa-entidade-central`, `catalogo-de-kpis`, `honestidade-estatistica`) são conceitos reais e citáveis no corpus (Projeto11, Manual_CRM, Manual_Dashboard, Manual_Stories), mas **não constam como um dos 46 itens numerados da lista oficial da Etapa 8**. Por instrução explícita da tarefa ("não apague os 26 termos existentes desnecessariamente"), essas 6 entradas foram mantidas no arquivo, mas identificadas separadamente como **complementares** (não contam para o total oficial de 46).

## 2. Trabalho realizado

1. Removido o prefixo `[placeholder]` das 3 definições incompletas, substituindo-as pelo texto fiel da Etapa 8 / Fase 3 / Fase 5.
2. Adicionados **26 novos termos** ao `glossario.json`, completando os 46 termos oficiais da Etapa 8. Cada novo termo usa exatamente a definição (ou paráfrase mínima fiel) do texto da Etapa 8, o `documentoOrigem` (1ª aparição) conforme indicado no próprio texto da Etapa 8, e `documentosRelacionados` extraídos da mesma fonte.
3. Resultado: **52 entradas totais** em `glossario.json` — 46 oficiais (Etapa 8) + 6 complementares pré-existentes.
4. Publicada a lista completa em `docs/glossario/index.html` (52 cards, cada um com `id` = id do termo, categoria, definição e link para o documento de origem, usando o campo `url` de `data/documents.json`).
5. Adicionadas 52 entradas novas em `data/search-index.json` (uma por termo do glossário, id `glossario-termo-<id>`, `categoria: "glossario"`, `url` apontando para a âncora do termo em `docs/glossario/index.html#<id>`). Total do índice de busca: 389 → 441 entradas.
6. Atualizadas as contagens em `RELEASE-CANDIDATE.md` (a Home `index.html` já indicava "46 termos" antes desta correção — apenas o dado subjacente estava incompleto; agora está correto).

## 3. Lista dos 46 termos oficiais (Etapa 8) e fonte de cada definição

Numeração conforme a Etapa 8 do documento fonte. "Origem" = `documentoOrigem` gravado em `glossario.json` (id em `data/documents.json`).

1. Chamada do Nome — fase3 (Cap.17)
2. Livro de Nomes — fase3 (Cap.17)
3. Peso Testemunha — fase3 (Cap.17)
4. Última Respiração — fase3 (Cap.17)
5. Cerimônia de Reconhecimento — fase3 (Cap.17)
6. Marca de Retorno — fase3 (Cap.17)
7. Momento do Box — fase3 (Cap.17)
8. Sistema Simbólico — fase3 (Cap.17, título)
9. Governança de Marca — fase5 (Cap.5)
10. Guardião da Constituição — fase6 (Cap.6)
11. Sistemas Permanentes — fase5 (Cap.3, título)
12. Existência Categórica — fase2 (Etapa 1)
13. Duelo Testemunhado — fase2 (Etapa 6)
14. DNA Estratégico — fase2 (título de seção final)
15. Território Emocional — fase2 (Etapa 2)
16. Ato 1 da Narrativa de Lançamento — fase4 (Cap.5)
17. Macrofases do Lançamento — projeto10 (Cap.2)
18. P1–P19 — fase6 (Cap.4)
19. RACI — fase6 (Cap.6)
20. Risk Register — fase6 (Cap.9)
21. Critérios de Prontidão — fase6 (Cap.12)
22. Quick Wins — fase6 (Cap.14)
23. ICP (Ideal Customer Profile) — projeto06 (Cap.3)
24. Sponsor Kit — projeto06 (título)
25. Guardiões Fundadores — projeto05 (Cap.11)
26. Naming Rights — projeto05 (Cap.9)
27. Wayfinding — projeto07 (Cap.10)
28. Sistema Cerimonial — projeto07 (Cap.12)
29. Centros Operacionais — projeto09 (Cap.4)
30. Cadeia de Comando — projeto09 (Cap.3)
31. Sistema Cromático / Terracota / Carvão / Ferro / Osso — projeto03 (Cap.3)
32. Versão Gravada/Cunhada — projeto03 (Cap.5)
33. Sistema Modular Oficial — projeto04 (Cap.3)
34. Nomenclatura de Arquivo Padrão — projeto04 (Cap.17)
35. Interesse Pré-Inscrição — projeto11 (título do documento)
36. Taxa de Não Conversão Declarada — projeto10 (auditoria final)
37. Social Proof — projeto10 (Cap.11) *(publicado como "Sistema de Social Proof", ver Seção 4)*
38. Sistema de Aprendizado — projeto11 (Cap.14)
39. Sistema Ético — projeto10 (Cap.16) / projeto11 (Cap.13)
40. LGPD — manual-crm (Cap.11)
41. Direito ao Esquecimento vs. Registro Histórico — manual-crm (Cap.16)
42. Storytelling Executivo — manual-dashboard (Cap.8)
43. Stories Baseados em Dados — manual-stories (título do manual)
44. Teste de Clareza vs. Teste Manipulativo — manual-formulario (Cap.13)
45. Constituição Simbólica (Internacional) — fase5 (Cap.9)
46. Cenários Orçamentários Proporcionais (Conservador/Intermediário/Ambicioso) — fase6 (Cap.8)

## 4. Correspondência com entradas pré-existentes

Os seguintes termos já existiam no `glossario.json` (26 originais) e foram mantidos com seus `id` originais em vez de duplicados:

- `sistema-simbolico`, `governanca-de-marca`, `sistemas-permanentes`, `macrofases-do-lancamento`, `icp-ideal-customer-profile`, `sponsor-kit`, `guardioes-fundadores`, `naming-rights`, `wayfinding`, `sistema-cerimonial`, `centros-operacionais`, `cadeia-de-comando`, `sistema-cromatico-terracota-carvao-ferro-osso`, `versao-gravada-cunhada`, `sistema-modular-oficial`, `nomenclatura-de-arquivo-padrao`, `interesse-pre-inscricao`, `taxa-de-nao-conversao-declarada`, `storytelling-executivo` (item 42), `sistema-de-social-proof` (item 37 — publicado com o nome já em uso no arquivo, "Sistema de Social Proof", equivalente ao "Social Proof" da Etapa 8).

Os demais 26 termos oficiais foram criados como novas entradas nesta rodada (ids listados em `data/glossario.json`, ex.: `chamada-do-nome`, `livro-de-nomes`, `peso-testemunha`, `ultima-respiracao`, `cerimonia-de-reconhecimento`, `marca-de-retorno`, `momento-do-box`, `guardiao-da-constituicao`, `existencia-categorica`, `duelo-testemunhado`, `dna-estrategico`, `territorio-emocional`, `ato-1-da-narrativa-de-lancamento`, `p1-p19`, `raci`, `risk-register`, `criterios-de-prontidao`, `quick-wins`, `sistema-de-aprendizado`, `sistema-etico`, `lgpd`, `direito-ao-esquecimento-vs-registro-historico`, `stories-baseados-em-dados`, `teste-de-clareza-vs-teste-manipulativo`, `constituicao-simbolica-internacional`, `cenarios-orcamentarios-proporcionais`).

## 5. Termos complementares (não numerados na Etapa 8, mantidos por não apagar conteúdo pré-existente)

`jornada-do-interessado`, `coleta-progressiva`, `fonte-unica-de-dados`, `pessoa-entidade-central`, `catalogo-de-kpis`, `honestidade-estatistica`. São descrições fiéis de conceitos reais do Projeto11/Manual_CRM/Manual_Dashboard/Manual_Stories, mas a Etapa 8 do documento de engenharia não os inclui na sua lista fechada de 46. Ficam sinalizados no `_comment` de `glossario.json` como suplementares, não contam para a métrica "46/46".

## 6. Teste de publicação/busca (item 8 da tarefa)

Script de verificação (Python, executado sobre os arquivos reais):

```
total de termos em glossario.json: 52
termos ausentes em docs/glossario/index.html (por id="..."): 0
termos ausentes em data/search-index.json (por id="glossario-termo-<id>"): 0
```

**Resultado:** os 46 termos oficiais (e as 6 entradas complementares, 52 no total) aparecem tanto na página HTML publicada do glossário quanto no índice de busca `data/search-index.json`. Nenhum termo falhou no teste.

## 7. Limitação declarada

Como o texto da Etapa 8 já é, ele próprio, um resumo/paráfrase dos 21 documentos .md originais (não uma citação literal com número de linha de cada .md), as definições dos 26 termos novos foram transcritas fielmente a partir do texto da Etapa 8 (que por sua vez foi produzido por leitura integral dos .md, conforme declarado no cabeçalho do documento). Não foi feita nova leitura integral dos 21 .md nesta rodada para re-confirmar cada definição linha a linha — isso seria redundante com o trabalho já certificado da Etapa 8 e está fora do escopo desta correção pontual de completude do glossário. Nenhum dos 21 .md fonte nem a pasta `/portal` original foi alterado.
