import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Trophy, Code, Briefcase, Award, ExternalLink, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Helper component for valid LinkedIn links
function LinkedInButton({ url }: { url: string }) {
  if (!url) return null;
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

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [stats, setStats] = useState({ hackathons: 0, wins: 0, projects: 0 });
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!username) return;
      setIsLoading(true);
      
      try {
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
          
        if (!pData) {
          setIsLoading(false);
          return;
        }

        let currentProfile = pData;
        
        // Clean up linkedIn URL if duplicated
        if (currentProfile.linkedin_url) {
          const m = currentProfile.linkedin_url.match(/^(https:\/\/[^/]+\.linkedin\.com\/in\/[^/]+\/?)/i);
          if (m) {
            currentProfile.linkedin_url = m[1];
          }
        }
  
        setProfile(currentProfile);
  
        const { data: sData } = await supabase
          .from('user_skills')
          .select('skills ( id, name, category )')
          .eq('user_id', pData.user_id);
          
        setSkills((sData || []).map(s => s.skills).filter(Boolean));

        const { data: cData } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', pData.user_id)
          .order('created_at', { ascending: false });
        
        setCertificates(cData || []);

        const { count: projectCount } = await supabase
          .from('workspaces')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', pData.user_id);

        const { data: tData } = await supabase
          .from('team_requests')
          .select('hackathon_id')
          .or(`sender_id.eq.${pData.user_id},receiver_id.eq.${pData.user_id}`)
          .eq('status', 'accepted');
        
        const uniqueHackathons = new Set(tData?.map(t => t.hackathon_id) || []);

        setStats({
          hackathons: uniqueHackathons.size,
          wins: cData?.length || 0,
          projects: projectCount || 0
        });

      } catch (err) {
        console.error('Error loading public profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [username]);

  const getInitials = (name: string) => (name || 'U').substring(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse p-4 min-h-screen">
        <div className="h-64 bg-slate-800 rounded-3xl"></div>
        <div className="h-32 bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4">
        <div className="bg-[#0B1026]/80 border border-indigo-500/20 p-8 rounded-3xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-slate-400 mb-6">The hacker you are looking for does not exist or has set their profile to private.</p>
          <Link to="/" className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

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
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-4xl font-black shrink-0 overflow-hidden border-4 border-[#1E2A5A] shadow-[0_0_30px_rgba(79,70,229,0.3)] bg-gradient-to-br from-indigo-900 to-[#0B1026] text-indigo-300">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : getInitials(profile.name)}
              </div>

              {/* Profile Details */}
              <div className="flex-1 w-full space-y-4 pt-2">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                    {profile.name || 'Anonymous Hacker'}
                  </h1>
                  <p className="text-indigo-300 text-lg sm:text-xl font-medium mb-3">
                    {profile.headline || 'Hacker'}
                  </p>
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{profile.location || 'Location not specified'}</span>
                  </div>
                </div>

                {/* Social Links View Mode */}
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
              </div>
            </div>

            {/* Statistics Row */}
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
          </div>
        </div>

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
            <div className="bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-amber-400" /> Achievements & Certificates
              </h3>
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
                <p className="text-sm text-slate-500">No public certificates yet.</p>
              )}
            </div>

            {/* Projects placeholder (Workspaces) */}
            <div className="bg-[#0B1026]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Code className="w-5 h-5 text-emerald-400" /> Public Projects
              </h3>
              <div className="p-8 border border-dashed border-indigo-500/20 rounded-2xl text-center">
                <p className="text-sm text-slate-500 mb-2">Projects integration from Workspaces</p>
                <p className="text-xs text-slate-600">Workspaces mapped to public projects will appear here.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
