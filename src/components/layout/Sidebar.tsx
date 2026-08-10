import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard,
  Trophy,
  Bot,
  GraduationCap,
  Timer,
  BarChart3,
  FileText,
  FileSearch,
  Lightbulb,
  TrendingUp,
  Users,
  UserPlus,
  Award,
  Mic,
  Bell,
  Briefcase,
  Shield,
  Flame,
  Radio,
  QrCode,
  Zap,
  User as UserIcon,
  Wrench,
  ChevronDown,
  ChevronRight,
  Brain,
  ScanLine,
  Building2
} from 'lucide-react'

interface NavItem {
  name: string
  path: string
  icon: any
  badge?: string
  highlight?: boolean
}

// Main platform navigation
const mainNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Hackathons', path: '/hackathons', icon: Trophy, badge: 'Hot' },
  { name: 'HackVerse Learn', path: '/learning', icon: GraduationCap },
  { name: 'Community', path: '/community', icon: Users },
]

// Requested Ecosystem Tools Group
const toolNavItems: NavItem[] = [
  { name: 'HackVerse Teams', path: '/teammate-matchmaker', icon: Flame, badge: 'New' },
  { name: 'HackVerse Mentor', path: '/ai-mentor', icon: Bot, highlight: true },
  { name: 'HackVerse Recruit', path: '/sponsor-hub', icon: Zap },
  { name: 'HackVerse Studio', path: '/project-generator', icon: Lightbulb },
  { name: 'Interview Prep', path: '/interview-prep', icon: Mic },
]

// Hackathon & Event Operations
const opsNavItems: NavItem[] = [
  { name: 'Live Event Ops', path: '/live-ops', icon: Radio, badge: 'Live' },
  { name: 'HackVerse Judge', path: '/judging-hub', icon: QrCode },
  { name: 'HackVerse Arena', path: '/mock-hackathon', icon: Timer },
  { name: 'Team Finder', path: '/team-finder', icon: UserPlus },
]

// AI Tools
const aiToolNavItems: NavItem[] = [
  { name: 'Plagiarism Scanner', path: '/ai-tools/plagiarism', icon: ScanLine, badge: 'AI' },
  { name: 'Sponsor Intel', path: '/ai-tools/sponsor-intel', icon: Building2, badge: 'AI' },
  { name: 'Trend Predictor', path: '/ai-tools/trend-predictor', icon: TrendingUp, badge: 'AI' },
]

// Analytics & Career
const careerNavItems: NavItem[] = [
  { name: 'HackVerse Resume', path: '/resume-builder', icon: FileText },
  { name: 'Resume Review', path: '/resume-review', icon: FileSearch },
  { name: 'Skill Analysis', path: '/skill-analysis', icon: BarChart3 },
  { name: 'Progress Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Leaderboard', path: '/leaderboard', icon: Award },
  { name: 'Notifications', path: '/notifications', icon: Bell },
]

export default function Sidebar() {
  const { sidebarOpen } = useAppStore()
  const { user } = useAuthStore()
  const location = useLocation()

  // Interactive Tools Collapsible State
  const isInsideTools = toolNavItems.some(item => location.pathname === item.path)
  const [toolsOpen, setToolsOpen] = useState<boolean>(true)

  // AI Tools Collapsible State
  const isInsideAITools = aiToolNavItems.some(item => location.pathname === item.path)
  const [aiToolsOpen, setAiToolsOpen] = useState<boolean>(true)

  // Auto-expand if active page is inside Tools
  useEffect(() => {
    if (isInsideTools) setToolsOpen(true)
    if (isInsideAITools) setAiToolsOpen(true)
  }, [location.pathname, isInsideTools, isInsideAITools])

  if (!sidebarOpen) return null

  const renderNavGroup = (items: typeof mainNavItems) => (
    items.map((item) => {
      const Icon = item.icon
      const isActive = location.pathname === item.path
      return (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3 truncate pr-1">
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-500' : 'text-gray-400'}`} />
            <span className="truncate">{item.name}</span>
          </div>
          {item.badge && (
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
              isActive ? 'bg-white/20 text-white' : 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
            }`}>
              {item.badge}
            </span>
          )}
        </Link>
      )
    })
  )

  return (
    <aside className="w-64 fixed left-0 top-16 bottom-0 z-30 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/10 flex flex-col justify-between transition-all duration-300">
      {/* Scrollable Navigation */}
      <div className="p-3 overflow-y-auto scrollbar-thin space-y-4">
        
        {/* Main Platform Section */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Platform Menu
          </div>
          {renderNavGroup(mainNavItems)}
        </div>

        {/* Collapsible Tools Section */}
        <div className="space-y-1 pt-2 border-t border-gray-200/50 dark:border-white/10">
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider hover:bg-indigo-500/10 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-500" /> Tools ({toolNavItems.length})
            </span>
            {toolsOpen ? (
              <ChevronDown className="w-4 h-4 text-indigo-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          
          {toolsOpen && (
            <div className="space-y-1 pl-1 pt-1 transition-all">
              {renderNavGroup(toolNavItems)}
            </div>
          )}
        </div>

        {/* AI Tools Section */}
        <div className="space-y-1 pt-2 border-t border-gray-200/50 dark:border-white/10">
          <button
            onClick={() => setAiToolsOpen(!aiToolsOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-purple-500 dark:text-purple-400 uppercase tracking-wider hover:bg-purple-500/10 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-500" /> AI Tools ({aiToolNavItems.length})
            </span>
            {aiToolsOpen ? (
              <ChevronDown className="w-4 h-4 text-purple-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-purple-400" />
            )}
          </button>
          
          {aiToolsOpen && (
            <div className="space-y-1 pl-1 pt-1 transition-all">
              {renderNavGroup(aiToolNavItems)}
            </div>
          )}
        </div>

        {/* Hackathon Operations */}
        <div className="space-y-1 pt-2 border-t border-gray-200/50 dark:border-white/10">
          <div className="px-3 py-1 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Event Operations
          </div>
          {renderNavGroup(opsNavItems)}
        </div>

        {/* Career & Skills */}
        <div className="space-y-1 pt-2 border-t border-gray-200/50 dark:border-white/10">
          <div className="px-3 py-1 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Analytics & Career
          </div>
          {renderNavGroup(careerNavItems)}
        </div>

        {/* Portals & Role Access */}
        <div className="space-y-1 pt-2 border-t border-gray-200/50 dark:border-white/10">
          <div className="px-3 py-1 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Portals & Role Access
          </div>

          {user?.role === 'organizer' && (
            <Link
              to="/organizer"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname.startsWith('/organizer')
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Organizer Portal</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname.startsWith('/admin')
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Panel</span>
            </Link>
          )}

          <Link
            to="/profile"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              location.pathname === '/profile'
                ? 'bg-gray-800 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <UserIcon className="w-4 h-4 text-amber-400" />
            <span>My Profile</span>
          </Link>
        </div>
      </div>

      {/* Footer Profile Snippet */}
      <div className="p-3 border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.[0] || 'H'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize truncate">{user?.role || 'Student'}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
