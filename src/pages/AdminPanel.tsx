import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, MessageSquare, Activity, Brain, ShieldAlert, BarChart3, TrendingUp, Search, Shield, Ban, CheckCircle, Sparkles, Check, X, Flag, Lock, Key, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TABS = ['Overview', 'Users', 'Hackathons', 'Community', 'AI Stats'];

const INITIAL_USERS = [
  { id: 1, name: 'Manjunath H Annigeri', email: 'manjunath@hackverse.ai', role: 'admin', level: 50, xp: 35000, status: 'active' },
  { id: 2, name: 'Alice Cooper', email: 'alice@example.com', role: 'student', level: 12, xp: 4500, status: 'active' },
  { id: 3, name: 'Bob Dylan', email: 'bob@example.com', role: 'organizer', level: 45, xp: 21000, status: 'active' },
  { id: 4, name: 'Charlie Puth', email: 'charlie@example.com', role: 'student', level: 3, xp: 800, status: 'banned' },
  { id: 5, name: 'Diana Ross', email: 'diana@example.com', role: 'student', level: 24, xp: 12400, status: 'active' },
  { id: 6, name: 'Evan Smith', email: 'evan@example.com', role: 'moderator', level: 31, xp: 16700, status: 'active' },
];

const INITIAL_HACKATHONS = [
  { id: 1, name: 'Global AI Innovation Hackathon', organizer: 'Google DeepMind', status: 'approved', regs: 1204 },
  { id: 2, name: 'Web3 DeFi Summit Hackathon', organizer: 'Ethereum Foundation', status: 'approved', regs: 1420 },
  { id: 3, name: 'Cybersecurity CTF Challenge 2026', organizer: 'DefenseTech Alliance', status: 'pending', regs: 350 },
  { id: 4, name: 'NextGen FinTech Challenge', organizer: 'Stripe Developers', status: 'pending', regs: 120 },
  { id: 5, name: 'HealthTech 2026', organizer: 'MedInnovate', status: 'rejected', regs: 0 },
];

const INITIAL_FLAGGED_POSTS = [
  { id: 1, author: 'Charlie Puth', content: 'Spam promotional link posted in General Discussion.', reason: 'Spam / Advertising', status: 'flagged' },
  { id: 2, author: 'Anonymous User', content: 'Offensive language used in team finder comment.', reason: 'Harassment', status: 'flagged' },
];

const AI_CHART_DATA = [
  { name: 'Mon', queries: 4000, tokens: 2400 },
  { name: 'Tue', queries: 3000, tokens: 1398 },
  { name: 'Wed', queries: 2000, tokens: 9800 },
  { name: 'Thu', queries: 2780, tokens: 3908 },
  { name: 'Fri', queries: 1890, tokens: 4800 },
  { name: 'Sat', queries: 2390, tokens: 3800 },
  { name: 'Sun', queries: 3490, tokens: 4300 },
];

export default function AdminPanel() {
  const { user } = useAuthStore();
  const { customHackathons } = useAppStore();
  
  // Password Security State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('hv_admin_unlocked') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [hackathonsList, setHackathonsList] = useState(INITIAL_HACKATHONS);
  const [flaggedPosts, setFlaggedPosts] = useState(INITIAL_FLAGGED_POSTS);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '1996') {
      setIsAuthenticated(true);
      sessionStorage.setItem('hv_admin_unlocked', 'true');
      setPasswordError(false);
      setPasswordInput('');
      showToast('Welcome Manjunath H Annigeri! Master Admin Portal Unlocked.');
    } else {
      setPasswordError(true);
    }
  };

  const handleLockAdmin = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('hv_admin_unlocked');
    showToast('Admin Portal Locked.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle user ban status
  const handleToggleBan = (userId: number, currentStatus: string, name: string) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    showToast(`User "${name}" is now ${nextStatus.toUpperCase()}.`);
  };

  // Change user role
  const handleChangeRole = (userId: number, newRole: string, name: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    showToast(`User "${name}" role updated to ${newRole.toUpperCase()}.`);
  };

  // Moderate hackathons
  const handleHackathonStatus = (id: number, newStatus: string, name: string) => {
    setHackathonsList(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
    showToast(`Hackathon "${name}" marked as ${newStatus.toUpperCase()}.`);
  };

  // Moderate community posts
  const handleModeratePost = (postId: number, action: 'approve' | 'delete') => {
    setFlaggedPosts(prev => prev.filter(p => p.id !== postId));
    showToast(action === 'approve' ? 'Post approved & unflagged.' : 'Flagged post deleted.');
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If NOT authenticated with passcode 1996, show Password Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Private Admin Gateway</h2>
            <p className="text-slate-400 text-sm mt-1">
              Restricted to Founder & Chief Architect <br />
              <span className="text-indigo-400 font-semibold">Manjunath H Annigeri</span>
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-400" /> Enter Admin Passcode
              </label>
              <input
                type="password"
                placeholder="Enter passcode..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-slate-900/80 border text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 transition-all",
                  passwordError ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-indigo-500"
                )}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-400 text-xs mt-2 text-center font-medium flex items-center justify-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> Access Denied: Incorrect Security Passcode
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Unlock Admin Portal
            </button>
          </form>

          <p className="text-xs text-slate-500">
            🔒 Protected by End-to-End Authentication System
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Toast */}
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-300 font-medium flex items-center justify-between shadow-xl">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              {toastMessage}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-indigo-400 text-sm font-bold">Dismiss</button>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Authenticated: Manjunath H Annigeri
              </span>
            </div>
            <p className="text-slate-400 mt-1">Private platform management, user controls & system analytics.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={handleLockAdmin}
              title="Lock Admin Portal"
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" /> Lock Portal
            </button>
          </div>
        </div>

        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Registered Users', value: usersList.length + 10240, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+12%' },
                { label: 'Active Today', value: '1,832', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+5%' },
                { label: 'Hackathons Listed', value: hackathonsList.length + customHackathons.length, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+2%' },
                { label: 'AI Queries Today', value: '8,451', icon: Brain, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '+24%' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className="text-xs text-emerald-400 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}</p>
                  </div>
                  <div className={cn("p-4 rounded-xl", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center"><Activity className="h-5 w-5 mr-2 text-indigo-400" /> Recent System Activity Stream</h3>
              <div className="space-y-4">
                {[
                  { text: 'Organizer published new hackathon "AI Genesis 2026".', time: 'Just now' },
                  { text: 'User @johndoe flagged a community post.', time: '2 mins ago' },
                  { text: 'AI Mentor Engine executed 1,200 requests with 0 latency errors.', time: '15 mins ago' },
                  { text: 'Master Admin Manjunath H Annigeri unlocked Admin Portal.', time: 'Just now' },
                ].map((act, i) => (
                  <div key={i} className="flex justify-between items-center p-3.5 rounded-xl border bg-white/5 border-white/5 hover:border-white/10 transition-colors">
                    <p className="text-sm text-slate-300">{act.text}</p>
                    <span className="text-xs text-slate-500 font-medium">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'Users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Role</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Stats</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={u.role} 
                            onChange={(e) => handleChangeRole(u.id, e.target.value, u.name)}
                            className="bg-slate-800 text-xs font-medium text-white border border-white/10 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="student">Student</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <span className="text-white">Lvl {u.level}</span>
                            <span className="text-slate-500 mx-2">|</span>
                            <span className="text-indigo-300">{u.xp} XP</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full", u.status === 'active' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30")}>
                            {u.status === 'active' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Ban className="h-3 w-3 mr-1" />}
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleToggleBan(u.id, u.status, u.name)}
                            className={cn("px-3 py-1 rounded-lg text-xs font-semibold transition-all", u.status === 'active' ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30")}
                          >
                            {u.status === 'active' ? 'Ban User' : 'Unban User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'Hackathons' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Hackathon</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Organizer</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Registrations</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {hackathonsList.map(h => (
                      <tr key={h.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{h.name}</td>
                        <td className="px-6 py-4 text-slate-400">{h.organizer}</td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium capitalize", h.status === 'approved' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : h.status === 'pending' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30")}>
                            {h.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{h.regs} registered</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {h.status !== 'approved' && (
                            <button onClick={() => handleHackathonStatus(h.id, 'approved', h.name)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all">
                              Approve
                            </button>
                          )}
                          {h.status !== 'rejected' && (
                            <button onClick={() => handleHackathonStatus(h.id, 'rejected', h.name)} className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-semibold transition-all">
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'Community' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-400" /> Flagged Community Content ({flaggedPosts.length})
              </h3>

              {flaggedPosts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="font-semibold text-white">All clear!</p>
                  <p className="text-sm">No reported or flagged posts requiring moderation.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedPosts.map(post => (
                    <div key={post.id} className="p-4 rounded-xl bg-slate-800/50 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{post.author}</span>
                          <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 rounded font-medium">{post.reason}</span>
                        </div>
                        <p className="text-slate-300 text-sm mt-1">{post.content}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={() => handleModeratePost(post.id, 'approve')} className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" /> Keep Post
                        </button>
                        <button onClick={() => handleModeratePost(post.id, 'delete')} className="flex-1 md:flex-none px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                          <X className="w-4 h-4" /> Delete Post
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'AI Stats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl h-96">
                <h3 className="text-lg font-bold text-white mb-6">AI Queries (7 Days)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={AI_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Line type="monotone" dataKey="queries" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl h-96">
                <h3 className="text-lg font-bold text-white mb-6">Token Usage</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={AI_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} cursor={{ fill: '#ffffff05' }} />
                    <Bar dataKey="tokens" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </motion.div>
        )}
        
      </div>
    </div>
  );
}
