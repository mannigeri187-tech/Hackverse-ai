import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MapPin, Trophy, Code, Briefcase, Award, PenLine, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LinkedInButton from '../components/profile/LinkedInButton';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      
      try {
        // Fetch profile
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        let currentProfile = pData || {};
        
        // Merge with auth metadata if missing fields
        if (user.user_metadata) {
          if (!currentProfile.name) currentProfile.name = user.user_metadata.full_name || user.email?.split('@')[0];
          if (!currentProfile.headline) currentProfile.headline = user.user_metadata.headline;
          if (!currentProfile.bio) currentProfile.bio = user.user_metadata.bio;
          if (!currentProfile.location) currentProfile.location = user.user_metadata.location;
          if (!currentProfile.linkedin_url) currentProfile.linkedin_url = user.user_metadata.linkedin_url;
        }

        setProfile(currentProfile);
        setEditForm(currentProfile);

        // Fetch skills
        const { data: sData } = await supabase
          .from('user_skills')
          .select('proficiency, skill:skills(id, name, category)')
          .eq('user_id', user.id);
        if (sData) setSkills(sData);

        // Fetch projects
        const { data: projData } = await supabase
          .from('workspaces')
          .select('id, project_name, problem_statement, tech_stack, github_url, hackathon:hackathons(id, title)')
          .eq('user_id', user.id)
          .not('project_name', 'is', null);
        if (projData) setProjects(projData);

        // Fetch achievements
        const { data: achData } = await supabase
          .from('certificates')
          .select('id, title, issuer, certificate_date, description, hackathon:hackathons(id, title)')
          .eq('user_id', user.id);
        if (achData) setAchievements(achData);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Validate LinkedIn URL
    if (editForm.linkedin_url) {
      try {
        const url = new URL(editForm.linkedin_url);
        if (!url.hostname.includes('linkedin.com')) {
          alert('Please enter a valid LinkedIn URL');
          return;
        }
      } catch {
        alert('Please enter a valid URL (include https://)');
        return;
      }
    }

    try {
      // 1. Try to save to profiles table (requires SQL migration)
      await supabase.from('profiles').upsert({
        user_id: user.id,
        name: editForm.name,
        headline: editForm.headline,
        bio: editForm.bio,
        location: editForm.location,
        linkedin_url: editForm.linkedin_url,
      });

      // 2. Always save to user_metadata as fallback
      await supabase.auth.updateUser({
        data: {
          full_name: editForm.name,
          headline: editForm.headline,
          bio: editForm.bio,
          location: editForm.location,
          linkedin_url: editForm.linkedin_url,
        }
      });

      setProfile(editForm);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE' || !user) return;
    setIsDeleting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete account');
      
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Failed to delete account. Please try again later.');
      setIsDeleting(false);
      setShowDelete(false);
      setDeleteConfirm('');
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-4">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'U';
  const hackathonsParticipated = projects.length;
  const hackathonsWon = achievements.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-600/20 dark:to-blue-600/20"></div>
        
        <div className="relative pt-12 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center text-cyan-700 dark:text-cyan-300 text-4xl font-black shadow-xl border-4 border-white dark:border-slate-900 shrink-0">
            {profile.profile_image ? (
              <img src={profile.profile_image} alt={profile.name} className="w-full h-full object-cover rounded-full" />
            ) : getInitials(profile.name)}
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            {isEditing ? (
              <div className="space-y-4 w-full">
                <input 
                  type="text" 
                  value={editForm.name || ''} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full p-2 text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
                <input 
                  type="text" 
                  value={editForm.headline || ''} 
                  onChange={e => setEditForm({...editForm, headline: e.target.value})}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Professional Headline"
                />
                <div className="flex gap-2">
                  <MapPin className="w-5 h-5 text-slate-400 mt-2" />
                  <input 
                    type="text" 
                    value={editForm.location || ''} 
                    onChange={e => setEditForm({...editForm, location: e.target.value})}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Location"
                  />
                </div>
                <textarea 
                  value={editForm.bio || ''} 
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  maxLength={500}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Tell the community about yourself..."
                />
                <div className="text-xs text-right text-slate-500">{editForm.bio?.length || 0}/500</div>
                <div className="flex gap-2">
                  <ExternalLink className="w-5 h-5 text-slate-400 mt-2" />
                  <input 
                    type="url" 
                    value={editForm.linkedin_url || ''} 
                    onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="LinkedIn Profile URL (https://www.linkedin.com/in/...)"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProfile} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                    Save Profile
                  </button>
                  <button onClick={() => {setIsEditing(false); setEditForm(profile);}} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-300 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      {profile.name}
                    </h1>
                    {profile.headline && <p className="text-lg text-slate-700 dark:text-slate-300 mt-2 font-medium">{profile.headline}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold rounded-lg transition-colors"
                    >
                      <PenLine className="w-4 h-4" /> Edit Profile
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>

                {profile.location && (
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                    <MapPin className="w-4 h-4 mr-1.5" /> {profile.location}
                  </div>
                )}

                {profile.bio ? (
                  <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-sm">No bio added yet.</p>
                )}

                <div className="pt-2 flex flex-wrap gap-3">
                  {profile.linkedin_url && <LinkedInButton url={profile.linkedin_url} />}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-3">
            <Code className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{hackathonsParticipated}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Hackathons</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-10 h-10 mx-auto bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{hackathonsWon}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Wins</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{projects.length}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Projects</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Skills */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Skills</h3>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((s: any) => (
                  <span key={s.skill.id} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">
                    {s.skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">You haven't added any skills. Go to the Skill Gap section to add them.</p>
            )}
          </div>
        </div>

        {/* Right Column: Projects & Achievements */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Projects */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" /> Your Projects (Participated)
            </h3>
            {projects.length > 0 ? (
              <div className="grid gap-4">
                {projects.map((p: any) => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{p.project_name}</h4>
                    {p.hackathon && <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">{p.hackathon.title}</p>}
                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4">{p.problem_statement}</p>
                    {p.tech_stack && p.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.tech_stack.slice(0, 4).map((tech: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
                You haven't added any projects to your workspaces yet.
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Hackathon Wins & Achievements
            </h3>
            {achievements.length > 0 ? (
              <div className="grid gap-4">
                {achievements.map((a: any) => (
                  <div key={a.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-500/20 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center shrink-0">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{a.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{a.hackathon?.title || a.issuer}</p>
                      {a.description && <p className="text-sm text-slate-500 mt-1">{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
                No achievements recorded yet. Add them in the Certificate Vault.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-red-500/20 pt-12 mt-12">
        <div className="bg-red-50 dark:bg-red-500/5 p-6 md:p-8 rounded-3xl border border-red-200 dark:border-red-500/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" /> Danger Zone
              </h3>
              <p className="text-red-600/80 dark:text-red-400/80 text-sm mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            
            {!showDelete ? (
              <button 
                onClick={() => setShowDelete(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shrink-0 shadow-lg shadow-red-600/20"
              >
                Delete Account
              </button>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-200 dark:border-red-500/30 w-full md:w-auto shadow-sm">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Type <strong className="text-red-600 dark:text-red-400">DELETE</strong> to confirm:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="flex-1 w-full md:w-32 p-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-bold text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500"
                    placeholder="DELETE"
                  />
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== 'DELETE' || isDeleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm'}
                  </button>
                  <button 
                    onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
