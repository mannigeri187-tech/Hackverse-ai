import { useState } from 'react';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ResumeContent, Education, Experience, Project } from '../types/resume';

interface ResumeFormProps {
  content: ResumeContent;
  onChange: (content: ResumeContent) => void;
}

export default function ResumeForm({ content, onChange }: ResumeFormProps) {
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isImproving, setIsImproving] = useState<string | null>(null);

  const updateField = (field: keyof ResumeContent, value: any) => {
    onChange({ ...content, [field]: value });
  };

  const handleAIImprove = async (section: string, text: string, onUpdate: (improved: string) => void) => {
    if (!text.trim()) return;
    setIsImproving(section);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ section, text })
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `AI improvement failed (${res.status})`);
      }

      const data = await res.json();
      if (data.improved) {
        onUpdate(data.improved);
      } else {
        alert('Failed to generate improvement. Please try again.');
      }
    } catch (err: any) {
      console.error('AI Improvement error:', err);
      alert(err.message || 'An error occurred during AI improvement.');
    } finally {
      setIsImproving(null);
    }
  };

  const addArrayItem = <T extends { id: string }>(field: 'education' | 'experience' | 'projects' | 'hackathons', defaultItem: Omit<T, 'id'>) => {
    const newItem = { id: crypto.randomUUID(), ...defaultItem } as unknown as T;
    updateField(field, [...content[field], newItem]);
  };

  const removeArrayItem = (field: 'education' | 'experience' | 'projects' | 'hackathons', id: string) => {
    updateField(field, content[field].filter((item: any) => item.id !== id));
  };

  const updateArrayItem = (field: 'education' | 'experience' | 'projects' | 'hackathons', id: string, updates: any) => {
    updateField(field, content[field].map((item: any) => item.id === id ? { ...item, ...updates } : item));
  };

  const AccordionHeader = ({ id, title }: { id: string, title: string }) => (
    <button
      onClick={() => setActiveSection(activeSection === id ? '' : id)}
      className="w-full text-left font-bold text-lg p-4 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 flex justify-between items-center"
    >
      {title}
      <span className="text-slate-400">{activeSection === id ? '−' : '+'}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 bg-slate-800 text-white font-semibold">
        Editor
      </div>
      <div className="overflow-y-auto flex-1 pb-20">
        
        {/* Personal Info */}
        <div className="border-b border-slate-200">
          <AccordionHeader id="personal" title="Personal Information" />
          {activeSection === 'personal' && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded" value={content.name} onChange={(e) => updateField('name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" className="w-full p-2 border border-slate-300 rounded" value={content.email} onChange={(e) => updateField('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded" value={content.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded" value={content.location} onChange={(e) => updateField('location', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GitHub</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded" value={content.github} onChange={(e) => updateField('github', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded" value={content.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded" value={content.portfolio} onChange={(e) => updateField('portfolio', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border-b border-slate-200">
          <AccordionHeader id="summary" title="Professional Summary" />
          {activeSection === 'summary' && (
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-700">Summary</label>
                <button 
                  onClick={() => handleAIImprove('summary', content.summary, (val) => updateField('summary', val))}
                  disabled={isImproving === 'summary' || !content.summary}
                  className="flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isImproving === 'summary' ? 'Improving...' : 'AI Improve'}
                </button>
              </div>
              <textarea 
                rows={4} 
                className="w-full p-2 border border-slate-300 rounded" 
                value={content.summary} 
                onChange={(e) => updateField('summary', e.target.value)} 
                placeholder="A brief overview of your background and goals..."
              />
            </div>
          )}
        </div>

        {/* Education */}
        <div className="border-b border-slate-200">
          <AccordionHeader id="education" title="Education" />
          {activeSection === 'education' && (
            <div className="p-4 space-y-6">
              {content.education.map((edu) => (
                <div key={edu.id} className="p-4 border border-slate-200 rounded relative bg-slate-50">
                  <button onClick={() => removeArrayItem('education', edu.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-6">
                    <input placeholder="Institution (e.g. MIT)" className="p-2 border border-slate-300 rounded col-span-2" value={edu.institution} onChange={(e) => updateArrayItem('education', edu.id, { institution: e.target.value })} />
                    <input placeholder="Degree (e.g. BS)" className="p-2 border border-slate-300 rounded" value={edu.degree} onChange={(e) => updateArrayItem('education', edu.id, { degree: e.target.value })} />
                    <input placeholder="Field (e.g. Computer Science)" className="p-2 border border-slate-300 rounded" value={edu.field} onChange={(e) => updateArrayItem('education', edu.id, { field: e.target.value })} />
                    <input placeholder="Start Date" className="p-2 border border-slate-300 rounded" value={edu.startDate} onChange={(e) => updateArrayItem('education', edu.id, { startDate: e.target.value })} />
                    <input placeholder="End Date" className="p-2 border border-slate-300 rounded" value={edu.endDate} onChange={(e) => updateArrayItem('education', edu.id, { endDate: e.target.value })} />
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayItem<Education>('education', { institution: '', degree: '', field: '', startDate: '', endDate: '' })} className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700">
                <Plus className="w-4 h-4 mr-1" /> Add Education
              </button>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="border-b border-slate-200">
          <AccordionHeader id="experience" title="Experience" />
          {activeSection === 'experience' && (
            <div className="p-4 space-y-6">
              {content.experience.map((exp) => (
                <div key={exp.id} className="p-4 border border-slate-200 rounded relative bg-slate-50">
                  <button onClick={() => removeArrayItem('experience', exp.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-6">
                    <input placeholder="Company" className="p-2 border border-slate-300 rounded col-span-2" value={exp.company} onChange={(e) => updateArrayItem('experience', exp.id, { company: e.target.value })} />
                    <input placeholder="Position" className="p-2 border border-slate-300 rounded" value={exp.position} onChange={(e) => updateArrayItem('experience', exp.id, { position: e.target.value })} />
                    <input placeholder="Location" className="p-2 border border-slate-300 rounded" value={exp.location} onChange={(e) => updateArrayItem('experience', exp.id, { location: e.target.value })} />
                    <input placeholder="Start Date" className="p-2 border border-slate-300 rounded" value={exp.startDate} onChange={(e) => updateArrayItem('experience', exp.id, { startDate: e.target.value })} />
                    <input placeholder="End Date" className="p-2 border border-slate-300 rounded" value={exp.endDate} onChange={(e) => updateArrayItem('experience', exp.id, { endDate: e.target.value })} />
                    <div className="col-span-2 mt-2">
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-xs font-medium text-slate-600">Description</label>
                        <button 
                          onClick={() => handleAIImprove(`experience-${exp.id}`, exp.description, (val) => updateArrayItem('experience', exp.id, { description: val }))}
                          disabled={isImproving === `experience-${exp.id}` || !exp.description}
                          className="flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isImproving === `experience-${exp.id}` ? 'Improving...' : 'AI Improve'}
                        </button>
                      </div>
                      <textarea rows={4} placeholder="Describe your achievements (bullet points recommended)" className="w-full p-2 border border-slate-300 rounded" value={exp.description} onChange={(e) => updateArrayItem('experience', exp.id, { description: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayItem<Experience>('experience', { company: '', position: '', location: '', startDate: '', endDate: '', description: '' })} className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700">
                <Plus className="w-4 h-4 mr-1" /> Add Experience
              </button>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="border-b border-slate-200">
          <AccordionHeader id="projects" title="Projects & Hackathons" />
          {activeSection === 'projects' && (
            <div className="p-4 space-y-6">
              {content.projects.map((proj) => (
                <div key={proj.id} className="p-4 border border-slate-200 rounded relative bg-slate-50">
                  <button onClick={() => removeArrayItem('projects', proj.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-6">
                    <input placeholder="Project Name" className="p-2 border border-slate-300 rounded col-span-2" value={proj.name} onChange={(e) => updateArrayItem('projects', proj.id, { name: e.target.value })} />
                    <input placeholder="Technologies (e.g. React, Node, AWS)" className="p-2 border border-slate-300 rounded col-span-2" value={proj.technologies} onChange={(e) => updateArrayItem('projects', proj.id, { technologies: e.target.value })} />
                    <input placeholder="Project Link" className="p-2 border border-slate-300 rounded col-span-2" value={proj.link || ''} onChange={(e) => updateArrayItem('projects', proj.id, { link: e.target.value })} />
                    <div className="col-span-2 mt-2">
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-xs font-medium text-slate-600">Description</label>
                        <button 
                          onClick={() => handleAIImprove(`project-${proj.id}`, proj.description, (val) => updateArrayItem('projects', proj.id, { description: val }))}
                          disabled={isImproving === `project-${proj.id}` || !proj.description}
                          className="flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isImproving === `project-${proj.id}` ? 'Improving...' : 'AI Improve'}
                        </button>
                      </div>
                      <textarea rows={3} placeholder="What did you build and why?" className="w-full p-2 border border-slate-300 rounded" value={proj.description} onChange={(e) => updateArrayItem('projects', proj.id, { description: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayItem<Project>('projects', { name: '', description: '', technologies: '' })} className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700">
                <Plus className="w-4 h-4 mr-1" /> Add Project
              </button>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="border-b border-slate-200">
          <AccordionHeader id="skills" title="Skills" />
          {activeSection === 'skills' && (
            <div className="p-4">
              <textarea 
                rows={4} 
                className="w-full p-2 border border-slate-300 rounded" 
                value={content.skills} 
                onChange={(e) => updateField('skills', e.target.value)} 
                placeholder="Languages: Python, JS...&#10;Tools: Git, Docker..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
