import type { Workspace, WorkspaceTask } from '../types/workspace';
import type { Hackathon } from '../hooks/useHackathons';

export interface ReadinessCategoryScore {
  name: string;
  key: string;
  score: number;
  maxScore: number;
  status: 'Analyzed' | 'Partial' | 'Not analyzed yet';
  explanation: string;
}

export interface CriticalGap {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
}

export interface ReadinessResult {
  overall_score: number;
  readiness_tier: 'Excellent Readiness' | 'Strong Readiness' | 'Good Progress' | 'Needs Improvement' | 'Early Stage';
  categories: ReadinessCategoryScore[];
  strengths: string[];
  gaps: CriticalGap[];
  checklist: string[];
}

export interface ReadinessCalculationInput {
  hackathon: Hackathon | null;
  workspace: Workspace | null;
  tasks: WorkspaceTask[];
  userSkills: string[];
  hackathonSkills?: string[];
  missingSkills?: string[];
  teamMembers: any[];
  githubScore?: number | null; // 0 - 100
  pitchScore?: number | null; // 0 - 100
}

/**
 * Deterministic calculation of Winning Readiness Score (0-100 pts)
 * 1. Hackathon Alignment (20 pts)
 * 2. Project Completeness (15 pts)
 * 3. Technical Readiness (15 pts)
 * 4. Team Readiness (15 pts)
 * 5. Skill Readiness (10 pts)
 * 6. GitHub Quality (10 pts)
 * 7. Pitch Readiness (10 pts)
 * 8. Submission Readiness (5 pts)
 */
export function calculateWinningReadiness(input: ReadinessCalculationInput): ReadinessResult {
  const {
    hackathon,
    workspace,
    tasks,
    userSkills,
    hackathonSkills = [],
    missingSkills = [],
    teamMembers,
    githubScore,
    pitchScore,
  } = input;

  const strengths: string[] = [];
  const gaps: CriticalGap[] = [];
  const checklist: string[] = [];

  // ==========================================
  // 1. Hackathon Alignment (Max: 20 pts)
  // ==========================================
  let alignmentScore = 0;
  if (hackathon) {
    alignmentScore += 5; // Base hackathon linked
    if (workspace?.problem_statement && workspace.problem_statement.trim().length > 20) {
      alignmentScore += 8;
    } else {
      gaps.push({
        id: 'gap-problem',
        title: 'Problem statement is brief or missing',
        category: 'Hackathon Alignment',
        priority: 'High',
        action: 'Add a clear, detailed problem statement in your workspace.',
      });
    }

    if (workspace?.solution && workspace.solution.trim().length > 20) {
      alignmentScore += 7;
      strengths.push('Workspace defines a concrete problem and proposed solution.');
    } else {
      gaps.push({
        id: 'gap-solution',
        title: 'Solution proposal is incomplete',
        category: 'Hackathon Alignment',
        priority: 'High',
        action: 'Detail your project solution in the workspace.',
      });
    }
  } else {
    gaps.push({
      id: 'gap-no-hack',
      title: 'No hackathon linked',
      category: 'Hackathon Alignment',
      priority: 'High',
      action: 'Select an active hackathon to calculate competition alignment.',
    });
  }

  // ==========================================
  // 2. Project Completeness (Max: 15 pts)
  // ==========================================
  let completenessScore = 0;
  if (workspace) {
    const progress = workspace.progress_percentage || 0;
    completenessScore = Math.round((progress / 100) * 15);

    if (progress >= 80) {
      strengths.push(`Your workspace tasks are ${progress}% complete.`);
    } else if (progress < 50) {
      const incompleteCount = tasks.filter((t) => t.status !== 'completed').length;
      gaps.push({
        id: 'gap-progress',
        title: `${incompleteCount} workspace sprint tasks are still incomplete`,
        category: 'Project Completeness',
        priority: 'High',
        action: 'Complete remaining high-priority sprint tasks before judging.',
      });
    }
  } else {
    gaps.push({
      id: 'gap-no-ws',
      title: 'Workspace not created yet',
      category: 'Project Completeness',
      priority: 'High',
      action: 'Create a preparation workspace for this hackathon.',
    });
  }

  // ==========================================
  // 3. Technical Readiness (Max: 15 pts)
  // ==========================================
  let techScore = 0;
  const techStack = Array.isArray(workspace?.tech_stack) ? workspace.tech_stack : [];
  if (techStack.length >= 3) {
    techScore += 10;
    strengths.push(`Identified a comprehensive tech stack (${techStack.slice(0, 3).join(', ')}).`);
  } else if (techStack.length > 0) {
    techScore += 5;
  } else {
    gaps.push({
      id: 'gap-tech-stack',
      title: 'No tech stack defined',
      category: 'Technical Readiness',
      priority: 'Medium',
      action: 'List your core frameworks and libraries in workspace settings.',
    });
  }

  if (workspace?.github_url && workspace.github_url.includes('github.com')) {
    techScore += 5;
    strengths.push('GitHub repository linked to workspace.');
  } else {
    gaps.push({
      id: 'gap-github-link',
      title: 'GitHub repository not linked',
      category: 'Technical Readiness',
      priority: 'High',
      action: 'Link your project GitHub repository URL in the workspace.',
    });
  }

  // ==========================================
  // 4. Team Readiness (Max: 15 pts)
  // ==========================================
  let teamScore = 0;
  if (teamMembers.length >= 2) {
    teamScore = 15;
    strengths.push(`Squad of ${teamMembers.length + 1} hackers collaborating.`);
  } else if (teamMembers.length === 1) {
    teamScore = 12;
    strengths.push('2-person team squad formed.');
  } else {
    teamScore = 8; // Solo hacker baseline
    gaps.push({
      id: 'gap-team-squad',
      title: 'Solo hacker / Squad not fully formed',
      category: 'Team Readiness',
      priority: 'Low',
      action: 'Invite teammates from Team Finder if you want complementary skills.',
    });
  }

  // ==========================================
  // 5. Skill Readiness (Max: 10 pts)
  // ==========================================
  let skillScore = 0;
  if (userSkills.length > 0) {
    if (missingSkills.length === 0 && hackathonSkills.length > 0) {
      skillScore = 10;
      strengths.push('You and your team cover all required technical skills for this hackathon.');
    } else if (missingSkills.length > 0) {
      skillScore = Math.max(3, 10 - missingSkills.length * 2);
      gaps.push({
        id: 'gap-skills',
        title: `Missing ${missingSkills.length} recommended hackathon skill(s): ${missingSkills.slice(0, 2).join(', ')}`,
        category: 'Skill Readiness',
        priority: 'Medium',
        action: 'Review the Skill Gap Analyzer and assign missing roles.',
      });
    } else {
      skillScore = 7; // User has skills but no hackathon requirements tagged
    }
  } else {
    skillScore = 2;
    gaps.push({
      id: 'gap-no-user-skills',
      title: 'User skills profile is empty',
      category: 'Skill Readiness',
      priority: 'Medium',
      action: 'Add your skills in your Profile or Team Finder settings.',
    });
  }

  // ==========================================
  // 6. GitHub Quality (Max: 10 pts)
  // ==========================================
  let githubPts = 0;
  let githubStatus: 'Analyzed' | 'Partial' | 'Not analyzed yet' = 'Not analyzed yet';
  let githubExplanation = 'Analyze your repo in GitHub Analyzer to unlock this score.';

  if (typeof githubScore === 'number' && githubScore > 0) {
    githubPts = Math.round((githubScore / 100) * 10);
    githubStatus = 'Analyzed';
    githubExplanation = `GitHub quality score: ${githubScore}/100 based on repository inspection.`;
    if (githubScore >= 75) {
      strengths.push(`GitHub repository has strong code organization (${githubScore}/100).`);
    } else {
      gaps.push({
        id: 'gap-gh-quality',
        title: `GitHub repo scored ${githubScore}/100`,
        category: 'GitHub Quality',
        priority: 'Medium',
        action: 'Review GitHub Analyzer suggestions (e.g. README, setup steps).',
      });
    }
  } else if (workspace?.github_url) {
    githubPts = 4; // Linked but not analyzed
    githubStatus = 'Partial';
    githubExplanation = 'Repo linked. Run GitHub Analyzer for in-depth quality points.';
  } else {
    gaps.push({
      id: 'gap-gh-not-analyzed',
      title: 'GitHub repository not analyzed yet',
      category: 'GitHub Quality',
      priority: 'Low',
      action: 'Run GitHub Analyzer to verify README and code architecture.',
    });
  }

  // ==========================================
  // 7. Pitch Readiness (Max: 10 pts)
  // ==========================================
  let pitchPts = 0;
  let pitchStatus: 'Analyzed' | 'Partial' | 'Not analyzed yet' = 'Not analyzed yet';
  let pitchExplanation = 'Score your pitch in Pitch Coach to verify judging readiness.';

  if (typeof pitchScore === 'number' && pitchScore > 0) {
    pitchPts = Math.round((pitchScore / 100) * 10);
    pitchStatus = 'Analyzed';
    pitchExplanation = `Pitch Coach score: ${pitchScore}/100 across 9 judging criteria.`;
    if (pitchScore >= 75) {
      strengths.push(`Pitch evaluated with strong judging clarity (${pitchScore}/100).`);
    } else {
      gaps.push({
        id: 'gap-pitch-quality',
        title: `Pitch scored ${pitchScore}/100 in Pitch Coach`,
        category: 'Pitch Readiness',
        priority: 'High',
        action: 'Revise pitch hook and differentiation in Pitch Coach.',
      });
    }
  } else {
    gaps.push({
      id: 'gap-pitch-not-analyzed',
      title: 'Pitch has not been analyzed yet',
      category: 'Pitch Readiness',
      priority: 'Medium',
      action: 'Draft and test your 60-second pitch in AI Pitch Coach.',
    });
  }

  // ==========================================
  // 8. Submission Readiness (Max: 5 pts)
  // ==========================================
  let submissionPts = 0;
  if (workspace?.project_name && workspace?.problem_statement && workspace?.solution && workspace?.github_url) {
    submissionPts = 5;
    strengths.push('All core submission fields are filled out in the workspace.');
  } else if (workspace) {
    submissionPts = 2;
    gaps.push({
      id: 'gap-submission-fields',
      title: 'Submission metadata incomplete',
      category: 'Submission Readiness',
      priority: 'High',
      action: 'Ensure Project Name, Solution, and Repo link are filled.',
    });
  }

  // Total Score Calculation (0-100)
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      alignmentScore +
      completenessScore +
      techScore +
      teamScore +
      skillScore +
      githubPts +
      pitchPts +
      submissionPts
    )
  );

  // Determine Tier Label
  let readinessTier: ReadinessResult['readiness_tier'] = 'Early Stage';
  if (totalScore >= 90) readinessTier = 'Excellent Readiness';
  else if (totalScore >= 75) readinessTier = 'Strong Readiness';
  else if (totalScore >= 60) readinessTier = 'Good Progress';
  else if (totalScore >= 40) readinessTier = 'Needs Improvement';

  // Construct Category Breakdown Cards
  const categories: ReadinessCategoryScore[] = [
    {
      name: 'Hackathon Alignment',
      key: 'alignment',
      score: alignmentScore,
      maxScore: 20,
      status: hackathon ? 'Analyzed' : 'Not analyzed yet',
      explanation: hackathon ? 'Measures how well problem & solution target event theme.' : 'No hackathon linked.',
    },
    {
      name: 'Project Completeness',
      key: 'completeness',
      score: completenessScore,
      maxScore: 15,
      status: workspace ? 'Analyzed' : 'Not analyzed yet',
      explanation: workspace ? `${workspace.progress_percentage || 0}% task completion in workspace.` : 'No workspace created.',
    },
    {
      name: 'Technical Readiness',
      key: 'technical',
      score: techScore,
      maxScore: 15,
      status: workspace ? 'Analyzed' : 'Not analyzed yet',
      explanation: 'Evaluates tech stack breadth and repository integration.',
    },
    {
      name: 'Team Readiness',
      key: 'team',
      score: teamScore,
      maxScore: 15,
      status: 'Analyzed',
      explanation: `${teamMembers.length + 1} hacker squad structure.`,
    },
    {
      name: 'Skill Readiness',
      key: 'skills',
      score: skillScore,
      maxScore: 10,
      status: userSkills.length > 0 ? 'Analyzed' : 'Not analyzed yet',
      explanation: 'Checks required technical capabilities against hackathon theme.',
    },
    {
      name: 'GitHub Quality',
      key: 'github',
      score: githubPts,
      maxScore: 10,
      status: githubStatus,
      explanation: githubExplanation,
    },
    {
      name: 'Pitch Readiness',
      key: 'pitch',
      score: pitchPts,
      maxScore: 10,
      status: pitchStatus,
      explanation: pitchExplanation,
    },
    {
      name: 'Submission Readiness',
      key: 'submission',
      score: submissionPts,
      maxScore: 5,
      status: workspace ? 'Analyzed' : 'Not analyzed yet',
      explanation: 'Verifies final submission prerequisites and metadata.',
    },
  ];

  // Prioritized Action Checklist
  gaps
    .sort((a, b) => (a.priority === 'High' ? -1 : b.priority === 'High' ? 1 : 0))
    .forEach((g) => {
      checklist.push(g.action);
    });

  if (checklist.length === 0) {
    checklist.push('Do a final run-through of your live demo.');
    checklist.push('Ensure your GitHub repository is public with an active README.');
    checklist.push('Submit your project before the deadline countdown expires.');
  }

  return {
    overall_score: totalScore,
    readiness_tier: readinessTier,
    categories,
    strengths,
    gaps,
    checklist,
  };
}
