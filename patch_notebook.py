import json
with open('C:/Users/Randerson/.gemini/antigravity/brain/b1b1eadf-b397-4527-b956-5cf6a206ed2d/Maquina_Infinita_A100.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        src = cell['source']
        for i, line in enumerate(src):
            if '📤 Publicando no GitHub' in line:
                src = src[:i] + [
                    '        # Fila de Consolidação e Blindagem (Retorna para o frontend enfileirar)\n',
                    '        payload_done = {\n',
                    '            \'type\': \'done_article\',\n',
                    '            \'msg\': f\'✅ Gerado: {slug}.md\',\n',
                    '            \'slug\': slug,\n',
                    '            \'markdown\': markdown\n',
                    '        }\n',
                    '        yield f"data: {json.dumps(payload_done)}\\n\\n"\n'
                ]
                cell['source'] = src
                break

with open('C:/Users/Randerson/.gemini/antigravity/brain/b1b1eadf-b397-4527-b956-5cf6a206ed2d/Maquina_Infinita_A100.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
