const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(fullPath, query);
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.vue') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          console.log(`Match in file: ${fullPath}`);
          let pos = 0;
          while ((pos = content.toLowerCase().indexOf(query.toLowerCase(), pos)) !== -1) {
            const start = Math.max(0, pos - 100);
            const end = Math.min(content.length, pos + 100);
            console.log(`  [${pos}] ...${content.slice(start, end).replace(/\n/g, ' ')}...`);
            pos += query.length;
          }
        }
      }
    }
  }
}

console.log('Searching for GitHub Token prompts...');
searchDir(__dirname, 'github');
searchDir(__dirname, 'ghp_');
searchDir(__dirname, 'token');
