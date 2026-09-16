import type { TeamProfile } from '../types/teamFinder';

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
