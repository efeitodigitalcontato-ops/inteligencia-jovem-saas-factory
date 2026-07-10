export default async function handler(req, res) {
  // Redirecionamento canônico de www para não-www ao nível HTTP para garantir mesma-origem (CORS) com o painel pai
  const host = req.headers.host || '';
  if (host.startsWith('www.')) {
    const nonWwwHost = host.replace(/^www\./, '');
    res.statusCode = 302;
    res.setHeader('Location', `https://${nonWwwHost}${req.url}`);
    res.end();
    return;
  }

  // Parsing robusto e nativo da URL
  const url = new URL(req.url, `https://${host || 'localhost'}`);
  
  // Se já temos o token e provider diretamente na query string (após redirecionamento de mesma origem)
  const existingToken = url.searchParams.get('token');
  const provider = url.searchParams.get('provider') || 'github';

  if (existingToken) {
    renderSuccessPage(res, existingToken, provider);
    return;
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // Contém a origem de onde o login foi iniciado

  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("Erro: Variáveis OAUTH_CLIENT_ID ou OAUTH_CLIENT_SECRET não estão configuradas na Vercel.");
    return;
  }

  if (!code) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("Erro: Nenhum código de autorização fornecido pelo GitHub.");
    return;
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`Erro de autenticação do GitHub: ${data.error_description || data.error}`);
      return;
    }

    const token = data.access_token;
    
    if (!token) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`Erro: O GitHub não retornou um access_token válido. Resposta recebida: ${JSON.stringify(data)}`);
      return;
    }

    // Verifica se a origem de onde o login foi disparado (state) é diferente do host atual do popup.
    // Se for diferente, redireciona o popup para o domínio original com o token na URL, eliminando erros de CORS/Origem cruzada!
    let targetOrigin = '';
    if (state) {
      try {
        const decodedState = decodeURIComponent(state);
        const stateUrl = new URL(decodedState);
        // Compara origens
        const currentOrigin = `https://${host}`;
        if (stateUrl.origin !== currentOrigin) {
          targetOrigin = stateUrl.origin;
        }
      } catch (e) {
        // Ignora erros de parsing do state
      }
    }

    if (targetOrigin) {
      res.statusCode = 302;
      res.setHeader('Location', `${targetOrigin}/api/callback?token=${token}&provider=${provider}`);
      res.end();
      return;
    }
    
    // Se já está na mesma origem, renderiza a página de sucesso para disparar o postMessage
    renderSuccessPage(res, token, provider);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Erro interno no servidor: ${error.message}`);
  }
}

// Função auxiliar para renderizar a página HTML de sucesso que dispara o postMessage
function renderSuccessPage(res, token, provider) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Autenticando - Inteligência Jovem</title>
      <!-- Google Fonts: Outfit -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
      
      <style>
        body {
          font-family: 'Outfit', -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: #0f172a; /* Slate 900 */
          color: #f1f5f9; /* Slate 100 */
          text-align: center;
          padding: 1.5rem;
          box-sizing: border-box;
        }
        .container {
          width: 100%;
          max-width: 480px;
          padding: 2.5rem 2rem;
          border-radius: 20px;
          background: #1e293b; /* Slate 800 */
          border: 1px solid #334155; /* Slate 700 */
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
        }
        .spinner {
          border: 4px solid #334155;
          border-top: 4px solid #3b82f6; /* Blue 500 */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .title {
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0 0 2rem 0;
        }
        .log-panel {
          text-align: left;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.8rem;
          max-height: 180px;
          overflow-y: auto;
          margin-bottom: 1.5rem;
          color: #38bdf8; /* Sky 400 */
        }
        .log-entry {
          margin: 0.25rem 0;
          line-height: 1.4;
        }
        .log-success { color: #4ade80; } /* Green 400 */
        .log-error { color: #f87171; } /* Red 400 */
        .log-warn { color: #fbbf24; } /* Amber 400 */
        
        .btn {
          background: #334155;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn:hover {
          background: #475569;
        }
        .btn-primary {
          background: #3b82f6;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div id="status-icon" class="spinner"></div>
        <div class="title" id="status-title">Autenticando...</div>
        <p class="subtitle" id="status-subtitle">Sincronizando suas credenciais com o painel...</p>
        
        <div class="log-panel" id="log-panel">
          <div class="log-entry">Iniciando handshake de autenticação...</div>
        </div>
        
        <div id="action-area">
          <button class="btn" onclick="window.close()">Cancelar</button>
        </div>
      </div>

      <script>
        const logPanel = document.getElementById('log-panel');
        const statusIcon = document.getElementById('status-icon');
        const statusTitle = document.getElementById('status-title');
        const statusSubtitle = document.getElementById('status-subtitle');
        const actionArea = document.getElementById('action-area');
        
        function log(msg, type = 'info') {
          const entry = document.createElement('div');
          entry.className = 'log-entry ' + (type === 'success' ? 'log-success' : type === 'error' ? 'log-error' : type === 'warn' ? 'log-warn' : '');
          entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
          logPanel.appendChild(entry);
          logPanel.scrollTop = logPanel.scrollHeight;
        }

        try {
          const token = "${token}";
          const provider = "${provider}";
          
          log("Token recuperado do GitHub com sucesso.", "success");
          log("Domínio atual: " + window.location.origin);
          
          // 1. Verifica window.opener
          if (!window.opener) {
            log("Erro: Janela mãe (window.opener) não encontrada.", "error");
            log("Isso ocorre se a aba principal foi fechada ou se o navegador bloqueou a relação por segurança.", "warn");
            showFailure("Erro de Conexão", "A aba principal de administração não pôde ser encontrada. Por favor, reabra o painel admin e tente fazer login novamente.");
          } else {
            log("Janela mãe (window.opener) detectada.", "success");
            
            // 2. Tenta verificar se há problemas de CORS (Origem Cruzada) acessando uma propriedade segura do opener
            let corsMismatch = false;
            let openerOrigin = null;
            try {
              // Tenta ler a propriedade origin do window.opener se disponível no navegador, ou deduzir
              openerOrigin = window.opener.origin;
              log("Origem da janela mãe: " + (openerOrigin || "Indeterminada (segura)"));
            } catch (e) {
              corsMismatch = true;
              log("CORS Bloqueado ao acessar propriedades diretas do opener. Possível mismatch de subdomínio (ex: www vs sem www).", "warn");
            }

            // Prepara o payload oficial exigido pelo Decap CMS / Netlify CMS
            const payloadData = {
              token: token,
              provider: provider
            };

            const messageStr = "authorization:" + provider + ":success:" + JSON.stringify(payloadData);

            log("Enviando credenciais para o painel principal...");
            
            let sendSuccess = false;
            try {
              // Envia estritamente a string no formato padrão esperado pelo CMS
              window.opener.postMessage(messageStr, "*");
              log("postMessage enviado com sucesso.", "success");
              sendSuccess = true;
            } catch (e) {
              log("Falha ao enviar postMessage: " + e.message, "error");
            }

            if (sendSuccess) {
              showSuccess();
            } else {
              showFailure("Erro no Envio", "Não foi possível transmitir as credenciais para o painel principal.");
            }
          }
        } catch (globalError) {
          log("Erro interno no script: " + globalError.message, "error");
          showFailure("Erro Crítico", "Ocorreu um erro inesperado ao finalizar seu login.");
        }

        function showSuccess() {
          statusIcon.style.animation = 'none';
          statusIcon.style.border = 'none';
          statusIcon.style.width = '48px';
          statusIcon.style.height = '48px';
          statusIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          
          statusTitle.textContent = "Autenticado!";
          statusTitle.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
          statusTitle.style.webkitBackgroundClip = 'text';
          
          statusSubtitle.textContent = "Retornando ao painel administrativo...";
          
          actionArea.innerHTML = '<button class="btn btn-primary" onclick="window.close()">Fechar Janela</button>';
          
          log("Autenticação finalizada. Fechando janela automaticamente em 2.5 segundos...", "success");
          setTimeout(function() {
            window.close();
          }, 2500);
        }

        function showFailure(title, description) {
          statusIcon.style.animation = 'none';
          statusIcon.style.border = 'none';
          statusIcon.style.width = '48px';
          statusIcon.style.height = '48px';
          statusIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
          
          statusTitle.textContent = title;
          statusTitle.style.background = 'linear-gradient(135deg, #f87171, #ef4444)';
          statusTitle.style.webkitBackgroundClip = 'text';
          
          statusSubtitle.innerHTML = description + '<br><br><span style="color:#f87171; font-weight:600;">Por favor, verifique os logs acima para detalhes técnicos.</span>';
          
          actionArea.innerHTML = '<button class="btn btn-primary" onclick="window.close()">Fechar e Tentar Novamente</button>';
        }
      </script>
    </body>
    </html>
  `);
}
