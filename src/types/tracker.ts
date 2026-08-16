import type { Hackathon } from '../hooks/useHackathons';

export type TrackerStatus = 
  | 'Saved'
  | 'Preparing'
  | 'Registered'
  | 'Team Formed'
  | 'Building'
  | 'Submitted'
  | 'Result';

export const TRACKER_STATUSES: TrackerStatus[] = [
  'Saved',
  'Preparing',
  'Registered',
  'Team Formed',
  'Building',
  'Submitted',
  'Result'
];

export interface TrackedHackathon {
  id: string;
  user_id: string;
  hackathon_id: string;
  status: TrackerStatus;
  notes?: string | null;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
  hackathons: Hackathon;
}
