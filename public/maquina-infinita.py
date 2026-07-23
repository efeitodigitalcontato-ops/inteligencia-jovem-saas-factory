# ============================================================
# ♾️ MÁQUINA INFINITA — T4 Free GPU (15GB VRAM)
# Cloudflare Tunnel — sem conta, sem token, 100% grátis
# ============================================================

import subprocess, sys, os, time, threading, re, json, base64
from datetime import datetime

# ── CONFIGURAÇÕES ────────────────────────────────────────────
MODELO      = 'gemma2:2b'
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
print('  ♾️  MÁQUINA INFINITA — CPU/GPU Light')
print('  Gemma 2:2b · 2 Bilhões de Parâmetros · Leve para CPU/GPU')
linha()


# ══════════════════════════════════════════════════════════════
# ETAPA 1 — Instalar Ollama
# ══════════════════════════════════════════════════════════════
print('\n[1/5] 🔧 Instalando Ollama...')
os.system('apt-get update -qq && apt-get install -y pciutils lshw zstd -qq 2>/dev/null')
os.system('curl -fsSL https://ollama.com/install.sh | sh 2>/dev/null')
ok('Ollama instalado!')


# ══════════════════════════════════════════════════════════════
# ETAPA 2 — Iniciar Ollama com GPU T4 completa
# ══════════════════════════════════════════════════════════════
print('\n[2/5] ⚡ Iniciando Ollama (GPU T4 — 15GB VRAM)...')

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
# ETAPA 3 — Baixar Gemma 2:2b
# ══════════════════════════════════════════════════════════════
print(f'\n[3/5] 🧠 Baixando {MODELO} (1ª vez: ~1-2 min)...')
info('Modelo super leve, ideal para CPU ou GPU!')
os.system(f'ollama pull {MODELO}')
os.system(f'ollama run {MODELO} "ok" 2>/dev/null')
ok(f'{MODELO} carregado e aquecido!')


# ══════════════════════════════════════════════════════════════
# ETAPA 4 — Instalar dependências
# ══════════════════════════════════════════════════════════════
print('\n[4/5] 📦 Instalando Flask + Cloudflare Tunnel...')
os.system('pip install flask flask-cors requests -q')

# Instalar cloudflared (sem conta, sem token!)
os.system('wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared')
os.system('chmod +x /usr/local/bin/cloudflared')
ok('Flask + Cloudflare Tunnel prontos!')


# ══════════════════════════════════════════════════════════════
# SERVIDOR FLASK
# ══════════════════════════════════════════════════════════════
print('\n[5/5] 🌐 Iniciando servidor Flask...')

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import requests as req

app = Flask(__name__)
CORS(app)
OLLAMA_URL = 'http://localhost:11434/api/generate'



@app.route('/chat', methods=['POST'])
@app.route('/api/generate', methods=['POST'])
def proxy_ollama_chat_api():
    try:
        data = request.json or {}
        prompt = data.get('prompt', '')
        if not prompt:
            msg = data.get('message', '')
            prompt = f"Você é a Safira, a assistente IA especialista do Gerador Ninja. Responda em português.

Usuário: {msg}
Safira:"
        
        model_name = data.get('model', MODELO)
        r = req.post(OLLAMA_URL, json={
            'model': model_name,
            'prompt': prompt,
            'stream': False
        }, timeout=120)
        
        if r.status_code == 200:
            res_json = r.json()
            return jsonify({'response': res_json.get('response', ''), 'reply': res_json.get('response', ''), 'status': 'ok'})
        return jsonify({'error': 'Ollama error', 'details': r.text}), r.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
        yield f"data: {json.dumps({'type':'log','msg':f'🧠 Gerando: {titulo}'})}\n\n"

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
                    yield f"data: {json.dumps({'type':'token','token':token})}\n\n"
                    if chunk.get('done'): break
        except Exception as e:
            yield f"data: {json.dumps({'type':'error','msg':str(e)})}\n\n"
            return

        # Extrair SEO
        seo_desc = ''
        m = re.search(r'\[SEO_DESCRIPTION:\s*(.*?)\]', full_text)
        if m:
            seo_desc = m.group(1).strip()
            full_text = full_text.replace(m.group(0), '').strip()
        if not seo_desc: seo_desc = titulo[:155]

        # Extrair tags
        tags_list = []
        t = re.search(r'\[TAGS:\s*(.*?)\]', full_text)
        if t:
            tags_list = [x.strip() for x in t.group(1).split(',')]
            full_text = full_text.replace(t.group(0), '').strip()

        # Slug
        slug = titulo.lower()
        for chars, rep in [('áàãâä','a'),('éèêë','e'),('íìîï','i'),
                            ('óòõôö','o'),('úùûü','u'),('ç','c')]:
            for ch in chars: slug = slug.replace(ch, rep)
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s_]+', '-', slug).strip('-')[:80]

        # Frontmatter
        pub_date  = datetime.now().strftime('%Y-%m-%d')
        tags_yaml = '\n'.join([f'  - "{tg}"' for tg in tags_list]) if tags_list else '  - "colchão"'
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
        yield f"data: {json.dumps(payload_done)}\n\n"

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
print('\n🔗 Abrindo Cloudflare Tunnel (aguarde ~15 segundos)...')
cf_proc = subprocess.Popen(
    ['cloudflared', 'tunnel', '--url', f'http://localhost:{PORTA_FLASK}'],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT
)

public_url = None
timeout = time.time() + 60  # aguarda até 60s
while time.time() < timeout:
    line = cf_proc.stdout.readline().decode('utf-8', errors='ignore')
    match = re.search(r'https://[a-z0-9\-]+\.trycloudflare\.com', line)
    if match:
        public_url = match.group(0)
        break

if not public_url:
    public_url = '❌ Erro ao obter URL — reinicie a célula'
else:
    try:
        import re
        email_key = re.sub(r'[^a-zA-Z0-9]', '', 'efeitodigital2@gmail.com')
        req.post(f'https://ntfy.sh/gninja_{email_key}', data=public_url, timeout=10)
        
        res = req.post('https://geradorninja.com.br/api/register-tunnel', json={'email': 'efeitodigital2@gmail.com', 'tunnel_url': public_url}, timeout=10)
        if res.status_code != 200:
            print(f"⚠️ Aviso: Falha ao enviar URL para servidor principal. Usando fallback P2P.")
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível enviar a URL automaticamente para o site. Erro: {e}")



# ══════════════════════════════════════════════════════════════
# PRONTO!
# ══════════════════════════════════════════════════════════════
print('\n')
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
    print('\n⏹ Máquina Infinita encerrada.')
    cf_proc.terminate()
