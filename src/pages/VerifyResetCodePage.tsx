import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function VerifyResetCodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email || '';
  
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Resend cooldown timer (60s)
  const [resendCooldown, setResendCooldown] = useState(60);
  
  // Expiration countdown (02:00 -> 120s)
  const [expiresIn, setExpiresIn] = useState(120);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If no email state, redirect back to /forgot-password
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: number;
    if (resendCooldown > 0) {
      timer = window.setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [resendCooldown]);

  // Code expiration countdown timer
  useEffect(() => {
    let timer: number;
    if (expiresIn > 0) {
      timer = window.setInterval(() => {
        setExpiresIn((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [expiresIn]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mask email for privacy (e.g., m***i@gmail.com)
  const maskEmail = (str: string) => {
    if (!str || !str.includes('@')) return str;
    const [local, domain] = str.split('@');
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    const first = local[0];
    const last = local[local.length - 1];
    return `${first}${'*'.repeat(Math.min(local.length - 2, 5))}${last}@${domain}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    // Reject non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const lastChar = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto move to next input if filled
    if (lastChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);
    setErrorMsg(null);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const code = digits.join('');
  const isComplete = code.length === 6 && digits.every(d => d !== '');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || loading) return;

    if (expiresIn <= 0) {
      setErrorMsg('This verification code has expired. Please request a new code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Verify email OTP token using Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error || !data.session) {
        if (error?.message?.toLowerCase().includes('expired')) {
          setErrorMsg('This verification code has expired. Please request a new code.');
        } else {
          setErrorMsg('Invalid verification code. Please try again.');
        }
        setLoading(false);
        return;
      }

      setSuccessMsg('Email verified successfully! Setting up your new password...');
      // After successful OTP authentication, navigate to reset password page to set new password
      setTimeout(() => {
        navigate('/reset-password');
      }, 700);
    } catch (err: any) {
      setErrorMsg('Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (error.status === 429 || msg.includes('rate')) {
          setErrorMsg('Email rate limit reached. Please wait a moment before requesting another code.');
        } else {
          setErrorMsg(error.message || 'Failed to resend code. Please try again later.');
        }
      } else {
        setSuccessMsg('A new 6-digit verification code has been sent to your email!');
        setDigits(['', '', '', '', '', '']);
        setResendCooldown(60);
        setExpiresIn(120); // Reset to 02:00
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setErrorMsg('Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-12 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
      {/* Header Icon */}
      <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary-100 shadow-sm">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
        Verify Your Email
      </h1>

      <p className="text-slate-600 text-sm mb-1">
        We sent a 6-digit verification code to:
      </p>
      
      <p className="font-bold text-slate-900 text-sm sm:text-base mb-6 break-all">
        {maskEmail(email)}
      </p>

      {/* Error / Success Alerts */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-xl text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Enter verification code
          </label>

          {/* 6-Digit Boxes */}
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoFocus={index === 0}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border transition-all focus:outline-none ${
                  digit 
                    ? 'border-primary-600 bg-primary-50/40 text-slate-900 ring-2 ring-primary-500/20' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Verify Code Button */}
        <button
          type="submit"
          disabled={!isComplete || loading}
          className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Code...
            </span>
          ) : (
            'Verify Code'
          )}
        </button>
      </form>

      {/* Resend Section */}
      <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
        <p className="text-xs text-slate-500">
          Didn't receive the code?
        </p>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={resendCooldown > 0 || resending}
          className="text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {resending 
            ? 'Sending new code...' 
            : resendCooldown > 0 
            ? `Resend Code in ${resendCooldown}s` 
            : 'Resend Code'}
        </button>

        {/* Expiration timer */}
        <p className="text-xs text-slate-400 font-medium">
          {expiresIn > 0 ? (
            <>Code expires in <span className="font-bold text-slate-600">{formatTime(expiresIn)}</span></>
          ) : (
            <span className="text-red-500 font-bold">This verification code has expired. Please request a new code.</span>
          )}
        </p>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Link 
          to="/forgot-password" 
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Link>
      </div>
    </div>
  );
}
