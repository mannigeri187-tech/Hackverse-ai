const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src', 'components', 'resume', 'themes', 'CreativeTheme.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the main wrapper to be flex-col
content = content.replace(
  '<div className="bg-stone-50 text-stone-800 font-sans max-w-4xl mx-auto h-full shadow-lg overflow-hidden text-sm flex">',
  '<div className="bg-stone-50 text-stone-800 font-sans max-w-4xl mx-auto h-full shadow-lg overflow-hidden text-sm flex flex-col">'
);

// Move the header OUT of the left column
const headerRegex = /<header className="w-full mb-6 flex flex-col gap-5">[\s\S]*?<\/header>\s*/;
const headerMatch = content.match(headerRegex);

if (headerMatch) {
  content = content.replace(headerMatch[0], ''); // Remove from old location
  
  // Create the new header structure
  const newHeader = `
      {/* Top Header */}
      <header className="w-full bg-stone-900 text-white p-8 md:px-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-stone-800">
        {data.personal?.profileImage && (
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
            <img src={data.personal.profileImage} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0 w-full text-center sm:text-left mt-2 sm:mt-0">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight tracking-tighter whitespace-nowrap overflow-visible">
            {data.personal?.name || 'Your Name'}
          </h1>
          {data.personal?.title && <div className="text-amber-500 font-medium tracking-wide uppercase text-sm break-words">{data.personal?.title}</div>}
        </div>
      </header>

      {/* Columns Wrapper */}
      <div className="flex flex-1 min-h-0 flex-col sm:flex-row">
`;

  // Insert the new header right after the main flex-col wrapper
  content = content.replace(
    '<div className="bg-stone-50 text-stone-800 font-sans max-w-4xl mx-auto h-full shadow-lg overflow-hidden text-sm flex flex-col">',
    '<div className="bg-stone-50 text-stone-800 font-sans max-w-4xl mx-auto h-full shadow-lg overflow-hidden text-sm flex flex-col">' + newHeader
  );
  
  // We need to close the Columns Wrapper before the final closing div
  content = content.replace(
    '      </div>\n    </div>\n  );\n}',
    '      </div>\n      </div>\n    </div>\n  );\n}'
  );
} else {
  console.log("Could not match header block!");
}

fs.writeFileSync(filePath, content);
console.log('CreativeTheme refactored successfully.');
