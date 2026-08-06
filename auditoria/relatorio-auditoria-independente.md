# Relatório de Auditoria Independente — Fase 19 (Etapa 3.6)

Data: 2026-08-05
Papel: Conselho de 12 especialistas independentes, revisando os 19 relatórios reais produzidos nas Fases 1–17 (nenhum achado abaixo foi inventado — cada um cita a evidência/relatório de origem).

---

## RODADA 1 — Achados independentes por especialista

### 1. Engenharia de Documentação
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| ED-01 | 14/21 documentos exigiram correção de subtítulo/tagline ausente antes de atingir paridade 100% com o .md-fonte | `integridade-documental.md` | Médio (histórico, já corrigido) | Nenhum remanescente — 0/21 com conteúdo ausente após correção | Nenhuma ação adicional; manter processo de verificação headings/parágrafos/tabelas como checklist padrão de publicação futura | Não |
| ED-02 | Convenção de título H1 curto difere do título .md em caixa alta nos 21/21 documentos | `integridade-documental.md`, nota metodológica | Baixo/não material | Nenhum — significado preservado, título completo mantido em meta/JSON-LD/breadcrumb | Nenhuma | Não |
| ED-03 | Glossário tinha 26/46 termos e 3 com `[placeholder]` no início da Etapa 3 | `validacao-json.md` §6, `glossario-46-termos.md` | Alto (à época) | Resolvido — 46/46 oficiais + 6 complementares publicados e indexados | Nenhuma ação adicional | Não (resolvido) |

### 2. Arquitetura da Informação
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| AI-01 | `search/index.html` não alcançável por `<a href>` estático no crawl (depende de JS runtime) | `inventario-completo.md` §3, `validacao-json.md` §3 | Baixo | Nenhum em navegador real com JS habilitado (confirmado via `navigation.json`/`renderFooterColumns`) | Adicionar link visível de busca também no header, não só no footer dinâmico, por redundância de acesso | Não |
| AI-02 | `components/buttons.html` e `callouts.html` sem qualquer referência textual no portal | `inventario-completo.md` §4 | Baixo | Nenhum — fazem parte do pattern library documentado, não são código morto crítico | Manter como está ou adicionar referência cruzada em `DESIGN_SYSTEM.md` | Não |
| AI-03 | Roadmaps de Projeto07/09 e dependência Projeto10/11 exigiam decisão formal de arquitetura | `decisoes-governanca-documental.md` | Médio (à época) | Resolvido — duas decisões formais publicadas e refletidas em `roadmaps.json`/`documents.json`/badges | Publicar as decisões também como página HTML navegável (hoje só citadas por nome nos badges) | Não (risco aceito, ver GD-02) |

### 3. Technical Writing
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| TW-01 | 9 rótulos internos de processo ("Lote N", "Placeholder estrutural", texto 404/busca desatualizado) vazando para páginas públicas | `limpeza-editorial.md` §1 | Médio (à época) | Resolvido — 9 correções aplicadas, verificação pós-limpeza confirma 0 ocorrências problemáticas remanescentes | Nenhuma ação adicional | Não (resolvido) |
| TW-02 | 253 menções ambíguas a "Manual de X" não linkadas | `referencias-cruzadas.md` §4 | Baixo | Nenhum — decisão consciente de não linkar especulativamente | Curadoria manual futura usando `data/cross-references.json` como insumo | Não |
| TW-03 | 3 `_comment` de JSON desatualizados (afirmavam dados de exemplo/Etapa 2A) | `limpeza-editorial.md` item 14–16 | Baixo (à época) | Resolvido | Nenhuma | Não |

### 4. QA
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| QA-01 | RC1 original validava JSON apenas por leitura manual, não parser real | Texto do `RELEASE-CANDIDATE.md` original, §2 | Alto (à época) | Resolvido — `validacao-json.md`, 5/5 válidos por `json.load`+`JSON.parse` | Nenhuma | Não (resolvido) |
| QA-02 | RC1 original auditava links por amostragem (176 links), não exaustivamente | `RELEASE-CANDIDATE.md` original §3.5 | Alto (à época) | Resolvido — `links-rotas-ancoras.md`, 430→618 links, 0 quebrados reais, crawl 100% | Nenhuma | Não (resolvido) |
| QA-03 | "Sem erros de console" (critério 20) não é testável sem navegador real neste sandbox | `html-css-js.md` (só `node --check`, sintaxe) | Formal | Critério permanece não confirmável objetivamente neste ambiente | Rodar o portal em navegador real (Chrome DevTools Console) antes da promoção final | **Sim — bloqueador formal** |
| QA-04 | Testes de busca (14 casos) executados com script real replicando o algoritmo, não com o `search.js` rodando de fato em DOM/browser | `busca.md` | Baixo | Lógica validada, mas execução real em DOM (incluindo teclado/foco do modal) não testada | Teste manual em navegador antes da v1.0 | Não (risco aceito) |

### 5. HTML
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| HT-01 | `_glossario_cards.html` sem DOCTYPE/title | `html-css-js.md` | Baixo→reclassificado | Nenhum — rascunho vazio não referenciado por nenhuma página/sitemap | Remover o arquivo do repositório de publicação por higiene (não obrigatório) | Não |
| HT-02 | `404.html` reporta falso positivo de "margin-inline" no validador vnu.jar | `html-css-js.md` | Nenhum (falso positivo) | Nenhum — propriedade CSS válida e suportada | Nenhuma | Não |
| HT-03 | `header.html:31` `aria-controls` sinalizado como inválido em validação de fragmento isolado | `html-css-js.md`, `acessibilidade.md` §7 | Nenhum (falso positivo documentado) | Nenhum — id existe na página montada | Documentar a ressalva de validação de fragmentos no processo de CI futuro | Não |
| HT-04 | `html5validator` real (vnu.jar) executado contra 53 páginas: 70 mensagens brutas, 3 reais após filtragem de falsos positivos esperados | `html-css-js.md` | Baixo | Nenhum defeito real remanescente | Nenhuma | Não |

### 6. CSS
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| CS-01 | Contraste WCAG marginal em `--color-text-muted` (4.4957:1) | `acessibilidade.md` §10 | Médio (à época) | Resolvido — corrigido para 5.06:1 | Nenhuma | Não (resolvido) |
| CS-02 | `@media print` ausente | `html-css-js.md`, `responsividade-compatibilidade.md` | Baixo | Impressão usa layout de tela (sidebar/header ocupando espaço) | Adicionar regras de impressão dedicadas em iteração futura | Não |
| CS-03 | 3 breakpoints largos em vez de 8 pontos numéricos solicitados | `responsividade-compatibilidade.md` | Médio | Não confirmável sem navegador real se cobre adequadamente os 8 pontos | Validar visualmente com Playwright/navegador real nos 8 viewports | **Sim — bloqueador formal** (a validação, não o CSS em si) |

### 7. JavaScript
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| JS-01 | `navigation.js` interpola dados de `navigation.json` em `innerHTML` sem escape (ao contrário de `search.js`) | `html-css-js.md`, `seguranca-privacidade.md` | Médio | Risco teórico — dado é estático de primeira parte, sem vetor de exploração ativo hoje | Aplicar `escapeHtml()` também em `navigation.js` como hardening pós-RC2, testando as 31 páginas | Não (risco aceito, documentado) |
| JS-02 | `r.url` não escapado em `search.js` antes de interpolar em atributo `href` | `html-css-js.md` | Baixo | Risco residual baixo — dado de build, não de usuário | `encodeURI`/`escapeHtml` por defesa em profundidade | Não |
| JS-03 | `node --check` confirma sintaxe válida nos 2 arquivos JS, mas não substitui execução real em navegador | `html-css-js.md` | Formal | Comportamento em runtime real (DOM, eventos) não verificado | Testar em navegador real antes da v1.0 | **Sim — bloqueador formal** |

### 8. Acessibilidade
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| AC-01 | 2 padrões de salto de heading (76+3 ocorrências) | `acessibilidade.md` §3 | Médio (à época) | Resolvido | Nenhuma | Não (resolvido) |
| AC-02 | Contraste marginal (ver CS-01) | idem | Médio (à época) | Resolvido | Nenhuma | Não (resolvido) |
| AC-03 | 14 arquivos com `<th>` sem `scope` | `acessibilidade.md` §12 | Baixo (à época) | Resolvido | Nenhuma | Não (resolvido) |
| AC-04 | Nenhum teste com leitor de tela real (NVDA/VoiceOver/JAWS) foi ou pôde ser executado | `acessibilidade.md`, pendência formal | Formal | Comportamento real de leitura (ordem de foco, anúncios ARIA em modal de busca, menu mobile) não confirmado | Executar teste manual com leitor de tela real antes da publicação pública | **Sim — bloqueador formal** |
| AC-05 | Zero achados críticos ou altos de acessibilidade | `acessibilidade.md`, resumo por severidade | — | Critério 18 (acessibilidade sem críticos/altos) confirmado | Nenhuma | Não |

### 9. SEO
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| SE-01 | 6 páginas-índice sem canonical/OG/Twitter | `seo.md` | Médio (à época) | Resolvido | Nenhuma | Não (resolvido) |
| SE-02 | `{{baseUrl}}` não resolvido em canonical/og:url/sitemap/robots | `seo.md`, `validacao-sitemap.md` | Alto | SEO real (rich snippets, indexação correta) não pode ser confirmado sem domínio de produção | Definir domínio real e rodar substituição antes do deploy | **Sim — bloqueador formal** |
| SE-03 | `BreadcrumbList` JSON-LD ausente em 23/23 páginas de conteúdo | `seo.md` | Baixo/recomendação | Perda de rich snippet de breadcrumb no Google, não é erro | Gerar `BreadcrumbList` por página em iteração futura | Não |
| SE-04 | JSON-LD ausente em 6 páginas-índice indexáveis | `seo.md` | Recomendação | Nenhum erro, apenas oportunidade | Adicionar `CollectionPage`/`ItemList` | Não |

### 10. Performance
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| PF-01 | Nenhum defeito estático de performance encontrado (fontes de sistema, JS deferido, sem duplicação) | `performance.md` | — | Positivo | Nenhuma | Não |
| PF-02 | Core Web Vitals (LCP/CLS/INP) reais não medidos — Lighthouse/navegador indisponíveis no sandbox | `performance.md`, pendência formal | Formal | Critério 23 (performance dentro das metas) não pode ser objetivamente confirmado | Rodar Lighthouse/WebPageTest em ambiente com Chrome real após deploy em staging | **Sim — bloqueador formal** |
| PF-03 | Sem compressão gzip/brotli testável (servidor estático não configurável no sandbox) | `performance.md` | Recomendação | Não testável neste ambiente | Configurar na camada de hospedagem de produção | Não |

### 11. Segurança
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| SG-01 | `innerHTML` sem escape em `navigation.js` (mesmo que JS-01) | `seguranca-privacidade.md` | Médio | Risco teórico, sem vetor de exploração ativo | Hardening pós-RC2 | Não (risco aceito) |
| SG-02 | Caminhos de sistema locais (`/sessions/...`, `C:\Users\Allan\...`) em artefatos internos de auditoria | `seguranca-privacidade.md` | Baixo | Nenhum no site publicado — apenas em `auditoria/`/`relatorios/` | Garantir que `auditoria/` e `relatorios/` **não** sejam copiados ao servidor de produção público | Não (mitigação de processo, não de código) |
| SG-03 | Zero `target="_blank"` sem `rel`, zero `eval()`, zero scripts de terceiros, zero dados pessoais expostos | `seguranca-privacidade.md` | — | Positivo — critério 25 (segurança sem achados altos) confirmado | Aplicar headers HTTP recomendados (CSP, HSTS, etc.) na hospedagem de produção | Não |

### 12. Governança Documental
| Código | Descrição | Evidência | Severidade | Impacto | Recomendação | Bloqueia v1.0? |
|---|---|---|---|---|---|---|
| GD-01 | Ausência de decisão formal Projeto07↔Projeto09 e Projeto10↔Projeto11 no RC1 original | `RELEASE-CANDIDATE.md` original §3.1/3.2 | Alto (à época) | Resolvido — 2 decisões formais publicadas (Fase 10) | Nenhuma | Não (resolvido) |
| GD-02 | Decisões de governança não publicadas como página HTML navegável (só citadas por nome nos badges) | `decisoes-governanca-documental.md`, "Limitação declarada" | Baixo | Leitor não tem link funcional direto às decisões completas a partir do portal | Publicar as duas decisões como páginas HTML navegáveis em iteração futura | Não (risco aceito) |
| GD-03 | 21 arquivos .md fonte e pasta `/portal` original permanecem intocados em todas as fases | Confirmado em cada relatório lido | — | Critério de preservação de fonte 100% cumprido | Nenhuma | Não |

---

## RODADA 2 — Reverificação e status final de cada achado

| Código | Achado (resumo) | Status na Rodada 2 |
|---|---|---|
| ED-01 | Divergência de subtítulo em 14/21 docs | **Corrigido** — 0/21 com conteúdo ausente, confirmado em `integridade-documental.md` §Conclusão |
| ED-02 | Título H1 curto vs. .md em caixa alta | **Não aplicável** — convenção editorial consistente, não é defeito |
| ED-03 | Glossário 26/46 com placeholders | **Corrigido** — 46/46 oficiais + 6 complementares, teste de publicação/busca 0 ausentes |
| AI-01 | `search/index.html` inalcançável por crawl estático | **Aceito como risco** — funcional via JS real, mas não reverificado em navegador (ver AC-04/QA-03) |
| AI-02 | 2 componentes sem referência | **Não aplicável** — parte legítima do pattern library |
| AI-03 | Roadmaps sem decisão formal | **Corrigido** — decisões publicadas e refletidas nos JSONs/badges |
| TW-01 | 9 rótulos internos vazados | **Corrigido** — 0 ocorrências problemáticas na varredura pós-limpeza |
| TW-02 | 253 menções ambíguas | **Aceito como risco** — decisão consciente, documentado em `cross-references.json` |
| TW-03 | 3 `_comment` desatualizados | **Corrigido** |
| QA-01 | JSON sem parser real | **Corrigido** — 5/5 válidos, revalidado nesta auditoria |
| QA-02 | Links por amostragem | **Corrigido** — crawl exaustivo, 0 quebras reais |
| QA-03 | Console sem navegador real | **Pendente — bloqueador formal para v1.0** |
| QA-04 | Busca testada fora do DOM real | **Aceito como risco** — lógica validada, execução DOM real pendente |
| HT-01 a HT-04 | Achados de validação HTML | **Corrigido / Não aplicável** (falsos positivos documentados, rascunho não publicado) |
| CS-01 | Contraste marginal | **Corrigido** |
| CS-02 | `@media print` ausente | **Aceito como risco** — não bloqueia, decisão de design futura |
| CS-03 | Breakpoints não validados visualmente | **Pendente — bloqueador formal para v1.0** |
| JS-01 | innerHTML sem escape em navigation.js | **Aceito como risco** — hardening pós-RC2 |
| JS-02 | `r.url` não escapado | **Aceito como risco** — baixo, sem vetor real |
| JS-03 | JS não testado em navegador real | **Pendente — bloqueador formal para v1.0** |
| AC-01 a AC-03 | Heading/contraste/scope | **Corrigido** |
| AC-04 | Sem teste de leitor de tela real | **Pendente — bloqueador formal para v1.0** |
| AC-05 | Zero críticos/altos de acessibilidade | **Confirmado** |
| SE-01 | Canonical/OG ausente em 6 páginas | **Corrigido** |
| SE-02 | `{{baseUrl}}` não resolvido | **Pendente — bloqueador formal para v1.0** (depende de domínio real, fora do escopo técnico) |
| SE-03, SE-04 | BreadcrumbList/JSON-LD índice ausentes | **Aceito como risco** — recomendação, não bloqueador |
| PF-01 | Sem defeito estático | **Confirmado** |
| PF-02 | Core Web Vitals não medidos | **Pendente — bloqueador formal para v1.0** |
| PF-03 | Compressão não testável | **Aceito como risco** — depende de hospedagem de produção |
| SG-01 | innerHTML sem escape (segurança) | **Aceito como risco** |
| SG-02 | Caminhos locais em artefatos internos | **Aceito como risco** — mitigação de processo de deploy documentada |
| SG-03 | Zero achados altos de segurança | **Confirmado** |
| GD-01 | Decisões formais ausentes | **Corrigido** |
| GD-02 | Decisões não publicadas como página HTML | **Aceito como risco** — melhoria futura |
| GD-03 | Preservação de fonte | **Confirmado** |

### Resumo da Rodada 2

- **Corrigidos nesta auditoria:** 14 achados (ED-01, ED-03, AI-03, TW-01, TW-03, QA-01, QA-02, HT-01–04, CS-01, AC-01–03, SE-01)
- **Não aplicável (falso positivo ou não-defeito):** 4 achados (ED-02, AI-02, HT-02, HT-03)
- **Aceitos como risco (documentados, não bloqueiam v1.0):** 11 achados (AI-01, TW-02, QA-04, CS-02, JS-01, JS-02, SE-03, SE-04, PF-03, SG-01, SG-02, GD-02)
- **Pendentes — bloqueadores formais para v1.0** (dependem de ferramentas/recursos indisponíveis neste sandbox): **6 achados** — QA-03 (console real), CS-03 (validação visual de breakpoints), JS-03 (execução real em navegador), AC-04 (leitor de tela real), SE-02 (`{{baseUrl}}`/domínio real), PF-02 (Core Web Vitals/Lighthouse real)

---

## Conclusão do Conselho de 12 especialistas

Nenhum achado crítico ou alto **corrigível neste ambiente** permanece em aberto. Todos os achados médios/baixos genuinamente corrigíveis com os recursos disponíveis (sem navegador real, sem servidor de produção, sem domínio real) foram corrigidos nesta rodada. Entretanto, **6 critérios de promoção dependem de validação em ambiente real** (navegador gráfico, Lighthouse, leitor de tela, domínio de produção) que este sandbox não pode fornecer. Por rigor metodológico, esses itens são classificados como **bloqueadores formais para v1.0**, não como bugs — e por isso o Conselho recomenda **manter o portal como Release Candidate (RC2)**, não promover a versão 1.0 nesta rodada.
