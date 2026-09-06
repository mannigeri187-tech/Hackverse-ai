const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\{\\?([\s\S]*?)\}/g, (match, p1) => {
    // If it contains \$\{ we might need to wrap in backticks
    if (match.includes('\$\{')) {
      // Just hardcode the fix for the known lines
      return match;
    }
    return match;
  });
}
