import { useState } from 'react';
import { Check, Sparkles, User, Briefcase, Award, Clock, Heart, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  AVAILABLE_SKILLS, 
  AVAILABLE_INTERESTS, 
  AVAILABLE_ROLES, 
  type TeamProfile, 
  type ExperienceLevel, 
  type AvailabilityType, 
  type PreferredRole 
} from '../types/teamFinder';
import { calculateProfileCompletion } from '../utils/teamMatching';

interface TeamProfileFormProps {
  initialProfile: TeamProfile | null;
  onSave: (savedProfile: TeamProfile) => void;
}

export function TeamProfileForm({ initialProfile, onSave }: TeamProfileFormProps) {
  const { user } = useAuth();
  
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || user?.email?.split('@')[0] || '');
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || []);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(initialProfile?.experience_level || 'Beginner');
  const [interests, setInterests] = useState<string[]>(initialProfile?.interests || []);
  const [availability, setAvailability] = useState<AvailabilityType>(initialProfile?.availability || 'Both');
  const [preferredRoles, setPreferredRoles] = useState<PreferredRole[]>(initialProfile?.preferred_roles || []);
  const [previousHackathons, setPreviousHackathons] = useState<number>(initialProfile?.previous_hackathons || 0);
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentProfileState: Partial<TeamProfile> = {
    display_name: displayName,
    skills,
    experience_level: experienceLevel,
    interests,
    availability,
    preferred_roles: preferredRoles,
    previous_hackathons: previousHackathons,
    bio
  };

  const completionPercent = calculateProfileCompletion(currentProfileState);

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleRole = (role: PreferredRole) => {
    setPreferredRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const payload = {
        user_id: user.id,
        display_name: displayName.trim() || user.email?.split('@')[0] || 'Hacker',
        skills,
        experience_level: experienceLevel,
        interests,
        availability,
        preferred_roles: preferredRoles,
        previous_hackathons: Math.max(0, Number(previousHackathons) || 0),
        bio: bio.trim(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('team_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setSaveSuccess(true);
      if (data) {
        onSave(data as TeamProfile);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving team profile:', err);
      setErrorMsg(err.message || 'Failed to save team profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
      {/* Header & Completion Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-600" /> Complete Your Team Profile
            </h2>
            <p className="text-sm text-slate-500">
              Highlight your skills, role interests, and availability to match with ideal teammates.
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-700">Completion</span>
            <span className="text-lg font-extrabold text-primary-600 ml-1.5">{completionPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          ></div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Team profile saved successfully! You are now discoverable by other hackers.
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* 1. Display Name */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
          <User className="w-4 h-4 text-slate-400" /> Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Alex Chen"
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
        <p className="text-xs text-slate-400 mt-1">This name will be shown publicly to potential teammates (no emails or phone numbers are ever displayed).</p>
      </div>

      {/* 2. Preferred Roles */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-slate-400" /> Preferred Roles in a Hackathon Team
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ROLES.map(role => {
            const isSelected = preferredRoles.includes(role);
            return (
              <button
                type="button"
                key={role}
                onClick={() => toggleRole(role)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Skills */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-slate-400" /> Your Skills & Technologies
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SKILLS.map(skill => {
            const isSelected = skills.includes(skill);
            return (
              <button
                type="button"
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Experience & Availability Row */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Experience Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map(level => (
              <button
                type="button"
                key={level}
                onClick={() => setExperienceLevel(level)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  experienceLevel === level
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" /> Availability
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Weekdays', 'Weekends', 'Both'] as AvailabilityType[]).map(avail => (
              <button
                type="button"
                key={avail}
                onClick={() => setAvailability(avail)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  availability === avail
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {avail}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Interests / Tracks */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-slate-400" /> Hackathon Tracks & Interests
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_INTERESTS.map(interest => {
            const isSelected = interests.includes(interest);
            return (
              <button
                type="button"
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Previous Hackathons & Bio */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Previous Hackathons
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={previousHackathons}
            onChange={(e) => setPreviousHackathons(parseInt(e.target.value) || 0)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Bio & What You're Looking For
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g. Passionate about AI agents and full-stack development. Looking for an enthusiastic backend/ML engineer for upcoming virtual hackathons!"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[70px]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Profile...' : 'Save Team Profile'}
        </button>
      </div>
    </form>
  );
}
