import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Users, MapPin, Calendar, Plus, MessageSquare, ChevronRight, CheckCircle2, Send, X, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  name: string;
  avatar: string;
}

interface Team {
  id: number;
  name: string;
  hackathon: string;
  members: TeamMember[];
  maxMembers: number;
  skillsNeeded: string[];
  description: string;
  posted: string;
  isJoined?: boolean;
}

interface ChatMessage {
  id: number;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
}

const INITIAL_SAMPLE_TEAMS: Team[] = [
  {
    id: 1,
    name: 'Neural Ninjas',
    hackathon: 'Global AI Hack 2024',
    members: [
      { name: 'Alex J.', avatar: 'https://i.pravatar.cc/150?u=1' },
      { name: 'Sarah C.', avatar: 'https://i.pravatar.cc/150?u=2' },
    ],
    maxMembers: 4,
    skillsNeeded: ['React', 'Python', 'UX Design'],
    description: 'Building an AI assistant for visually impaired users using computer vision and LLMs.',
    posted: '2h ago'
  },
  {
    id: 2,
    name: 'Block Builders',
    hackathon: 'ETH Denver 2024',
    members: [
      { name: 'Mike B.', avatar: 'https://i.pravatar.cc/150?u=3' },
    ],
    maxMembers: 3,
    skillsNeeded: ['Solidity', 'Next.js'],
    description: 'Creating a decentralized voting platform with zero-knowledge proofs.',
    posted: '5h ago'
  },
  {
    id: 3,
    name: 'HealthTech Innovators',
    hackathon: 'Hack Health',
    members: [
      { name: 'David K.', avatar: 'https://i.pravatar.cc/150?u=4' },
      { name: 'Emma W.', avatar: 'https://i.pravatar.cc/150?u=5' },
      { name: 'Lisa M.', avatar: 'https://i.pravatar.cc/150?u=6' },
    ],
    maxMembers: 5,
    skillsNeeded: ['Data Science', 'Mobile Dev'],
    description: 'Predictive health analytics using wearables data. Need a mobile dev for the frontend!',
    posted: '1d ago'
  },
  {
    id: 4,
    name: 'Green Hackers',
    hackathon: 'Climate Fixathon',
    members: [
      { name: 'Tom R.', avatar: 'https://i.pravatar.cc/150?u=7' },
    ],
    maxMembers: 4,
    skillsNeeded: ['Hardware', 'IoT', 'C++'],
    description: 'Smart sensor network for monitoring indoor air quality and optimizing HVAC systems.',
    posted: '2d ago'
  },
  {
    id: 5,
    name: 'FinTech Wizards',
    hackathon: 'FinHack 2024',
    members: [
      { name: 'Anna P.', avatar: 'https://i.pravatar.cc/150?u=8' },
      { name: 'John D.', avatar: 'https://i.pravatar.cc/150?u=9' },
    ],
    maxMembers: 4,
    skillsNeeded: ['Node.js', 'PostgreSQL'],
    description: 'Micro-lending platform for students. Backend almost done, need help scaling.',
    posted: '3d ago'
  }
];

const INITIAL_MY_TEAMS: Team[] = [
  {
    id: 10,
    name: 'Quantum Coders',
    hackathon: 'HackMIT',
    members: [
      { name: 'Manjunath (You)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
      { name: 'Jane S.', avatar: 'https://i.pravatar.cc/150?u=10' },
      { name: 'Bob M.', avatar: 'https://i.pravatar.cc/150?u=11' },
    ],
    maxMembers: 4,
    skillsNeeded: ['TypeScript', 'Python'],
    description: 'Building a high-throughput quantum algorithm simulator.',
    posted: 'Active',
    isJoined: true
  }
];

export default function TeamFinder() {
  const [activeTab, setActiveTab] = useState<'find' | 'create' | 'my'>('find');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent Teams State
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem('hv_teams_list');
      return saved ? JSON.parse(saved) : INITIAL_SAMPLE_TEAMS;
    } catch {
      return INITIAL_SAMPLE_TEAMS;
    }
  });

  const [myTeams, setMyTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem('hv_my_teams_list');
      return saved ? JSON.parse(saved) : INITIAL_MY_TEAMS;
    } catch {
      return INITIAL_MY_TEAMS;
    }
  });

  // Create Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newHackathon, setNewHackathon] = useState('Global AI Hack 2024');
  const [newDescription, setNewDescription] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newMaxMembers, setNewMaxMembers] = useState(4);

  // Team Chat Modal State
  const [activeChatTeam, setActiveChatTeam] = useState<Team | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>({
    10: [
      { id: 1, sender: 'Jane S.', avatar: 'https://i.pravatar.cc/150?u=10', text: 'Hey team! Ready to crush HackMIT?', time: '10:15 AM', isMe: false },
      { id: 2, sender: 'Bob M.', avatar: 'https://i.pravatar.cc/150?u=11', text: 'I completed the DB setup in PostgreSQL.', time: '10:18 AM', isMe: false }
    ]
  });
  const [inputChatMessage, setInputChatMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('hv_teams_list', JSON.stringify(teams));
      localStorage.setItem('hv_my_teams_list', JSON.stringify(myTeams));
    } catch (e) {
      console.error(e);
    }
  }, [teams, myTeams]);

  // Show auto-expiring toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Join Team Handler
  const handleJoinTeam = (teamId: number) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    if (myTeams.some(m => m.id === teamId)) {
      showToast(`You are already a member of ${targetTeam.name}!`);
      return;
    }

    if (targetTeam.members.length >= targetTeam.maxMembers) {
      showToast(`Team ${targetTeam.name} is already full!`);
      return;
    }

    const meUser: TeamMember = {
      name: 'Manjunath (You)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    };

    const updatedTeam = {
      ...targetTeam,
      members: [...targetTeam.members, meUser],
      isJoined: true
    };

    // Update global teams list
    setTeams(prev => prev.map(t => t.id === teamId ? updatedTeam : t));
    // Add to My Teams
    setMyTeams(prev => [updatedTeam, ...prev]);

    // Initialize Chat History for new team
    setChatMessages(prev => ({
      ...prev,
      [teamId]: [
        {
          id: Date.now(),
          sender: targetTeam.members[0]?.name || 'Team Leader',
          avatar: targetTeam.members[0]?.avatar || 'https://i.pravatar.cc/150?u=1',
          text: `Welcome to ${targetTeam.name}! Glad to have you on board.`,
          time: 'Just now',
          isMe: false
        }
      ]
    }));

    showToast(`🎉 You have successfully joined team ${targetTeam.name}!`);
  };

  // Create Team Handler
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newDescription.trim()) {
      showToast('Please enter a Team Name and Description.');
      return;
    }

    const createdTeam: Team = {
      id: Date.now(),
      name: newTeamName.trim(),
      hackathon: newHackathon,
      members: [{ name: 'Manjunath (You)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }],
      maxMembers: Number(newMaxMembers),
      skillsNeeded: newSkills ? newSkills.split(',').map(s => s.trim()) : ['React', 'Node.js'],
      description: newDescription.trim(),
      posted: 'Just now',
      isJoined: true
    };

    setTeams(prev => [createdTeam, ...prev]);
    setMyTeams(prev => [createdTeam, ...prev]);

    setChatMessages(prev => ({
      ...prev,
      [createdTeam.id]: [
        {
          id: Date.now(),
          sender: 'System',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          text: `Team "${createdTeam.name}" created! Share your team link to recruit hackers.`,
          time: 'Just now',
          isMe: false
        }
      ]
    }));

    // Reset Form & Switch Tab
    setNewTeamName('');
    setNewDescription('');
    setNewSkills('');
    setActiveTab('my');
    showToast(`✨ Team "${createdTeam.name}" created successfully!`);
  };

  // Send Chat Message Handler
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChatMessage.trim() || !activeChatTeam) return;

    const teamId = activeChatTeam.id;
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      text: inputChatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setChatMessages(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), userMsg]
    }));

    const sentText = inputChatMessage.trim();
    setInputChatMessage('');

    // Simulated Teammate AI Reply
    setTimeout(() => {
      const teammateName = activeChatTeam.members.find(m => !m.name.includes('You'))?.name || 'Alex J.';
      const teammateAvatar = activeChatTeam.members.find(m => !m.name.includes('You'))?.avatar || 'https://i.pravatar.cc/150?u=1';
      
      const replyMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: teammateName,
        avatar: teammateAvatar,
        text: `Got it! I will start working on "${sentText.slice(0, 30)}..." right away.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };

      setChatMessages(prev => ({
        ...prev,
        [teamId]: [...(prev[teamId] || []), replyMsg]
      }));
    }, 1000);
  };

  // Filtered Teams
  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.hackathon.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.skillsNeeded.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)}><X size={16} /></button>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <Users className="w-9 h-9 text-indigo-500" /> HackVerse Teams & Recruitment
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Find the perfect teammates, join active hackathon squads, or recruit hackers for your project.</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('find')}
              className={cn("flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all", activeTab === 'find' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white")}
            >
              Find Teams ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={cn("flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all", activeTab === 'create' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white")}
            >
              Create Team +
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={cn("flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all", activeTab === 'my' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white")}
            >
              My Teams ({myTeams.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Find Teams */}
        {activeTab === 'find' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by team name, hackathon, skills (e.g. React, Python)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm backdrop-blur-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team, idx) => {
                const isJoined = myTeams.some(m => m.id === team.id);
                const isFull = team.members.length >= team.maxMembers;

                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={team.id}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col h-full hover:border-indigo-500/50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{team.name}</h3>
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs mt-1 font-semibold">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                          {team.hackathon}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{team.posted}</span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-1 font-medium">{team.description}</p>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Skills Needed</span>
                        <div className="flex flex-wrap gap-2">
                          {team.skillsNeeded.map(skill => (
                            <span key={skill} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            {team.members.map((m, i) => (
                              <img key={i} src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover" title={m.name} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {team.maxMembers - team.members.length} {team.maxMembers - team.members.length === 1 ? 'spot' : 'spots'} left
                          </span>
                        </div>

                        <button 
                          onClick={() => handleJoinTeam(team.id)}
                          disabled={isJoined || isFull}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md",
                            isJoined 
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default"
                              : isFull 
                              ? "bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-500 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          )}
                        >
                          {isJoined ? (
                            <>
                              <CheckCircle2 size={14} /> Joined
                            </>
                          ) : isFull ? (
                            'Full'
                          ) : (
                            <>
                              <UserPlus size={14} /> Join Team
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Create Team Form */}
        {activeTab === 'create' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Plus className="text-indigo-500" /> Create a New Hackathon Team
              </h2>
              
              <form onSubmit={handleCreateTeamSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Team Name</label>
                  <input 
                    type="text" 
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Neural Ninjas" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Target Hackathon</label>
                  <select 
                    value={newHackathon}
                    onChange={(e) => setNewHackathon(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                  >
                    <option>Global AI Hack 2024</option>
                    <option>ETH Denver 2024</option>
                    <option>HackMIT</option>
                    <option>Climate Fixathon</option>
                    <option>FinHack 2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Project Description & Goal</label>
                  <textarea 
                    rows={4} 
                    required
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What are you building? What kind of teammates are you looking for?" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm resize-none" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Skills Needed (comma separated)</label>
                    <input 
                      type="text" 
                      value={newSkills}
                      onChange={(e) => setNewSkills(e.target.value)}
                      placeholder="React, Python, UI/UX" 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Max Team Size</label>
                    <input 
                      type="number" 
                      min="2" 
                      max="6" 
                      value={newMaxMembers}
                      onChange={(e) => setNewMaxMembers(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Team Now</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Tab 3: My Teams */}
        {activeTab === 'my' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {myTeams.length === 0 ? (
              <div className="text-center py-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 space-y-4">
                <Users className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">You haven't joined any teams yet!</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">Browse the Find Teams tab to join an existing squad, or create a brand new team to start building.</p>
                <button onClick={() => setActiveTab('find')} className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl">Find Teams Now</button>
              </div>
            ) : (
              myTeams.map((team) => (
                <div key={team.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{team.name}</h3>
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active Team
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-4 font-semibold">
                      <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
                      {team.hackathon}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-400 mr-2 uppercase">Team Members:</span>
                      <div className="flex -space-x-2">
                        {team.members.map((m, i) => (
                          <img key={i} src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover" title={m.name} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <button 
                      onClick={() => setActiveChatTeam(team)}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>Open Live Team Chat</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Live Team Chat Modal */}
        {activeChatTeam && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
              
              {/* Modal Header */}
              <div className="p-4 bg-slate-100 dark:bg-slate-950 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500 font-bold">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{activeChatTeam.name} — Live Team Room</h3>
                    <p className="text-xs text-slate-500 font-medium">{activeChatTeam.members.length} members • {activeChatTeam.hackathon}</p>
                  </div>
                </div>
                <button onClick={() => setActiveChatTeam(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl text-slate-500">
                  <X size={18} />
                </button>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/50">
                {(chatMessages[activeChatTeam.id] || []).map((msg) => (
                  <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", msg.isMe ? "ml-auto flex-row-reverse" : "")}>
                    <img src={msg.avatar} alt={msg.sender} className="w-8 h-8 rounded-full border border-gray-300 dark:border-white/10 object-cover shrink-0" />
                    <div className="space-y-1">
                      <div className={cn("text-[10px] font-bold text-slate-400", msg.isMe ? "text-right" : "")}>{msg.sender} • {msg.time}</div>
                      <div className={cn(
                        "p-3 rounded-2xl text-sm font-medium shadow-sm",
                        msg.isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendChatMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-white/10 flex gap-2">
                <input 
                  type="text" 
                  value={inputChatMessage}
                  onChange={(e) => setInputChatMessage(e.target.value)}
                  placeholder={`Message ${activeChatTeam.name} members...`}
                  className="flex-1 bg-slate-100 dark:bg-slate-950 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button 
                  type="submit" 
                  disabled={!inputChatMessage.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>

            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
