import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Recovery state active
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting to dashboard...' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-12 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
      <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary-100 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Set New Password</h1>
      <p className="text-slate-600 text-sm mb-6 leading-relaxed">
        Choose a strong, secure password for your HackVerse AI account.
      </p>
      
      {message && (
        <div className={`mb-5 p-3.5 rounded-xl text-xs sm:text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1.5' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            New Password
          </label>
          <input 
            type="password" 
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-slate-900" 
            placeholder="At least 6 characters" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Confirm New Password
          </label>
          <input 
            type="password" 
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-slate-900" 
            placeholder="Re-enter password" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || message?.type === 'success'}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all text-sm shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Updating Password...
            </span>
          ) : (
            'Update Password & Log In'
          )}
        </button>
      </form>
    </div>
  );
}
