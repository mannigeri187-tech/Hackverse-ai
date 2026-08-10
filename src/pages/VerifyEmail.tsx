import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification, pendingEmailForVerification, isLoading } = useAuthStore();
  const { theme } = useAppStore();
  const isDarkMode = theme === 'dark';

  const emailParam = searchParams.get('email') || location.state?.email || pendingEmailForVerification || '';

  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // 10-minute expiration countdown timer (600 seconds)
  const [expirySeconds, setExpirySeconds] = useState(600);
  // 60-second resend cooldown timer
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [expirySeconds]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Utility to mask email for privacy (e.g. m***i@gmail.com)
  const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name.charAt(0)}*@${domain}`;
    return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
  };

  const formatTimer = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!emailParam) {
      setErrorMsg('Email address missing. Please log in or sign up again.');
      return;
    }
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await verifyEmail(emailParam, otpCode);
      setSuccessMsg('✅ Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid verification code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!emailParam || cooldownSeconds > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const msg = await resendVerification(emailParam);
      setSuccessMsg(`✅ ${msg}`);
      setExpirySeconds(600); // Reset 10-min timer
      setCooldownSeconds(60); // Trigger 60-sec cooldown
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 relative overflow-hidden", isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900")}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-md p-8 rounded-3xl border shadow-2xl backdrop-blur-xl relative z-10 space-y-6",
          isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white/90 border-slate-200"
        )}
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Verify your email</h1>
          <p className="text-sm text-slate-400">
            We sent a verification code to: <br />
            <strong className="text-indigo-400 font-mono font-semibold">{maskEmail(emailParam)}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-3">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block text-center">
              Enter the 6-digit code below
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="_ _ _ _ _ _"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className={cn(
                "w-full py-4 text-center text-2xl font-mono font-bold tracking-[12px] rounded-2xl border outline-none transition-all",
                isDarkMode ? "bg-slate-950 border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" : "bg-slate-100 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500"
              )}
            />
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otpCode.length < 6 || expirySeconds <= 0}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin size-5" />
            ) : (
              <>
                <span>Verify Email</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Expiration Timer Indicator */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
            <Clock size={14} className={cn(expirySeconds < 60 ? "text-red-400 animate-pulse" : "text-indigo-400")} />
            <span>Code expires in: <strong className={cn("font-mono font-bold", expirySeconds < 60 ? "text-red-400" : "text-slate-200")}>{formatTimer(expirySeconds)}</strong></span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-400">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={isResending || cooldownSeconds > 0}
            className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 disabled:no-underline font-bold underline transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <RefreshCw size={14} className={cn(isResending && "animate-spin")} />
            <span>{cooldownSeconds > 0 ? `Resend Code in ${cooldownSeconds}s` : 'Resend Code'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
