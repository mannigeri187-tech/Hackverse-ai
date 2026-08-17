import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [cooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0 || !email.trim()) return;
    
    setLoading(true);
    setMessage(null);

    const trimmedEmail = email.trim().toLowerCase();

    console.log('[AUTH-DEBUG] Request started');
    console.log('[AUTH-DEBUG] Email exists:', Boolean(trimmedEmail));
    console.log('[AUTH-DEBUG] Supabase URL configured:', Boolean(import.meta.env.VITE_SUPABASE_URL || 'https://updhbkmjgzighnifabsd.supabase.co'));

    // Request 6-digit email OTP for existing accounts only
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        shouldCreateUser: false, // Prevents creating accounts for unregistered emails
      }
    });

    console.log('[AUTH-DEBUG] Request completed');
    console.log('[AUTH-DEBUG] Error:', Boolean(error));

    if (error) {
      const msg = error.message ? error.message.toLowerCase() : '';
      const code = (error as any).code || '';

      console.warn('[AUTH-DEBUG] Supabase error message:', error.message);
      console.warn('[AUTH-DEBUG] Supabase error status:', error.status);
      console.warn('[AUTH-DEBUG] Supabase error name:', error.name);
      console.warn('[AUTH-DEBUG] Full safe error object:', {
        status: error.status,
        name: error.name,
        message: error.message,
      });

      // Check for rate limit
      if (error.status === 429 || code === 'over_email_send_rate_limit' || msg.includes('rate limit') || msg.includes('rate')) {
        setMessage({ 
          type: 'error', 
          text: 'Email rate limit reached. Please wait 60 seconds before requesting another code.' 
        });
        setCooldown(60);
      } 
      // Check for nonexistent account (Supabase returns 422 with otp_disabled when shouldCreateUser: false and user does not exist)
      else if (error.status === 422 || code === 'otp_disabled' || msg.includes('signups not allowed') || msg.includes('user not found')) {
        setMessage({ 
          type: 'error', 
          text: 'No account exists with this email address.' 
        });
      } 
      // Check for SMTP / Email delivery error from Supabase
      else if (msg.includes('error sending') || msg.includes('magic link') || msg.includes('smtp') || msg.includes('email')) {
        setMessage({
          type: 'error',
          text: 'Unable to send verification email. Please ensure your Supabase custom SMTP/Resend settings and sender domain are configured in the Supabase Dashboard.'
        });
      }
      // Other errors
      else {
        setMessage({ type: 'error', text: error.message });
      }
      setLoading(false);
    } else {
      setLoading(false);
      // Navigate to the dedicated 6-digit OTP verification screen
      navigate('/verify-reset-code', { state: { email: trimmedEmail } });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-12 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
      <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary-100 shadow-sm">
        <Mail className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Forgot Password</h1>
      <p className="text-slate-600 text-sm mb-6 leading-relaxed">
        Enter your registered email address to receive a secure 6-digit verification code.
      </p>
      
      {message && (
        <div className={`mb-5 p-3.5 rounded-xl text-xs sm:text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSendOtp} className="space-y-5 text-left">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address
          </label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium text-slate-900" 
            placeholder="you@example.com" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || cooldown > 0}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all text-sm shadow-sm"
        >
          {loading ? 'Sending Verification Code...' : cooldown > 0 ? `Try again in ${cooldown}s` : 'Send Verification Code'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link to="/login" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Login
        </Link>
      </div>
    </div>
  );
}
