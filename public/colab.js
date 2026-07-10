/**
 * colab.js — Lógica de integração com o Google Colab via ngrok
 * GeradorNinja.com.br
 */

// =============================================
// CÓDIGO DA CÉLULA 3 DO COLAB (para exibir ao usuário)
// =============================================
const COLAB_CELL_3_CODE = `# ============================================================
# ♾️ MÁQUINA INFINITA — T4 Free GPU (15GB VRAM)
# Cloudflare Tunnel — sem conta, sem token, 100% grátis
# ============================================================

import subprocess, sys, os, time, threading, re, json, base64
from datetime import datetime

# ── CONFIGURAÇÕES ────────────────────────────────────────────
MODELO      = 'gemma2:9b'
PORTA_FLASK = 5050
GH_USER     = 'efeitodigitalcontato-ops'
GH_EMAIL    = 'efeitodigitalcontato@gmail.com'
NUM_CTX     = 8192
NUM_PREDICT = 4096
# ────────────────────────────────────────────────────────────

def linha(c='═', n=60): print(c * n)
def ok(m):   print(f'      ✅ {m}')
def info(m): print(f'      ℹ️  {m}')

linha()
print('  ♾️  MÁQUINA INFINITA — T4 Free GPU')
print('  Gemma 2:9b · 9 Bilhões de Parâmetros · 15GB VRAM')
linha()


# ══════════════════════════════════════════════════════════════
# ETAPA 1 — Instalar Ollama
# ══════════════════════════════════════════════════════════════
print('\\n[1/5] 🔧 Instalando Ollama...')
os.system('apt-get update -qq && apt-get install -y pciutils lshw zstd -qq 2>/dev/null')
os.system('curl -fsSL https://ollama.com/install.sh | sh 2>/dev/null')
ok('Ollama instalado!')


# ══════════════════════════════════════════════════════════════
# ETAPA 2 — Iniciar Ollama com GPU T4 completa
# ══════════════════════════════════════════════════════════════
print('\\n[2/5] ⚡ Iniciando Ollama (GPU T4 — 15GB VRAM)...')

env = os.environ.copy()
env['OLLAMA_NUM_GPU']           = '99'
env['OLLAMA_GPU_OVERHEAD']      = '0'
env['OLLAMA_MAX_LOADED_MODELS'] = '1'
env['OLLAMA_KEEP_ALIVE']        = '-1'
env['CUDA_VISIBLE_DEVICES']     = '0'

subprocess.Popen(
    ['ollama', 'serve'],
    env=env,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)
time.sleep(8)
ok('Ollama rodando na GPU T4!')


# ══════════════════════════════════════════════════════════════
# ETAPA 3 — Baixar Gemma 2:9b
# ══════════════════════════════════════════════════════════════
print(f'\\n[3/5] 🧠 Baixando {MODELO} (1ª vez: ~3-5 min)...')
info('Na T4 15GB o modelo carrega 100% na VRAM!')
os.system(f'ollama pull {MODELO}')
os.system(f'ollama run {MODELO} "ok" 2>/dev/null')
ok(f'{MODELO} carregado e aquecido!')


# ══════════════════════════════════════════════════════════════
# ETAPA 4 — Instalar dependências
# ══════════════════════════════════════════════════════════════
print('\\n[4/5] 📦 Instalando Flask + Cloudflare Tunnel...')
os.system('pip install flask flask-cors requests -q')

# Instalar cloudflared (sem conta, sem token!)
os.system('wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared')
os.system('chmod +x /usr/local/bin/cloudflared')
ok('Flask + Cloudflare Tunnel prontos!')


# ══════════════════════════════════════════════════════════════
# SERVIDOR FLASK
# ══════════════════════════════════════════════════════════════
print('\\n[5/5] 🌐 Iniciando servidor Flask...')

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import requests as req

app = Flask(__name__)
CORS(app)
OLLAMA_URL = 'http://localhost:11434/api/generate'


@app.route('/status', methods=['GET'])
def status():
    return jsonify({'status': 'online', 'model': MODELO, 'gpu': 'T4 GPU 15GB',
                    'timestamp': datetime.now().isoformat()})


@app.route('/gerar', methods=['POST'])
def gerar():
    data     = request.json or {}
    titulo   = data.get('titulo', '').strip()
    repo     = data.get('repo', 'afiliados-blog-colchoes-inteligencia-jovem')
    gh_token = data.get('gh_token', '')
    gh_user  = data.get('gh_user', GH_USER)
    gh_email = data.get('gh_email', GH_EMAIL)

    if not titulo:
        return jsonify({'error': 'Título vazio'}), 400

    def generate():
        yield f"data: {json.dumps({'type':'log','msg':f'🧠 Gerando: {titulo}'})}\\n\\n"

        prompt = f"""Você é o Agente Ninja, redator profissional especialista em SEO e marketing de afiliados.
Escreva um artigo completo de blog, extremamente detalhado e persuasivo, sobre:

TÍTULO: "{titulo}"

REGRAS CRÍTICAS:
1. Markdown limpo. Use ## e ### para subtítulos, - para listas. NUNCA use blocos de código com aspas triplas.
2. NÃO inclua o H1 — comece direto com a introdução.
3. O conteúdo deve ser escrito em português do Brasil, sendo permitido usar termos em inglês apenas para nomes de produtos, marcas e modelos. Use um tom amigável, cativante e premium.
4. Mínimo de 6 seções com ## e pelo menos 3-4 parágrafos densos cada.
5. Não inclua uma seção com lista de produtos recomendados com bullets detalhados.
6. Inclua uma seção de FAQ com 5 perguntas e respostas.
7. Tom persuasivo de afiliado — incentive a compra de forma natural.
8. Artigo longo e rico (mínimo 1500 palavras).
9. Não descreva imagens que não existem ou que não estão no texto.
10. NUNCA adicione tags, hashtags ou blocos com o caractere '#' (como #colchão, #sono, etc.) no meio ou no final do texto. Qualquer listagem de tags ou hashtags é terminantemente proibida fora do formato da última linha [TAGS: ...].
11. Não mencione links de produtos no meio do texto.

PRIMEIRA LINHA (obrigatório):
[SEO_DESCRIPTION: meta descrição de 140-160 caracteres]

ÚLTIMA LINHA (obrigatório):
[TAGS: tag1, tag2, tag3, tag4, tag5]"""

        full_text = ''
        try:
            r = req.post(OLLAMA_URL, json={
                'model': MODELO, 'prompt': prompt, 'stream': True,
                'options': {'num_gpu': 99, 'num_ctx': NUM_CTX,
                            'num_predict': NUM_PREDICT, 'temperature': 0.7,
                            'top_p': 0.9, 'repeat_penalty': 1.1}
            }, stream=True, timeout=600)
            for line in r.iter_lines():
                if line:
                    chunk = json.loads(line.decode('utf-8'))
                    token = chunk.get('response', '')
                    full_text += token
                    yield f"data: {json.dumps({'type':'token','token':token})}\\n\\n"
                    if chunk.get('done'): break
        except Exception as e:
            yield f"data: {json.dumps({'type':'error','msg':str(e)})}\\n\\n"
            return

        # Extrair SEO
        seo_desc = ''
        m = re.search(r'\\[SEO_DESCRIPTION:\\s*(.*?)\\]', full_text)
        if m:
            seo_desc = m.group(1).strip()
            full_text = full_text.replace(m.group(0), '').strip()
        if not seo_desc: seo_desc = titulo[:155]

        # Extrair tags
        tags_list = []
        t = re.search(r'\\[TAGS:\\s*(.*?)\\]', full_text)
        if t:
            tags_list = [x.strip() for x in t.group(1).split(',')]
            full_text = full_text.replace(t.group(0), '').strip()

        # Slug
        slug = titulo.lower()
        for chars, rep in [('áàãâä','a'),('éèêë','e'),('íìîï','i'),
                            ('óòõôö','o'),('úùûü','u'),('ç','c')]:
            for ch in chars: slug = slug.replace(ch, rep)
        slug = re.sub(r'[^a-z0-9\\s-]', '', slug)
        slug = re.sub(r'[\\s_]+', '-', slug).strip('-')[:80]

        # Frontmatter
        pub_date  = datetime.now().strftime('%Y-%m-%d')
        tags_yaml = '\\n'.join([f'  - "{tg}"' for tg in tags_list]) if tags_list else '  - "colchão"'
        markdown  = f"""---
title: {json.dumps(titulo, ensure_ascii=False)}
description: {json.dumps(seo_desc, ensure_ascii=False)}
pubDate: "{pub_date}"
heroImage: "/images/{slug}.jpg"
tags:
{tags_yaml}
---

""" + full_text

        # --------------------------------------------------------
        # FILA DE CONSOLIDAÇÃO (LOTES DE 25)
        # --------------------------------------------------------
        # Retorna o arquivo gerado para o frontend, que fará o deploy apenas a cada 25 artigos
        payload_done = {
            'type': 'done_article',
            'msg': f'✅ Gerado e enviado para a fila: {slug}.md',
            'slug': slug,
            'markdown': markdown
        }
        yield f"data: {json.dumps(payload_done)}\\n\\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream',
                    headers={'X-Accel-Buffering': 'no', 'Cache-Control': 'no-cache'})


@app.route('/deploy', methods=['POST'])
def deploy():
    return jsonify({'status': 'ok'})


# ══════════════════════════════════════════════════════════════
# INICIAR FLASK + CLOUDFLARE TUNNEL (sem conta, sem token!)
# ══════════════════════════════════════════════════════════════

# Flask em thread separada
flask_thread = threading.Thread(
    target=lambda: app.run(port=PORTA_FLASK, threaded=True, use_reloader=False),
    daemon=True
)
flask_thread.start()
time.sleep(3)
ok('Flask rodando na porta 5050!')

# Cloudflare Tunnel — captura a URL do output
print('\\n🔗 Abrindo Cloudflare Tunnel (aguarde ~15 segundos)...')
cf_proc = subprocess.Popen(
    ['cloudflared', 'tunnel', '--url', f'http://localhost:{PORTA_FLASK}'],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT
)

public_url = None
timeout = time.time() + 60  # aguarda até 60s
while time.time() < timeout:
    line = cf_proc.stdout.readline().decode('utf-8', errors='ignore')
    match = re.search(r'https://[a-z0-9\\-]+\\.trycloudflare\\.com', line)
    if match:
        public_url = match.group(0)
        break

if not public_url:
    public_url = '❌ Erro ao obter URL — reinicie a célula'
else:
    try:
        import re
        email_key = re.sub(r'[^a-zA-Z0-9]', '', '{{USER_EMAIL}}')
        req.post(f'https://ntfy.sh/gninja_{email_key}', data=public_url, timeout=10)
        
        res = req.post('https://geradorninja.com.br/api/register-tunnel', json={'email': '{{USER_EMAIL}}', 'tunnel_url': public_url}, timeout=10)
        if res.status_code != 200:
            print(f"⚠️ Aviso: Falha ao enviar URL para servidor principal. Usando fallback P2P.")
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível enviar a URL automaticamente para o site. Erro: {e}")



# ══════════════════════════════════════════════════════════════
# PRONTO!
# ══════════════════════════════════════════════════════════════
print('\\n')
linha('★')
print('  ♾️  MÁQUINA INFINITA PRONTA!')
print(f'  🧠 {MODELO}  |  T4 GPU 15GB  |  Cloudflare Tunnel')
linha('★')
print()
print(f'  🔗 URL: {public_url}')
print()
linha('─')
print('  PRÓXIMOS PASSOS:')
print('  1. Copie a URL acima')
print('  2. Acesse geradorninja.com.br')
print('  3. Artigos em Lote → ♾️ Máquina Infinita')
print('  4. Cole a URL → Testar → cole temas → Gerar')
print()
print('  ✅ MINIMIZE ESTA ABA — só o site fica aberto!')
linha('─')

# Manter vivo com ping a cada 60s para não descarregar da GPU
import requests as req
try:
    while True:
        time.sleep(60)
        try:
            req.post('http://localhost:11434/api/generate',
                     json={'model': MODELO, 'prompt': '.', 'stream': False,
                           'options': {'num_predict': 1}}, timeout=10)
        except: pass
except KeyboardInterrupt:
    print('\\n⏹ Máquina Infinita encerrada.')
    cf_proc.terminate()
`;

// =============================================
// Override fetch to include token automatically
const originalFetch = window.fetch;
window.fetch = async function (resource, options = {}) {
  const url = typeof resource === 'string' ? resource : (resource && resource.url);
  if (url && (url.startsWith('/api/') || url.includes('/api/')) && !url.includes('/api/config')) {
    const token = localStorage.getItem('saas_token');
    if (token) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return originalFetch(resource, options);
};

// ESTADO GLOBAL
// =============================================
let ngrokBase = '';
let isGenerating = false;
let shouldStop = false;
let timerInterval = null;
let startTime = 0;
let okCount = 0;
let failCount = 0;
let totalCount = 0;
let processedCount = 0;

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Carregar valores salvos
  const savedUrl   = localStorage.getItem('colabNinjaUrl') || '';
  const savedToken = localStorage.getItem('colabNinjaToken') || '';

  const ngrokInput   = document.getElementById('ngrokUrl');
  const tokenInput   = document.getElementById('githubToken');
  const topicsArea   = document.getElementById('topicsTextarea');
  const cell3Pre     = document.getElementById('cell3Code');

  let activeColabCode = COLAB_CELL_3_CODE;
  window.currentUserProfile = null;

  if (savedUrl)   { ngrokInput.value = savedUrl; ngrokBase = savedUrl.replace(/\/$/, ''); }
  if (savedToken) { tokenInput.value = savedToken; }

  // Sync githubToken when blog selection changes
  const blogSelect = document.getElementById('blogSelect');
  if (blogSelect) {
    blogSelect.addEventListener('change', () => {
      const selectedBlog = blogSelect.value;
      if (selectedBlog) {
        const savedTokenForBlog = localStorage.getItem('colabNinjaToken_' + selectedBlog) || localStorage.getItem('colabNinjaToken') || '';
        const tokenInput = document.getElementById('githubToken');
        if (tokenInput) tokenInput.value = savedTokenForBlog;
      }
    });
  }

  // Save githubToken per blog on input change
  if (tokenInput) {
    tokenInput.addEventListener('input', () => {
      const token = tokenInput.value.trim();
      const blogSelect = document.getElementById('blogSelect');
      if (token) {
        localStorage.setItem('colabNinjaToken', token);
        if (blogSelect && blogSelect.value) {
          localStorage.setItem('colabNinjaToken_' + blogSelect.value, token);
        }
      }
    });
  }

  // Injetar código da célula 3
  if (cell3Pre) cell3Pre.textContent = COLAB_CELL_3_CODE;

  // Contador de temas em tempo real
  topicsArea.addEventListener('input', updateTopicsCounter);

  // Carregar blogs disponíveis
  loadBlogs();

  // Toggle Célula 3
  const showBtn = document.getElementById('showCell3Btn');
  if (showBtn) {
    showBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const block = document.getElementById('cell3CodeBlock');
      if (block.style.display === 'none') {
        block.style.display = 'block';
        showBtn.textContent = 'Ocultar código ↑';
      } else {
        block.style.display = 'none';
        showBtn.textContent = 'Ver código da Célula 3 →';
      }
    });
  }

  // Auto-test se URL já estava salva
  if (savedUrl) {
    setTimeout(() => testConnection(true), 800);
  }

  // Carregar dados de perfil do usuário logado
  loadUserProfile();
});

// =============================================
// CARREGAR BLOGS
// =============================================
async function loadBlogs() {
  const sel = document.getElementById('blogSelect');
  try {
    const res  = await fetch('/api/all-blogs');
    const data = await res.json();
    if (data.blogs && data.blogs.length > 0) {
      sel.innerHTML = '';
      data.blogs.forEach(b => {
        const opt   = document.createElement('option');
        opt.value   = b.repoName;
        const label = b.repoName.replace('afiliados-blog-', '').replace(/-inteligencia-jovem$/, '').toUpperCase();
        const domain = b.deployUrl ? b.deployUrl.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '') : '';
        opt.textContent = domain ? `${label} (${domain})` : label;
        sel.appendChild(opt);
      });
      // Load stored token for the first selected blog
      if (sel.value) {
        const savedTokenForBlog = localStorage.getItem('colabNinjaToken_' + sel.value) || localStorage.getItem('colabNinjaToken') || '';
        const tokenInput = document.getElementById('githubToken');
        if (tokenInput && !tokenInput.value) tokenInput.value = savedTokenForBlog;
      }
    }
  } catch (_) {
    // Manter o option padrão (colchões)
  }
}

// =============================================
// CARREGAR E ATUALIZAR DADOS DO PERFIL
// =============================================
let activeColabCode = COLAB_CELL_3_CODE;

async function loadUserProfile() {
  try {
    const res = await fetch('/api/profile');
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        window.currentUserProfile = data.user;
        
        // Preencher email e tokens nos inputs correspondentes
        const emailInput = document.getElementById('userEmail');
        if (emailInput) {
          emailInput.value = data.user.email || '';
        }
        
        const ghInput = document.getElementById('githubToken');
        if (ghInput && data.user.githubToken) {
          ghInput.value = data.user.githubToken;
        }

        const vInput = document.getElementById('vercelToken');
        if (vInput && data.user.vercelToken) {
          vInput.value = data.user.vercelToken;
        }
        
        // Ajustar código da célula 3 dinamicamente
        updateColabCode(data.user);
      }
    }
  } catch (err) {
    console.error('Erro ao carregar dados do usuário:', err);
  }
}

function updateColabCode(userProfile) {
  let ghUser = 'efeitodigitalcontato-ops';
  let ghEmail = 'efeitodigitalcontato@gmail.com';
  
  const email = (userProfile && userProfile.email) ? userProfile.email.toLowerCase() : '';
  
  // REGRA: randersoncontato@gmail.com NUNCA DEVE SER ALTERADO (mantém o código original)
  if (email === 'randersoncontato@gmail.com') {
    ghUser = 'efeitodigitalcontato-ops';
    ghEmail = 'efeitodigitalcontato@gmail.com';
    renderCode(ghUser, ghEmail, email);
  } else if (userProfile && userProfile.githubToken) {
    // Buscar login do GitHub a partir do token
    fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${userProfile.githubToken}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data && data.login) {
        ghUser = data.login;
        ghEmail = data.email || userProfile.email || 'user@noreply.github.com';
      } else {
        ghUser = 'seu-usuario-github';
        ghEmail = userProfile.email || 'seu-email@github.com';
      }
      renderCode(ghUser, ghEmail, email);
    })
    .catch(err => {
      console.error('Erro ao decodificar token GitHub:', err);
      renderCode('seu-usuario-github', userProfile.email || 'seu-email@github.com', email);
    });
  } else {
    renderCode('seu-usuario-github', email || 'seu-email@github.com', email);
  }
}

function renderCode(ghUser, ghEmail, accountEmail) {
  let code = COLAB_CELL_3_CODE;
  // Substituir os valores hardcoded do template pelo do usuário atual
  code = code.replace("GH_USER     = 'efeitodigitalcontato-ops'", `GH_USER     = '${ghUser}'`);
  code = code.replace("GH_EMAIL    = 'efeitodigitalcontato@gmail.com'", `GH_EMAIL    = '${ghEmail}'`);
  
  const emailToUse = accountEmail || ghEmail || 'efeitodigitalcontato@gmail.com';
  code = code.replace(/\{\{USER_EMAIL\}\}/g, emailToUse);
  
  activeColabCode = code;
  
  const cell3Pre = document.getElementById('cell3Code');
  if (cell3Pre) {
    cell3Pre.textContent = code;
  }
}

async function saveTokensToServer() {
  const ghToken = document.getElementById('githubToken').value.trim();
  const vToken = document.getElementById('vercelToken').value.trim();
  const btn = document.getElementById('saveTokensBtn');
  
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Salvando...';
  }
  
  try {
    const res = await fetch('/api/save-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        githubToken: ghToken,
        vercelToken: vToken
      })
    });
    
    if (res.ok) {
      const result = await res.json();
      showToast('✅ Credenciais salvas com sucesso!');
      if (result.user) {
        window.currentUserProfile = result.user;
        updateColabCode(result.user);
      }
    } else {
      const err = await res.json();
      showToast('❌ Erro ao salvar: ' + (err.error || 'Erro desconhecido'), 'error');
    }
  } catch (e) {
    showToast('❌ Erro de conexão ao salvar tokens.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '💾 Salvar Tokens na Conta';
    }
  }
}

// =============================================
// CONTADOR DE TEMAS
// =============================================
function updateTopicsCounter() {
  const lines = document.getElementById('topicsTextarea').value
    .split('\n')
    .map(l => cleanTitle(l))
    .filter(l => l.length > 0);
  const counter = document.getElementById('topicsCounter');
  counter.textContent = `${lines.length} tema${lines.length !== 1 ? 's' : ''}`;
}

// Limpa títulos numerados: "1. Título" → "Título"
function cleanTitle(raw) {
  return raw.replace(/^\s*\d+[\.\)]\s*/, '').trim();
}

// =============================================
// TESTAR CONEXÃO
// =============================================
async function testConnection(silent = false) {
  const input  = document.getElementById('ngrokUrl');
  const badge  = document.getElementById('statusBadge');
  const text   = document.getElementById('statusText');
  const btn    = document.getElementById('testBtn');
  const info   = document.getElementById('modelInfo');

  const url = input.value.trim().replace(/\/$/, '');
  if (!url) {
    if (!silent) alert('Cole a URL do Colab primeiro!');
    return;
  }

  ngrokBase = url;
  btn.disabled = true;
  btn.textContent = '🔄 Testando...';
  badge.className = 'status-badge checking';
  text.textContent = 'Verificando...';
  info.style.display = 'none';

  try {
    const res  = await fetch(`${url}/status`, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();

    if (data.status === 'online') {
      badge.className = 'status-badge online';
      text.textContent = 'Colab Online ✓';
      info.style.display = 'block';
      info.innerHTML = `🧠 Modelo: <strong style="color:#a78bfa">${data.model || 'gemma2:2b'}</strong> &nbsp;·&nbsp; ⏱ ${new Date(data.timestamp).toLocaleTimeString('pt-BR')}`;
      markStep(1, true);
      markStep(2, true);
    } else {
      throw new Error('Status inesperado');
    }
  } catch (err) {
    badge.className = 'status-badge offline';
    text.textContent = 'Desconectado';
    if (!silent) {
      appendLog(`❌ Falha ao conectar: ${err.message}\nVerifique se o Colab está rodando e a URL está correta.`, 'err');
    }
  } finally {
    btn.disabled = false;
    btn.textContent = '🔍 Testar';
  }
}

// =============================================
// SALVAR URL E TOKEN
// =============================================
function saveUrl() {
  const url   = document.getElementById('ngrokUrl').value.trim().replace(/\/$/, '');
  const token = document.getElementById('githubToken').value.trim();
  if (url) {
    localStorage.setItem('colabNinjaUrl', url);
    ngrokBase = url;
  }
  if (token) {
    localStorage.setItem('colabNinjaToken', token);
    const blogSelect = document.getElementById('blogSelect');
    if (blogSelect && blogSelect.value) {
      localStorage.setItem('colabNinjaToken_' + blogSelect.value, token);
    }
  }
  showToast('💾 Salvado no navegador!');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(99,102,241,0.9);color:#fff;padding:0.7rem 1.5rem;border-radius:12px;font-size:0.85rem;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:opacity 0.5s ease;';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 2000);
}

// =============================================
// COPIAR CÉLULA 3
// =============================================
function copyCell3() {
  navigator.clipboard.writeText(activeColabCode).then(() => showToast('✅ Código copiado!'));
}

// =============================================
// MARCAR PASSO COMO CONCLUÍDO
// =============================================
function markStep(n, done) {
  const card = document.getElementById(`step${n}Card`);
  const num  = document.getElementById(`step${n}Num`);
  if (card && done) {
    card.classList.add('done');
    num.textContent = '✓';
  }
}

// =============================================
// LOG BOX
// =============================================
function appendLog(msg, type = 'info') {
  const box = document.getElementById('logBox');
  const line = document.createElement('span');
  line.className = `log-${type}`;
  line.textContent = msg + '\n';
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function clearLog() {
  document.getElementById('logBox').innerHTML = '';
}

// =============================================
// TIMER
// =============================================
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const m = String(Math.floor(diff / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    document.getElementById('progressTimer').textContent = `${m}:${s}`;

    // Calcular velocidade (artigos/hora)
    if (processedCount > 0 && diff > 0) {
      const rate = Math.round((processedCount / diff) * 3600);
      document.getElementById('chipSpeed').textContent = `⚡ ~${rate} art/h`;
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

// =============================================
// ATUALIZAR CHIPS
// =============================================
function updateChips(ok, fail, pending) {
  document.getElementById('chipOk').textContent      = `✅ ${ok} concluído${ok !== 1 ? 's' : ''}`;
  document.getElementById('chipFail').textContent    = `❌ ${fail} falha${fail !== 1 ? 's' : ''}`;
  document.getElementById('chipPending').textContent = `⏳ ${pending} restante${pending !== 1 ? 's' : ''}`;
}

// =============================================
// PARAR GERAÇÃO
// =============================================
function stopGeneration() {
  shouldStop = true;
  document.getElementById('progressStatus').textContent = '⏹ Parando após artigo atual...';
  document.getElementById('stopBtn').disabled = true;
  appendLog('⏹ Parada solicitada — aguardando fim do artigo atual.', 'info');
}

// =============================================
// GERAR UM ARTIGO VIA SSE
// =============================================
async function generateOne(titulo, repo, ghToken, ghEmail) {
  return new Promise(async (resolve) => {
    clearLog();
    const currentEl = document.getElementById('currentArticle');
    const currentTitleEl = document.getElementById('currentTitle');
    currentEl.classList.add('visible');
    currentTitleEl.textContent = titulo;

    try {
      const res = await fetch(`${ngrokBase}/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, repo, gh_token: ghToken, gh_email: ghEmail })
      });

      if (!res.ok) {
        appendLog(`❌ Servidor retornou ${res.status}`, 'err');
        return resolve(false);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let result = null;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (!value) continue;

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.substring(6).trim();
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'token') {
              document.getElementById('logBox').textContent += data.token;
              document.getElementById('logBox').scrollTop = document.getElementById('logBox').scrollHeight;
            } else if (data.type === 'log') {
              appendLog(data.msg, 'info');
            } else if (data.type === 'done') {
              appendLog('\n' + (data.msg || '✅ Artigo publicado!'), 'ok');
              result = true;
              if (typeof ASMR !== 'undefined' && ASMR.playCashRegister) {
                ASMR.playCashRegister();
              } else if (window.parent && window.parent.ASMR && window.parent.ASMR.playCashRegister) {
                window.parent.ASMR.playCashRegister();
              }
            } else if (data.type === 'done_article') {
              appendLog('\n' + (data.msg || '📥 Enfileirando artigo no navegador...'), 'info');
              
              // Salvar no localStorage do navegador
              const queueKey = `ninja_queue_${repo}`;
              let localQueue = [];
              try {
                localQueue = JSON.parse(localStorage.getItem(queueKey) || '[]');
              } catch(e) {}
              
              localQueue.push({
                fileName: data.slug + '.md',
                content: data.markdown
              });
              localStorage.setItem(queueKey, JSON.stringify(localQueue));
              
              // Envia também para o servidor (retrocompatibilidade)
              try {
                await fetch('/api/queue-single-post', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    repoName: repo,
                    fileName: data.slug + '.md',
                    content: data.markdown,
                    githubToken: ghToken,
                    userEmail: ghEmail
                  })
                });
              } catch (e) {}

              appendLog('\n✅ Artigo salvo na fila temporária do navegador.', 'ok');
              result = true;
              if (typeof ASMR !== 'undefined' && ASMR.playCashRegister) {
                ASMR.playCashRegister();
              } else if (window.parent && window.parent.ASMR && window.parent.ASMR.playCashRegister) {
                window.parent.ASMR.playCashRegister();
              }
            } else if (data.type === 'error') {
              appendLog(`\n❌ ${data.msg}`, 'err');
              result = false;
            }
          } catch (_) {}
        }
      }

      resolve(result !== null ? result : true);
    } catch (err) {
      appendLog(`❌ Erro de conexão: ${err.message}`, 'err');
      resolve(false);
    }
  });
}

// =============================================
// INICIAR GERAÇÃO EM LOTE
// =============================================
async function startGeneration() {
  // Validações
  if (!ngrokBase) {
    alert('Configure e teste a URL do Colab primeiro!');
    return;
  }

  const repo    = document.getElementById('blogSelect').value;
  const ghToken = document.getElementById('githubToken').value.trim();
  const ghEmail = (window.currentUserProfile && window.currentUserProfile.email) || 'efeitodigitalcontato@gmail.com';

  if (!ghToken) {
    alert('Insira o Token do GitHub (ghp_...)!');
    document.getElementById('githubToken').focus();
    return;
  }

  const rawLines = document.getElementById('topicsTextarea').value
    .split('\n')
    .map(l => cleanTitle(l))
    .filter(l => l.length > 0);

  if (rawLines.length === 0) {
    alert('Cole pelo menos 1 tema!');
    return;
  }

  // Verificar conexão
  const badge = document.getElementById('statusBadge');
  if (!badge.classList.contains('online')) {
    if (!confirm('O Colab parece estar desconectado. Tentar assim mesmo?')) return;
  }

  // Reset state
  isGenerating   = true;
  shouldStop     = false;
  okCount        = 0;
  failCount      = 0;
  totalCount     = rawLines.length;
  processedCount = 0;

  // UI
  document.getElementById('generateBtn').disabled = true;
  document.getElementById('generateBtn').innerHTML = '<span class="spin">⚙️</span> Gerando...';
  document.getElementById('stopBtn').style.display = 'flex';
  document.getElementById('stopBtn').disabled = false;
  document.getElementById('progressArea').classList.add('visible');
  document.getElementById('progressFill').style.width = '0%';
  clearLog();
  updateChips(0, 0, totalCount);
  markStep(3, true);
  startTimer();

  appendLog(`🚀 Iniciando geração de ${totalCount} artigos com Gemma 2:9b\n`, 'info');

  // Loop de geração sequencial
  for (let i = 0; i < rawLines.length; i++) {
    if (shouldStop) {
      appendLog('\n⏹ Geração interrompida pelo usuário.', 'info');
      break;
    }

    const titulo  = rawLines[i];
    const pending = totalCount - i - 1;

    document.getElementById('progressStatus').textContent = `🧠 Gerando ${i + 1}/${totalCount}`;
    document.getElementById('progressFill').style.width   = `${(i / totalCount) * 100}%`;
    updateChips(okCount, failCount, pending);

    appendLog(`\n[${i + 1}/${totalCount}] "${titulo}"`, 'info');

    const success = await generateOne(titulo, repo, ghToken, ghEmail);
    processedCount++;

    if (success) {
      okCount++;
    } else {
      failCount++;
      appendLog(`❌ Falhou: ${titulo}`, 'err');
    }

    updateChips(okCount, failCount, totalCount - processedCount);
  }

  // Finalizar
  stopTimer();
  isGenerating = false;
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('currentArticle').classList.remove('visible');
  document.getElementById('generateBtn').disabled = false;
  document.getElementById('generateBtn').innerHTML = '🚀 Gerar Artigos com Gemma 2:9b';
  document.getElementById('stopBtn').style.display = 'none';

  const allOk = failCount === 0;
  document.getElementById('progressStatus').textContent = allOk
    ? `🎉 Todos os ${totalCount} artigos publicados!`
    : `⚠️ ${okCount} OK · ${failCount} falha(s) de ${totalCount}`;

  if (allOk) {
    appendLog(`\n\n🎉 CONCLUÍDO! ${totalCount} artigos gerados e publicados no GitHub.\nA Vercel reconstruirá o site automaticamente em alguns minutos.`, 'ok');
  } else {
    appendLog(`\n⚠️ Finalizado: ${okCount}/${totalCount} artigos. ${failCount} falharam.`, 'info');
  }
}

// =============================================
// DEPLOY VERCEL
// =============================================
async function triggerDeploy() {
  const btn = document.getElementById('deployBtn');
  const repo = document.getElementById('blogSelect').value;
  const ghToken = document.getElementById('githubToken').value.trim();
  const ghEmail = (window.currentUserProfile && window.currentUserProfile.email) || 'efeitodigitalcontato@gmail.com';

  const queueKey = `ninja_queue_${repo}`;
  let localQueue = [];
  try {
    localQueue = JSON.parse(localStorage.getItem(queueKey) || '[]');
  } catch(e) {}

  if (localQueue.length === 0) {
    alert('Nenhum artigo na fila local do navegador para fazer deploy.');
    return;
  }

  if (!confirm(`Fazer push de ${localQueue.length} artigos para o GitHub e acionar o rebuild na Vercel?`)) return;

  btn.disabled = true;
  btn.innerHTML = '⏳ Deployando...';

  try {
    const res = await fetch('/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        blog: repo,
        articles: localQueue,
        githubToken: ghToken,
        userEmail: ghEmail
      })
    });
    
    if (res.ok) {
      localStorage.removeItem(queueKey);
      showToast('✅ Deploy solicitado! A Vercel está compilando.');
      appendLog(`\n🚀 [DEPLOY COM SUCESSO] ${localQueue.length} posts enviados para o GitHub!`, 'ok');
    } else {
      const err = await res.json();
      showToast(`❌ Falha no deploy: ${err.error || 'Erro desconhecido'}`);
    }
  } catch (err) {
    showToast(`❌ Erro de conexão: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✈️ Deploy Vercel';
  }
}
