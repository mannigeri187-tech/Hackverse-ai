import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  FolderGit2, 
  Award, 
  ExternalLink, 
  Calendar, 
  Layers, 
  Building2, 
  Loader2, 
  Rocket, 
  CheckCircle2,
  Lock,
  GitBranch
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useCertificates } from '../hooks/useCertificates';

export default function HackathonPortfolioPage() {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces } = useWorkspaces();
  const { certificates, fetchCertificates } = useCertificates();

  const [profile, setProfile] = useState<any | null>(null);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPortfolioData() {
      if (!user) return;
      setIsLoading(true);

      try {
        // 1. Fetch Profile info
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // Also fetch team profile info (preferred roles, bio)
        const { data: teamProf } = await supabase
          .from('team_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setProfile({
          name: profData?.name || teamProf?.display_name || 'Hackathon Hacker',
          college: profData?.college || teamProf?.college || '',
          bio: profData?.bio || teamProf?.bio || 'Passionate software engineer building innovative hackathon solutions.',
          preferred_roles: teamProf?.preferred_roles || ['Full-Stack Developer'],
          skills: teamProf?.skills || [],
        });

        // 2. Fetch User Skills
        if (teamProf?.skills && Array.isArray(teamProf.skills)) {
          setUserSkills(teamProf.skills.map((s: string) => ({ name: s, category: 'Technical', proficiency: 'Intermediate' })));
        }

        // 3. Workspaces & Certificates
        await Promise.all([
          fetchWorkspaces(),
          fetchCertificates()
        ]);
      } catch (err) {
        console.error('Error loading portfolio:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPortfolioData();
  }, [user, fetchWorkspaces, fetchCertificates]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* 1. HERO PROFILE CARD */}
      <div className="bg-theme-portfolio-8k text-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-cyan-900/40 relative overflow-hidden glow-blue">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-600/30 border-2 border-cyan-400 text-white font-black text-2xl flex items-center justify-center shadow-lg">
              {profile?.name?.slice(0, 2).toUpperCase() || <User className="w-8 h-8" />}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                <Lock className="w-3 h-3 text-cyan-400" /> Developer Portfolio &amp; Verified Proof-of-Work
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">{profile?.name}</h1>
              {profile?.college && (
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" /> {profile.college}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(profile?.preferred_roles || []).map((role: string, idx: number) => (
              <span 
                key={idx}
                className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-xl backdrop-blur-sm border border-white/10"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {profile?.bio && (
          <p className="text-xs sm:text-sm text-slate-300 mt-6 leading-relaxed max-w-3xl border-t border-white/10 pt-4">
            {profile.bio}
          </p>
        )}
      </div>

      {/* 2. STATS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Hackathons</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{workspaces.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Projects Built</span>
          <p className="text-2xl sm:text-3xl font-black text-primary-600">{workspaces.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Certificates</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{certificates.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Skills Tracked</span>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">{userSkills.length}</p>
        </div>
      </div>

      {/* 3. FEATURED HACKATHON PROJECTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-primary-600" />
            Hackathon Projects ({workspaces.length})
          </h2>
          <Link to="/hackathons" className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
            <span>Discover Events</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
            <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No hackathon projects created yet.</h3>
            <p className="text-xs text-slate-500">Participate in a hackathon to automatically showcase your work.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((ws) => (
              <div 
                key={ws.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 truncate">
                      {ws.hackathon?.title || 'Hackathon Project'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {ws.progress_percentage || 0}% Complete
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{ws.project_name || 'Untitled Project'}</h3>

                  {ws.problem_statement && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      <strong className="text-slate-800">Problem:</strong> {ws.problem_statement}
                    </p>
                  )}

                  {ws.solution && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      <strong className="text-slate-800">Solution:</strong> {ws.solution}
                    </p>
                  )}

                  {/* Tech Stack */}
                  {Array.isArray(ws.tech_stack) && ws.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ws.tech_stack.slice(0, 5).map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/workspace/${ws.id}`}
                    className="text-xs font-bold text-primary-600 hover:text-primary-800 inline-flex items-center gap-1"
                  >
                    <span>Open Workspace</span>
                    <Rocket className="w-3.5 h-3.5" />
                  </Link>

                  {ws.github_url && (
                    <a
                      href={ws.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>View Repository</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. VERIFIED CREDENTIALS & CERTIFICATES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Verified Certificates ({certificates.length})
          </h2>
          <Link to="/certificates" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            <span>Manage Vault</span>
          </Link>
        </div>

        {certificates.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
            <Award className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No certificates stored yet.</h3>
            <Link to="/certificates" className="text-xs font-bold text-primary-600 hover:underline">
              Add your credentials to the Certificate Vault
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div 
                key={cert.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block truncate">
                    {cert.hackathon?.title || 'Hackathon Award'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{cert.title}</h4>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    {cert.issuer && <p>Issuer: {cert.issuer}</p>}
                    {cert.certificate_date && (
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {new Date(cert.certificate_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {cert.certificate_url && (
                  <a
                    href={cert.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="pt-2 border-t border-slate-100 text-xs font-bold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. VERIFIED TECHNICAL SKILLS */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-purple-600" />
          Technical Skillset ({userSkills.length})
        </h2>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {userSkills.length === 0 ? (
            <div className="text-center py-4 space-y-1">
              <p className="text-xs text-slate-500">No skills added yet.</p>
              <Link to="/team-finder" className="text-xs font-bold text-primary-600 hover:underline">
                Update your team profile & skills
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200"
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
