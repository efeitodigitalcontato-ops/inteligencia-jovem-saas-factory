const fs = require('fs');
const path = 'C:/Users/Randerson/.gemini/antigravity/brain/b1b1eadf-b397-4527-b956-5cf6a206ed2d/Maquina_Infinita_A100.ipynb';
const nb = JSON.parse(fs.readFileSync(path, 'utf8'));

for (let cell of nb.cells) {
    if (cell.cell_type === 'code') {
        const src = cell.source;
        for (let i = 0; i < src.length; i++) {
            if (src[i].includes('📤 Publicando no GitHub')) {
                cell.source = src.slice(0, i).concat([
                    '        # Fila de Consolidação e Blindagem (Retorna para o frontend enfileirar)\n',
                    '        payload_done = {\n',
                    '            \'type\': \'done_article\',\n',
                    '            \'msg\': f\'✅ Gerado: {slug}.md\',\n',
                    '            \'slug\': slug,\n',
                    '            \'markdown\': markdown\n',
                    '        }\n',
                    '        yield f"data: {json.dumps(payload_done)}\\n\\n"\n'
                ]);
                break;
            }
        }
    }
}

fs.writeFileSync(path, JSON.stringify(nb, null, 1));
