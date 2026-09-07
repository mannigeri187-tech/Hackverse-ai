const fs = require('fs');
let code = fs.readFileSync('api/user-actions.js', 'utf8');

// Replace the unsafe profile fetch
code = code.replace(
  /const \{ data: pData \} = await adminClient\.from\('profiles'\)\.select\('\*'\)\.eq\('user_id', id\)\.single\(\);/g,
  "const { data: pData } = await adminClient.from('profiles').select('user_id, name, bio, college, profile_image, discoverable').eq('user_id', id).single();\n      if (pData && pData.discoverable === false) return res.status(403).json({ error: 'Profile is private.' });"
);

fs.writeFileSync('api/user-actions.js', code);
console.log('Fixed Information Disclosure.');
