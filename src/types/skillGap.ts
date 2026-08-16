export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'AI/ML'
  | 'Database'
  | 'DevOps'
  | 'Cloud'
  | 'Design'
  | 'Business'
  | 'Mobile'
  | 'Other';

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced';

export type SkillImportance = 'required' | 'recommended';

export type SkillGapStatus = 'have' | 'missing';

export type SkillGapPriority = 'high' | 'medium' | 'low';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  created_at?: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: SkillProficiency;
  created_at?: string;
  updated_at?: string;
  skill?: Skill;
}

export interface HackathonSkill {
  id: string;
  hackathon_id: string;
  skill_id: string;
  importance: SkillImportance;
  created_at?: string;
  skill?: Skill;
}

export interface SkillGapItem {
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  user_proficiency: SkillProficiency | null;
  importance: SkillImportance;
  status: SkillGapStatus;
  priority: SkillGapPriority;
}

export interface SkillGapResult {
  hackathonId: string;
  totalRequiredSkills: number;
  skillsUserHas: number;
  missingSkills: number;
  completionPercentage: number;
  skills: SkillGapItem[];
}

export interface LearningPlanItem {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  topics: string[];
  estimated_hours: number | string;
  practice_task: string;
  hackathon_application: string;
}

export interface AILearningPlanResponse {
  summary: string;
  learning_plan: LearningPlanItem[];
}
