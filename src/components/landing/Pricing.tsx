'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Student Hacker',
      price: '$0',
      period: 'forever free',
      description: 'Perfect for students getting started with hackathons and AI preparation.',
      features: [
        'Access to 500+ Global Hackathons',
        '3 AI Mock Hackathons per month',
        'Basic ATS Resume Score Scanner',
        'Standard Developer Portfolio',
        'Community Team Matcher',
      ],
      cta: 'Start Free Forever',
      popular: false,
    },
    {
      name: 'Pro Hacker AI',
      price: '$19',
      period: 'per month',
      description: 'For serious developers aiming to win global hackathons and build top portfolios.',
      features: [
        'Unlimited AI Mock Hackathons & Rubric Reports',
        'Real-time Code Reviewer & OWASP Vulnerability Scanner',
        'Full AI Resume Builder with PDF Export',
        'Custom Domain Developer Portfolio',
        'Priority Recruiter Talent Matching',
        'AI Mentor 24/7 Unlimited Chat',
      ],
      cta: 'Upgrade to Pro AI',
      popular: true,
    },
    {
      name: 'Enterprise Recruiter',
      price: '$299',
      period: 'per month',
      description: 'For companies & sponsors hiring verified hackathon winners directly.',
      features: [
        'Direct Candidate Search & Filter Pipeline',
        'Access to Verified Project Rubric Scores & Code Audits',
        'Sponsor & Host Hackathons with Branded Portals',
        'Dedicated Talent Account Manager',
        'Custom SSO & SOC2 Compliance Export',
      ],
      cta: 'Contact Enterprise Sales',
      popular: false,
    },
  ];

  return (
    <section className="py-24 bg-slate-950 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Transparent Pricing for <br />
            <span className="gradient-text">Hackers & Enterprise Leaders</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Choose the plan that fits your career goals or hiring needs. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl glass-card p-8 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'border-2 border-indigo-500 shadow-glow bg-slate-900/90 scale-105 z-10'
                  : 'border border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-[11px] font-bold text-white shadow-glow uppercase">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-xs text-slate-400">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">/{plan.period}</span>
                </div>

                <div className="my-6 border-t border-white/10" />

                <ul className="space-y-3 text-xs text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/signup"
                  className={`w-full flex items-center justify-center rounded-2xl py-3 text-xs font-bold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow hover:opacity-90'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
