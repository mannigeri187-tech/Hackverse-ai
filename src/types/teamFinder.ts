export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type AvailabilityType = 'Weekdays' | 'Weekends' | 'Both';
export type PreferredRole = 'Frontend' | 'Backend' | 'AI/ML' | 'UI/UX' | 'Pitching' | 'Business' | 'DevOps' | 'Other';
type TeamRequestStatus = 'pending' | 'accepted' | 'rejected';

export const AVAILABLE_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'AI/ML',
  'Data Science',
  'SQL',
  'Firebase',
  'Supabase',
  'UI/UX',
  'Figma',
  'Backend',
  'Frontend',
  'DevOps',
  'Cloud',
  'Pitching',
  'Business',
  'Marketing'
];

export const AVAILABLE_INTERESTS = [
  'Artificial Intelligence',
  'Web Development',
  'Mobile Apps',
  'FinTech',
  'Healthcare',
  'Climate & Sustainability',
  'EdTech',
  'Gaming',
  'Open Source',
  'Web3 / Crypto',
  'Social Good'
];

export const AVAILABLE_ROLES: PreferredRole[] = [
  'Frontend',
  'Backend',
  'AI/ML',
  'UI/UX',
  'Pitching',
  'Business',
  'DevOps',
  'Other'
];

export interface TeamProfile {
  id?: string;
  user_id: string;
  display_name: string;
  skills: string[];
  experience_level: ExperienceLevel;
  interests: string[];
  availability: AvailabilityType;
  preferred_roles: PreferredRole[];
  previous_hackathons: number;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CompatibilityBreakdown {
  total: number; // 0 - 100
  skillsScore: number; // max 40
  experienceScore: number; // max 20
  interestsScore: number; // max 20
  availabilityScore: number; // max 10
  relevanceScore: number; // max 10
  insights: string[];
}

export interface TeamRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  hackathon_id: string;
  status: TeamRequestStatus;
  message?: string | null;
  created_at: string;
  updated_at: string;
  sender_profile?: TeamProfile;
  receiver_profile?: TeamProfile;
  hackathon_title?: string;
}

export interface TeammateFilterState {
  skill: string;
  role: string;
  experience: string;
  availability: string;
  searchQuery: string;
}
