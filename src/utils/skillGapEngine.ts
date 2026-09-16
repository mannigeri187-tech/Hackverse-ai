import type {
  UserSkill,
  HackathonSkill,
  SkillGapItem,
  SkillGapResult,
  SkillGapPriority,
  SkillGapStatus,
  SkillCategory,
} from '../types/skillGap';

/**
 * Pure calculation function comparing user skills against hackathon requirements.
 * Deterministic, easily unit-testable, and has no direct dependency on React.
 */
export function calculateSkillGap(
  hackathonId: string,
  userSkills: UserSkill[],
  hackathonSkills: HackathonSkill[]
): SkillGapResult {
  if (!hackathonSkills || hackathonSkills.length === 0) {
    return {
      hackathonId,
      totalRequiredSkills: 0,
      skillsUserHas: 0,
      missingSkills: 0,
      completionPercentage: 0,
      skills: [],
    };
  }

  // Create a quick lookup Map for the user's skills: skill_id -> UserSkill
  const userSkillMap = new Map<string, UserSkill>();
  (userSkills || []).forEach((us) => {
    if (us.skill_id) {
      userSkillMap.set(us.skill_id, us);
    }
  });

  const processedItems: SkillGapItem[] = [];
  let userHasCount = 0;

  hackathonSkills.forEach((req) => {
    const userMatch = userSkillMap.get(req.skill_id);
    const hasSkill = !!userMatch;

    if (hasSkill) {
      userHasCount++;
    }

    const status: SkillGapStatus = hasSkill ? 'have' : 'missing';
    
    // Priority logic: required -> high, recommended -> medium
    const priority: SkillGapPriority = req.importance === 'required' ? 'high' : 'medium';

    const item: SkillGapItem = {
      skill_id: req.skill_id,
      skill_name: req.skill?.name || 'Unknown Skill',
      category: (req.skill?.category || 'Other') as SkillCategory,
      user_proficiency: hasSkill ? userMatch.proficiency : null,
      importance: req.importance,
      status,
      priority,
    };

    processedItems.push(item);
  });

  const totalRequired = hackathonSkills.length;
  const missingCount = totalRequired - userHasCount;
  const completion = totalRequired === 0 ? 0 : Math.round((userHasCount / totalRequired) * 100);

  return {
    hackathonId,
    totalRequiredSkills: totalRequired,
    skillsUserHas: userHasCount,
    missingSkills: missingCount,
    completionPercentage: isNaN(completion) ? 0 : completion,
    skills: processedItems,
  };
}
