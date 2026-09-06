const fs = require('fs');
let code = fs.readFileSync('src/components/resume/themes/MinimalistTheme.tsx', 'utf8');
code = code.replace(/const visibleHackathons = .*;\n/, '');
code = code.replace(/const visibleCertifications = .*;\n/, '');
code = code.replace(/{edu\.score && <div.*?<\/div>}/g, '');
fs.writeFileSync('src/components/resume/themes/MinimalistTheme.tsx', code, 'utf8');

code = fs.readFileSync('src/components/resume/themes/EngineeringTheme.tsx', 'utf8');
code = code.replace(/{edu\.score && <div.*?<\/div>}/g, '');
fs.writeFileSync('src/components/resume/themes/EngineeringTheme.tsx', code, 'utf8');

code = fs.readFileSync('src/components/resume/themes/CreativeTheme.tsx', 'utf8');
code = code.replace(/const visibleHackathons = .*;\n/, '');
code = code.replace(/{edu\.score && <div.*?<\/div>}/g, '');
fs.writeFileSync('src/components/resume/themes/CreativeTheme.tsx', code, 'utf8');
