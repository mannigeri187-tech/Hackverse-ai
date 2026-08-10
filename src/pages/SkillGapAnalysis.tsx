import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity, Zap, TrendingUp, BookOpen, Clock, Download, Plus } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const SAMPLE_HACKATHONS = [
  'Global AI Hackathon',
  'EthDenver Web3',
  'HealthTech Innovators',
  'FinTech Disrupt 2024'
];

export default function SkillGapAnalysis() {
  const [target, setTarget] = useState(SAMPLE_HACKATHONS[0]);
  const [customTarget, setCustomTarget] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Mock user skills
  const userSkills = ['React', 'Node.js', 'Python', 'Git', 'CSS', 'TypeScript'];

  const handleAnalyze = async () => {
    setAnalyzing(true);
    // Mock API call delay
    await new Promise(r => setTimeout(r, 2000));
    setResults({
      chartData: [
        { subject: 'Frontend', A: 90, B: 85, fullMark: 100 },
        { subject: 'Backend', A: 75, B: 85, fullMark: 100 },
        { subject: 'AI/ML', A: 40, B: 90, fullMark: 100 },
        { subject: 'DevOps', A: 60, B: 70, fullMark: 100 },
        { subject: 'Database', A: 80, B: 75, fullMark: 100 },
        { subject: 'System Design', A: 50, B: 80, fullMark: 100 },
      ],
      missingSkills: [
        { name: 'PyTorch / TensorFlow', priority: 'High', time: '20h' },
        { name: 'Vector Databases (Pinecone)', priority: 'High', time: '8h' },
        { name: 'LangChain & RAG Pipeline', priority: 'High', time: '12h' },
        { name: 'Docker & Containerization', priority: 'Medium', time: '10h' }
      ],
      strengths: ['Strong React/TypeScript foundation', 'Good understanding of relational databases'],
      weaknesses: ['Limited AI model deployment experience', 'No background in RAG architectures'],
      learningPath: [
        { title: 'Intro to LLMs & Prompting', duration: '4h', resources: 3, done: true },
        { title: 'Vector DBs and Embeddings', duration: '6h', resources: 2, done: false },
        { title: 'Building RAG with LangChain', duration: '12h', resources: 5, done: false },
        { title: 'Deploying AI Models via API', duration: '8h', resources: 4, done: false }
      ],
      totalTime: '30h'
    });
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 font-sans text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Skill Gap Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl">
            Compare your current skillset against the requirements of specific hackathons to get a personalized, AI-generated learning roadmap.
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400"><Target size={24}/> Target Hackathon / Role</h3>
              <select 
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full p-4 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/20 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-lg shadow-sm"
              >
                {SAMPLE_HACKATHONS.map(h => <option key={h} value={h}>{h}</option>)}
                <option value="custom">Custom Goal...</option>
              </select>
              
              {target === 'custom' && (
                <motion.input 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  type="text" 
                  placeholder="e.g. AI Engineer, OpenAI Spring Hackathon"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  className="w-full p-4 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg shadow-sm mt-4"
                />
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Activity size={24}/> Current Skills Profile</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                {userSkills.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold shadow-sm">
                    {skill}
                  </span>
                ))}
                <button className="px-4 py-2 bg-gray-100 dark:bg-slate-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                  <Plus size={16} /> Add Skill
                </button>
              </div>
              <p className="text-sm text-gray-500 font-medium">Skills are pulled from your profile. Add more for better accuracy.</p>
            </div>
          </div>
          
          <div className="mt-10 flex justify-end pt-8 border-t border-gray-200 dark:border-white/10">
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {analyzing ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Zap size={24} /></motion.div> Analyzing Profile...</>
              ) : (
                <><Zap size={24} /> Analyze Skills</>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Radar Chart */}
                <div className="lg:col-span-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl flex flex-col items-center">
                  <h3 className="text-xl font-bold mb-6 self-start flex items-center gap-2"><Target className="text-indigo-500"/> Skill Match</h3>
                  <div className="flex gap-6 text-sm font-bold mb-6 self-start bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    <span className="flex items-center gap-2"><div className="w-4 h-4 bg-indigo-500 rounded-md"></div> You</span>
                    <span className="flex items-center gap-2"><div className="w-4 h-4 bg-pink-500 rounded-md opacity-70"></div> Required</span>
                  </div>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={results.chartData}>
                        <PolarGrid stroke="#475569" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="You" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.4} />
                        <Radar name="Required" dataKey="B" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.2} strokeDasharray="5 5" />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Missing Skills Table */}
                <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Zap className="text-amber-500"/> Critical Missing Skills</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-white/10 text-sm text-gray-500">
                          <th className="pb-4 font-bold uppercase tracking-wider">Skill Requirement</th>
                          <th className="pb-4 font-bold uppercase tracking-wider">Priority</th>
                          <th className="pb-4 font-bold uppercase tracking-wider">Est. Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.missingSkills.map((skill: any, i: number) => (
                          <tr key={i} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-5 font-bold text-gray-900 dark:text-white text-lg">{skill.name}</td>
                            <td className="py-5">
                              <span className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-bold",
                                skill.priority === 'High' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                skill.priority === 'Medium' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              )}>
                                {skill.priority}
                              </span>
                            </td>
                            <td className="py-5 text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 mt-1"><Clock size={16}/> {skill.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Learning Path */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                  <div>
                    <h3 className="text-3xl font-bold flex items-center gap-3"><TrendingUp className="text-indigo-500" size={32}/> Learning Roadmap</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Total Preparation Time: <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg ml-2">{results.totalTime}</span></p>
                  </div>
                  <button className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform font-bold shadow-md">
                    <Download size={20} /> Export Plan
                  </button>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-pink-500">
                  {results.learningPath.map((step: any, i: number) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors",
                        step.done ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                      )}>
                        {step.done ? "✓" : i + 1}
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className={cn("font-bold text-xl", step.done ? "text-gray-400 line-through" : "text-gray-900 dark:text-white")}>{step.title}</h4>
                          <input type="checkbox" checked={step.done} readOnly className="w-6 h-6 rounded text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-700 border-none cursor-pointer" />
                        </div>
                        <div className="flex gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl inline-flex">
                          <span className="flex items-center gap-2"><Clock size={16}/> {step.duration}</span>
                          <span className="w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                          <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"><BookOpen size={16}/> {step.resources} resources</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
