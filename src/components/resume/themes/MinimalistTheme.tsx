import { Globe } from 'lucide-react';
import type { ResumeData } from '../../../types/resumeBuilder';

export function MinimalistTheme({ data }: { data: ResumeData }) {
  const visibleProjects = (data.projects || []).filter(p => p.included);

  return (
    <div className="bg-white text-slate-800 font-sans max-w-4xl mx-auto h-full shadow-lg overflow-hidden text-sm p-12">
      
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-light text-slate-900 tracking-tight mb-2">
          {data.personal?.name || 'Your Name'}
        </h1>
        {data.personal?.title && <div className="text-slate-500 uppercase tracking-widest text-xs font-semibold mb-4">{data.personal?.title}</div>}
        
        <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
          {data.personal?.email && <span>{data.personal?.email}</span>}
          {data.personal?.phone && <span>{data.personal?.phone}</span>}
          {data.personal?.location && <span>{data.personal?.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500 mt-2">
          {data.personal?.github && <a href={data.personal?.github} className="hover:text-slate-800">GitHub</a>}
          {data.personal?.linkedin && <a href={data.personal?.linkedin} className="hover:text-slate-800">LinkedIn</a>}
          {data.personal?.portfolio && <a href={data.personal?.portfolio} className="hover:text-slate-800">Portfolio</a>}
        </div>
      </header>

      <div className="space-y-8">
        
        {/* Summary */}
        {data.summary && (
          <section>
            <p className="text-slate-600 leading-relaxed text-justify">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4 pb-1 border-b border-slate-100">Experience</h2>
            <div className="space-y-6">
              {(data.experience || []).map(exp => (
                <div key={exp.id}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h3 className="font-medium text-slate-900 text-base">{exp.title}</h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">{exp.company}</div>
                  {exp.description && (
                    <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4 pb-1 border-b border-slate-100">Education</h2>
            <div className="space-y-4">
              {(data.education || []).map(edu => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-medium text-slate-900">{edu.institution}</h3>
                    <div className="text-slate-600">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  </div>
                  <div className="text-xs text-slate-400 font-medium text-right">
                    {edu.startYear} – {edu.endYear}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {visibleProjects.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4 pb-1 border-b border-slate-100">Projects</h2>
            <div className="space-y-6">
              {visibleProjects.map(proj => (
                <div key={proj.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900">{proj.name}</h3>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} className="text-slate-400 hover:text-slate-600">
                        <Globe className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-2">{proj.description}</p>
                  {proj.technologies?.length > 0 && (
                    <div className="text-xs text-slate-400 flex flex-wrap gap-2">
                      {proj.technologies.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-4 pb-1 border-b border-slate-100">Skills</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600">
              {(data.skills || []).map((skill, i) => (
                <span key={i} className="flex items-center">
                  <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
