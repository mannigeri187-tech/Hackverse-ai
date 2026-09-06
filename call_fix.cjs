const https = require('https');
setTimeout(() => {
  console.log('Calling API...');
  https.get('https://hackverse-ai.vercel.app/api/hackathons/cron?task=repair-images&dev=true', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
  }).on('error', console.error);
}, 25000);
