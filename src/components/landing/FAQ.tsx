'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the AI Mock Hackathon Generator work?',
      a: 'You specify your target domain (AI, Web3, FinTech, DevTools), difficulty level, tech stack, and duration. The AI engine instantly generates a full problem statement, technical requirements, rubrics, and submission portal. When you submit your code, our automated evaluator grades your architecture, UI/UX, testing, security, and performance.',
    },
    {
      q: 'Can I use HackVerse AI to get hired by top tech companies?',
      a: 'Yes! HackVerse AI connects verified hackathon participants and top AI mock performers with enterprise recruiters at top tech firms. Recruiters search candidates by code evaluation scores, ATS resume scores, and verified GitHub project metrics.',
    },
    {
      q: 'How accurate is the ATS Resume Scanner?',
      a: 'Our ATS Scanner uses the same parsing heuristics as major enterprise ATS software (Lever, Greenhouse, Workday). It analyzes keyword density, section headers, formatting safety, and metrics alignment to give you an accurate score out of 100.',
    },
    {
      q: 'Is there a free trial for Pro features?',
      a: 'All new student signups receive 3 free full AI Mock Hackathon evaluations and unlimited access to Global Hackathon Discovery.',
    },
  ];

  return (
    <section className="py-20 bg-slate-950/80">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about HackVerse AI</p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl glass-card border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-indigo-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs leading-relaxed text-slate-400 border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
