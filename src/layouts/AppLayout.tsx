import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Home, 
  Compass, 
  Bookmark, 
  User, 
  LogOut, 
  FileText, 
  Users, 
  Award, 
  Bot, 
  Lightbulb, 
  Mic, 
  GitBranch, 
  Trophy, 
  Sparkles, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setToolsDropdownOpen(false);
      }
    }

    if (toolsDropdownOpen) {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toolsDropdownOpen]);

  // Automatically close mobile menu and dropdown when route changes
  useEffect(() => {
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  // Primary top navigation links
  const primaryNavLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/hackathons', label: 'Discover', icon: Compass },
    { to: '/mentor', label: 'AI Mentor', icon: Bot, isHighlight: true },
    { to: '/idea-generator', label: 'Ideas', icon: Lightbulb },
    { to: '/winning-readiness', label: 'Readiness', icon: Trophy },
    { to: '/pitch-coach', label: 'Pitch Coach', icon: Mic },
    { to: '/github-analyzer', label: 'GitHub', icon: GitBranch },
  ];

  // Secondary tools dropdown items
  const secondaryNavLinks = [
    { to: '/skill-gap', label: 'Skill Gap Analyzer', icon: Award },
    { to: '/team-finder', label: 'Team Finder', icon: Users },
    { to: '/certificates', label: 'Certificate Vault', icon: Award },
    { to: '/portfolio', label: 'Hackathon Portfolio', icon: Sparkles },
    { to: '/saved', label: 'Saved Tracker', icon: Bookmark },
    { to: '/resume', label: 'Resume Builder', icon: FileText },
  ];

  // All links for mobile navigation drawer
  const allNavLinks = [
    ...primaryNavLinks,
    ...secondaryNavLinks,
  ];

  const isToolActive = secondaryNavLinks.some(link => location.pathname === link.to);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2 flex-shrink-0">
              <Terminal className="w-7 h-7 text-primary-600 flex-shrink-0" />
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">HackVerse AI</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {user && (
                <>
                  {primaryNavLinks.map(link => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                      <Link 
                        key={link.to} 
                        to={link.to} 
                        className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs xl:text-sm transition-all flex items-center gap-1.5 ${
                          isActive 
                            ? 'bg-primary-50 text-primary-600 font-bold' 
                            : link.isHighlight
                            ? 'text-primary-700 bg-primary-50/50 hover:bg-primary-100/60 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}

                  {/* More Tools Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs xl:text-sm transition-all flex items-center gap-1 ${
                        isToolActive 
                          ? 'bg-slate-100 text-slate-900 font-bold' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      aria-expanded={toolsDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span>More</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {toolsDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in">
                        {secondaryNavLinks.map(link => {
                          const Icon = link.icon;
                          const isActive = location.pathname === link.to;
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setToolsDropdownOpen(false)}
                              className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${
                                isActive ? 'bg-primary-50 text-primary-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </nav>

            {/* Desktop User / Auth Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <>
                  <Link 
                    to="/portfolio"
                    className={`font-semibold text-xs px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                      location.pathname === '/portfolio' 
                        ? 'bg-primary-50 text-primary-600 border-primary-200 font-bold' 
                        : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                    <span>Portfolio</span>
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`font-semibold text-xs transition-colors px-2 py-1.5 text-slate-600 hover:text-slate-900 ${
                      location.pathname === '/profile' ? 'text-primary-600 font-bold' : ''
                    }`}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center text-slate-500 hover:text-red-600 text-xs font-semibold transition-colors px-2 py-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium text-xs">Log In</Link>
                  <Link to="/signup" className="btn btn-primary text-xs py-1.5 px-3">Sign Up</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-lg hover:bg-slate-100"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 shadow-lg max-h-[85vh] overflow-y-auto">
            {user ? (
              <>
                {allNavLinks.map(link => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary text-center text-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <span>&copy; {new Date().getFullYear()} HackVerse AI. Built for hackers worldwide.</span>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/hackathons" className="hover:text-slate-700 font-medium">Hackathons</Link>
            <Link to="/mentor" className="hover:text-primary-600 font-bold text-primary-700">AI Mentor</Link>
            <Link to="/idea-generator" className="hover:text-slate-700 font-medium">Idea Generator</Link>
            <Link to="/pitch-coach" className="hover:text-slate-700 font-medium">Pitch Coach</Link>
            <Link to="/winning-readiness" className="hover:text-slate-700 font-medium">Readiness</Link>
            <Link to="/certificates" className="hover:text-slate-700 font-medium">Certificates</Link>
            <Link to="/portfolio" className="hover:text-slate-700 font-medium">Portfolio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
