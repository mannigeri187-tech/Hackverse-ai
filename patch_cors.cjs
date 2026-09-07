const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js')) results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(process.cwd(), 'api'));
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("'Access-Control-Allow-Origin', '*'")) {
    content = content.replace(/'Access-Control-Allow-Origin', '\*'/g, "'Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://hackverse-ai.vercel.app'");
    fs.writeFileSync(file, content);
    count++;
  }
});
console.log('Patched CORS in ' + count + ' files.');
