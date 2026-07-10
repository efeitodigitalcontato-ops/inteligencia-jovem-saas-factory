const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'src/content/blog');
const publicDir = path.join(__dirname, 'public');

const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const heroMatch = content.match(/heroImage:\s*"(.*?)"/);
  if (heroMatch) {
    let imgPath = heroMatch[1];
    
    // Check if the file exists in public dir
    let fullPath = path.join(publicDir, imgPath);
    
    if (!fs.existsSync(fullPath)) {
        // sometimes there's a typo or difference in extension due to compression
        let baseImgPath = imgPath.replace(/\.png$/, '.jpg');
        let fullPathJpg = path.join(publicDir, baseImgPath);
        
        if (fs.existsSync(fullPathJpg)) {
            // It was converted to JPG, update reference
            content = content.replace(heroMatch[0], `heroImage: "${baseImgPath}"`);
            content = content.replace(new RegExp(imgPath, 'g'), baseImgPath); // also fix inline
        } else {
            // Missing completely, use placeholder
            content = content.replace(heroMatch[0], 'heroImage: "/placeholder-colchoes.jpg"');
            // also replace any occurrences in the content body with placeholder
            content = content.replace(new RegExp(imgPath, 'g'), '/placeholder-colchoes.jpg');
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        updatedCount++;
    }
  }
}

console.log(`Updated ${updatedCount} files with missing images.`);
