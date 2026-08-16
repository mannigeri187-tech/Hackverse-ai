import type { TeamProfile, CompatibilityBreakdown } from '../types/teamFinder';

export function calculateTeamCompatibility(
  myProfile: TeamProfile | null,
  candidateProfile: TeamProfile
): CompatibilityBreakdown {
  if (!myProfile) {
    return {
      total: 50,
      skillsScore: 20,
      experienceScore: 10,
      interestsScore: 10,
      availabilityScore: 5,
      relevanceScore: 5,
      insights: ['Complete your team profile to unlock personalized compatibility analysis.']
    };
  }

  const insights: string[] = [];

  // 1. SKILLS COMPLEMENTARITY (Max 40 points)
  let skillsScore = 10; // Base score
  const mySkills = new Set((myProfile.skills || []).map(s => s.toLowerCase()));
  const candidateSkills = new Set((candidateProfile.skills || []).map(s => s.toLowerCase()));
  const myRoles = new Set((myProfile.preferred_roles || []).map(r => r.toLowerCase()));
  const candidateRoles = new Set((candidateProfile.preferred_roles || []).map(r => r.toLowerCase()));

  // Role Complementarity (+15 pts)
  const isDifferentRole = [...candidateRoles].some(r => !myRoles.has(r));
  if (isDifferentRole) {
    skillsScore += 15;
    insights.push(`Complementary roles: You bring ${myProfile.preferred_roles.join('/')} and they bring ${candidateProfile.preferred_roles.join('/')}`);
  } else {
    skillsScore += 8;
    insights.push(`Shared role focus: Both interested in ${myProfile.preferred_roles.join('/')}`);
  }

  // Cross-Domain Tech Synergies (+15 pts)
  const isMyFrontend = [...mySkills].some(s => ['react', 'javascript', 'typescript', 'frontend', 'ui/ux', 'figma'].includes(s));
  const isCandidateBackendOrAI = [...candidateSkills].some(s => ['python', 'backend', 'ai/ml', 'data science', 'sql', 'devops', 'cloud', 'supabase', 'firebase'].includes(s));
  
  const isMyBackendOrAI = [...mySkills].some(s => ['python', 'backend', 'ai/ml', 'data science', 'sql', 'devops', 'cloud'].includes(s));
  const isCandidateFrontend = [...candidateSkills].some(s => ['react', 'javascript', 'typescript', 'frontend', 'ui/ux', 'figma'].includes(s));

  if ((isMyFrontend && isCandidateBackendOrAI) || (isMyBackendOrAI && isCandidateFrontend)) {
    skillsScore += 15;
    insights.push('Strong Full-Stack / AI cross-domain synergy');
  } else {
    // Unique skills bonus (+1 pt per unique skill)
    const uniqueSkills = [...candidateSkills].filter(s => !mySkills.has(s)).length;
    skillsScore += Math.min(uniqueSkills * 2, 12);
  }
  skillsScore = Math.min(Math.round(skillsScore), 40);

  // 2. EXPERIENCE LEVEL BALANCE (Max 20 points)
  let experienceScore = 14;
  const myExp = myProfile.experience_level;
  const candExp = candidateProfile.experience_level;

  if (
    (myExp === 'Advanced' && candExp === 'Intermediate') ||
    (myExp === 'Intermediate' && candExp === 'Advanced')
  ) {
    experienceScore = 20;
    insights.push('Optimal senior-mid team execution balance');
  } else if (myExp === candExp) {
    experienceScore = 18;
    insights.push(`Matching ${myExp} experience level`);
  } else {
    experienceScore = 15;
    insights.push(`Diverse experience levels (${myExp} + ${candExp})`);
  }

  // 3. INTERESTS OVERLAP (Max 20 points)
  const myInterests = new Set((myProfile.interests || []).map(i => i.toLowerCase()));
  const sharedInterests = (candidateProfile.interests || []).filter(i => myInterests.has(i.toLowerCase()));
  
  let interestsScore = 6;
  if (sharedInterests.length >= 3) {
    interestsScore = 20;
    insights.push(`High domain alignment in ${sharedInterests.slice(0, 2).join(', ')}`);
  } else if (sharedInterests.length === 2) {
    interestsScore = 16;
    insights.push(`Shared interests in ${sharedInterests.join(', ')}`);
  } else if (sharedInterests.length === 1) {
    interestsScore = 12;
    insights.push(`Shared interest in ${sharedInterests[0]}`);
  } else {
    interestsScore = 8;
  }

  // 4. AVAILABILITY MATCH (Max 10 points)
  let availabilityScore = 5;
  const myAvail = myProfile.availability;
  const candAvail = candidateProfile.availability;

  if (myAvail === 'Both' || candAvail === 'Both' || myAvail === candAvail) {
    availabilityScore = 10;
    insights.push('Schedules align perfectly for hackathon sprints');
  } else {
    availabilityScore = 4;
    insights.push('Differing availability windows');
  }

  // 5. HACKATHON RELEVANCE & COMPLETION (Max 10 points)
  let relevanceScore = 6;
  if (candidateProfile.previous_hackathons > 0) {
    relevanceScore += 4;
    insights.push(`Experienced hacker (${candidateProfile.previous_hackathons} previous hackathons)`);
  } else {
    relevanceScore += 2;
    insights.push('Motivated first-time hackathon participant');
  }

  const total = Math.min(
    Math.round(skillsScore + experienceScore + interestsScore + availabilityScore + relevanceScore),
    100
  );

  return {
    total,
    skillsScore,
    experienceScore,
    interestsScore,
    availabilityScore,
    relevanceScore,
    insights
  };
}

export function calculateProfileCompletion(profile: Partial<TeamProfile>): number {
  let score = 0;
  if (profile.display_name?.trim()) score += 15;
  if (profile.skills && profile.skills.length >= 2) score += 25;
  else if (profile.skills && profile.skills.length === 1) score += 10;
  
  if (profile.preferred_roles && profile.preferred_roles.length > 0) score += 20;
  if (profile.experience_level) score += 10;
  if (profile.availability) score += 10;
  if (profile.interests && profile.interests.length > 0) score += 10;
  if (profile.bio?.trim()) score += 10;

  return Math.min(score, 100);
}
