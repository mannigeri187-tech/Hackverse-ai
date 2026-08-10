import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import {
  Bell,
  Sun,
  Moon,
  Search,
  Menu,
  Sparkles,
  User as UserIcon,
  LogOut,
  Trophy,
  Flame,
  Shield,
  Briefcase
} from 'lucide-react'
import BrandEmblem from '@/components/common/BrandEmblem'

export default function Navbar() {
  const { theme, toggleTheme, toggleSidebar, notifications, unreadCount, globalSearch, setGlobalSearch } = useAppStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-white/10 transition-colors">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left: Menu & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link to="/">
            <BrandEmblem size="md" />
          </Link>
        </div>

        {/* Middle: Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search hackathons, courses, team members..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && globalSearch.trim()) {
                  navigate('/hackathons')
                }
              }}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Right: Gamification Badges, Actions, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user && (
            <div className="hidden lg:flex items-center gap-3 mr-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                <span>{user.streak} Day Streak</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                <Trophy className="w-4 h-4 text-indigo-500" />
                <span>Lvl {user.level || 1} ({(user.xp || 0).toLocaleString()} XP)</span>
              </div>
            </div>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3 mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl text-xs transition-colors ${
                        n.read
                          ? 'bg-gray-50 dark:bg-white/5 opacity-75'
                          : 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">{n.title}</p>
                      <p className="text-gray-600 dark:text-gray-300 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Auth */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                <span className="hidden sm:inline-block font-medium text-sm text-gray-900 dark:text-white">
                  {user.name}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-white/10 mb-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role} • {user.college || 'Student'}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    My Profile
                  </Link>
                  <Link
                    to="/organizer"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <Briefcase className="w-4 h-4 text-purple-500" />
                    Organizer Portal
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Admin Panel
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setShowProfileMenu(false)
                      navigate('/login')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
