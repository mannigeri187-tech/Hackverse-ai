import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { checkAuthRateLimit, reportAuthFailure } from '../utils/authRateLimiter';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Rate Limit before signup
    const rateCheck = await checkAuthRateLimit('signup', cleanEmail);
    if (!rateCheck.allowed) {
      setError(rateCheck.error || 'Too many signup attempts. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const cleanPassword = password;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        reportAuthFailure(cleanEmail);
        setError(signUpError.message || 'Signup failed. Please try again.');
        setLoading(false);
      } else if (data?.user) {
        navigate('/verify-email', { state: { email: cleanEmail } });
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err?.message || 'Network error connecting to authentication service.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-theme-auth-universe rounded-3xl my-4 sm:my-8 shadow-2xl border border-indigo-900/40 glow-blue">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl space-y-4">
        <h1 className="text-2xl font-black mb-6 text-center text-slate-900 tracking-tight">Create an Account</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium" 
              placeholder="Jane Doe" 
            />
          </div>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs font-medium text-slate-600">
          Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
