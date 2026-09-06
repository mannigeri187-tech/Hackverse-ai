import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import type { ResumeData } from '../../../types/resumeBuilder';

export function ModernTheme({ data }: { data: ResumeData }) {
  const visibleProjects = (data.projects || []).filter(p => p.included);
  const visibleHackathons = (data.hackathons || []).filter(h => h.included);
  const visibleCertifications = (data.certifications || []).filter(c => c.included);

  return (
    <div className="bg-white text-slate-800 font-sans max-w-4xl mx-auto h-full shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
      
      {/* Left Column (Sidebar) */}
      <div className="w-full md:w-1/3 bg-slate-50 p-6 md:p-8 border-r border-slate-200 flex flex-col gap-8">
        
        {/* Personal Details */}
        <div className="text-sm space-y-3 break-words">
          {data.personal?.email && (
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <span>{data.personal?.email}</span>
            </div>
          )}
          {data.personal?.phone && (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <span>{data.personal?.phone}</span>
            </div>
          )}
          {data.personal?.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <span>{data.personal?.location}</span>
            </div>
          )}
          {data.personal?.linkedin && (
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <a href={data.personal?.linkedin} className="hover:underline">LinkedIn</a>
            </div>
          )}
          {data.personal?.github && (
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <a href={data.personal?.github} className="hover:underline">GitHub</a>
            </div>
          )}
          {data.personal?.portfolio && (
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <a href={data.personal?.portfolio} className="hover:underline">Portfolio</a>
            </div>
          )}
        </div>

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-primary-100 pb-1 mb-3">Education</h2>
            <div className="space-y-4">
              {(data.education || []).map(edu => (
                <div key={edu.id} className="text-sm">
                  <div className="font-bold text-slate-900">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  <div className="text-primary-700 font-medium my-0.5">{edu.institution}</div>
                  <div className="text-slate-500 text-xs mb-1">{edu.startYear} – {edu.endYear}</div>
                  {edu.gpa && <div className="text-slate-600 text-xs">GPA: {edu.gpa}</div>}
                  {edu.description && <p className="text-xs text-slate-600 mt-1">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-primary-100 pb-1 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(data.skills || []).map((skill, i) => (
                <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {visibleCertifications.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b-2 border-primary-100 pb-1 mb-3">Certifications</h2>
            <div className="space-y-3 text-sm">
              {visibleCertifications.map(cert => (
                <div key={cert.id}>
                  <div className="font-bold text-slate-900">{cert.title}</div>
                  <div className="text-slate-600 text-xs">{cert.issuer}</div>
                  <div className="text-slate-500 text-xs">{cert.date ? new Date(cert.date).toLocaleDateString() : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Main Column */}
      <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col gap-6">
        
        <header>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{data.personal?.name || 'Your Name'}</h1>
          {data.personal?.title && <div className="text-xl text-primary-600 font-medium">{data.personal?.title}</div>}
        </header>

        {data.summary && (
          <section>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Profile</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Experience</h2>
            <div className="space-y-4">
              {(data.experience || []).map(exp => (
                <div key={exp.id}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h3 className="font-bold text-slate-900">{exp.title}</h3>
                    <span className="text-xs text-slate-500 font-medium shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-primary-600 font-medium text-sm mb-2">{exp.company} <span className="text-slate-400 font-normal">| {exp.location}</span></div>
                  {exp.description && (
                    <p className="text-sm text-slate-600 whitespace-pre-line pl-3 border-l-2 border-slate-200">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleProjects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Projects</h2>
            <div className="space-y-4">
              {visibleProjects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900">
                      {proj.name}
                      {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="ml-2 text-xs font-normal text-primary-600 hover:underline border border-primary-200 px-1.5 py-0.5 rounded-md">GitHub</a>}
                    </h3>
                  </div>
                  {proj.technologies?.length > 0 && (
                    <div className="text-xs text-slate-500 mb-1 font-medium">{proj.technologies.join(' • ')}</div>
                  )}
                  <p className="text-sm text-slate-600 whitespace-pre-line mt-1">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleHackathons.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Hackathons</h2>
            <div className="space-y-3">
              {visibleHackathons.map(hack => (
                <div key={hack.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900">{hack.name}</h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{hack.date ? new Date(hack.date).getFullYear() : ''}</span>
                  </div>
                  <div className="text-slate-600">Built: <span className="font-medium text-slate-800">{hack.project}</span></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.achievements && data.achievements.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Achievements</h2>
            <div className="space-y-3">
              {data.achievements.map(ach => (
                <div key={ach.id} className="text-sm">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-slate-900">{ach.title}</span>
                    <span className="text-xs text-slate-500">{ach.date}</span>
                  </div>
                  <div className="text-primary-600 text-xs mb-1 font-medium">{ach.organization}</div>
                  <p className="text-xs text-slate-600">{ach.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
