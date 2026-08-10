import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Github, Chrome, ArrowRight, ShieldCheck, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isLoading } = useAuthStore();
  const { theme } = useAppStore();
  const isDarkMode = theme === 'dark';

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: location.state?.registeredEmail || '',
    }
  });

  const googleAccounts = [
    { name: 'Manjunath H Annigeri', email: 'manjunath.annigeri@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manjunath' },
    { name: 'Student Innovator', email: 'student.hacker@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student' }
  ];

  const handleSelectGoogleAccount = async (acc: { name: string; email: string; avatar: string }) => {
    setLoginError(null);
    setShowGoogleModal(false);
    try {
      await loginWithGoogle(acc);
      navigate('/dashboard');
    } catch (e: any) {
      setLoginError(e?.message || 'Google OAuth authentication failed.');
    }
  };

  const handleCustomGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    setLoginError(null);
    setShowGoogleModal(false);
    try {
      await loginWithGoogle({
        name: customGoogleEmail.split('@')[0],
        email: customGoogleEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customGoogleEmail)}`
      });
      navigate('/dashboard');
    } catch (e: any) {
      setLoginError(e?.message || 'Google OAuth authentication failed.');
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setLoginError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.message || 'Authentication failed.';
      setLoginError(msg);

      if (msg.toLowerCase().includes('verify your email')) {
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(data.email)}`, { state: { email: data.email } });
        }, 1500);
      }
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden", isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-gray-900")}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/30">
            H
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            HackVerse AI
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Or{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className={cn("py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border backdrop-blur-xl", isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white/90 border-gray-200")}>

          {loginError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setShowGoogleModal(true)}
              className={cn(
                "flex items-center justify-center px-4 py-2.5 border rounded-xl shadow-sm text-sm font-medium transition-all gap-2",
                isDarkMode ? "bg-slate-800 border-white/10 hover:bg-slate-700 text-white" : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
              )}
            >
              <Chrome className="size-5 text-red-500" />
              <span>Google</span>
            </button>
            <button
              onClick={() => handleSelectGoogleAccount(googleAccounts[0])}
              className={cn(
                "flex items-center justify-center px-4 py-2.5 border rounded-xl shadow-sm text-sm font-medium transition-all gap-2",
                isDarkMode ? "bg-slate-800 border-white/10 hover:bg-slate-700 text-white" : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
              )}
            >
              <Github className="size-5" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className={cn("w-full border-t", isDarkMode ? "border-white/10" : "border-gray-200")} /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className={cn("px-2 text-gray-500", isDarkMode ? "bg-slate-900" : "bg-white")}>Or sign in with email</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Email Address"
                  className={cn("w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-gray-100 border-transparent text-gray-900")}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  className={cn("w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-gray-100 border-transparent text-gray-900")}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Google OAuth Identity Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Chrome className="size-6 text-red-500" />
                  <h3 className="font-bold text-white text-lg">Google Identity Auth</h3>
                </div>
                <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-3">
                {googleAccounts.map((acc, idx) => (
                  <button key={idx} onClick={() => handleSelectGoogleAccount(acc)} className="w-full p-4 rounded-2xl border border-white/10 bg-slate-800/50 hover:bg-indigo-500/10 transition-all flex items-center gap-4 text-left">
                    <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{acc.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{acc.email}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <input
                  type="email"
                  placeholder="Enter custom Google account email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={handleCustomGoogleSignIn} disabled={!customGoogleEmail.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all">
                  Continue with Google
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
