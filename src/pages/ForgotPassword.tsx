import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export default function ForgotPassword() {
  const { theme } = useAppStore();
  const isDarkMode = theme === 'dark';
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-slate-950" : "bg-gray-50"
    )}>
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-500/20 blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-pink-500/20 blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "w-full max-w-md p-8 rounded-2xl shadow-xl z-10 backdrop-blur-xl border relative",
          isDarkMode ? "bg-slate-900/60 border-white/10" : "bg-white/80 border-gray-200"
        )}
      >
        <Link 
          to="/login" 
          className={cn(
            "inline-flex items-center gap-2 text-sm mb-6 transition-colors",
            isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
          )}
        >
          <ArrowLeft size={16} /> Back to login
        </Link>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Forgot Password?
                </h1>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="relative">
                    <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 size-5", isDarkMode ? "text-gray-500" : "text-gray-400")} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                        isDarkMode ? "bg-slate-800/50 border-white/10 text-white placeholder-gray-500" : "bg-gray-100 border-transparent text-gray-900 placeholder-gray-500 focus:bg-white focus:border-gray-300"
                      )}
                    />
                  </div>
                  {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-gray-900")}>
                Check your email
              </h2>
              <p className={cn("mb-8", isDarkMode ? "text-gray-400" : "text-gray-600")}>
                We've sent a password reset link to <br/>
                <span className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-900")}>{email}</span>
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors"
              >
                Didn't receive the email? Click to resend
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
