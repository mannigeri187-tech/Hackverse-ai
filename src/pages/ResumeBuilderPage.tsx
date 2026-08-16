import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Save, Download, LayoutTemplate, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ResumePreview } from '../components/ResumePreview';
import ResumeForm from '../components/ResumeForm';
import { defaultResumeContent } from '../types/resume';
import type { ResumeContent } from '../types/resume';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<ResumeContent>(defaultResumeContent);
  const [template, setTemplate] = useState<'modern' | 'classic'>('modern');
  const [resumeId, setResumeId] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: content.name ? `${content.name}_Resume` : 'Resume',
    contentRef: printRef,
  });

  // Load existing resume
  useEffect(() => {
    async function loadResume() {
      if (!user) return;
      setIsLoading(true);
      
      const { data } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setResumeId(data.id);
        setTemplate(data.template_id as 'modern' | 'classic');
        if (data.content) {
          // Merge with defaults to ensure all array fields exist
          setContent({ ...defaultResumeContent, ...data.content });
        }
      } else {
        // Pre-fill email and name from user auth if new
        setContent(prev => ({
          ...prev,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        }));
      }
      setIsLoading(false);
    }
    
    loadResume();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      if (resumeId) {
        // Update
        const { error } = await supabase
          .from('resumes')
          .update({ content, template_id: template, updated_at: new Date().toISOString() })
          .eq('id', resumeId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('resumes')
          .insert([{ user_id: user.id, content, template_id: template }])
          .select()
          .single();
          
        if (error) throw error;
        if (data) setResumeId(data.id);
      }
      setSaveMessage({ type: 'success', text: 'Resume saved successfully!' });
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save resume' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const validateAndPrint = () => {
    if (!content.name || !content.email) {
      alert("Please enter at least your Name and Email before downloading.");
      return;
    }
    handlePrint();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        Loading Resume Builder...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <FileText className="w-8 h-8 mr-2 text-primary-600" />
            Resume Builder
          </h1>
          <p className="text-slate-600">Build, preview, and download your professional resume.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-200 rounded-lg p-1 mr-2">
            <button 
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${template === 'modern' ? 'bg-white shadow text-primary-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <LayoutTemplate className="w-4 h-4 mr-1.5" /> Modern
            </button>
            <button 
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${template === 'classic' ? 'bg-white shadow text-primary-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <LayoutTemplate className="w-4 h-4 mr-1.5" /> Classic
            </button>
          </div>

          {saveMessage && (
            <span className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {saveMessage.text}
            </span>
          )}

          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors flex items-center shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button 
            onClick={validateAndPrint}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Editor Pane */}
        <div className="w-full lg:w-[45%] flex-shrink-0 lg:overflow-hidden h-full">
          <ResumeForm content={content} onChange={setContent} />
        </div>
        
        {/* Preview Pane */}
        <div className="w-full lg:w-[55%] bg-slate-200 rounded-xl border border-slate-300 overflow-y-auto p-4 md:p-8 relative">
          <ResumePreview ref={printRef} content={content} template={template} />
        </div>
      </div>
    </div>
  );
}
