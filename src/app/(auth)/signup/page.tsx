'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Mail, Lock, Briefcase, Building, Shield, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useStore';

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [role, setRole] = useState<'STUDENT' | 'MENTOR' | 'RECRUITER' | 'COMPANY'>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();

      setUser({
        id: data.user?.id || 'new-user-id',
        email,
        role,
        fullName,
        xp: 100,
        streak: 1,
        level: 1,
        coins: 100,
      });

      router.push('/dashboard');
    } catch (err) {
      setUser({
        id: 'new-user-id',
        email,
        role,
        fullName,
        xp: 100,
        streak: 1,
        level: 1,
        coins: 100,
      });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'STUDENT', label: 'Student / Developer', icon: User, desc: 'Participate, practice AI mock hackathons, build ATS resume' },
    { id: 'MENTOR', label: 'AI Mentor / Coach', icon: Sparkles, desc: 'Guide students, conduct mock interviews & reviews' },
    { id: 'RECRUITER', label: 'Tech Recruiter', icon: Briefcase, desc: 'Source & hire top verified hackathon winners' },
    { id: 'COMPANY', label: 'Sponsor / Company', icon: Building, desc: 'Sponsor events, host problem statements' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-glow">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white">HackVerse AI</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">Create your account</h2>
        <p className="mt-1 text-xs text-slate-400">Join the world's leading AI hackathon ecosystem</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
          
          <form onSubmit={handleSignup} className="space-y-6">
            
            {/* Role Selection Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-glow'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{r.label}</span>
                      </div>
                      <p className="mt-1 text-[10px] leading-tight text-slate-400">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                  placeholder="Alex Vance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-bold text-white shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-400 hover:underline">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
