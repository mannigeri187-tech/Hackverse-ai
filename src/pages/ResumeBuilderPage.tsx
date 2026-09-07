import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Save, Loader2, LayoutTemplate, RefreshCw, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { ResumeData, ResumeThemeId } from '../types/resumeBuilder';
import { fetchUserResumeData } from '../utils/resume/resumeDataService';
import { ResumeEditor } from '../components/resume/ResumeEditor';
import { ResumeThemeRenderer } from '../components/resume/themes';

const THEMES: { id: ResumeThemeId; name: string; description: string; badge?: string }[] = [
  { id: 'ats', name: 'ATS Classic', description: 'ATS-friendly and optimized for traditional job applications.', badge: 'ATS-Friendly' },
  { id: 'modern', name: 'Modern Professional', description: 'Balanced modern design for almost any career.', badge: 'Recommended' },
  { id: 'tech', name: 'Tech Professional', description: 'Designed for developers, engineers and technical roles.', badge: 'For Developers' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean, elegant and distraction-free.', badge: 'Clean' },
  { id: 'engineering', name: 'Engineering', description: 'Optimized for engineering students and fresh graduates.', badge: 'For Engineering Students' },
  { id: 'creative', name: 'Creative Professional', description: 'Modern visual layout for designers and creative professionals.', badge: 'For Designers' }
];

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ResumeThemeId>('modern');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncData, setSyncData] = useState<ResumeData | null>(null);
  const [syncSelections, setSyncSelections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const { data: savedResume } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (savedResume && savedResume.content && Object.keys(savedResume.content).length > 0) {
          setResumeId(savedResume.id);
          const content = savedResume.content as Partial<ResumeData>;
          setResumeData({
            ...content,
            personal: content.personal || { name: 'Your Name' },
            education: content.education || [],
            experience: content.experience || [],
            projects: content.projects || [],
            skills: content.skills || [],
            hackathons: content.hackathons || [],
            achievements: content.achievements || [],
            certifications: content.certifications || []
          } as ResumeData);
          
          // Fix: Validate theme ID to prevent ResumeThemeRenderer crashes from legacy/invalid IDs
          if (savedResume.template_id) {
            const validThemeIds = ['ats', 'modern', 'tech', 'minimalist', 'engineering', 'creative'];
            if (validThemeIds.includes(savedResume.template_id)) {
              setTheme(savedResume.template_id as ResumeThemeId);
            } else {
              console.warn(`Invalid theme ID "${savedResume.template_id}" found in database. Falling back to default.`);
            }
          }
        } else {
          const freshData = await fetchUserResumeData(user.id);
          if (freshData) {
            setResumeData(freshData);
            setIsFirstTime(true);
          }
        }
      } catch (err) {
        console.error('Error in ResumeBuilderPage loadData:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSyncProfile = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const freshData = await fetchUserResumeData(user.id);
      if (freshData) {
        setSyncData(freshData);
        setSyncSelections({
          personal: true,
          summary: false, // Don't replace summary by default to preserve edits
          skills: true,
          projects: true,
          hackathons: true,
          certifications: true,
          education: true,
          experience: true
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const applySync = () => {
    if (!syncData || !resumeData) return;
    const merged = { ...resumeData };
    
    if (syncSelections.personal) {
      merged.personal = { ...merged.personal, ...syncData.personal };
    }
    if (syncSelections.summary) {
      merged.summary = syncData.summary || merged.summary;
    }
    if (syncSelections.skills) {
      merged.skills = Array.from(new Set([...merged.skills, ...syncData.skills]));
    }
    if (syncSelections.projects) {
      const existingIds = new Set(merged.projects.map(p => p.id));
      const newProjects = syncData.projects.filter(p => !existingIds.has(p.id));
      merged.projects = [...merged.projects, ...newProjects];
    }
    if (syncSelections.hackathons) {
      const existingIds = new Set(merged.hackathons.map(h => h.id));
      const newHackathons = syncData.hackathons.filter(h => !existingIds.has(h.id));
      merged.hackathons = [...merged.hackathons, ...newHackathons];
    }
    if (syncSelections.certifications) {
      const existingIds = new Set(merged.certifications.map(c => c.id));
      const newCerts = syncData.certifications.filter(c => !existingIds.has(c.id));
      merged.certifications = [...merged.certifications, ...newCerts];
    }
    // Also merge education and experience preventing duplicates by ID
    if (syncSelections.education) {
      const existingIds = new Set(merged.education.map(e => e.id));
      const newEdu = syncData.education.filter(e => !existingIds.has(e.id));
      merged.education = [...merged.education, ...newEdu];
    }
    if (syncSelections.experience) {
      const existingIds = new Set(merged.experience.map(e => e.id));
      const newExp = syncData.experience.filter(e => !existingIds.has(e.id));
      merged.experience = [...merged.experience, ...newExp];
    }
    
    setResumeData(merged);
    setSyncData(null);
  };

  const handleSave = async () => {
    if (!user || !resumeData) return;
    setSaving(true);
    setMessage(null);

    try {
      if (resumeId) {
        const { error } = await supabase
          .from('resumes')
          .update({ content: resumeData, template_id: theme, updated_at: new Date().toISOString() })
          .eq('id', resumeId);
        if (error) throw error;
      } else {
        const session = await supabase.auth.getSession();
        const res = await fetch('/api/resources/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session?.access_token}`
          },
          body: JSON.stringify({
            table: 'resumes',
            payload: {
              title: 'My Professional Resume',
              template_id: theme,
              content: resumeData
            },
            selectQuery: '*'
          })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw errData;
        }
        const data = await res.json();
        if (data) setResumeId(data.id);
      }
      setMessage({ type: 'success', text: 'Resume saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save resume' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              Resume Builder
            </h1>
            <p className="text-slate-500 text-sm">Professional resume generator</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
          <button 
            onClick={handleSyncProfile} 
            disabled={syncing || !resumeData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-70"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-primary-600" />}
            <span className="hidden sm:inline">Sync Profile</span>
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || !resumeData}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Resume'}
          </button>
        </div>
      </div>

      {isFirstTime && (
        <div className="mb-6 bg-primary-50 border border-primary-200 text-primary-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-sm font-bold">We've filled your resume using your HackVerse profile.</p>
              <p className="text-xs text-primary-600 mt-0.5">You can now edit, reorder, or customize the sections before saving.</p>
            </div>
          </div>
          <button onClick={() => setIsFirstTime(false)} className="text-primary-600 hover:bg-primary-100 p-2 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[calc(100vh-200px)] bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center shadow-sm">
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <p>Preparing your resume...</p>
            </div>
          </div>
          <div className="h-[calc(100vh-200px)] bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center animate-pulse">
            <div className="w-[70%] h-[80%] bg-white rounded-xl shadow-sm border border-slate-100"></div>
          </div>
        </div>
      ) : !resumeData ? (
        <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
          <p className="text-slate-500">Could not initialize resume data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Editor */}
          <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            <ResumeEditor data={resumeData} onChange={setResumeData} />
          </div>

          {/* Right Column: Preview & Theme Selector */}
          <div className="h-[calc(100vh-200px)] overflow-y-auto sticky top-4 flex flex-col gap-4">
            
            {/* Theme Selector */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-primary-600" /> Resume Templates
                </h2>
                <p className="text-xs text-slate-500 mt-1">Choose a professional design that matches your career goals.</p>
              </div>
              
              <div className="p-4 flex gap-4 overflow-x-auto custom-scrollbar pb-4">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex-shrink-0 w-64 text-left p-4 rounded-xl border transition-all ${theme === t.id ? 'border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}
                  >
                    <div className="flex flex-col gap-2 mb-2 min-h-[40px]">
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-bold text-slate-900 leading-tight flex-1 break-words">{t.name}</div>
                        {t.badge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 ${theme === t.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
                              {t.badge}
                            </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">{t.description}</p>
                    <div className={`text-xs font-bold text-center py-1.5 rounded-lg w-full ${theme === t.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {theme === t.id ? 'Selected' : 'Select'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Preview */}
            <div className="transform origin-top lg:scale-[0.85] xl:scale-95 transition-transform flex-1">
              <ResumeThemeRenderer data={resumeData} theme={theme} />
            </div>
          </div>
        </div>
      )}

      {/* Sync Profile Modal */}
      {syncData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary-600" /> Sync from Profile
              </h3>
              <button onClick={() => setSyncData(null)} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Select the information you want to import from your HackVerse AI profile into your resume. Existing manual edits will not be overwritten for unselected items.</p>
              
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {Object.keys(syncSelections).map((key) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${syncSelections[key] ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-300 group-hover:border-primary-400'}`}>
                      {syncSelections[key] && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={syncSelections[key]}
                      onChange={() => setSyncSelections(prev => ({ ...prev, [key]: !prev[key] }))}
                    />
                    <span className="text-sm font-medium text-slate-700 capitalize">Update {key}</span>
                  </label>
                ))}
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  onClick={() => setSyncData(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={applySync}
                  className="px-4 py-2 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm"
                >
                  Apply Selected Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
