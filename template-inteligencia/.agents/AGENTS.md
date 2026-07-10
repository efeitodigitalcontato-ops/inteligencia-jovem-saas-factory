## Configurações de Rede e Deploy Não-Interativo

1. **Restrição de SSL/TLS local**: Caso comandos de instalação (`npm install`) ou deploys via CLI falhem com erros de certificado SSL/TLS (`unable to verify the first certificate`), execute-os desabilitando a verificação estrita temporariamente:
   - Em linha no Node/Vercel (Windows): É obrigatório contornar a ExecutionPolicy do PowerShell chamando o CMD diretamente sem espaços antes do '&&'. Ex: `cmd /c "set NODE_TLS_REJECT_UNAUTHORIZED=0&& npx.cmd vercel <command> --scope <scope>"`
   - Configuração do NPM: `npm install --strict-ssl=false`
2. **Autenticação Não-Interativa**: Nunca execute chamadas de Git ou CLI que solicitem entrada interativa ou abertura de abas de navegador. Passe os tokens de autenticação diretamente:
   - Git push: `git push https://<token>@github.com/...`
   - Vercel CLI: `npx vercel <command> --token <token> --scope <scope>`

## Regras de Imagens e Deploys de Alta Performance

1. **Imagens de Produtos Reais**: NUNCA utilize imagens de bancos genéricos ou placeholders temporários para produtos recomendados. Sempre gere imagens sob medida de proporção 1:1 ou 3:2 via IA e salve-as localmente na pasta `public/` para garantir uma experiência visual premium de e-commerce real.
2. **Exclusão de node_modules em Deploys**: Sempre garanta a existência de um arquivo `.vercelignore` excluindo `node_modules`, `.git`, e `.astro` para manter o tamanho de upload do Vercel abaixo de 50MB, prevenindo falhas de conexão de rede ou timeouts.

## Regras de CTAs e Conversão Estática

3. **Exibição Consistente de CTAs de Conclusão**: Garanta que o botão "Ver Preço Aqui" apareça na seção final de TODOS os posts de blog. Para artigos que não possuem uma lista estruturada de reviews de produtos (`hasProducts` é falso), insira um bloco condicional alternativo (`.conclusion-cta-standalone`) com estilo de container pastel, garantindo que o botão nunca seja omitido.

## Diretrizes de Compressão e Performance

4. **Conversão Compulsória de Formatos de Imagem**: NUNCA utilize imagens em formato `.png` de tamanho superior a 150KB na pasta `/public`. Todas as imagens pesadas devem ser compactadas e convertidas para `.jpg` com 80% de qualidade através de rotinas GDI+ nativas em PowerShell no ambiente Windows, atualizando recursivamente as referências em arquivos `.astro` e `.md`.

## Diretrizes do Agente Zequinha (Painel Administrativo)

5. **Sveltia CMS e Autenticação GitHub**: Sempre que o usuário solicitar a criação ou correção de um painel de controle administrativo, consulte e utilize a skill `zequinha`. Ela contém o roteiro para configurar o Sveltia CMS de modo drop-in, as funções serverless de OAuth livre de CORS, e o uso de `widget: datetime` com `type: date` para campos de data de publicação sem erros de fuso horário.

## Diretrizes do Agente Lego (Criação de Sites e Blogs Estáticos)

6. **Skill Lego**: Sempre que o usuário iniciar um novo projeto de site, migração ou acionar o codinome `Lego`, consulte e utilize a skill `lego`. Ela contém todas as instruções, diretrizes de isolamento de repositórios/Vercel, remoção de lixo Markdown (sem wrappers de código ou backticks), paginação de 10 itens e compressão compulsória de imagens para PageSpeed ideal.

