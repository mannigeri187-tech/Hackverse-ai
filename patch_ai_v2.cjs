const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'api', 'ai');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'mentor.js');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find where const { user, error: authError } = await authenticateServerRequest(req); is
  const authIdx = content.indexOf('const { user, error: authError } = await authenticateServerRequest(req);');
  if (authIdx === -1) return;

  // Find where const usageCheck = await checkFeatureAccess... is
  const usageIdx = content.indexOf('const usageCheck = await checkFeatureAccess');
  if (usageIdx === -1) return;

  // Find where if (authError || !user) { is
  const authErrorIdx = content.indexOf('if (authError || !user) {');
  if (authErrorIdx === -1) return;
  const authErrorEndIdx = content.indexOf('}', authErrorIdx);

  // We want to extract everything between authIdx and authErrorEndIdx, and rewrite it.
  const oldBlock = content.substring(authIdx, authErrorEndIdx + 1);
  
  const newBlock = "const { user, error: authError } = await authenticateServerRequest(req);\n" +
"    if (authError || !user) {\n" +
"      return res.status(401).json({ error: authError || 'Unauthorized user session.' });\n" +
"    }\n" +
"\n" +
"    // 2. Strict Payload Size Validation BEFORE Quota Check\n" +
"    const bodyStr = JSON.stringify(req.body || {});\n" +
"    if (bodyStr.length > 25000) {\n" +
"      return res.status(400).json({ error: 'Payload exceeds 25,000 characters limit. Please shorten your input.' });\n" +
"    }\n" +
"\n" +
"    const { userMessage, chatHistory, prompt } = req.body || {};\n" +
"    if (userMessage && typeof userMessage === 'string' && userMessage.length > 2000) {\n" +
"      return res.status(400).json({ error: 'Message exceeds 2000 character limit.' });\n" +
"    }\n" +
"    if (prompt && typeof prompt === 'string' && prompt.length > 5000) {\n" +
"      return res.status(400).json({ error: 'Prompt exceeds 5000 character limit.' });\n" +
"    }\n" +
"    if (Array.isArray(chatHistory)) {\n" +
"      if (chatHistory.length > 50) return res.status(400).json({ error: 'Chat history too long.' });\n" +
"      for (const msg of chatHistory) {\n" +
"        if (msg && msg.text && msg.text.length > 2000) {\n" +
"          return res.status(400).json({ error: 'A chat history message exceeds 2000 characters.' });\n" +
"        }\n" +
"      }\n" +
"    }\n" +
"\n" +
"    // 3. Quota Enforcement\n" +
"    const usageCheck = await checkFeatureAccess({ userId: user.id, feature: 'ai_generation' });\n" +
"    if (!usageCheck.allowed) {\n" +
"      return res.status(usageCheck.status).json(usageCheck);\n" +
"    }";

  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, content);
  console.log('Patched ' + file);
});
