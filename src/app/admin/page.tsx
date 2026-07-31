'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Users, 
  Activity, 
  Database, 
  Terminal, 
  CheckCircle, 
  AlertTriangle,
  Server,
  Zap
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'audit'>('metrics');

  const usersList = [
    { id: 'u1', name: 'Alex Vance', email: 'alex.vance@hackverse.ai', role: 'STUDENT', status: 'ACTIVE', joined: 'Jul 2026' },
    { id: 'u2', name: 'Elena Rostova', email: 'recruiter@techcorp.com', role: 'RECRUITER', status: 'VERIFIED', joined: 'Jul 2026' },
    { id: 'u3', name: 'OpenAI Sponsor', email: 'sponsor@openai.com', role: 'COMPANY', status: 'ACTIVE', joined: 'Jun 2026' },
    { id: 'u4', name: 'Admin Ops', email: 'admin@hackverse.ai', role: 'ADMIN', status: 'ACTIVE', joined: 'Jan 2026' },
  ];

  const auditLogs = [
    { id: 'a1', time: '23:14:02', action: 'AI_MOCK_HACKATHON_GENERATED', user: 'alex.vance@hackverse.ai', ip: '192.168.1.45' },
    { id: 'a2', time: '23:10:55', action: 'ATS_RESUME_AUDIT_COMPLETED', user: 'alex.vance@hackverse.ai', ip: '192.168.1.45' },
    { id: 'a3', time: '22:45:12', action: 'RECRUITER_INTERVIEW_REQUEST_SENT', user: 'recruiter@techcorp.com', ip: '10.0.0.12' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Platform Governance & System Operations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Admin <span className="gradient-text">Governance Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Monitor infrastructure health, AI token usage, user roles, system SLA uptime, and real-time audit event logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'metrics'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Activity className="h-4 w-4" /> System Health & AI Token Usage
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Users className="h-4 w-4" /> User Management
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Terminal className="h-4 w-4" /> Audit Logs
          </button>
        </div>

        {/* Tab 1: System Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-3xl glass-card p-6 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">PostgreSQL & Redis Pool</span>
                  <Database className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">1.2ms Latency</p>
                <p className="text-[11px] text-emerald-400 font-semibold">✔ Healthy Pool Connection</p>
              </div>

              <div className="rounded-3xl glass-card p-6 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">AI Token Consumption</span>
                  <Cpu className="h-4 w-4 text-purple-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">4.2M Tokens / Day</p>
                <p className="text-[11px] text-indigo-400 font-semibold">OpenAI gpt-4o & Gemini Flash</p>
              </div>

              <div className="rounded-3xl glass-card p-6 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Platform SLA Uptime</span>
                  <Server className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-extrabold text-white">99.99%</p>
                <p className="text-[11px] text-emerald-400 font-semibold">SOC2 Type II Certified</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="rounded-3xl glass-card border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4">
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-400 font-bold">{u.status}</span>
                    </td>
                    <td className="p-4 text-slate-400">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-3 font-mono text-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase">Live System Audit Stream</h4>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-white/10 flex items-center justify-between text-slate-300">
                  <span>[{log.time}] <strong className="text-cyan-400">{log.action}</strong> by {log.user}</span>
                  <span className="text-slate-500">IP: {log.ip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
