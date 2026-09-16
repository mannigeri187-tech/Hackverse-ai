import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { checkAuthRateLimit, reportAuthSuccess, reportAuthFailure } from '../utils/authRateLimiter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Rate Limit before hitting auth service
    const rateCheck = await checkAuthRateLimit('login', cleanEmail);
    if (!rateCheck.allowed) {
      setError(rateCheck.error || 'Too many login attempts. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const cleanPassword = password;

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (signInError) {
        reportAuthFailure(cleanEmail);
        setError(signInError.message || 'Invalid email or password.');
        if (signInError.message?.includes('Email not confirmed')) {
          navigate('/verify-email', { state: { email: cleanEmail } });
        }
        setLoading(false);
      } else if (data?.user) {
        reportAuthSuccess(cleanEmail);
        navigate(from, { replace: true });
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Network error connecting to authentication service.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-theme-auth-universe rounded-3xl my-4 sm:my-8 shadow-2xl border border-indigo-900/40 glow-blue">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl space-y-4">
        <h1 className="text-2xl font-black mb-6 text-center text-slate-900 tracking-tight">Log in to HackVerse AI</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium" 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-primary-600 hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs font-medium text-slate-600">
          Don't have an account? <Link to="/signup" className="text-primary-600 font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
