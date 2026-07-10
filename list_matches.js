const fs = require('fs');
const path = require('path');

function searchDir(dir, query, matches) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(fullPath, query, matches);
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          matches.add(fullPath);
        }
      }
    }
  }
}

const matches = new Set();
searchDir(__dirname, 'github-token', matches);
searchDir(__dirname, 'ghp_', matches);
searchDir(__dirname, 'DEFAULT_GITHUB_TOKEN', matches);

console.log('Matching files:');
matches.forEach(m => console.log(' - ' + m));
