import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { ResumeData } from '../types/resumeBuilder';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Fetch team profile data for skills
        const { data: teamProfile } = await supabase
          .from('team_profiles')
          .select('skills')
          .eq('user_id', user.id)
          .single();

        const data: ResumeData = {
          personal: {
            name: profile?.name || 'Your Name',
            email: profile?.email || user.email,
            phone: profile?.phone || '',
            location: profile?.college || '',
            profileImage: profile?.profile_image || ''
          },
          summary: profile?.bio || 'Add your professional summary here.',
          education: [],
          experience: [],
          projects: [],
          skills: teamProfile?.skills || [],
          hackathons: [],
          achievements: [],
          certifications: []
        };
        
        setResumeData(data);
      } catch (err) {
        console.error('Error fetching resume data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
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

      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Build Your Professional Resume</h2>
        <p className="text-slate-600">
          Turn your HackVerse profile, projects, hackathons and achievements into a professional resume.
        </p>
      </div>

      {/* Resume Preview Placeholder */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        {!resumeData ? (
          <div className="text-center py-12 text-slate-500">Add your profile information</div>
        ) : (
          <div>
            <div className="border-b border-slate-200 pb-6 mb-6">
              <h3 className="text-3xl font-bold text-slate-900">{resumeData.personal.name}</h3>
              <div className="text-slate-500 mt-2 flex gap-4 text-sm">
                {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
                {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
                {resumeData.personal.location && <span>{resumeData.personal.location}</span>}
              </div>
            </div>

            {resumeData.summary && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Summary</h4>
                <p className="text-slate-700 text-sm">{resumeData.summary}</p>
              </div>
            )}

            {resumeData.skills && resumeData.skills.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-slate-400 text-sm italic mt-8 text-center border-t border-slate-100 pt-8">
              Education, Experience, Projects, and Hackathons will appear here once added to your profile.
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-sm">
          Create My Resume
        </button>
      </div>
    </div>
  );
}
