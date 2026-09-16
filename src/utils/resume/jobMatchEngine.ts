import type { ResumeData } from '../../types/resumeBuilder';

export interface JobMatchResult {
  score: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
}

export function calculateJobMatch(resumeData: ResumeData, jobDescription: string): JobMatchResult {
  if (!jobDescription || jobDescription.trim().length === 0) {
    return { score: 0, matchedSkills: [], missingSkills: [] };
  }

  const commonTech = [
    'react', 'typescript', 'javascript', 'js', 'node.js', 'node', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s', 'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo',
    'redis', 'graphql', 'rest', 'api', 'html', 'css', 'sass', 'tailwind', 'git', 'ci/cd', 'linux', 'unix', 'agile', 'scrum',
    'machine learning', 'ml', 'ai', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'spring boot', 'django',
    'flask', 'express', 'next.js', 'vue', 'angular', 'svelte', 'php', 'laravel', 'swift', 'kotlin', 'flutter', 'react native',
    'nosql', 'dynamodb', 'firebase', 'supabase', 'figma', 'ui/ux', 'docker compose', 'kafka', 'rabbitmq'
  ];

  const jdLower = jobDescription.toLowerCase();
  
  const jdKeywords = new Set<string>();
  commonTech.forEach(tech => {
    const escapedTech = tech.replace(/\+/g, '\\+');
    const regex = new RegExp('\\b' + escapedTech + '\\b', 'i');
    if (regex.test(jdLower)) {
      jdKeywords.add(tech);
    }
  });

  let resumeText = '';
  
  if (resumeData.skills) resumeData.skills.forEach(s => resumeText += ' ' + s.toLowerCase());
  
  if (resumeData.experience) {
    resumeData.experience.forEach(e => {
      if (e.title) resumeText += ' ' + e.title.toLowerCase();
      if (e.description) resumeText += ' ' + e.description.toLowerCase();
    });
  }
  
  if (resumeData.projects) {
    resumeData.projects.filter(p => p.included).forEach(p => {
      if (p.name) resumeText += ' ' + p.name.toLowerCase();
      if (p.description) resumeText += ' ' + p.description.toLowerCase();
      if (p.technologies) p.technologies.forEach(t => resumeText += ' ' + t.toLowerCase());
    });
  }

  if (resumeData.summary) resumeText += ' ' + resumeData.summary.toLowerCase();

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jdKeywords.forEach(keyword => {
    const escapedKw = keyword.replace(/\+/g, '\\+');
    const regex = new RegExp('\\b' + escapedKw + '\\b', 'i');
    if (regex.test(resumeText)) {
      matchedSkills.push(keyword);
    } else {
      missingSkills.push(keyword);
    }
  });

  const formatKeyword = (kw: string) => {
    const original = commonTech.find(c => c.toLowerCase() === kw.toLowerCase()) || kw;
    if (original === 'api') return 'API';
    if (original === 'aws') return 'AWS';
    if (original === 'gcp') return 'GCP';
    if (original === 'ci/cd') return 'CI/CD';
    if (original === 'html') return 'HTML';
    if (original === 'css') return 'CSS';
    if (original === 'sql') return 'SQL';
    if (original === 'ui/ux') return 'UI/UX';
    return original.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formattedMatches = matchedSkills.map(formatKeyword);
  const formattedMissing = missingSkills.map(formatKeyword);

  let score = 0;
  
  if (jdKeywords.size === 0) {
    const wordCount = resumeText.split(/\s+/).length;
    score = Math.min(Math.round((wordCount / 200) * 100), 100);
  } else {
    const matchRatio = matchedSkills.length / jdKeywords.size;
    score = Math.round(matchRatio * 100);
  }

  if (score > 0 && resumeData.projects && resumeData.projects.some(p => p.included)) score = Math.min(score + 5, 100);
  if (score > 0 && resumeData.experience && resumeData.experience.length) score = Math.min(score + 5, 100);

  return {
    score,
    matchedSkills: formattedMatches,
    missingSkills: formattedMissing
  };
}
