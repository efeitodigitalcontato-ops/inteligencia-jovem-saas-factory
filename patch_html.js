const fs = require('fs');
const path = 'public/index.html';
let html = fs.readFileSync(path, 'utf8');

const target = `        # GitHub publish
        yield f"data: {json.dumps({'type':'log','msg':'📤 Publicando no GitHub...'})}\\n\\n"
        api_url = f"https://api.github.com/repos/{gh_user}/{repo}/contents/src/content/blog/{slug}.md"
        headers = {"Authorization":f"token {gh_token}","Accept":"application/vnd.github.v3+json"}
        content_b64 = base64.b64encode(md.encode('utf-8')).decode('utf-8')
        sha = None
        try:
            ck = req.get(api_url, headers=headers)
            if ck.status_code == 200: sha = ck.json().get('sha')
        except: pass
        payload = {"message":f"feat: {titulo[:60]}","content":content_b64,"committer":{"name":"Agente Ninja","email":gh_email}}
        if sha: payload["sha"] = sha
        try:
            rr = req.put(api_url, headers=headers, json=payload)
            if rr.status_code in [200,201]:
                yield f"data: {json.dumps({'type':'done','msg':f'✅ Publicado: {slug}.md'})}\\n\\n"
            else:
                yield f"data: {json.dumps({'type':'error','msg':f'GitHub {rr.status_code}'})}\\n\\n"
        except Exception as e:
            yield f"data: {json.dumps({'type':'error','msg':str(e)})}\\n\\n"`;

const replacement = `        # Fila de Consolidação e Blindagem (Retorna para o frontend enfileirar)
        payload_done = {
            'type': 'done_article',
            'msg': f'✅ Gerado: {slug}.md',
            'slug': slug,
            'markdown': md
        }
        yield f"data: {json.dumps(payload_done)}\\n\\n"`;

html = html.replace(target, replacement);
fs.writeFileSync(path, html);
