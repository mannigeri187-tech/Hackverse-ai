import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, MapPin, Radio, WifiOff, Clock, CheckCircle, AlertTriangle, Send, Utensils, Zap, Users, ShieldAlert, Sparkles, MessageSquare, Coffee, Gamepad2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_TICKETS = [
  {
    id: 'TCK-104',
    team: 'Team CyberMatrix',
    techStack: 'Python / PyTorch / Docker',
    issue: 'CUDNN memory allocation error when training model on GPU instance.',
    urgency: 'High',
    status: 'In Progress',
    mentor: 'Dr. Aris (AI Specialist)',
    queuePos: 1,
    createdAt: '10 mins ago',
  },
  {
    id: 'TCK-103',
    team: 'Team QuantumBytes',
    techStack: 'Solidity / Web3.js',
    issue: 'MetaMask provider connection failing on Sepolia testnet deployment.',
    urgency: 'Medium',
    status: 'Assigned',
    mentor: 'Sarah W. (Blockchain Lead)',
    queuePos: 2,
    createdAt: '25 mins ago',
  },
];

const VENUE_ZONES = [
  { id: 'food', name: 'Food & Snacks Lounge', status: 'Active — Serving Pizza 🍕', occupancy: '65% Capacity', color: 'from-amber-500 to-orange-500', icon: Utensils, pos: 'Top Right' },
  { id: 'sponsors', name: 'Sponsor & API Booths', status: 'Open — 5 Sponsors Onsite 🚀', occupancy: '40% Capacity', color: 'from-purple-500 to-indigo-500', icon: Zap, pos: 'Main Entrance' },
  { id: 'zone-a', name: 'Hacking Zone A (Quiet)', status: 'Active Hacking 💻', occupancy: '92% Capacity (Nearly Full)', color: 'from-emerald-500 to-teal-500', icon: Layers, pos: 'Hall A' },
  { id: 'zone-b', name: 'Hacking Zone B (Collaborative)', status: 'Active Hacking ⚡', occupancy: '78% Capacity', color: 'from-blue-500 to-cyan-500', icon: Users, pos: 'Hall B' },
  { id: 'mentors', name: 'Mentorship Desk', status: '4 Mentors Available 🟢', occupancy: 'Low Queue', color: 'from-pink-500 to-rose-500', icon: LifeBuoy, pos: 'Center Stage' },
  { id: 'gaming', name: 'Rest & Gaming Lounge', status: 'VR & Coffee Open ☕', occupancy: '30% Capacity', color: 'from-indigo-500 to-violet-500', icon: Gamepad2, pos: 'West Wing' },
];

const INITIAL_ALERTS = [
  { id: 1, title: '🍕 Dinner Served in Main Hall', message: 'Hot pizza, vegan options, and energy drinks are now ready at Food Lounge!', type: 'info', time: '5 mins ago' },
  { id: 2, title: '⚠️ Mesh Network Alert: Wi-Fi Router #3 Restarting', message: 'Local mesh routing active. Emergency alerts will continue over Bluetooth mesh.', type: 'warning', time: '20 mins ago' },
  { id: 3, title: '⏱️ Midpoint Code Checkpoint in 30 Mins', message: 'Ensure your GitHub repo link is submitted in your project dashboard.', type: 'urgent', time: '1 hour ago' },
];

export default function LiveOps() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'map' | 'alerts'>('tickets');
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  // Ticket Form state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [techStack, setTechStack] = useState('');
  const [issue, setIssue] = useState('');
  const [urgency, setUrgency] = useState('High');

  // Broadcast Alert Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'urgent'>('urgent');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !issue) return;
    const newTicket = {
      id: 'TCK-' + (100 + tickets.length + 1),
      team: teamName,
      techStack: techStack || 'React / Node.js',
      issue,
      urgency,
      status: 'Open — Waiting for Mentor',
      mentor: 'Routing to Mentor...',
      queuePos: tickets.length + 1,
      createdAt: 'Just now',
    };
    setTickets([newTicket, ...tickets]);
    setShowTicketModal(false);
    setTeamName('');
    setTechStack('');
    setIssue('');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    const newAlert = {
      id: Date.now(),
      title: broadcastTitle,
      message: broadcastMessage,
      type: broadcastType,
      time: 'Just now (Bluetooth Broadcast)',
    };
    setAlerts([newAlert, ...alerts]);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Radio className="w-8 h-8 text-cyan-400 animate-pulse" /> Live Event Operations & Venue Hub
          </h1>
          <p className="text-slate-400 mt-1">Real-time mentorship ticket system, interactive venue map & Bluetooth mesh alerts.</p>
        </div>

        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('tickets')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'tickets' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <LifeBuoy className="w-4 h-4" /> Mentor Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'map' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <MapPin className="w-4 h-4" /> Live Venue Map
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'alerts' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            )}
          >
            <WifiOff className="w-4 h-4 text-amber-400" /> Bluetooth Alerts
          </button>
        </div>
      </div>

      {/* TAB 1: Mentorship Ticket System */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Mentorship Helpdesk Queue</h2>
              <p className="text-slate-400 text-sm">Need technical help? Request a mentor to visit your table in 5 minutes.</p>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <LifeBuoy className="w-5 h-5" /> Request Mentor Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map(t => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-400">{t.id}</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{t.team}</h3>
                    <p className="text-xs text-slate-400 mt-1">Tech Stack: <span className="text-indigo-300 font-semibold">{t.techStack}</span></p>
                  </div>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-extrabold uppercase border", t.urgency === 'High' ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30")}>
                    {t.urgency} Urgency
                  </span>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-slate-300">"{t.issue}"</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-500" /> Queue Pos: <strong className="text-white">#{t.queuePos}</strong> ({t.createdAt})
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {t.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Interactive Dynamic Venue Map */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Live Venue Occupancy & Station Map</h2>
            <p className="text-slate-400 text-sm">Real-time status of food lounges, sponsor booths, and hacking zones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VENUE_ZONES.map(z => {
              const Icon = z.icon;
              return (
                <motion.div key={z.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-4 rounded-2xl bg-gradient-to-r text-white shadow-lg", z.color)}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{z.name}</h3>
                      <p className="text-xs text-slate-400">Location: {z.pos}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Current Status:</span>
                      <span className="text-emerald-400 font-bold">{z.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Occupancy:</span>
                      <span className="text-white font-medium">{z.occupancy}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Bluetooth Mesh Offline Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Broadcast Sender Form */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" /> Bluetooth Mesh Broadcast
              </h3>
              <p className="text-xs text-slate-400">Send instant emergency offline alerts to all attendee phones via Bluetooth mesh network.</p>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Alert Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Urgent Schedule Shift"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Broadcast Message</label>
                  <textarea
                    rows={3}
                    placeholder="Message will deliver even without internet connection..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Priority Level</label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="info">Info / General Notification</option>
                    <option value="warning">Warning / Network Alert</option>
                    <option value="urgent">CRITICAL / Emergency Schedule Alert</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-amber-500/20 transition-all"
                >
                  <Radio className="w-5 h-5" /> Broadcast Alert via Mesh
                </button>
              </form>
            </div>

            {/* Alert History Feed */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-white">Live Bluetooth Mesh Feed ({alerts.length})</h3>
              
              <div className="space-y-4">
                {alerts.map(a => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className={cn("p-5 rounded-2xl border flex items-start gap-4", a.type === 'urgent' ? "bg-red-500/10 border-red-500/30" : a.type === 'warning' ? "bg-amber-500/10 border-amber-500/30" : "bg-blue-500/10 border-blue-500/30")}>
                    <div className="p-3 rounded-xl bg-slate-900 border border-white/10">
                      <WifiOff className={cn("w-6 h-6", a.type === 'urgent' ? "text-red-400" : "text-amber-400")} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-lg font-bold text-white">{a.title}</h4>
                        <span className="text-xs text-slate-400 font-mono">{a.time}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{a.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="text-2xl font-bold text-white">Submit Mentor Help Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Team CyberMatrix (Table #14)"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tech Stack & Frameworks</label>
                <input
                  type="text"
                  placeholder="e.g. PyTorch / Docker / FastAPI"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Specific Issue / Blocker</label>
                <textarea
                  rows={3}
                  placeholder="Describe exact error message or concept you need help with..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Low">Low — Concept / Design Question</option>
                  <option value="Medium">Medium — Non-blocking Bug</option>
                  <option value="High">High — Critical Deployment Blocker</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowTicketModal(false)} className="px-5 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm">Submit Ticket</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
