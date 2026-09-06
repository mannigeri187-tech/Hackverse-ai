const fs = require('fs');
let code = fs.readFileSync('src/components/resume/ResumeEditor.tsx', 'utf8');

function injectLabel(num, name, sourceText) {
  const searchStr = '<h3 className="text-lg font-bold text-slate-900 mb-4">' + num + '. ' + name + '</h3>';
  const replacement = 
        '<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">' +
          '<h3 className="text-lg font-bold text-slate-900">' + num + '. ' + name + '</h3>' +
          '<span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider self-start sm:self-auto">' + sourceText + '</span>' +
        '</div>';
  code = code.replace(searchStr, replacement);
}

injectLabel('1', 'Personal Information', 'Imported from HackVerse Profile');
injectLabel('3', 'Skills', 'Imported from Team Profile');
injectLabel('4', 'Projects', 'Imported from Workspaces');
injectLabel('5', 'Hackathons', 'Imported from Workspaces');
injectLabel('6', 'Education', 'Imported from HackVerse Profile');
injectLabel('8', 'Certifications', 'Imported from Certificate Vault');

fs.writeFileSync('src/components/resume/ResumeEditor.tsx', code, 'utf8');
