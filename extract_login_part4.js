const fs = require('fs');
const path = require('path');
const serverPath = path.join(__dirname, 'server.js');
const content = fs.readFileSync(serverPath, 'utf8');

const loginIdx = content.indexOf("app.post('/api/login'");
if (loginIdx !== -1) {
  console.log(content.slice(loginIdx + 5000, loginIdx + 8000));
} else {
  console.log('Not found login');
}
