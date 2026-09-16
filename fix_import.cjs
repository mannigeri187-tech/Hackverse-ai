const fs = require('fs');
let code = fs.readFileSync('src/pages/IdeaGeneratorPage.tsx', 'utf8');

if (!code.includes("import { SafeHtml }")) {
  code = code.replace("import { useState, useRef, useEffect } from 'react';", "import { useState, useRef, useEffect } from 'react';\nimport { SafeHtml } from '../components/SafeHtml';");
  fs.writeFileSync('src/pages/IdeaGeneratorPage.tsx', code);
}
