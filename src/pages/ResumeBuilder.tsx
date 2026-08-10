import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, ChevronUp, Plus, Trash2, CheckCircle, XCircle, Sparkles, LayoutTemplate, Briefcase, GraduationCap, Code2, Award, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const RESUME_TEMPLATES = [
  { id: 'modern', name: 'Modern', color: 'bg-indigo-500', preview: 'bg-indigo-500/20 border-indigo-500/50' },
  { id: 'professional', name: 'Professional', color: 'bg-slate-800', preview: 'bg-slate-800/20 border-slate-500/50' },
  { id: 'minimal', name: 'Minimal', color: 'bg-gray-400', preview: 'bg-gray-400/20 border-gray-400/50' },
  { id: 'tech', name: 'Tech', color: 'bg-emerald-500', preview: 'bg-emerald-500/20 border-emerald-500/50' }
];

export default function ResumeBuilder() {
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [activeSection, setActiveSection] = useState('personal');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [personalInfo, setPersonalInfo] = useState({
    name: 'Alex Developer',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'linkedin.com/in/alexdev',
    github: 'github.com/alexdev',
    portfolio: 'alexdev.com'
  });
  
  const [summary, setSummary] = useState('Passionate Full-Stack Developer with 3 years of experience building scalable web applications. Strong focus on React, Node.js, and cloud architectures. Hackathon enthusiast and open-source contributor.');
  
  const [education, setEducation] = useState([
    { id: 1, school: 'Tech University', degree: 'B.S. Computer Science', year: '2019 - 2023', gpa: '3.8/4.0' }
  ]);
  
  const [experience, setExperience] = useState([
    { id: 1, company: 'TechNova', role: 'Frontend Engineer', duration: '2023 - Present', bullets: ['Developed modern React applications', 'Improved performance by 40%'] }
  ]);
  
  const [projects, setProjects] = useState([
    { id: 1, name: 'AI Hackathon Platform', description: 'Platform for organizing and participating in hackathons using AI matching.', tech: 'React, Node, MongoDB, OpenAI', github: 'github.com/alexdev/ai-hack' }
  ]);
  
  const [skills, setSkills] = useState(['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker']);
  const [newSkill, setNewSkill] = useState('');
  
  const [achievements, setAchievements] = useState([
    { id: 1, text: '1st Place - Global AI Hackathon 2023' }
  ]);
  
  const [atsScore, setAtsScore] = useState<{
    score: number;
    format: number;
    keywords: number;
    content: number;
    matched: string[];
    missing: string[];
    suggestions: string[];
  } | null>(null);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAtsScore({
        score: 85,
        format: 90,
        keywords: 75,
        content: 88,
        matched: ['React', 'Node.js', 'Python', 'AWS'],
        missing: ['Agile', 'CI/CD', 'GraphQL'],
        suggestions: [
          'Add more quantifiable metrics in experience bullets.',
          'Include continuous integration (CI/CD) keywords.',
          'Expand on database technologies used in projects.'
        ]
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleExport = () => {
    window.print();
  };

  const handleDownloadResume = () => {
    const resumeText = `
==================================================
${personalInfo.name.toUpperCase()}
Email: ${personalInfo.email} | Phone: ${personalInfo.phone}
LinkedIn: ${personalInfo.linkedin} | GitHub: ${personalInfo.github} | Portfolio: ${personalInfo.portfolio}
==================================================

PROFESSIONAL SUMMARY
--------------------------------------------------
${summary}

SKILLS
--------------------------------------------------
${skills.join(', ')}

WORK EXPERIENCE
--------------------------------------------------
${experience.map(exp => `${exp.role} at ${exp.company} (${exp.duration})\n` + exp.bullets.map(b => `  • ${b}`).join('\n')).join('\n\n')}

PROJECTS
--------------------------------------------------
${projects.map(proj => `${proj.name} [${proj.tech}]\n  ${proj.description}\n  Repository: ${proj.github}`).join('\n\n')}

EDUCATION
--------------------------------------------------
${education.map(edu => `${edu.degree} - ${edu.school} (${edu.year}) | GPA: ${edu.gpa}`).join('\n')}

ACHIEVEMENTS
--------------------------------------------------
${achievements.map(ach => `• ${ach.text}`).join('\n')}
    `.trim();

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAIImprove = () => {
    setSummary('Results-driven Full-Stack Developer with 3+ years of expertise in designing and deploying scalable web architectures. Specialized in React ecosystem and Node.js backend services. Proven track record of delivering high-impact solutions in competitive hackathons and active contributor to robust open-source projects.');
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Resume Builder</h1>
            <p className="text-slate-500 dark:text-slate-400">Craft an ATS-friendly, hackathon-ready resume.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleAnalyze}
              className="px-4 py-2 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Analyze ATS
            </button>
            <button 
              onClick={handleDownloadResume}
              className="px-4 py-2 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" /> Download Resume (.TXT)
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export PDF / Print
            </button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="mb-8 p-4 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LayoutTemplate className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white">Choose Template</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {RESUME_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => setActiveTemplate(template.id)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all flex items-center justify-between",
                  activeTemplate === template.id 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                    : "border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{template.name}</span>
                <span className={cn("w-4 h-4 rounded-full", template.color)} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 print:block print:w-full">
          {/* Editor Panel */}
          <div className="space-y-4 print:hidden">
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
              
              {/* Personal Info */}
              <div className="border-b border-gray-200 dark:border-white/10">
                <button 
                  onClick={() => toggleSection('personal')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-indigo-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">Personal Information</span>
                  </div>
                  {activeSection === 'personal' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                <AnimatePresence>
                  {activeSection === 'personal' && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(personalInfo).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">{key}</label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setPersonalInfo({ ...personalInfo, [key]: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none transition-shadow"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <div className="border-b border-gray-200 dark:border-white/10">
                <button 
                  onClick={() => toggleSection('summary')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">Professional Summary</span>
                  </div>
                  {activeSection === 'summary' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                <AnimatePresence>
                  {activeSection === 'summary' && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-2">
                        <div className="flex justify-end mb-2">
                          <button onClick={handleAIImprove} className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                            <Sparkles className="w-3 h-3" /> AI Improve
                          </button>
                        </div>
                        <textarea
                          value={summary}
                          onChange={(e) => setSummary(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none transition-shadow resize-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Experience */}
              <div className="border-b border-gray-200 dark:border-white/10">
                <button 
                  onClick={() => toggleSection('experience')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">Experience</span>
                  </div>
                  {activeSection === 'experience' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                <AnimatePresence>
                  {activeSection === 'experience' && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-2 space-y-4">
                        {experience.map((exp, idx) => (
                          <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 relative">
                            <button onClick={() => setExperience(experience.filter(e => e.id !== exp.id))} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <input placeholder="Company" value={exp.company} onChange={(e) => { const newExp = [...experience]; newExp[idx].company = e.target.value; setExperience(newExp); }} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md dark:text-white" />
                              <input placeholder="Role" value={exp.role} onChange={(e) => { const newExp = [...experience]; newExp[idx].role = e.target.value; setExperience(newExp); }} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md dark:text-white" />
                              <input placeholder="Duration" value={exp.duration} onChange={(e) => { const newExp = [...experience]; newExp[idx].duration = e.target.value; setExperience(newExp); }} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md dark:text-white col-span-2" />
                            </div>
                            <textarea placeholder="Bullets (one per line)" value={exp.bullets.join('\n')} onChange={(e) => { const newExp = [...experience]; newExp[idx].bullets = e.target.value.split('\n'); setExperience(newExp); }} rows={3} className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md dark:text-white" />
                          </div>
                        ))}
                        <button onClick={() => setExperience([...experience, { id: Date.now(), company: '', role: '', duration: '', bullets: [] }])} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-500 hover:border-indigo-500 transition-colors flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Add Experience
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Skills */}
              <div className="border-b border-gray-200 dark:border-white/10">
                <button 
                  onClick={() => toggleSection('skills')}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-slate-800 dark:text-white">Skills</span>
                  </div>
                  {activeSection === 'skills' ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                <AnimatePresence>
                  {activeSection === 'skills' && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-2">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium">
                              {skill}
                              <button onClick={() => removeSkill(idx)} className="hover:text-emerald-800 dark:hover:text-emerald-200"><XCircle className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Type a skill and press Enter..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={handleAddSkill}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ATS Score Panel */}
            <AnimatePresence>
              {atsScore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-500" /> ATS Analysis
                    </h3>
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-200 dark:text-slate-800" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="175" strokeDashoffset={175 - (175 * atsScore.score) / 100} className="text-indigo-500 transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800 dark:text-white">
                        {atsScore.score}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400"><span>Format</span><span>{atsScore.format}%</span></div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${atsScore.format}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400"><span>Keywords</span><span>{atsScore.keywords}%</span></div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{ width: `${atsScore.keywords}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-400"><span>Content</span><span>{atsScore.content}%</span></div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${atsScore.content}%` }}></div></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Matched</h4>
                      <div className="flex flex-wrap gap-1">
                        {atsScore.matched.map((kw, i) => <span key={i} className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {kw}</span>)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Missing</h4>
                      <div className="flex flex-wrap gap-1">
                        {atsScore.missing.map((kw, i) => <span key={i} className="text-xs px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded flex items-center gap-1"><XCircle className="w-3 h-3"/> {kw}</span>)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Suggestions</h4>
                    <ul className="space-y-2">
                      {atsScore.suggestions.map((sug, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <span className="text-indigo-500 mt-0.5">•</span> {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {isAnalyzing && (
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 dark:text-slate-300">Analyzing resume against ATS algorithms...</p>
              </div>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="print:m-0 print:shadow-none print:bg-white">
            <div className={cn(
              "w-full aspect-[1/1.414] bg-white rounded-xl shadow-2xl p-8 overflow-hidden transition-all print:p-0",
              activeTemplate === 'modern' ? 'font-sans' : '',
              activeTemplate === 'professional' ? 'font-serif' : '',
              activeTemplate === 'minimal' ? 'font-sans text-gray-800' : '',
              activeTemplate === 'tech' ? 'font-mono bg-slate-900 text-slate-300' : ''
            )}>
              {/* Header */}
              <div className={cn(
                "mb-6 pb-6",
                activeTemplate === 'modern' ? 'border-b-2 border-indigo-500/20' : 'border-b border-gray-300',
                activeTemplate === 'tech' ? 'border-b border-emerald-500/30' : ''
              )}>
                <h1 className={cn(
                  "text-3xl font-bold mb-2",
                  activeTemplate === 'modern' ? 'text-indigo-900' : '',
                  activeTemplate === 'professional' ? 'text-black' : '',
                  activeTemplate === 'tech' ? 'text-emerald-400' : ''
                )}>{personalInfo.name}</h1>
                <div className={cn(
                  "flex flex-wrap gap-x-4 gap-y-1 text-sm",
                  activeTemplate === 'tech' ? 'text-emerald-500/80' : 'text-gray-600'
                )}>
                  <span>{personalInfo.email}</span>
                  <span>•</span>
                  <span>{personalInfo.phone}</span>
                  <span>•</span>
                  <span>{personalInfo.linkedin}</span>
                  <span>•</span>
                  <span>{personalInfo.github}</span>
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div className="mb-6">
                  <h2 className={cn(
                    "text-lg font-bold mb-2 uppercase tracking-wider text-sm",
                    activeTemplate === 'modern' ? 'text-indigo-600' : 'text-gray-800',
                    activeTemplate === 'tech' ? 'text-emerald-500' : ''
                  )}>Professional Summary</h2>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    activeTemplate === 'tech' ? 'text-slate-400' : 'text-gray-700'
                  )}>{summary}</p>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div className="mb-6">
                  <h2 className={cn(
                    "text-lg font-bold mb-3 uppercase tracking-wider text-sm",
                    activeTemplate === 'modern' ? 'text-indigo-600' : 'text-gray-800',
                    activeTemplate === 'tech' ? 'text-emerald-500' : ''
                  )}>Experience</h2>
                  <div className="space-y-4">
                    {experience.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={cn("font-bold", activeTemplate === 'tech' ? 'text-emerald-100' : 'text-gray-900')}>{exp.role}</h3>
                          <span className={cn("text-xs font-semibold", activeTemplate === 'tech' ? 'text-slate-500' : 'text-gray-500')}>{exp.duration}</span>
                        </div>
                        <div className={cn("text-sm font-medium italic mb-2", activeTemplate === 'tech' ? 'text-emerald-400/70' : 'text-indigo-600')}>{exp.company}</div>
                        <ul className={cn(
                          "list-disc list-outside ml-4 text-sm space-y-1",
                          activeTemplate === 'tech' ? 'text-slate-400 marker:text-emerald-500' : 'text-gray-700'
                        )}>
                          {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                            <li key={i}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="mb-6">
                  <h2 className={cn(
                    "text-lg font-bold mb-3 uppercase tracking-wider text-sm",
                    activeTemplate === 'modern' ? 'text-indigo-600' : 'text-gray-800',
                    activeTemplate === 'tech' ? 'text-emerald-500' : ''
                  )}>Education</h2>
                  <div className="space-y-3">
                    {education.map(edu => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={cn("font-bold", activeTemplate === 'tech' ? 'text-emerald-100' : 'text-gray-900')}>{edu.school}</h3>
                          <span className={cn("text-xs font-semibold", activeTemplate === 'tech' ? 'text-slate-500' : 'text-gray-500')}>{edu.year}</span>
                        </div>
                        <div className={cn("text-sm flex justify-between", activeTemplate === 'tech' ? 'text-slate-400' : 'text-gray-700')}>
                          <span>{edu.degree}</span>
                          <span className="font-medium">GPA: {edu.gpa}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h2 className={cn(
                    "text-lg font-bold mb-2 uppercase tracking-wider text-sm",
                    activeTemplate === 'modern' ? 'text-indigo-600' : 'text-gray-800',
                    activeTemplate === 'tech' ? 'text-emerald-500' : ''
                  )}>Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span key={i} className={cn(
                        "text-sm px-2 py-0.5 rounded",
                        activeTemplate === 'modern' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700',
                        activeTemplate === 'tech' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20' : ''
                      )}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Activity = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);
