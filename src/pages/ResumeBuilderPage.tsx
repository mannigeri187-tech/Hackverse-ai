import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Globe, MapPin, Mail, Phone, Briefcase, Award, GraduationCap, Code } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { ResumeData } from '../types/resumeBuilder';
import { fetchUserResumeData } from '../utils/resume/resumeDataService';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const data = await fetchUserResumeData(user.id);
        if (data) {
          setResumeData(data);
        }
      } catch (err) {
        console.error('Error in ResumeBuilderPage:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-600"></div>
        
        {!resumeData ? (
          <div className="text-center py-12 text-slate-500">Add your profile information</div>
        ) : (
          <div>
            <div className="border-b border-slate-200 pb-6 mb-6">
              <h3 className="text-3xl font-bold text-slate-900">{resumeData.personal.name}</h3>
              {resumeData.personal.title && (
                <p className="text-lg text-primary-600 font-medium mt-1">{resumeData.personal.title}</p>
              )}
              
              <div className="text-slate-500 mt-4 flex flex-wrap gap-4 text-sm">
                {resumeData.personal.email && (
                  <div className="flex items-center gap-1.5"><Mail className="w-4 h-4"/> {resumeData.personal.email}</div>
                )}
                {resumeData.personal.phone && (
                  <div className="flex items-center gap-1.5"><Phone className="w-4 h-4"/> {resumeData.personal.phone}</div>
                )}
                {resumeData.personal.location && (
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {resumeData.personal.location}</div>
                )}
                {resumeData.personal.github && (
                  <div className="flex items-center gap-1.5"><Globe className="w-4 h-4"/> GitHub</div>
                )}
                {resumeData.personal.linkedin && (
                  <div className="flex items-center gap-1.5"><Globe className="w-4 h-4"/> LinkedIn</div>
                )}
                {resumeData.personal.portfolio && (
                  <div className="flex items-center gap-1.5"><Globe className="w-4 h-4"/> Portfolio</div>
                )}
              </div>
            </div>

            {resumeData.summary && (
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Summary
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed">{resumeData.summary}</p>
              </div>
            )}

            {resumeData.skills && resumeData.skills.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-slate-400" /> Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Projects
              </h4>
              {resumeData.projects && resumeData.projects.length > 0 ? (
                <div className="space-y-4">
                  {resumeData.projects.map((proj, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-slate-900">{proj.name}</h5>
                        {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-xs">View Code</a>}
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {proj.technologies.map((tech: string, j: number) => (
                            <span key={j} className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No projects added yet</p>
              )}
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-400" /> Hackathons
              </h4>
              {resumeData.hackathons && resumeData.hackathons.length > 0 ? (
                <div className="space-y-3">
                  {resumeData.hackathons.map((hack, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{hack.name}</h5>
                        <p className="text-xs text-slate-500 mt-1">Project: {hack.project}</p>
                      </div>
                      <div className="text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                        {hack.date ? new Date(hack.date).toLocaleDateString() : 'Participant'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No hackathons participated yet</p>
              )}
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-400" /> Certifications
              </h4>
              {resumeData.certifications && resumeData.certifications.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {resumeData.certifications.map((cert, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">{cert.title}</span> — {cert.issuer}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No certifications added yet</p>
              )}
            </div>

            {/* Missing Data Sections */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-slate-400" /> Education
              </h4>
              <p className="text-sm text-slate-400 italic">No education history added yet</p>
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Experience
              </h4>
              <p className="text-sm text-slate-400 italic">No work experience added yet</p>
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
