import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Shield, Zap, Sparkles, Loader2, AlertCircle } from 'lucide-react';
// @ts-ignore
import { FEATURE_LIMITS, PLANS } from '../../api/_shared/usageConfig.js';

export default function PricingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname === '/success' || params.get('success') === 'true') {
      setSuccessMessage("Your payment was received. We're confirming your subscription...");
      setIsSyncing(true);
    } else if (params.get('canceled') === 'true') {
      setError("Checkout was canceled.");
    }
  }, [location]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setTier(PLANS.FREE);
      setLoading(false);
      return;
    }

    const fetchTier = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        setTier(data?.subscription_tier || PLANS.FREE);
      } catch (err) {
        console.error('Failed to fetch subscription tier', err);
        setTier(PLANS.FREE);
      } finally {
        setLoading(false);
      }
    };

    fetchTier();

    let syncInterval: number;
    let attempts = 0;
    
    if (isSyncing && user) {
      syncInterval = window.setInterval(async () => {
        attempts++;
        try {
          const { data } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('user_id', user.id)
            .single();
            
          if (data?.subscription_tier === PLANS.PRO) {
            setTier(PLANS.PRO);
            setIsSyncing(false);
            setSuccessMessage("Success! Your Pro subscription is now active.");
            clearInterval(syncInterval);
          } else if (attempts >= 15) {
            setIsSyncing(false);
            setSuccessMessage(null);
            setError("We're still processing your subscription. Please check back in a few minutes.");
            clearInterval(syncInterval);
          }
        } catch (e) {}
      }, 2000);
    }

    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [user, authLoading, isSyncing]);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login?redirectTo=/pricing');
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const { data: sessionData, error: _sessionError } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (!token) throw new Error('Authentication required');

      const res = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Unable to start checkout process. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const isPro = tier === PLANS.PRO;
  const freeLimits = FEATURE_LIMITS[PLANS.FREE];
  const proLimits = FEATURE_LIMITS[PLANS.PRO];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Choose the plan that fits your hackathon journey
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto">
            Start free to explore ideas and build your profile. Upgrade when you need advanced AI coaching and unlimited portfolio tools.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700 font-medium">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-sm text-green-700 font-medium">
            {isSyncing ? (
              <Loader2 className="w-5 h-5 text-green-600 animate-spin flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
            <div className="p-8 sm:p-10 flex-grow">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">?0</span>
                <span className="text-slate-500 font-medium">/ month</span>
              </div>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Essential tools to kickstart your project and track your hackathon experience.
              </p>
              
              <ul className="space-y-4 text-sm text-slate-700 mb-8">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span>{freeLimits.ai_generation.limit} AI Generations per day</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span>{freeLimits.max_projects.limit} Workspaces / Projects</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span>{freeLimits.max_resumes.limit} AI-Generated Resumes</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span>{freeLimits.max_certificates.limit} Verified Certificates</span>
                </li>
              </ul>
            </div>
            
            <div className="p-8 sm:p-10 pt-0 mt-auto">
              {loading || authLoading ? (
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
              ) : !isPro ? (
                <button 
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 border border-slate-200 cursor-default"
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-400 bg-slate-50 border border-slate-100 cursor-not-allowed"
                >
                  Included
                </button>
              )}
            </div>
          </div>

          <div className="bg-primary-950 rounded-3xl shadow-xl border border-primary-800 overflow-hidden flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-primary-500 to-amber-400"></div>
            
            <div className="p-8 sm:p-10 flex-grow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold text-white">Pro</h3>
                <span className="px-3 py-1 bg-primary-900 border border-primary-700 text-primary-300 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold text-white">?499</span>
                <span className="text-primary-300 font-medium">/ month</span>
              </div>
              <p className="text-primary-200 mb-8 leading-relaxed">
                Unlock more power for your hackathon journey with advanced AI tools and extended limits.
              </p>
              
              <ul className="space-y-4 text-sm text-primary-100 mb-8">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span className="font-semibold text-white">{proLimits.ai_generation.limit} AI Generations per day</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span>{proLimits.max_projects.limit} Workspaces / Projects</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span>{proLimits.max_resumes.limit} AI-Generated Resumes</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span>{proLimits.max_certificates.limit} Verified Certificates</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <span>Priority API Rate Limits ({proLimits.api_request.limit}/min)</span>
                </li>
              </ul>
            </div>
            
            <div className="p-8 sm:p-10 pt-0 mt-auto">
              {loading || authLoading ? (
                <div className="h-12 bg-primary-900 rounded-xl animate-pulse"></div>
              ) : isPro ? (
                <button 
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-primary-800 border border-primary-700 cursor-default flex justify-center items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  You're on Pro
                </button>
              ) : (
                <button 
                  onClick={handleUpgrade}
                  disabled={checkoutLoading || isSyncing}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Upgrade to Pro
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t border-slate-200 pt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-slate-400" />
            <span>Secure checkout powered by <strong>Stripe</strong></span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            <span>Auto-syncs after payment</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
