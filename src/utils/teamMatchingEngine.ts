import type { TeamProfile, PreferredRole } from '../types/teamFinder';
import type { HackathonSkill } from '../types/skillGap';

export interface TeamMatchResult {
  score: number;
  skillComplementarity: number;
  experienceBalance: number;
  hackathonRelevance: number;
  interestAlignment: number;
  availability: number;
  roleComplementarity: number;
  matchedSkills: string[];
  teamGapsFilled: string[];
  missingTeamSkills: string[];
  reasons: string[];
  matchLabel: 'Excellent Match' | 'Strong Match' | 'Good Match' | 'Potential Match' | 'Low Match';
}

/**
 * Pure calculation function for hackathon-specific teammate matching.
 * Deterministic, in-memory, without direct database calls.
 */
export function calculateTeamMatch(
  currentUserProfile: TeamProfile | null,
  candidateProfile: TeamProfile,
  hackathonRequirements: HackathonSkill[] = [],
  currentTeamSkills: string[] = []
): TeamMatchResult {
  const reasons: string[] = [];

  // Gather current team skills
  const teamSkillsSet = new Set(
    (currentTeamSkills.length > 0 ? currentTeamSkills : currentUserProfile?.skills || []).map((s) => s.toLowerCase().trim())
  );

  // Candidate skills and roles sets
  const candidateSkills = (candidateProfile.skills || []).map((s) => s.trim());
  const candidateSkillsSet = new Set(candidateSkills.map((s) => s.toLowerCase()));

  // Current team roles
  const teamRolesSet = new Set((currentUserProfile?.preferred_roles || []).map((r) => r.toLowerCase().trim()));

  // Hackathon required and recommended skills sets
  const reqSkillsList = hackathonRequirements
    .filter((h) => h.importance === 'required')
    .map((h) => h.skill?.name || '')
    .filter(Boolean);

  const recSkillsList = hackathonRequirements
    .filter((h) => h.importance === 'recommended')
    .map((h) => h.skill?.name || '')
    .filter(Boolean);

  const hackathonReqSkillsSet = new Set(reqSkillsList.map((s) => s.toLowerCase()));
  const hackathonRecSkillsSet = new Set(recSkillsList.map((s) => s.toLowerCase()));
  const allHackathonSkillsSet = new Set([...hackathonReqSkillsSet, ...hackathonRecSkillsSet]);

  // ---------------------------------------------------------
  // 1. TEAM GAPS IDENTIFICATION & FILLING (Max 40 pts)
  // ---------------------------------------------------------
  // Team Gaps = (Hackathon Requirements - Current Team Skills)
  const teamGapsList: string[] = [];
  hackathonRequirements.forEach((hr) => {
    const sName = hr.skill?.name;
    if (sName && !teamSkillsSet.has(sName.toLowerCase())) {
      teamGapsList.push(sName);
    }
  });

  const teamGapsFilled: string[] = [];
  const missingTeamSkills: string[] = [];

  teamGapsList.forEach((gapSkill) => {
    if (candidateSkillsSet.has(gapSkill.toLowerCase())) {
      teamGapsFilled.push(gapSkill);
    } else {
      missingTeamSkills.push(gapSkill);
    }
  });

  // Candidate's matched skills for this hackathon
  const matchedSkills: string[] = [];
  candidateSkills.forEach((s) => {
    if (allHackathonSkillsSet.has(s.toLowerCase())) {
      matchedSkills.push(s);
    }
  });

  let skillComplementarity = 10; // baseline

  if (teamGapsList.length > 0) {
    // Gap filling points (up to 30 pts)
    const gapFillRatio = teamGapsFilled.length / teamGapsList.length;
    skillComplementarity += Math.round(gapFillRatio * 30);

    if (teamGapsFilled.length > 0) {
      reasons.push(`Fills ${teamGapsFilled.length} important team skill gap${teamGapsFilled.length > 1 ? 's' : ''} (${teamGapsFilled.join(', ')}).`);
    }
  } else {
    // If no explicit hackathon requirements, score based on complementary new skills
    const uniqueSkills = candidateSkills.filter((s) => !teamSkillsSet.has(s.toLowerCase()));
    skillComplementarity += Math.min(uniqueSkills.length * 6, 25);
    if (uniqueSkills.length > 0) {
      reasons.push(`Brings ${uniqueSkills.length} new skill${uniqueSkills.length > 1 ? 's' : ''} to the team (${uniqueSkills.slice(0, 3).join(', ')}).`);
    }
  }

  // Cross-domain synergy bonus (+5 pts)
  const isTeamFrontend = [...teamSkillsSet].some((s) => ['react', 'javascript', 'typescript', 'frontend', 'ui/ux', 'figma'].includes(s));
  const isCandidateBackendOrAI = [...candidateSkillsSet].some((s) =>
    ['python', 'backend', 'ai/ml', 'data science', 'sql', 'devops', 'cloud', 'supabase', 'firebase', 'docker'].includes(s)
  );

  if (isTeamFrontend && isCandidateBackendOrAI) {
    skillComplementarity += 5;
    reasons.push('Provides strong Full-Stack / AI cross-domain synergy.');
  }

  skillComplementarity = Math.min(Math.max(skillComplementarity, 0), 40);

  // ---------------------------------------------------------
  // 2. HACKATHON RELEVANCE (Max 20 pts)
  // ---------------------------------------------------------
  let hackathonRelevance = 8; // baseline

  if (allHackathonSkillsSet.size > 0) {
    let reqMatches = 0;
    let recMatches = 0;

    candidateSkills.forEach((s) => {
      const lower = s.toLowerCase();
      if (hackathonReqSkillsSet.has(lower)) reqMatches++;
      else if (hackathonRecSkillsSet.has(lower)) recMatches++;
    });

    // Required skills provide higher weight than recommended
    const relevanceGain = reqMatches * 6 + recMatches * 3;
    hackathonRelevance = Math.min(hackathonRelevance + relevanceGain, 20);

    if (reqMatches > 0) {
      reasons.push(`Possesses ${reqMatches} core skill${reqMatches > 1 ? 's' : ''} required by this hackathon.`);
    }
  } else if (candidateProfile.previous_hackathons > 0) {
    hackathonRelevance = Math.min(hackathonRelevance + 6, 20);
    reasons.push(`Experienced competitor (${candidateProfile.previous_hackathons} previous hackathons).`);
  }

  hackathonRelevance = Math.min(Math.max(hackathonRelevance, 0), 20);

  // ---------------------------------------------------------
  // 3. EXPERIENCE BALANCE (Max 15 pts)
  // ---------------------------------------------------------
  let experienceBalance = 10;
  const myExp = currentUserProfile?.experience_level || 'Intermediate';
  const candExp = candidateProfile.experience_level || 'Beginner';

  if ((myExp === 'Beginner' && candExp === 'Intermediate') || (myExp === 'Intermediate' && candExp === 'Advanced')) {
    experienceBalance = 15;
    reasons.push(`Great experience balance (${candExp} elevates team execution).`);
  } else if (myExp === candExp) {
    experienceBalance = 13;
  } else if (myExp === 'Advanced' && candExp === 'Beginner') {
    experienceBalance = 11;
    reasons.push('Fresh perspectives and high hackathon enthusiasm.');
  } else {
    experienceBalance = 12;
  }

  experienceBalance = Math.min(Math.max(experienceBalance, 0), 15);

  // ---------------------------------------------------------
  // 4. AVAILABILITY (Max 10 pts)
  // ---------------------------------------------------------
  let availability = 4;
  const myAvail = currentUserProfile?.availability || 'Both';
  const candAvail = candidateProfile.availability || 'Both';

  if (myAvail === 'Both' || candAvail === 'Both' || myAvail === candAvail) {
    availability = 10;
    reasons.push(`Available on ${candAvail === 'Both' ? 'Weekdays & Weekends' : candAvail} aligned with your schedule.`);
  } else {
    availability = 3;
  }

  availability = Math.min(Math.max(availability, 0), 10);

  // ---------------------------------------------------------
  // 5. INTEREST ALIGNMENT (Max 10 pts)
  // ---------------------------------------------------------
  let interestAlignment = 4;
  const myInterestsSet = new Set((currentUserProfile?.interests || []).map((i) => i.toLowerCase().trim()));
  const sharedInterests = (candidateProfile.interests || []).filter((i) => myInterestsSet.has(i.toLowerCase().trim()));

  if (sharedInterests.length >= 2) {
    interestAlignment = 10;
    reasons.push(`Strong shared domain interests in ${sharedInterests.slice(0, 2).join(' & ')}.`);
  } else if (sharedInterests.length === 1) {
    interestAlignment = 7;
    reasons.push(`Shared track interest in ${sharedInterests[0]}.`);
  } else {
    interestAlignment = 4;
  }

  interestAlignment = Math.min(Math.max(interestAlignment, 0), 10);

  // ---------------------------------------------------------
  // 6. ROLE COMPLEMENTARITY (Max 5 pts)
  // ---------------------------------------------------------
  let roleComplementarity = 2;
  const missingRoles: PreferredRole[] = (candidateProfile.preferred_roles || []).filter(
    (role) => !teamRolesSet.has(role.toLowerCase().trim())
  );

  if (missingRoles.length > 0) {
    roleComplementarity = 5;
    reasons.push(`Provides ${missingRoles[0]} role currently missing in your squad.`);
  } else {
    roleComplementarity = 3;
  }

  roleComplementarity = Math.min(Math.max(roleComplementarity, 0), 5);

  // ---------------------------------------------------------
  // FINAL SCORE & LABEL CALCULATION
  // ---------------------------------------------------------
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        skillComplementarity +
        hackathonRelevance +
        experienceBalance +
        availability +
        interestAlignment +
        roleComplementarity
      )
    )
  );

  let matchLabel: 'Excellent Match' | 'Strong Match' | 'Good Match' | 'Potential Match' | 'Low Match';
  if (totalScore >= 90) {
    matchLabel = 'Excellent Match';
  } else if (totalScore >= 75) {
    matchLabel = 'Strong Match';
  } else if (totalScore >= 60) {
    matchLabel = 'Good Match';
  } else if (totalScore >= 40) {
    matchLabel = 'Potential Match';
  } else {
    matchLabel = 'Low Match';
  }

  return {
    score: totalScore,
    skillComplementarity,
    experienceBalance,
    hackathonRelevance,
    interestAlignment,
    availability,
    roleComplementarity,
    matchedSkills,
    teamGapsFilled,
    missingTeamSkills,
    reasons: reasons.slice(0, 4),
    matchLabel,
  };
}
