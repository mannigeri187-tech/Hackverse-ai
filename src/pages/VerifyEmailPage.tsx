import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otp, setOtp] = useState('');
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Email not found. Please log in again.' });
      return;
    }
    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit code.' });
      return;
    }

    setVerifying(true);
    setMessage(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setVerifying(false);
    } else {
      setMessage({ type: 'success', text: 'Email verified successfully! Redirecting...' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  };

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
      if (error.status === 429) {
        setCooldown(60);
      }
    } else {
      setMessage({ type: 'success', text: 'Verification code resent! Please check your inbox.' });
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
        We sent a 6-digit verification code to <span className="font-semibold text-slate-900">{email || 'your email'}</span>. 
        Please enter it below to verify your account.
      </p>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleVerifyOtp} className="space-y-4 mb-6">
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="000000"
            className="w-full text-center text-3xl tracking-[1em] font-mono py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={verifying || otp.length !== 6}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="space-y-4">
        <button 
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          className="w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-primary-500 text-slate-700 hover:text-primary-600 font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? 'Sending...' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend verification code'}
        </button>
        <Link 
          to="/login"
          className="w-full flex items-center justify-center py-3 px-4 text-slate-600 hover:text-primary-600 font-semibold transition-all"
        >
          Return to Login <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
