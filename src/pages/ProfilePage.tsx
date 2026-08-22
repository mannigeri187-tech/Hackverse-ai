import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Trophy, Code, Briefcase, Award, PenLine, ExternalLink, 
  Camera, Loader2, Globe, Save, AlertTriangle, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Helper component for valid LinkedIn links
function LinkedInButton({ url }: { url: string }) {
  if (!url) return null;
  // Ensure the url is exactly the stored one
  return (
    <a 
      href={url.trim()}
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-colors"
      title="Visit LinkedIn Profile"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </a>
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [stats, setStats] = useState({ hackathons: 0, wins: 0, projects: 0 });
  const [certificates, setCertificates] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [linkedinError, setLinkedinError] = useState('');

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
        
        // Merge with auth metadata if missing
        if (user.user_metadata) {
          if (!currentProfile.name) currentProfile.name = user.user_metadata.full_name || user.email?.split('@')[0];
          if (!currentProfile.headline) currentProfile.headline = user.user_metadata.headline;
          if (!currentProfile.bio) currentProfile.bio = user.user_metadata.bio;
          if (!currentProfile.location) currentProfile.location = user.user_metadata.location;
          if (!currentProfile.linkedin_url) currentProfile.linkedin_url = user.user_metadata.linkedin_url;
          if (!currentProfile.github_url) currentProfile.github_url = user.user_metadata.github_url;
          if (!currentProfile.portfolio_url) currentProfile.portfolio_url = user.user_metadata.portfolio_url;
          if (!currentProfile.avatar_url) currentProfile.avatar_url = user.user_metadata.avatar_url || user.user_metadata.picture || currentProfile.profile_image;
        }

        // Clean up linkedIn URL if it's duplicated in the database from the previous bug
        if (currentProfile.linkedin_url) {
          const m = currentProfile.linkedin_url.match(/^(https:\/\/[^/]+\.linkedin\.com\/in\/[^/]+\/?)/i);
          if (m) {
            currentProfile.linkedin_url = m[1];
          }
        }
  
        setProfile(currentProfile);
        setEditForm(currentProfile);
  
        // Fetch skills
        const { data: sData } = await supabase
          .from('user_skills')
          .select('skills ( id, name, category )')
          .eq('user_id', user.id);
          
        setSkills((sData || []).map(s => s.skills).filter(Boolean));

        // Fetch Certificates
        const { data: cData } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setCertificates(cData || []);

        // Fetch Workspaces (Projects)
        const { count: projectCount } = await supabase
          .from('workspaces')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch Accepted Team Requests to approximate hackathon participation
        const { data: tData } = await supabase
          .from('team_requests')
          .select('hackathon_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted');
        
        const uniqueHackathons = new Set(tData?.map(t => t.hackathon_id) || []);

        setStats({
          hackathons: uniqueHackathons.size,
          wins: cData?.length || 0,
          projects: projectCount || 0
        });

      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  const validateLinkedIn = (url: string) => {
    if (!url || !url.trim()) return true;
    const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return regex.test(url.trim());
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Validate LinkedIn
    if (editForm.linkedin_url && !validateLinkedIn(editForm.linkedin_url)) {
      setLinkedinError('Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username/)');
      return;
    }
    setLinkedinError('');

    try {
      const { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        name: editForm.name,
        headline: editForm.headline,
        bio: editForm.bio,
        location: editForm.location,
        linkedin_url: editForm.linkedin_url?.trim(),
        github_url: editForm.github_url?.trim(),
        portfolio_url: editForm.portfolio_url?.trim(),
        avatar_url: editForm.avatar_url
      }, { onConflict: 'user_id' });

      if (error) throw error;
      setProfile(editForm);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) return alert('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return alert('File size must be less than 5MB');

    try {
      setIsUploadingAvatar(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setEditForm({ ...editForm, avatar_url: publicUrlData.publicUrl });
      
      // Auto-save just the avatar so it persists even if they cancel other edits
      await supabase.from('profiles').upsert({
        user_id: user.id,
        avatar_url: publicUrlData.publicUrl
      }, { onConflict: 'user_id' });

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrlData.publicUrl }));
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Error uploading avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user-actions', { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => (name || 'U').substring(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse p-4 min-h-screen">
        <div className="h-64 bg-slate-800 rounded-3xl"></div>
        <div className="h-32 bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  // Profile Completion logic
  const requiredFields = ['name', 'headline', 'bio', 'location', 'linkedin_url', 'github_url'];
  const filledFields = requiredFields.filter(f => profile[f] && profile[f].trim() !== '').length;
  const completionPercentage = Math.round((filledFields / requiredFields.length) * 100);

  return (
    <div className="min-h-screen bg-[#050816] text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-24">
        
        {/* Profile Header (Premium Glassmorphism) */}
        <div className="relative bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] shadow-2xl shadow-indigo-900/20 overflow-hidden">
          {/* Top glowing gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
          
          {/* Soft background glows */}
          <div className="absolute -top-[150px] -right-[150px] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-[150px] -left-[150px] w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative p-8 sm:p-12">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-6 sm:top-8 sm:right-8 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium transition-all border border-indigo-500/20"
              >
                <PenLine className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div 
                onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-4xl font-black shrink-0 overflow-hidden relative border-4 border-[#1E2A5A] shadow-[0_0_30px_rgba(79,70,229,0.3)] bg-gradient-to-br from-indigo-900 to-[#0B1026] text-indigo-300 ${isEditing ? 'cursor-pointer group' : ''}`}
              >
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm transition-all">
                    {isUploadingAvatar ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                      <>
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-xs font-bold">Upload</span>
                      </>
                    )}
                  </div>
                )}
                {(isEditing ? editForm.avatar_url : profile.avatar_url) ? (
                  <img src={isEditing ? editForm.avatar_url : profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : getInitials(profile.name)}
              </div>
              <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} />

              {/* Profile Details */}
              <div className="flex-1 w-full space-y-4 pt-2">
                {isEditing ? (
                  <div className="space-y-4 max-w-2xl">
                    <input 
                      type="text" 
                      value={editForm.name || ''} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full p-3 text-2xl font-bold bg-[#111A3A] border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500"
                      placeholder="Full Name"
                    />
                    <input 
                      type="text" 
                      value={editForm.headline || ''} 
                      onChange={e => setEditForm({...editForm, headline: e.target.value})}
                      className="w-full p-3 bg-[#111A3A] border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-300 placeholder-slate-500"
                      placeholder="Professional Headline"
                    />
                    <div className="flex gap-2 items-center">
                      <MapPin className="w-5 h-5 text-indigo-400" />
                      <input 
                        type="text" 
                        value={editForm.location || ''} 
                        onChange={e => setEditForm({...editForm, location: e.target.value})}
                        className="flex-1 p-3 bg-[#111A3A] border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-300 placeholder-slate-500"
                        placeholder="Location (e.g. Bangalore, India)"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                      {profile.name || 'Anonymous Hacker'}
                    </h1>
                    <p className="text-indigo-300 text-lg sm:text-xl font-medium mb-3">
                      {profile.headline || 'Add a professional headline to stand out'}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span>{profile.location || 'Location not specified'}</span>
                    </div>
                  </div>
                )}

                {/* Social Links View Mode */}
                {!isEditing && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {profile.linkedin_url && <LinkedInButton url={profile.linkedin_url} />}
                    {profile.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors" title="GitHub">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                      </a>
                    )}
                    {profile.portfolio_url && (
                      <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-900/40 text-cyan-400 hover:bg-cyan-900/60 hover:text-cyan-300 transition-colors" title="Portfolio">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Row */}
            {!isEditing && (
              <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-indigo-500/10">
                <div className="bg-[#111A3A]/50 rounded-2xl p-4 text-center border border-indigo-500/10">
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stats.hackathons}</div>
                  <div className="text-xs sm:text-sm font-medium text-indigo-300 uppercase tracking-wider">Hackathons</div>
                </div>
                <div className="bg-[#111A3A]/50 rounded-2xl p-4 text-center border border-indigo-500/10">
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stats.wins}</div>
                  <div className="text-xs sm:text-sm font-medium text-cyan-300 uppercase tracking-wider">Wins</div>
                </div>
                <div className="bg-[#111A3A]/50 rounded-2xl p-4 text-center border border-indigo-500/10">
                  <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stats.projects}</div>
                  <div className="text-xs sm:text-sm font-medium text-purple-300 uppercase tracking-wider">Projects</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion Indicator */}
        {!isEditing && completionPercentage < 100 && (
          <div className="bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 shadow-lg flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-sm font-bold text-white">Profile Completion</h3>
                <span className="text-sm font-bold text-indigo-400">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-[#111A3A] rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-2 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-3">Add your LinkedIn, GitHub, and bio to complete your profile.</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
              Complete Now
            </button>
          </div>
        )}

        {isEditing ? (
          /* EDIT MODE FIELDS */
          <div className="bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-xl space-y-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">About Me</h3>
              <textarea 
                value={editForm.bio || ''} 
                onChange={e => setEditForm({...editForm, bio: e.target.value.substring(0, 500)})}
                className="w-full p-4 bg-[#111A3A] border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-300 placeholder-slate-500 min-h-[120px] resize-none"
                placeholder="Full-stack developer passionate about AI, hackathons, and building products that solve real-world problems."
              />
              <div className="text-right text-xs text-slate-500 mt-2">{editForm.bio?.length || 0}/500 characters</div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">LinkedIn Profile</label>
                  <input 
                    type="text" 
                    value={editForm.linkedin_url || ''} 
                    onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})}
                    className="w-full p-3 bg-[#111A3A] border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-300 placeholder-slate-500"
                    placeholder="https://www.linkedin.com/in/your-username/"
                  />
                  {linkedinError && <p className="text-red-400 text-xs mt-1">{linkedinError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">GitHub Profile</label>
                  <input 
                    type="text" 
                    value={editForm.github_url || ''} 
                    onChange={e => setEditForm({...editForm, github_url: e.target.value})}
                    className="w-full p-3 bg-[#111A3A] border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-300 placeholder-slate-500"
                    placeholder="https://github.com/your-username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Portfolio Website</label>
                  <input 
                    type="text" 
                    value={editForm.portfolio_url || ''} 
                    onChange={e => setEditForm({...editForm, portfolio_url: e.target.value})}
                    className="w-full p-3 bg-[#111A3A] border border-indigo-500/30 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-300 placeholder-slate-500"
                    placeholder="https://your-portfolio.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-indigo-500/20">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(profile);
                  setLinkedinError('');
                }}
                className="px-6 py-2.5 bg-transparent hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: About & Skills */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" /> About Me
                </h3>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                  {profile.bio || "No bio added yet."}
                </p>
              </div>

              <div className="bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan-400" /> Skills
                  </h3>
                  <Link to="/skill-gap" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Edit Skills</Link>
                </div>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span key={skill.id} className="px-3 py-1.5 bg-[#111A3A] border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-semibold">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No skills added yet.</p>
                )}
              </div>
            </div>

            {/* Right Column: Achievements & Projects */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Achievements / Certificates */}
              <div className="bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" /> Achievements & Certificates
                  </h3>
                  <Link to="/certificate-vault" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Manage</Link>
                </div>
                {certificates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {certificates.map(cert => (
                      <div key={cert.id} className="p-4 bg-[#111A3A] border border-indigo-500/20 rounded-2xl flex flex-col hover:border-indigo-500/50 transition-colors">
                        <Trophy className="w-6 h-6 text-amber-400 mb-2" />
                        <h4 className="font-bold text-slate-200 line-clamp-1">{cert.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{cert.issuer || 'HackVerse AI'}</p>
                        {cert.certificate_url && (
                          <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 w-fit">
                            View Certificate <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No certificates yet.</p>
                )}
              </div>

              {/* Projects placeholder (Workspaces) */}
              <div className="bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-emerald-400" /> Public Projects
                  </h3>
                  <Link to="/workspaces" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View Workspaces</Link>
                </div>
                <div className="p-8 border border-dashed border-indigo-500/20 rounded-2xl text-center">
                  <p className="text-sm text-slate-500 mb-2">Projects integration from Workspaces</p>
                  <p className="text-xs text-slate-600">Ensure your workspace is marked public to display it here.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Danger Zone */}
        {!isEditing && (
          <div className="mt-16 border-t border-red-500/20 pt-16">
            <div className="bg-[#1a0f14] border border-red-500/30 rounded-3xl p-8 sm:p-10 shadow-xl shadow-red-900/10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h3>
                  <p className="text-sm text-slate-400 mb-6 max-w-xl">
                    Permanently delete your HackVerse AI account and all associated data. This action is destructive, completely irreversible, and removes your profile, certificates, and workspaces.
                  </p>
                  
                  {!showDelete ? (
                    <button 
                      onClick={() => setShowDelete(true)}
                      className="px-6 py-2.5 bg-transparent border border-red-500/50 hover:bg-red-500/10 text-red-500 text-sm font-bold rounded-xl transition-colors"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-4 max-w-md">
                      <label className="block text-sm font-medium text-slate-300">
                        Type <span className="font-bold text-red-400 select-all">DELETE</span> to confirm
                      </label>
                      <input 
                        type="text" 
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        className="w-full p-3 bg-[#0B1026] border border-red-500/50 rounded-xl focus:ring-2 focus:ring-red-500 text-white font-mono"
                        placeholder="DELETE"
                      />
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                          className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirm !== 'DELETE' || isDeleting}
                          className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-red-400/50 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
