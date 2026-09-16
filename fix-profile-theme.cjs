const fs = require('fs');

function convertToLightMode(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Backgrounds
    content = content.replace(/bg-\[#050816\]/g, 'bg-slate-50');
    content = content.replace(/bg-\[#0B1026\]\/80/g, 'bg-white');
    content = content.replace(/bg-\[#0B1026\]/g, 'bg-white');
    content = content.replace(/bg-\[#111A3A\]\/50/g, 'bg-slate-50');
    content = content.replace(/bg-\[#111A3A\]/g, 'bg-slate-50');
    content = content.replace(/bg-\[#1E2A5A\]/g, 'bg-slate-100');
    content = content.replace(/bg-\[#1a0f14\]/g, 'bg-red-50');
    content = content.replace(/from-indigo-900 to-\[#0B1026\]/g, 'from-primary-50 to-white');
    
    // Text colors
    content = content.replace(/text-slate-200/g, 'text-slate-700');
    content = content.replace(/text-slate-300/g, 'text-slate-600');
    content = content.replace(/text-slate-400/g, 'text-slate-500');
    content = content.replace(/text-white/g, 'text-slate-900');
    content = content.replace(/text-indigo-300/g, 'text-primary-700');
    content = content.replace(/text-cyan-300/g, 'text-cyan-700');
    content = content.replace(/text-purple-300/g, 'text-purple-700');
    content = content.replace(/text-indigo-400/g, 'text-primary-600');
    content = content.replace(/text-cyan-400/g, 'text-cyan-600');
    content = content.replace(/text-indigo-500/g, 'text-primary-600');
    
    // Borders
    content = content.replace(/border-indigo-500\/20/g, 'border-slate-200');
    content = content.replace(/border-indigo-500\/30/g, 'border-slate-200');
    content = content.replace(/border-indigo-500\/10/g, 'border-slate-100');
    content = content.replace(/border-indigo-500\/50/g, 'border-slate-300');
    content = content.replace(/border-\[#1E2A5A\]/g, 'border-slate-200');
    content = content.replace(/border-red-500\/30/g, 'border-red-200');
    content = content.replace(/border-red-500\/50/g, 'border-red-300');
    
    // Shadows
    content = content.replace(/shadow-indigo-900\/20/g, 'shadow-slate-200/50');
    content = content.replace(/shadow-\[0_0_30px_rgba\(79,70,229,0\.3\)\]/g, 'shadow-lg');
    content = content.replace(/shadow-red-900\/10/g, 'shadow-sm');
    
    // Other specific elements
    content = content.replace(/backdrop-blur-xl/g, '');
    content = content.replace(/via-indigo-500/g, 'via-primary-500');
    content = content.replace(/bg-indigo-600\/20/g, 'bg-primary-100/50');
    content = content.replace(/bg-cyan-600\/10/g, 'bg-cyan-100/50');
    content = content.replace(/hover:border-indigo-500\/50/g, 'hover:border-primary-300');
    content = content.replace(/focus:ring-indigo-500/g, 'focus:ring-primary-500');
    content = content.replace(/focus:border-indigo-500/g, 'focus:border-primary-500');
    
    // Fix text-slate-900 hover state where text-white was used
    content = content.replace(/hover:text-slate-900/g, 'hover:text-primary-600');
    content = content.replace(/hover:bg-slate-700/g, 'hover:bg-slate-200');
    content = content.replace(/bg-slate-800 text-slate-900/g, 'bg-slate-100 text-slate-700 hover:bg-slate-200');
    content = content.replace(/bg-cyan-900\/40 text-cyan-600 hover:bg-cyan-900\/60 hover:text-cyan-700/g, 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100');

    fs.writeFileSync(filePath, content, 'utf-8');
}

convertToLightMode('src/pages/ProfilePage.tsx');
convertToLightMode('src/pages/PublicProfilePage.tsx');
console.log("Converted Profile pages to light mode!");
