'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Search, 
  Bell, 
  Bookmark, 
  Flame, 
  Zap, 
  User, 
  Trophy, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  Code2,
  Briefcase,
  Layers,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { useAppStore } from '@/store/useStore';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, notifications, searchQuery, setSearchQuery } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { label: 'Discovery', href: '/hackathons', icon: Trophy },
    { label: 'AI Mock Engine', href: '/mock-hackathon', icon: Bot },
    { label: 'AI Resume ATS', href: '/resume-builder', icon: Briefcase },
    { label: 'Portfolio', href: '/portfolio-builder', icon: Code2 },
    { label: 'Community', href: '/community', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-glow group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950">
                <Sparkles className="h-5 w-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                HackVerse <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/30">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">Enterprise Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Search & Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Quick Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search hackathons, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl glass-input pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Gamification Stats */}
          {user && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-900/80 border border-white/10 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-semibold" title="Daily Streak">
                <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-pulse" />
                <span>{user.streak}d</span>
              </div>
              <div className="h-3 w-[1px] bg-white/10" />
              <div className="flex items-center gap-1 text-cyan-400 font-semibold" title="XP Points">
                <Zap className="h-4 w-4 fill-cyan-400 text-cyan-400" />
                <span>{user.xp.toLocaleString()} XP</span>
              </div>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl border border-white/10 bg-slate-900/60 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-glow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-card border border-white/10 p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  <span className="text-xs text-indigo-400 font-medium">{unreadCount} new</span>
                </div>
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl p-2.5 text-xs transition-colors ${
                        n.read ? 'bg-white/5 text-slate-400' : 'bg-indigo-600/10 text-slate-200 border border-indigo-500/20'
                      }`}
                    >
                      <p className="font-semibold text-white">{n.title}</p>
                      <p className="mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 p-1.5 pr-3 hover:bg-white/10 transition-all"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.fullName}
                  className="h-7 w-7 rounded-lg object-cover border border-indigo-500/50"
                />
                <span className="text-xs font-semibold text-white">{user.fullName}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-card border border-white/10 p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-white">{user.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="mt-1 inline-block rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                      Role: {user.role}
                    </span>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
                    <User className="h-3.5 w-3.5" /> Dashboard
                  </Link>
                  <Link href="/recruiter" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
                    <Briefcase className="h-3.5 w-3.5" /> Recruiter Portal
                  </Link>
                  <Link href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white">
                    <ShieldAlert className="h-3.5 w-3.5" /> Admin Panel
                  </Link>
                  <div className="my-1 border-t border-white/10" />
                  <button className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10">
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-xs font-semibold text-slate-300 hover:text-white">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-glow hover:opacity-90 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden rounded-xl border border-white/10 bg-slate-900 p-2 text-slate-300"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950 px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                <link.icon className="h-4 w-4 text-indigo-400" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
