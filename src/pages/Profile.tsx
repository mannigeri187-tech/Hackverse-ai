import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, GraduationCap, MapPin, Linkedin, Github, Edit3, Save, Flame, Trophy, Zap, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { SAMPLE_USER } from '@/lib/constants';
import { cn } from '@/lib/utils';

const ACHIEVEMENTS = [
  { id: 1, name: 'First Blood', description: 'Complete your first mock test', icon: Zap, unlocked: true },
  { id: 2, name: 'Hackathon Hero', description: 'Win a hackathon', icon: Trophy, unlocked: true },
  { id: 3, name: '7-Day Streak', description: 'Log in for 7 days straight', icon: Flame, unlocked: false },
  { id: 4, name: 'Top 10%', description: 'Reach top 10% on leaderboard', icon: Star, unlocked: false },
];

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const currentUser = user || SAMPLE_USER;
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser.name || 'Alex Vance',
    email: currentUser.email || 'alex@hackverse.ai',
    college: currentUser.college || 'MIT',
    branch: currentUser.branch || 'Computer Science',
    year: currentUser.year || '3rd Year',
    github: currentUser.github || 'github.com/alexvance',
    linkedin: currentUser.linkedin || 'linkedin.com/in/alexvance'
  });

  const [skills, setSkills] = useState<string[]>(
    currentUser.skills?.length ? currentUser.skills : ['React', 'TypeScript', 'Node.js', 'Python', 'Machine Learning']
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'Alex Vance',
        email: user.email || 'alex@hackverse.ai',
        college: user.college || 'MIT',
        branch: user.branch || 'Computer Science',
        year: user.year || '3rd Year',
        github: user.github || 'github.com/alexvance',
        linkedin: user.linkedin || 'linkedin.com/in/alexvance'
      });
      if (user.skills?.length) {
        setSkills(user.skills);
      }
    }
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    updateProfile({
      name: formData.name,
      email: formData.email,
      college: formData.college,
      branch: formData.branch,
      year: formData.year,
      github: formData.github,
      linkedin: formData.linkedin,
      skills
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-pink-500">
              <img src={currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'} alt="Profile" className="w-full h-full rounded-full bg-slate-900 object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-indigo-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{formData.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2">
                  <GraduationCap className="w-4 h-4" /> {formData.college} • {formData.year}
                </p>
              </div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={cn(
                  "px-6 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors",
                  isEditing ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {isEditing ? <><Save className="w-4 h-4"/> Save Profile</> : <><Edit3 className="w-4 h-4"/> Edit Profile</>}
              </button>
            </div>

            {/* Level/XP Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Level</span>
                  <p className="text-xl font-bold text-indigo-500">Level {currentUser.level || 12}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.xp || 4500}</span>
                  <span className="text-xs text-slate-500"> / 5000 XP</span>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: '90%' }} transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details Form */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', icon: null },
                { label: 'Email', key: 'email', icon: Mail },
                { label: 'College', key: 'college', icon: GraduationCap },
                { label: 'Branch', key: 'branch', icon: null },
                { label: 'LinkedIn', key: 'linkedin', icon: Linkedin },
                { label: 'GitHub', key: 'github', icon: Github },
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-sm font-medium text-slate-500">{field.label}</label>
                  <div className="relative">
                    {field.icon && <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                    <input 
                      disabled={!isEditing}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                      className={cn(
                        "w-full rounded-xl border dark:border-slate-700 bg-transparent py-2.5 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors",
                        field.icon ? "pl-10 pr-4" : "px-4",
                        !isEditing && "bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Skills</h2>
              {isEditing && <button className="text-sm text-indigo-500 font-medium">+ Add Skill</button>}
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl font-medium text-sm flex items-center gap-2">
                  {skill}
                  {isEditing && <button className="hover:text-red-500">&times;</button>}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Stats Summary */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3"><Flame className="w-5 h-5 text-amber-500"/> <span className="font-medium dark:text-white">Streak</span></div>
                <span className="font-bold text-slate-900 dark:text-white">12 Days</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-yellow-500"/> <span className="font-medium dark:text-white">Hackathons</span></div>
                <span className="font-bold text-slate-900 dark:text-white">4 Attended</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-purple-500"/> <span className="font-medium dark:text-white">Mock Tests</span></div>
                <span className="font-bold text-slate-900 dark:text-white">15 Completed</span>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Achievements</h2>
            <div className="grid grid-cols-2 gap-4">
              {ACHIEVEMENTS.map(ach => (
                <div key={ach.id} className={cn(
                  "p-4 rounded-xl text-center flex flex-col items-center gap-2 border transition-all",
                  ach.unlocked ? "bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-500/30 shadow-md" : "bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-60 grayscale"
                )}>
                  <div className={cn("p-3 rounded-full", ach.unlocked ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500" : "bg-slate-200 dark:bg-slate-800 text-slate-400")}>
                    <ach.icon className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{ach.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
