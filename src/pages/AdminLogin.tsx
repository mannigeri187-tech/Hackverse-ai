import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Key, ArrowRight, AlertCircle, RefreshCw, Briefcase, Database } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, setUser, isLoading } = useAuthStore();
  const { theme } = useAppStore();
  const isDarkMode = theme === 'dark';

  const [passcode, setPasscode] = useState('1996');
  const [email, setEmail] = useState('manjunath@hackverse.ai');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setErrorMsg('Security Passcode is required.');
      return;
    }
    if (passcode !== '1996') {
      setErrorMsg('Incorrect Security Passcode. Access denied.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please enter your admin email and password.');
      return;
    }

    setErrorMsg(null);

    try {
      await login(email, password);
      // Elevate session to Admin role & unlock admin portal key
      sessionStorage.setItem('hv_admin_unlocked', 'true');
      const activeUser = useAuthStore.getState().user;
      if (activeUser) {
        const adminProfile = { ...activeUser, role: 'admin' as const };
        setUser(adminProfile);
        sessionStorage.setItem('hv_user_profile', JSON.stringify(adminProfile));
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Admin authentication failed. Invalid admin credentials.');
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 relative overflow-hidden", isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900")}>
      {/* Dynamic Security Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "w-full max-w-md p-8 rounded-3xl border shadow-2xl backdrop-blur-xl relative z-10 space-y-6",
          isDarkMode ? "bg-slate-900/80 border-emerald-500/30 shadow-emerald-950/40" : "bg-white/90 border-emerald-200 shadow-emerald-100"
        )}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Shield size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
            Admin Control Panel
          </h1>
          <p className="text-xs text-slate-400">
            Restricted operations, Supabase database management & platform security.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 block flex items-center justify-between">
              <span>Security Passcode</span>
              <span className="text-[10px] text-slate-400">Default: 1996</span>
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="password"
                required
                maxLength={4}
                placeholder="1996"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border text-base font-mono tracking-widest outline-none transition-all",
                  isDarkMode ? "bg-slate-950 border-emerald-500/30 text-white focus:border-emerald-500" : "bg-slate-100 border-slate-200 text-slate-900 focus:border-emerald-500"
                )}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="email"
                required
                placeholder="manjunath@hackverse.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all",
                  isDarkMode ? "bg-slate-950 border-white/10 text-white focus:border-emerald-500" : "bg-slate-100 border-slate-200 text-slate-900 focus:border-emerald-500"
                )}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all",
                  isDarkMode ? "bg-slate-950 border-white/10 text-white focus:border-emerald-500" : "bg-slate-100 border-slate-200 text-slate-900 focus:border-emerald-500"
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin size-5" />
            ) : (
              <>
                <span>Authenticate Admin Session</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <Link to="/login" className="hover:text-emerald-400 font-medium transition-colors">
            ← Student Sign In
          </Link>
          <Link to="/organizer/login" className="hover:text-purple-400 font-medium transition-colors flex items-center gap-1">
            <Briefcase size={12} /> Organizer Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
