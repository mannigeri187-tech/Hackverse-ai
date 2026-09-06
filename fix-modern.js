const fs = require('fs');
let code = fs.readFileSync('src/components/resume/themes/ModernTheme.tsx', 'utf8');
code = code.replace(/import \{.*?\} from 'lucide-react';/, "import { Mail, Phone, MapPin, Globe } from 'lucide-react';");
code = code.replace(/<Github /g, "<Globe ");
code = code.replace(/<Linkedin /g, "<Globe ");
fs.writeFileSync('src/components/resume/themes/ModernTheme.tsx', code, 'utf8');
