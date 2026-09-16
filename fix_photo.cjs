const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src', 'components', 'resume', 'ResumeEditor.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "const fileInputRef = useRef<HTMLInputElement>(null);",
  "const fileInputRef = useRef<HTMLInputElement>(null);\n  const [photoError, setPhotoError] = useState<string>('');"
);

content = content.replace(
  "const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {",
  `const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\\/(jpeg|jpg|png|webp)/)) {
      setPhotoError('Please select a valid image (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('File is too large. Maximum size is 2MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    // Provide an instant safe preview via object URL while we read base64 for persistence
    updatePersonal('profileImage', objectUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      updatePersonal('profileImage', reader.result as string);
      URL.revokeObjectURL(objectUrl); // Clean up the object URL appropriately
    };
    reader.readAsDataURL(file);
`
);

// We need to remove the old implementation of handlePhotoUpload which is:
/*
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
*/
// The above replace will put the new one INSIDE the old one since I matched the first line. Let me just do a block replacement.
