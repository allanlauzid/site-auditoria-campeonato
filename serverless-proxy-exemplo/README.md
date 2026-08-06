# Proxy serverless do assistente de IA (Gemini) — código de exemplo

**Esta pasta NÃO faz parte do deploy do site estático.** `portal-v1/` é publicado
como site estático (HTML/CSS/JS puro); `serverless-proxy-exemplo/` é um projeto
separado, publicado à parte, em uma plataforma serverless. Nunca copie esta
pasta para o servidor de arquivos estáticos do portal.

## Por que o proxy é necessário

O frontend do portal (`assets/js/gemini-assistant.js`) roda inteiramente no
navegador do visitante — qualquer string colocada em um arquivo `.html`,
`.css` ou `.js` público fica visível a qualquer pessoa que abrir o "Ver código
fonte" da página. Se a `GEMINI_API_KEY` fosse colocada ali, ela vazaria
publicamente e poderia ser usada por terceiros até esgotar a cota/gerar custo
na conta do usuário.

Por isso a arquitetura usada é **proxy serverless**:

```
Navegador do visitante          Proxy serverless (este código)         Google Gemini API
  gemini-assistant.js   ---->     worker.js / api-vercel-example.js  ---->  generativelanguage.googleapis.com
  (sem chave nenhuma)             (guarda GEMINI_API_KEY em variável        (chave só é usada aqui)
                                    de ambiente do provedor)
```

O frontend só conhece a URL pública do proxy (`geminiProxyEndpoint` em
`portal-v1/data/site-config.json`). O proxy é o único lugar que conhece a
chave real, e ela fica configurada como variável de ambiente no painel do
provedor de hospedagem — nunca em um arquivo de código versionado.

## Opção 1 — Cloudflare Workers (`worker.js`)

1. Instale a CLI: `npm install -g wrangler`
2. Crie um projeto de Worker (ou use o arquivo `worker.js` desta pasta como
   ponto de partida) e publique:
   ```
   wrangler login
   wrangler deploy worker.js --name assistente-gemini-cbks
   ```
3. Configure a variável de ambiente **no painel do Cloudflare** (nunca no
   código):
   ```
   wrangler secret put GEMINI_API_KEY
   ```
   ou pelo dashboard: Workers & Pages → seu Worker → Settings → Variables →
   "Encrypt" para `GEMINI_API_KEY`.
4. Ajuste `ALLOWED_ORIGIN` no topo de `worker.js` para o domínio real do
   portal em produção (ex.: `https://www.seudominio.com.br`). Em
   desenvolvimento local, `http://localhost:*` já é liberado como fallback.
5. Anote a URL publicada (ex.: `https://assistente-gemini-cbks.SEU-USUARIO.workers.dev`).

## Opção 2 — Vercel ou Netlify Functions (`api-vercel-example.js`)

### Vercel
1. Coloque `api-vercel-example.js` em `api/gemini.js` dentro de um projeto
   Vercel (Node.js runtime).
2. No painel do Vercel: Project → Settings → Environment Variables → adicione
   `GEMINI_API_KEY` (Production e Preview). Nunca coloque a chave no código
   nem no `.env` versionado.
3. Deploy: `vercel deploy --prod`.
4. A URL final será algo como `https://seu-projeto.vercel.app/api/gemini`.

### Netlify Functions
1. Coloque o mesmo arquivo em `netlify/functions/gemini.js`.
2. No painel do Netlify: Site settings → Environment variables → adicione
   `GEMINI_API_KEY`.
3. Deploy normal do site (`netlify deploy --prod`).
4. A URL final será algo como
   `https://seu-site.netlify.app/.netlify/functions/gemini`.

## Testando localmente

Cloudflare Workers:
```
wrangler dev worker.js --local
# defina a chave localmente sem commitar: wrangler secret put GEMINI_API_KEY --local
```

Vercel:
```
vercel dev
# crie um .env.local (NÃO versionado) com GEMINI_API_KEY=... só para teste local
```

Teste com curl (não inclui chave nenhuma — ela fica no servidor do proxy):
```
curl -X POST http://localhost:8787/ \
  -H "Content-Type: application/json" \
  -d '{"pergunta":"O que é a Fase 3?","contextoPagina":{"titulo":"Fase 3","conteudo":"..."},"historico":[]}'
```

## Passo final — conectar o frontend ao proxy publicado

Depois de publicar o proxy em produção, edite
`portal-v1/data/site-config.json` e preencha:

```json
"geminiProxyEndpoint": "https://assistente-gemini-cbks.SEU-USUARIO.workers.dev"
```

(ou a URL equivalente do Vercel/Netlify). Não é necessária nenhuma outra
alteração no frontend — `gemini-assistant.js` lê esse campo automaticamente
na inicialização de cada página.

## Diagnóstico — erro de rede genérico no navegador (possível CORS)

O JavaScript do navegador não consegue distinguir "proxy fora do ar" de
"bloqueado por CORS": nos dois casos o `fetch()` simplesmente rejeita, sem
detalhe de status HTTP, e `gemini-assistant.js` mostra a mensagem genérica de
erro de conexão. Se os usuários relatarem falha constante mesmo com o proxy
publicado e saudável, verifique CORS antes de qualquer outra coisa:

1. Abra o DevTools (F12) → aba Console/Network ao reproduzir o erro. Um
   bloqueio de CORS aparece como algo como `Access to fetch at '...' from
   origin '...' has been blocked by CORS policy` — isso só aparece no
   DevTools, nunca chega ao código JS do frontend para ser tratado.
2. Confirme que `ALLOWED_ORIGIN` (`worker.js`) ou `resolveAllowedOrigin()`
   (`api-vercel-example.js`) está com o domínio real de produção do portal
   (com `https://` e sem barra final).
3. Se o portal for servido em mais de um domínio (ex.: domínio próprio +
   subdomínio de preview), inclua todos os domínios esperados na checagem de
   origem — hoje o exemplo libera apenas um `ALLOWED_ORIGIN` fixo + localhost.
4. Depois de corrigir, teste com `curl` (que ignora CORS) para confirmar que o
   proxy em si responde; depois teste no navegador para confirmar que o
   cabeçalho `Access-Control-Allow-Origin` bate com a origem do portal.

## Formato padronizado de erro

Em qualquer falha, o proxy responde com um corpo JSON no formato:

```json
{ "erro": true, "codigo": "RATE_LIMIT", "mensagem": "texto de apoio para debug" }
```

acompanhado de um status HTTP apropriado (`401`/`403` autenticação, `413`
pergunta/contexto grande demais, `429` limite de requisições, `500`/`502`
erro do proxy ou da API do Gemini). Os códigos possíveis são: `AUTH_ERROR`,
`RATE_LIMIT`, `SERVER_ERROR`, `SAFETY_BLOCKED`, `EMPTY_RESPONSE`,
`INVALID_REQUEST`, `REQUEST_TOO_LARGE`. O campo `mensagem` é só para debug no
proxy — o frontend (`gemini-assistant.js`) decide o texto final mostrado ao
usuário a partir do `codigo`, então nunca inclua ali detalhes sensíveis
(chave, stack trace, URL interna).

## O que NUNCA fazer

- Nunca colar a `GEMINI_API_KEY` em `worker.js`, `api-vercel-example.js`,
  `.env.example` ou qualquer arquivo versionado.
- Nunca chamar `generativelanguage.googleapis.com` diretamente do
  `assets/js/gemini-assistant.js` do frontend.
- Nunca commitar um `.env` real — apenas `.env.example` (vazio) fica no
  controle de versão.
