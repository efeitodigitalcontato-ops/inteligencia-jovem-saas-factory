---
name: wordpress_importer
description: Conversor robusto de banco de dados do WordPress (SQL Dump) para arquivos Markdown de coleções do Astro.
---

# WordPress SQL to Astro Importer

Esta habilidade fornece as melhores práticas para ler um arquivo `.sql` de backup do WordPress e gerar páginas estáticas limpas em Markdown para o Astro.

## Diretrizes de Implementação

### 1. Tratamento de Escapes no Parser SQL
Ao ler comandos SQL `INSERT INTO wp_posts`, garanta que as sequências de escape sejam convertidas em caracteres de controle reais, e não mantidas literalmente:
- `\n` -> `\n` (newline)
- `\r` -> `\r` (carriage return)
- `\t` -> `\t` (tab)
- Outros caracteres (como `\'`) devem ser limpos da contrabarra.

### 2. Higienização de Recuos no HTML (Prevenção de Code Blocks)
O Markdown interpreta linhas recuadas por 4 espaços ou 1 tabulação como blocos de código (`<pre><code>`). Para evitar que o HTML importado quebre e renderize código bruto na página:
- Sempre aplique um trim na linha ao escrever o conteúdo do post:
  ```javascript
  const cleanedContent = content.split('\n').map(line => line.trim()).join('\n');
  ```

### 3. Validação do Frontmatter (YAML)
Títulos e resumos com aspas duplas, contrabarras ou colons `:` quebram o analisador de frontmatter.
- Evite regexes manuais de escape.
- Utilize `JSON.stringify(valor)` para formatar as chaves do frontmatter automaticamente no formato correto e seguro do YAML.
