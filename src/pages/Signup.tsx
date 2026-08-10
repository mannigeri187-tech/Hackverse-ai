import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Building, GraduationCap, Github, Chrome, Briefcase, Phone, ArrowRight, Shield, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Valid 10-digit mobile phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  college: z.string().min(2, 'College name is required'),
  year: z.string().min(1, 'Year is required'),
  branch: z.string().min(1, 'Branch is required'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms & conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isLoading } = useAuthStore();
  const { theme } = useAppStore();
  const isDarkMode = theme === 'dark';
  const [role, setRole] = useState<'student' | 'organizer'>('student');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const googleAccounts = [
    { name: 'Manjunath H Annigeri', email: 'manjunath.annigeri@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manjunath' },
    { name: 'Student Innovator', email: 'student.hacker@gmail.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student' }
  ];

  const handleSelectGoogleAccount = async (acc: { name: string; email: string; avatar: string }) => {
    setSignupError(null);
    setShowGoogleModal(false);
    try {
      await loginWithGoogle({ ...acc, role });
      navigate('/dashboard');
    } catch (e: any) {
      setSignupError(e?.message || 'Google OAuth failed.');
    }
  };

  const handleCustomGoogleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    setSignupError(null);
    setShowGoogleModal(false);
    try {
      await loginWithGoogle({
        name: customGoogleEmail.split('@')[0],
        email: customGoogleEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customGoogleEmail)}`,
        role
      });
      navigate('/dashboard');
    } catch (e: any) {
      setSignupError(e?.message || 'Google OAuth failed.');
    }
  };

  const onSubmit = async (data: SignupForm) => {
    setSignupError(null);
    try {
      const result = await signup({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: role,
        college: data.college,
        year: data.year,
        branch: data.branch
      });

      // ONLY Navigate to Email Verification page IF backend confirms successful dispatch
      if (result && result.email) {
        navigate(`/verify-email?email=${encodeURIComponent(result.email)}`, {
          state: { email: result.email }
        });
      }
    } catch (error: any) {
      // Show user-friendly error when email dispatch fails (Do NOT navigate to /verify-email)
      setSignupError(error?.message || 'Unable to send verification code. Please check your email address and try again.');
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
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Log in directly
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className={cn("py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border backdrop-blur-xl", isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white/90 border-gray-200")}>

          {signupError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{signupError}</span>
            </div>
          )}

          {/* Social Sign up */}
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
            <div className="relative flex justify-center text-xs uppercase"><span className={cn("px-2 text-gray-500", isDarkMode ? "bg-slate-900" : "bg-white")}>Or register with email</span></div>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
                role === 'student' 
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                  : isDarkMode ? "border-white/10 bg-slate-800/50 text-gray-400" : "border-gray-200 bg-white text-gray-600"
              )}
            >
              <GraduationCap size={24} />
              <span className="font-medium text-sm">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2",
                role === 'organizer' 
                  ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400" 
                  : isDarkMode ? "border-white/10 bg-slate-800/50 text-gray-400" : "border-gray-200 bg-white text-gray-600"
              )}
            >
              <Briefcase size={24} />
              <span className="font-medium text-sm">Organizer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  {...register('fullName')}
                  type="text"
                  placeholder="Full Name"
                  className={cn("w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-gray-100 border-transparent text-gray-900")}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

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
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="Mobile Phone Number"
                  className={cn("w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-gray-100 border-transparent text-gray-900")}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="Confirm Password"
                    className={cn("w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-gray-100 border-transparent text-gray-900")}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  {...register('college')}
                  type="text"
                  placeholder="College / University Name"
                  className={cn("w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-gray-100 border-transparent text-gray-900")}
                />
              </div>
              {errors.college && <p className="mt-1 text-xs text-red-500">{errors.college.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  {...register('year')}
                  className={cn("w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-gray-100 border-transparent text-gray-900")}
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year.message}</p>}
              </div>

              <div>
                <input
                  {...register('branch')}
                  type="text"
                  placeholder="Branch / Major"
                  className={cn("w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500", isDarkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-gray-100 border-transparent text-gray-900")}
                />
                {errors.branch && <p className="mt-1 text-xs text-red-500">{errors.branch.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input {...register('terms')} type="checkbox" id="terms" className="rounded text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400">
                I agree to the <a href="#" className="text-indigo-600 dark:text-indigo-400 font-medium">Terms of Service</a> & <a href="#" className="text-indigo-600 dark:text-indigo-400 font-medium">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all text-sm mt-4"
            >
              {isLoading ? 'Sending Verification Code...' : 'Create Account & Send Code →'}
            </button>
          </form>
        </div>
      </div>

      {/* Google Identity Modal */}
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
                <button onClick={handleCustomGoogleSignUp} disabled={!customGoogleEmail.trim()} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all">
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
