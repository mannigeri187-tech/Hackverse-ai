const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src', 'components', 'resume', 'ResumeEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "import { useState } from 'react';",
  "import { useState, useRef } from 'react';"
);

content = content.replace(
  "const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {",
  `const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonal('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    updatePersonal('profileImage', '');
  };

  const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {`
);

content = content.replace(
  '          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">',
  `          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              {data.personal.profileImage ? (
                <>
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <img src={data.personal.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-2 items-start">
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors">Change Photo</button>
                    <button onClick={handleRemovePhoto} className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors">Remove Photo</button>
                  </div>
                </>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors border border-primary-100 border-dashed">
                  + Upload Photo
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`
);

fs.writeFileSync(filePath, content);
console.log('ResumeEditor patched successfully.');
