import { forwardRef } from 'react';
import type { ResumeContent } from '../types/resume';

interface ResumePreviewProps {
  content: ResumeContent;
  template: string;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ content, template }, ref) => {
  const isModern = template === 'modern';

  return (
    <div 
      ref={ref} 
      className={`bg-white w-[210mm] min-h-[297mm] shadow-lg mx-auto p-10 print:shadow-none print:w-full print:p-0 ${isModern ? 'font-sans' : 'font-serif'}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className={`text-center border-b-2 ${isModern ? 'border-primary-500 pb-6 mb-6' : 'border-slate-800 pb-4 mb-4'}`}>
        <h1 className={`text-4xl font-bold uppercase tracking-wider ${isModern ? 'text-primary-900' : 'text-slate-900'}`}>
          {content.name || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-sm text-slate-600">
          {content.email && <span>{content.email}</span>}
          {content.phone && <span>• {content.phone}</span>}
          {content.location && <span>• {content.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 text-sm text-blue-600">
          {content.linkedin && <a href={content.linkedin}>LinkedIn</a>}
          {content.github && <span>• <a href={content.github}>GitHub</a></span>}
          {content.portfolio && <span>• <a href={content.portfolio}>Portfolio</a></span>}
        </div>
      </div>

      {/* Summary */}
      {content.summary && (
        <div className="mb-6">
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{content.summary}</p>
        </div>
      )}

      {/* Education */}
      {content.education.length > 0 && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold uppercase tracking-widest mb-3 ${isModern ? 'text-primary-700' : 'text-slate-900 border-b border-slate-300 pb-1'}`}>
            Education
          </h2>
          <div className="space-y-4">
            {content.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <h3>{edu.institution}</h3>
                  <span className="text-sm font-normal text-slate-600">{edu.startDate} - {edu.endDate || 'Present'}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 italic mt-0.5">
                  <span>{edu.degree} in {edu.field}</span>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {content.experience.length > 0 && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold uppercase tracking-widest mb-3 ${isModern ? 'text-primary-700' : 'text-slate-900 border-b border-slate-300 pb-1'}`}>
            Experience
          </h2>
          <div className="space-y-4">
            {content.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <h3>{exp.position} <span className="font-normal text-slate-600">| {exp.company}</span></h3>
                  <span className="text-sm font-normal text-slate-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
                {exp.location && <div className="text-sm text-slate-500 italic mt-0.5">{exp.location}</div>}
                <div className="mt-2 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects & Hackathons */}
      {(content.projects.length > 0 || content.hackathons.length > 0) && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold uppercase tracking-widest mb-3 ${isModern ? 'text-primary-700' : 'text-slate-900 border-b border-slate-300 pb-1'}`}>
            Projects & Hackathons
          </h2>
          <div className="space-y-4">
            {[...content.projects, ...content.hackathons].map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <h3>
                    {proj.name}
                    {proj.link && <a href={proj.link} className="ml-2 font-normal text-blue-600 text-xs">Link</a>}
                  </h3>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{proj.technologies}</span>
                </div>
                <div className="mt-1.5 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {proj.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {content.skills && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold uppercase tracking-widest mb-3 ${isModern ? 'text-primary-700' : 'text-slate-900 border-b border-slate-300 pb-1'}`}>
            Skills
          </h2>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{content.skills}</p>
        </div>
      )}

      {/* Achievements & Certifications */}
      {(content.achievements || content.certifications) && (
        <div className="mb-6">
          <h2 className={`text-lg font-bold uppercase tracking-widest mb-3 ${isModern ? 'text-primary-700' : 'text-slate-900 border-b border-slate-300 pb-1'}`}>
            Achievements & Certifications
          </h2>
          {content.achievements && (
            <div className="mb-2">
              <span className="font-bold text-sm text-slate-900">Achievements: </span>
              <span className="text-sm text-slate-800 whitespace-pre-wrap">{content.achievements}</span>
            </div>
          )}
          {content.certifications && (
            <div>
              <span className="font-bold text-sm text-slate-900">Certifications: </span>
              <span className="text-sm text-slate-800 whitespace-pre-wrap">{content.certifications}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
