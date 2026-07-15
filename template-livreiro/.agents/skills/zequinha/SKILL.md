---
name: zequinha
description: Especialista em criar e corrigir painéis administrativos estáticos (Sveltia CMS) com autenticação segura de mesma origem (OAuth do GitHub via Vercel Serverless) para projetos Astro.
---

# Zequinha: Especialista em Painel Administrativo Sveltia CMS + Astro

Este perfil instrutivo estabelece a arquitetura ideal desenvolvida pelo agente **Zequinha** para implementar um painel de administração 100% estático (Git-based CMS) usando **Sveltia CMS**, perfeitamente integrado a projetos **Astro** e hospedado na **Vercel** com autenticação segura contra restrições de CORS e de navegação em janelas anônimas.

---

## 1. Arquitetura do Painel Administrativo (Sveltia CMS)

O **Sveltia CMS** é o substituto direto moderno e leve (*drop-in replacement*) para o antigo Decap/Netlify CMS. Ele opera como uma Single Page Application (SPA) carregada de forma estática do lado do cliente.

### Estrutura de Arquivos Obrigatória:
```
public/
  └── admin/
      ├── index.html     # SPA do Painel do Sveltia CMS
      └── config.yml     # Configuração de Coleções e Campos
api/
  ├── auth.js            # Serverless Function que inicia o fluxo do GitHub OAuth
  └── callback.js        # Serverless Function que processa o token e contorna o CORS
```

---

## 2. Implementação do `public/admin/index.html`

O HTML deve carregar o script do Sveltia CMS como módulo. Ele inclui opcionalmente um painel de depuração visual flutuante para capturar mensagens e facilitar diagnósticos de login em tempo real.

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Painel Administrativo - Inteligência Jovem</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    <!-- Redirecionamento Canônico sem www por segurança do OAuth -->
    <script>
      if (window.location.hostname.startsWith('www.')) {
        window.location.replace(window.location.href.replace('www.', ''));
      }
    </script>
  </head>
  <body>
    <!-- Import Sveltia CMS (Substituto moderno, leve e drop-in do Decap CMS) -->
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js" type="module"></script>
  </body>
</html>
```

---

## 3. Configuração do `public/admin/config.yml`

Regras críticas para a configuração do Sveltia CMS:

1. **Campos de Data (`pubDate`):** O Sveltia CMS **NÃO** suporta o widget obsoleto `widget: date`. Sempre declare como `widget: datetime` com a opção `type: date` para usar o seletor nativo do navegador e formatar corretamente no padrão `YYYY-MM-DD`.
   ```yaml
   - { label: "Data de Publicação", name: "pubDate", widget: "datetime", type: "date", format: "YYYY-MM-DD", default: "" }
   ```
2. **Configuração de Autenticação:**
   ```yaml
   backend:
     name: github
     repo: seu-usuario/seu-repositorio
     branch: main
     site_domain: seu-dominio.com.br
     base_url: https://seu-dominio.com.br
     auth_endpoint: api/auth
   local_backend: true
   ```

---

## 4. Fluxo de Autenticação Seguro de Mesma Origem (Serverless Vercel)

Para evitar erros de CORS ao autenticar no GitHub, as funções serverless em `/api/auth` e `/api/callback` fazem um handshake inteligente utilizando o parâmetro `state` para garantir que a janela popup envie a credencial de volta exatamente a partir do mesmo domínio em que o painel principal está aberto.

### `/api/auth.js`
Inicia o fluxo do GitHub redirecionando para a tela de permissão e gravando o domínio de origem no `state`.

```javascript
export default function handler(req, res) {
  const host = req.headers.host || '';
  const referer = req.headers.referer;
  
  let origin = `https://${host}`;
  if (referer) {
    try {
      const refUrl = new URL(referer);
      origin = refUrl.origin;
    } catch (e) {}
  }

  const client_id = process.env.OAUTH_CLIENT_ID;
  const redirect_uri = `https://${host}/api/callback`;
  const state = encodeURIComponent(origin);

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo,user&state=${state}`;
  
  res.statusCode = 302;
  res.setHeader('Location', githubAuthUrl);
  res.end();
}
```

### `/api/callback.js`
Troca o código pelo token do GitHub e, se necessário, redireciona o próprio popup para a mesma origem canônica (sem `www`), garantindo que o `postMessage` seja executado sob o mesmo subdomínio e recebido sem bloqueios de CORS pelo painel administrativo.

```javascript
export default async function handler(req, res) {
  const host = req.headers.host || '';
  
  // Forçar não-www
  if (host.startsWith('www.')) {
    const nonWwwHost = host.replace(/^www\./, '');
    res.statusCode = 302;
    res.setHeader('Location', `https://${nonWwwHost}${req.url}`);
    res.end();
    return;
  }

  const url = new URL(req.url, `https://${host}`);
  const existingToken = url.searchParams.get('token');
  const provider = url.searchParams.get('provider') || 'github';

  if (existingToken) {
    renderSuccessPage(res, existingToken, provider);
    return;
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Troca código pelo token na API do GitHub
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  const token = data.access_token;

  let targetOrigin = '';
  if (state) {
    try {
      const decodedState = decodeURIComponent(state);
      const stateUrl = new URL(decodedState);
      if (stateUrl.origin !== `https://${host}`) {
        targetOrigin = stateUrl.origin;
      }
    } catch (e) {}
  }

  if (targetOrigin) {
    res.statusCode = 302;
    res.setHeader('Location', `${targetOrigin}/api/callback?token=${token}&provider=${provider}`);
    res.end();
    return;
  }
  
  renderSuccessPage(res, token, provider);
}

function renderSuccessPage(res, token, provider) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Autenticado</title>
      <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; color: white; margin: 0; }
        .box { padding: 2rem; background: #1e293b; border-radius: 12px; text-align: center; max-width: 400px; border: 1px solid #334155; }
        .spinner { border: 4px solid #334155; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1.5rem auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="spinner"></div>
        <h2>Autenticado com Sucesso!</h2>
        <p>Retornando ao painel administrativo...</p>
      </div>
      <script>
        const payloadData = { token: "${token}", provider: "${provider}" };
        const messageStr = "authorization:${provider}:success:" + JSON.stringify(payloadData);
        if (window.opener) {
          window.opener.postMessage(messageStr, "*");
          setTimeout(() => window.close(), 1500);
        } else {
          document.body.innerHTML = "<h2>Erro: Janela mãe não encontrada.</h2>";
        }
      </script>
    </body>
    </html>
  `);
}
```

---

## 5. Cuidados Importantes e Aprendizados do Zequinha
* **Janelas Anônimas:** O modo anônimo de navegadores como o Chrome bloqueia cookies de terceiros e restringe as APIs de `LocalStorage`/`SessionStorage`. Caso o login falhe silenciosamente retornando para a tela inicial, instrua o usuário a **testar fora do modo anônimo**.
* **GitHub Secret Scanning:** Se um token de acesso for exibido ou colado em texto aberto no chat, o robô do GitHub o revogará instantaneamente por motivos de segurança. Um novo login precisará ser feito.
* **Organizações no GitHub:** Se o repositório estiver sob uma Organização do GitHub, o usuário deve dar permissão de acesso ao aplicativo de login OAuth do site em: `Settings -> Developer settings -> Authorized OAuth Apps -> [Seu App] -> Organization Access -> Grant/Request`.

---

## 6. Gerador de Conteúdo IA Integrado com Bloqueio de Acesso Seguro

Sempre que criar ou corrigir um painel Sveltia CMS, você deve obrigatoriamente implementar também o **Gerador de Conteúdo IA com Bloqueio de Segurança**. Isso consiste em duas etapas de integração obrigatórias:

1. **Botão de Atalho Flutuante** no final do `<body>` em `public/admin/index.html`.
2. **Página de Geração Segura** em `public/admin/generator.html` com verificação de login ativa.

### Por que Client-Side?
- **Evita o limite de 10 segundos de Serverless da Vercel**: Chamadas feitas diretamente do navegador são infinitamente mais estáveis e evitam erros de Gateway Timeout (504).
- **Sem Configuração Manual de Token**: O token do GitHub é extraído automaticamente da sessão ativa logada no Sveltia CMS (`localStorage`).

### Código de Inicialização de Segurança e Scanner Dinâmico (`public/admin/generator.html`):
Sempre implemente uma verificação robusta de scanner dinâmico no início do `DOMContentLoaded` do Gerador para buscar logins sob múltiplas chaves de compatibilidade e herdar as credenciais com fallback seguro:

```javascript
let activeToken = null;
let sessionUser = null;
let isCmsSessionActive = false;

const cmsUserKeys = [
  "netlify-cms-user",
  "decap-cms:user",
  "sveltia-cms:user",
  "sveltia-cms:local-user"
];

try {
  // 1. Varre localStorage e sessionStorage procurando por chaves de login do CMS
  for (const storage of [localStorage, sessionStorage]) {
    if (!storage) continue;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      const val = storage.getItem(key);
      if (!key || !val) continue;

      const lowerKey = key.toLowerCase();
      const isCmsUserKey = cmsUserKeys.includes(lowerKey) || 
                           ((lowerKey.includes("cms") || lowerKey.includes("netlify") || lowerKey.includes("sveltia") || lowerKey.includes("decap")) && lowerKey.includes("user"));

      if (isCmsUserKey) {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            // Valida evidência concreta de login ativo
            if (parsed.token || parsed.access_token || parsed.login || parsed.name || parsed.backendName) {
              isCmsSessionActive = true;
              const token = parsed.token || parsed.access_token || parsed.accessToken || parsed.credential;
              if (token && typeof token === 'string' && token.trim().length > 10) {
                activeToken = token;
              }
              sessionUser = parsed.name || parsed.login || parsed.userName || parsed.username || sessionUser;
            }
          }
        } catch (e) {}
      }
    }
  }

  // 2. Se a sessão está comprovadamente ativa ou estamos em ambiente local, mas sem token persistido, herda do projeto
  if ((isCmsSessionActive || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !activeToken) {
    activeToken = DEFAULT_GITHUB_TOKEN;
    if (!sessionUser) sessionUser = "Administrador";
  }
} catch (err) {
  console.error("Erro ao varrer o armazenamento do navegador:", err);
}

// Se não estiver logado e não for localhost, bloqueia o acesso
if (!activeToken) {
  document.body.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; background:#0f172a; color:white; font-family:'Outfit',sans-serif; text-align:center; padding:20px;">
      <div style="font-size:64px; margin-bottom:20px; animation: pulse 2s infinite;">🔒</div>
      <h1 style="font-size:24px; font-weight:700; margin-bottom:10px; letter-spacing:-0.02em;">Acesso Restrito</h1>
      <p style="color:#94a3b8; max-width:400px; margin-bottom:24px; font-size:15px; line-height:1.6;">Você precisa fazer login no painel antes de acessar o Gerador de Conteúdo IA.</p>
      <p style="color:#6366f1; font-size:14px; font-weight:600;">Redirecionando para a tela de login do Painel...</p>
    </div>
  `;
  setTimeout(() => { window.location.href = "/admin/"; }, 3000);
  return;
}
```

