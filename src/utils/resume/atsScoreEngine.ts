import type { ResumeData } from '../../types/resumeBuilder';

export type ATSImprovementPriority = 'high' | 'medium' | 'low';

export interface ATSImprovement {
  priority: ATSImprovementPriority;
  message: string;
}

export interface ATSScoreCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface ATSScoreResult {
  totalScore: number;
  categories: ATSScoreCategory[];
  improvements: ATSImprovement[];
}

export function calculateATSScore(data: ResumeData): ATSScoreResult {
  const categories: ATSScoreCategory[] = [];
  const improvements: ATSImprovement[] = [];
  let totalScore = 0;

  // 1. Personal Information (Max 10)
  let personalScore = 0;
  if (data.personal.name?.trim()) personalScore += 2;
  if (data.personal.email?.trim()) personalScore += 2;
  if (data.personal.phone?.trim()) personalScore += 1;
  if (data.personal.location?.trim()) personalScore += 1;
  if (data.personal.title?.trim()) personalScore += 2;
  if (data.personal.linkedin?.trim()) personalScore += 1;
  if (data.personal.github?.trim() || data.personal.portfolio?.trim()) personalScore += 1;
  
  if (personalScore < 10) {
    if (!data.personal.title?.trim()) {
      improvements.push({ priority: 'high', message: 'Add your professional title.' });
    }
    if (!data.personal.phone?.trim()) {
      improvements.push({ priority: 'medium', message: 'Add your phone number for recruiters to reach you.' });
    }
  }

  categories.push({
    id: 'personal',
    name: 'Personal Information',
    score: personalScore,
    maxScore: 10,
    feedback: personalScore === 10 ? 'Complete contact information.' : 'Missing some contact details.'
  });
  totalScore += personalScore;

  // 2. Professional Summary (Max 10)
  let summaryScore = 0;
  const summaryLength = data.summary?.trim().length || 0;
  
  if (summaryLength === 0) {
    summaryScore = 0;
    improvements.push({ priority: 'high', message: 'Add a professional summary to introduce yourself.' });
  } else if (summaryLength < 50) {
    summaryScore = 5;
    improvements.push({ priority: 'medium', message: 'Expand your professional summary to provide more detail.' });
  } else {
    summaryScore = 10;
  }

  categories.push({
    id: 'summary',
    name: 'Professional Summary',
    score: summaryScore,
    maxScore: 10,
    feedback: summaryScore === 10 ? 'Strong summary length.' : 'Summary could be improved.'
  });
  totalScore += summaryScore;

  // 3. Skills (Max 15)
  let skillsScore = 0;
  const validSkills = (data.skills || []).map(s => s.trim()).filter(s => s.length > 0);
  const uniqueSkills = new Set(validSkills).size;

  if (uniqueSkills === 0) {
    skillsScore = 0;
    improvements.push({ priority: 'high', message: 'Add your technical skills.' });
  } else if (uniqueSkills <= 2) {
    skillsScore = 5;
    improvements.push({ priority: 'medium', message: 'Add more technical skills.' });
  } else if (uniqueSkills <= 5) {
    skillsScore = 10;
    improvements.push({ priority: 'low', message: 'Consider adding a few more relevant technical skills.' });
  } else if (uniqueSkills <= 9) {
    skillsScore = 13;
  } else {
    skillsScore = 15;
  }

  categories.push({
    id: 'skills',
    name: 'Skills',
    score: skillsScore,
    maxScore: 15,
    feedback: skillsScore === 15 ? 'Excellent skill coverage.' : 'Skill section could be expanded.'
  });
  totalScore += skillsScore;

  // 4. Experience (Max 15)
  let expScore = 0;
  const validExp = data.experience || [];
  
  if (validExp.length === 0) {
    expScore = 0;
    improvements.push({ priority: 'medium', message: 'Add work experience. If you have none, ensure your projects are strong.' });
  } else {
    validExp.forEach(exp => {
      let currentExpScore = 0;
      if (exp.title?.trim() && exp.company?.trim()) currentExpScore += 5;
      if (exp.description?.trim().length > 20) currentExpScore += 2;
      expScore += currentExpScore;
    });
    expScore = Math.min(expScore, 15);
    
    const missingDesc = validExp.some(exp => !exp.description?.trim());
    if (missingDesc) {
      improvements.push({ priority: 'medium', message: 'Add measurable details/descriptions to your experience entries.' });
    }
  }

  categories.push({
    id: 'experience',
    name: 'Experience',
    score: expScore,
    maxScore: 15,
    feedback: expScore >= 10 ? 'Strong experience section.' : 'Experience lacks detail.'
  });
  totalScore += expScore;

  // 5. Projects (Max 20)
  let projScore = 0;
  const includedProjects = (data.projects || []).filter(p => p.included);

  if (includedProjects.length === 0) {
    projScore = 0;
    improvements.push({ priority: 'high', message: 'Include at least one project.' });
  } else {
    includedProjects.forEach(proj => {
      let currentProjScore = 5; // Base for existing included project
      if (proj.description?.trim().length > 20) currentProjScore += 2;
      if (proj.technologies && proj.technologies.length > 0) currentProjScore += 1;
      projScore += currentProjScore;
    });
    projScore = Math.min(projScore, 20);

    if (includedProjects.length === 1) {
      improvements.push({ priority: 'medium', message: 'Consider including more projects to showcase your abilities.' });
    }
    const missingDescProj = includedProjects.some(p => !p.description?.trim());
    if (missingDescProj) {
      improvements.push({ priority: 'medium', message: 'Add detailed descriptions to all included projects.' });
    }
  }

  categories.push({
    id: 'projects',
    name: 'Projects',
    score: projScore,
    maxScore: 20,
    feedback: projScore >= 15 ? 'Excellent project showcase.' : 'Project section could be stronger.'
  });
  totalScore += projScore;

  // 6. Hackathons (Max 5)
  let hackScore = 0;
  const includedHacks = (data.hackathons || []).filter(h => h.included);

  if (includedHacks.length === 0) {
    hackScore = 0;
    improvements.push({ priority: 'low', message: 'Consider adding hackathons to demonstrate collaborative building.' });
  } else if (includedHacks.length === 1) {
    hackScore = 3;
  } else {
    hackScore = 5;
  }

  categories.push({
    id: 'hackathons',
    name: 'Hackathons',
    score: hackScore,
    maxScore: 5,
    feedback: hackScore === 5 ? 'Great hackathon participation.' : 'Hackathon participation noted.'
  });
  totalScore += hackScore;

  // 7. Education (Max 10)
  let eduScore = 0;
  const validEdu = data.education || [];

  if (validEdu.length === 0) {
    eduScore = 0;
    improvements.push({ priority: 'high', message: 'Add your educational background.' });
  } else {
    validEdu.forEach(edu => {
      if (edu.institution?.trim() && edu.degree?.trim()) {
        eduScore += 10; // 1 solid entry is enough for full marks
      } else {
        eduScore += 5;
      }
    });
    eduScore = Math.min(eduScore, 10);
  }

  categories.push({
    id: 'education',
    name: 'Education',
    score: eduScore,
    maxScore: 10,
    feedback: eduScore === 10 ? 'Education clearly listed.' : 'Education entries missing key details.'
  });
  totalScore += eduScore;

  // 8. Achievements (Max 5)
  let achScore = 0;
  const validAch = data.achievements || [];

  if (validAch.length === 0) {
    achScore = 0;
    improvements.push({ priority: 'low', message: 'Consider adding awards or achievements.' });
  } else if (validAch.length === 1) {
    achScore = 3;
  } else {
    achScore = 5;
  }

  categories.push({
    id: 'achievements',
    name: 'Achievements',
    score: achScore,
    maxScore: 5,
    feedback: achScore > 0 ? 'Valuable achievements included.' : 'No achievements listed.'
  });
  totalScore += achScore;

  // 9. Certifications (Max 5)
  let certScore = 0;
  const includedCerts = (data.certifications || []).filter(c => c.included);

  if (includedCerts.length === 0) {
    certScore = 0;
    improvements.push({ priority: 'low', message: 'Consider including relevant certifications if you have them.' });
  } else if (includedCerts.length === 1) {
    certScore = 3;
  } else {
    certScore = 5;
  }

  categories.push({
    id: 'certifications',
    name: 'Certifications',
    score: certScore,
    maxScore: 5,
    feedback: certScore > 0 ? 'Certifications included.' : 'No certifications included.'
  });
  totalScore += certScore;

  // 10. Completeness (Max 5)
  let completenessScore = 0;
  if (personalScore > 0) completenessScore += 1;
  if (summaryLength > 0) completenessScore += 1;
  if (uniqueSkills > 0) completenessScore += 1;
  if (validEdu.length > 0) completenessScore += 1;
  if (validExp.length > 0 || includedProjects.length > 0) completenessScore += 1;
  
  categories.push({
    id: 'completeness',
    name: 'Completeness',
    score: completenessScore,
    maxScore: 5,
    feedback: completenessScore === 5 ? 'Structurally complete.' : 'Missing structural sections.'
  });
  totalScore += completenessScore;

  // Sort improvements: High -> Medium -> Low
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  improvements.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  // Remove duplicate messages
  const uniqueImprovements = improvements.filter((imp, index, self) => 
    index === self.findIndex((t) => t.message === imp.message)
  );

  return {
    totalScore: Math.round(totalScore),
    categories,
    improvements: uniqueImprovements
  };
}
