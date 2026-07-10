const fs = require('fs');
const path = require('path');
const serverPath = path.join(__dirname, 'server.js');
const content = fs.readFileSync(serverPath, 'utf8');

console.log('--- Occurrences of twoFactor or two_factor ---');
let pos = 0;
while ((pos = content.toLowerCase().indexOf('twofactor', pos)) !== -1) {
  const start = Math.max(0, pos - 150);
  const end = Math.min(content.length, pos + 150);
  console.log(`[${pos}] ...${content.slice(start, end).replace(/\n/g, ' ')}...`);
  pos += 'twoFactor'.length;
}

pos = 0;
while ((pos = content.toLowerCase().indexOf('two_factor', pos)) !== -1) {
  const start = Math.max(0, pos - 150);
  const end = Math.min(content.length, pos + 150);
  console.log(`[${pos}] ...${content.slice(start, end).replace(/\n/g, ' ')}...`);
  pos += 'two_factor'.length;
}
