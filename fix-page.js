const fs = require('fs');
let code = fs.readFileSync('src/pages/ResumeBuilderPage.tsx', 'utf8');

const OLD = \setResumeData(savedResume.content as ResumeData);\;
const NEW = \
          const content = savedResume.content as any;
          setResumeData({
            ...content,
            personal: content.personal || { name: 'Your Name' },
            education: content.education || [],
            experience: content.experience || [],
            projects: content.projects || [],
            skills: content.skills || [],
            hackathons: content.hackathons || [],
            achievements: content.achievements || [],
            certifications: content.certifications || []
          });\;

code = code.replace(OLD, NEW);
fs.writeFileSync('src/pages/ResumeBuilderPage.tsx', code, 'utf8');
