import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Trophy, Code, Briefcase, Award } from 'lucide-react';
import LinkedInButton from '../components/profile/LinkedInButton';
import TwitterButton from '../components/profile/TwitterButton';

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicProfile() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/user-actions?id=${id}`);
        if (!res.ok) throw new Error('Profile not found');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-4">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !data?.profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Profile Not Found</h2>
        <p className="text-slate-500 mt-2">The user you are looking for does not exist or is private.</p>
      </div>
    );
  }

  const { profile, skills, projects, achievements } = data;

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'U';

  const hackathonsParticipated = projects.length;
  const hackathonsWon = achievements.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-600/20 dark:to-purple-600/20"></div>
        
        <div className="relative pt-12 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 text-4xl font-black shadow-xl border-4 border-white dark:border-slate-900 shrink-0 overflow-hidden">
            {profile.avatar_url || profile.profile_image ? (
              <img src={profile.avatar_url || profile.profile_image} alt={profile.name} className="w-full h-full object-cover" />
            ) : getInitials(profile.name)}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {profile.name}
              </h1>
              {profile.username && <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">@{profile.username}</p>}
              {profile.headline && <p className="text-lg text-slate-700 dark:text-slate-300 mt-2 font-medium">{profile.headline}</p>}
            </div>

            {profile.location && (
              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                <MapPin className="w-4 h-4 mr-1.5" /> {profile.location}
              </div>
            )}

            {profile.bio && (
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              {profile.linkedin_url && <LinkedInButton url={profile.linkedin_url} />}
              {profile.twitter_url && <TwitterButton url={profile.twitter_url} />}
            </div>
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Technical Skills</h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((s: any) => (
                  <span key={s.skill.id} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">
                    {s.skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Projects & Achievements */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Projects */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" /> Public Projects
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
                No public projects yet.
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Achievements
            </h3>
            {achievements.length > 0 ? (
              <div className="grid gap-4">
                {achievements.map((a: any) => (
                  <div key={a.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-500/20 dark:border-amber-500/20 shadow-sm flex items-start gap-4">
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
                No achievements recorded yet.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
