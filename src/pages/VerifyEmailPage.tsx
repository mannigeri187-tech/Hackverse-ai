import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function VerifyEmailPage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const email = location.state?.email || '';

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

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email address not found. Please try logging in again to trigger a resend.' });
      return;
    }
    if (cooldown > 0) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      // If we hit a rate limit error, still trigger cooldown to prevent spamming
      if (error.status === 429) {
        setCooldown(60);
      }
    } else {
      setMessage({ type: 'success', text: 'Verification email resent! Please check your inbox.' });
      setCooldown(60);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
      <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-slate-900">Check your email</h1>
      <p className="text-slate-600 mb-8 leading-relaxed">
        We sent a verification link to <span className="font-semibold text-slate-900">{email || 'your email'}</span>. 
        Please click the link to verify your account and access the platform.
      </p>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <button 
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          className="w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-primary-500 text-slate-700 hover:text-primary-600 font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? 'Sending...' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend verification email'}
        </button>
        <Link 
          to="/login"
          className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all"
        >
          Return to Login <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
