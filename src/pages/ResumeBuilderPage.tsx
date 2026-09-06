import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Save, Loader2, LayoutTemplate } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { ResumeData, ResumeThemeId } from '../types/resumeBuilder';
import { fetchUserResumeData } from '../utils/resume/resumeDataService';
import { ATSScoreCard } from '../components/resume/ATSScoreCard';
import { AIResumeCoach } from '../components/resume/AIResumeCoach';
import { calculateATSScore } from '../utils/resume/atsScoreEngine';
import { ResumeEditor } from '../components/resume/ResumeEditor';
import { ResumeThemeRenderer } from '../components/resume/themes';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ResumeThemeId>('ats-pro');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
          setResumeData(savedResume.content as ResumeData);
          if (savedResume.template_id && ['ats-pro', 'modern', 'tech'].includes(savedResume.template_id)) {
            setTheme(savedResume.template_id as ResumeThemeId);
          } else {
            setTheme('ats-pro');
          }
        } else {
          const freshData = await fetchUserResumeData(user.id);
          if (freshData) {
            setResumeData(freshData);
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
        const { data, error } = await supabase
          .from('resumes')
          .insert({
            user_id: user.id,
            title: 'My Professional Resume',
            template_id: theme,
            content: resumeData
          })
          .select()
          .single();
        if (error) throw error;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

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
            onClick={handleSave} 
            disabled={saving || !resumeData}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Resume'}
          </button>
        </div>
      </div>

      {!resumeData ? (
        <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
          <p className="text-slate-500">Could not initialize resume data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Editor, Coach & ATS Score */}
          <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            <ATSScoreCard atsResult={calculateATSScore(resumeData)} />
            <AIResumeCoach data={resumeData} atsResult={calculateATSScore(resumeData)} onChange={setResumeData} />
            <ResumeEditor data={resumeData} onChange={setResumeData} />
          </div>

          {/* Right Column: Preview & Theme Selector */}
          <div className="h-[calc(100vh-200px)] overflow-y-auto sticky top-4 flex flex-col gap-4">
            
            {/* Theme Selector */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <LayoutTemplate className="w-4 h-4" />
                Theme
              </div>
              <div className="flex gap-2">
                {(['ats-pro', 'modern', 'tech'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize ${theme === t ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {t === 'ats-pro' ? 'ATS Pro (Recommended)' : t}
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
    </div>
  );
}
