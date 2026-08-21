import { useMemo } from 'react';
import type { ResumeContent } from '../types/resume';

interface ResumeQualityScoreProps {
  content: ResumeContent;
}

export function ResumeQualityScore({ content }: ResumeQualityScoreProps) {
  const score = useMemo(() => {
    let currentScore = 0;
    const maxScore = 100;
    const feedback: string[] = [];

    // Personal Info (15 pts)
    if (content.name && content.email) currentScore += 10;
    else feedback.push('Add name and email to contact info.');
    
    if (content.phone || content.linkedin || content.github) currentScore += 5;
    else feedback.push('Add phone or professional links (LinkedIn/GitHub).');

    // Summary (15 pts)
    if (content.summary && content.summary.trim().length > 50) currentScore += 15;
    else if (content.summary) {
      currentScore += 5;
      feedback.push('Expand your summary to highlight key strengths.');
    } else feedback.push('Add a professional summary.');

    // Education (15 pts)
    if (content.education && content.education.length > 0) {
      currentScore += 15;
    } else {
      feedback.push('Add at least one education entry.');
    }

    // Experience/Projects/Hackathons (40 pts)
    const totalProjects = (content.projects?.length || 0) + (content.hackathons?.length || 0) + (content.experience?.length || 0);
    
    if (totalProjects >= 3) currentScore += 40;
    else if (totalProjects > 0) {
      currentScore += 20;
      feedback.push('Add more projects, hackathons, or experience (aim for 3+).');
    } else {
      feedback.push('Add your projects or hackathon experience.');
    }

    // Skills (15 pts)
    if (content.skills && content.skills.trim().length > 10) currentScore += 15;
    else feedback.push('Add technical skills (languages, frameworks, tools).');

    return { total: Math.min(currentScore, maxScore), feedback };
  }, [content]);

  let colorClass = 'text-red-600 bg-red-50 border-red-200';
  if (score.total >= 80) colorClass = 'text-green-700 bg-green-50 border-green-200';
  else if (score.total >= 50) colorClass = 'text-yellow-700 bg-yellow-50 border-yellow-200';

  return (
    <div className={`p-4 rounded-xl border mb-4 ${colorClass}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Resume Quality Score</h3>
        <span className="text-xl font-black">{score.total}/100</span>
      </div>
      {score.feedback.length > 0 && (
        <ul className="text-sm list-disc pl-4 space-y-1">
          {score.feedback.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
      {score.total >= 100 && (
        <p className="text-sm font-medium">✨ Excellent! Your resume looks highly complete and ATS-friendly.</p>
      )}
    </div>
  );
}
