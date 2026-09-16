const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src', 'components', 'resume', 'ResumeEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "    // Safe instant preview using object URL\n    const objectUrl = URL.createObjectURL(file);\n    updatePersonal('profileImage', objectUrl);\n\n    // Read as Base64 for local architecture persistence\n    const reader = new FileReader();\n    reader.onloadend = () => {\n      updatePersonal('profileImage', reader.result as string);\n      URL.revokeObjectURL(objectUrl); // Clean up the object URL when appropriate\n    };\n    reader.readAsDataURL(file);",
  "    const reader = new FileReader();\n    reader.onloadend = () => {\n      if (reader.result) {\n        updatePersonal('profileImage', reader.result as string);\n      }\n    };\n    reader.readAsDataURL(file);"
);

fs.writeFileSync(filePath, content);
console.log("Removed objectUrl to prevent race condition.");
