const fs = require('fs');
const path = require('path');
const serverPath = path.join(__dirname, 'server.js');
const content = fs.readFileSync(serverPath, 'utf8');

const funcs = ['encodeToken', 'decodeToken'];
for (const f of funcs) {
  const idx = content.indexOf(`function ${f}`);
  if (idx !== -1) {
    console.log(content.slice(idx, idx + 1000));
  } else {
    console.log(`Could not find ${f}`);
  }
}
