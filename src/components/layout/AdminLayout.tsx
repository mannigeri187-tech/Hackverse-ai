import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Shield, Users, Database, BarChart3, Lock, LogOut, ArrowLeft, Activity, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme } = useAppStore();
  const location = useLocation();
  const isDarkMode = theme === 'dark';

  const isPasscodeUnlocked = sessionStorage.getItem('hv_admin_unlocked') === 'true';

  // Guard: Must be authenticated, unlocked via passcode, and have admin role
  if (!isAuthenticated || !isPasscodeUnlocked || user?.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleAdminLockout = () => {
    sessionStorage.removeItem('hv_admin_unlocked');
    logout();
  };

  return (
    <div className={cn("min-h-screen flex flex-col", isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900")}>
      {/* Admin Header Bar */}
      <header className={cn("h-16 border-b px-6 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40", isDarkMode ? "bg-slate-900/90 border-emerald-500/30" : "bg-white/90 border-slate-200")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/30">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              Admin Control Panel <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono">SUPABASE CONNECTED</span>
            </h1>
            <p className="text-[11px] text-slate-400">System Governance & Production Database Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] text-emerald-400 font-mono">
            <Activity size={12} className="animate-pulse" />
            <span>DB Status: Active (wivwpljb...)</span>
          </div>

          <Link
            to="/dashboard"
            className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <ArrowLeft size={14} /> Student View
          </Link>

          <div className="h-4 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-xs font-bold">{user.name}</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Super Administrator</p>
            </div>
            <button
              onClick={handleAdminLockout}
              title="Lock Admin Session"
              className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Lock size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1">
        {/* Admin Navigation Sidebar */}
        <aside className={cn("w-64 border-r p-4 space-y-2 shrink-0 hidden md:block", isDarkMode ? "bg-slate-900/60 border-white/10" : "bg-white border-slate-200")}>
          <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            System Governance
          </div>
          
          <Link
            to="/admin/dashboard"
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
              location.pathname === '/admin/dashboard' || location.pathname === '/admin'
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Shield size={16} />
            <span>Admin Overview</span>
          </Link>

          <Link
            to="/admin/dashboard?tab=Users"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Users size={16} />
            <span>Manage Users & Roles</span>
          </Link>

          <Link
            to="/admin/dashboard?tab=AI+Stats"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <BarChart3 size={16} />
            <span>AI Token Analytics</span>
          </Link>
        </aside>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
