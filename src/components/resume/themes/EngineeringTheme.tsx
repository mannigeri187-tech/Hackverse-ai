import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import type { ResumeData } from '../../../types/resumeBuilder';

export function EngineeringTheme({ data }: { data: ResumeData }) {
  const visibleProjects = (data.projects || []).filter(p => p.included);
  const visibleHackathons = (data.hackathons || []).filter(h => h.included);
  const visibleCertifications = (data.certifications || []).filter(c => c.included);

  return (
    <div className="bg-white text-gray-800 font-serif max-w-4xl mx-auto h-full shadow-lg overflow-hidden text-sm p-10 border-t-8 border-blue-900">
      
      {/* Header */}
      <header className="border-b-2 border-gray-200 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 uppercase tracking-wide">
          {data.personal?.name || 'Your Name'}
        </h1>
        {data.personal?.title && <div className="text-blue-900 font-semibold mb-3">{data.personal?.title}</div>}
        
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600 font-sans">
          {data.personal?.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.personal?.email}</div>}
          {data.personal?.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.personal?.phone}</div>}
          {data.personal?.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.personal?.location}</div>}
          {data.personal?.github && <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> <a href={data.personal?.github}>GitHub</a></div>}
          {data.personal?.linkedin && <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> <a href={data.personal?.linkedin}>LinkedIn</a></div>}
          {data.personal?.portfolio && <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> <a href={data.personal?.portfolio}>Portfolio</a></div>}
        </div>
      </header>

      <div className="space-y-6">
        
        {/* Objective / Summary */}
        {data.summary && (
          <section>
            <h2 className="text-sm font-bold uppercase text-gray-900 mb-2 border-b border-gray-300 pb-1">Career Objective</h2>
            <p className="text-gray-700 leading-relaxed font-sans">{data.summary}</p>
          </section>
        )}

        {/* Education (Prioritized) */}
        {data.education && data.education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 border-b border-gray-300 pb-1">Education</h2>
            <div className="space-y-3">
              {(data.education || []).map(edu => (
                <div key={edu.id} className="font-sans">
                  <div className="flex justify-between items-start font-bold text-gray-900">
                    <div>{edu.institution}</div>
                    <div className="text-xs font-normal whitespace-nowrap ml-4">{edu.startYear} – {edu.endYear}</div>
                  </div>
                  <div className="flex justify-between items-start mt-0.5">
                    <div className="text-gray-700">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Skills */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase text-gray-900 mb-2 border-b border-gray-300 pb-1">Technical Skills</h2>
            <div className="font-sans text-gray-700">
               <div className="flex flex-wrap gap-2">
                 {(data.skills || []).map((skill, i) => (
                   <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                     {skill}
                   </span>
                 ))}
               </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {visibleProjects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 border-b border-gray-300 pb-1">Engineering Projects</h2>
            <div className="space-y-4">
              {visibleProjects.map(proj => (
                <div key={proj.id} className="font-sans">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      {proj.name}
                      {proj.githubUrl && <a href={proj.githubUrl} className="text-blue-600 hover:underline text-xs font-normal">[View Source]</a>}
                    </h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-1">{proj.description}</p>
                  {proj.technologies?.length > 0 && (
                    <div className="text-xs text-gray-500 font-medium">Tech: {proj.technologies.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hackathons */}
        {visibleHackathons.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 border-b border-gray-300 pb-1">Hackathons & Competitions</h2>
            <div className="space-y-3">
              {visibleHackathons.map(hack => (
                <div key={hack.id} className="font-sans text-sm">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">{hack.name}</span>
                    <span className="text-xs text-gray-500">{hack.date ? new Date(hack.date).getFullYear() : ''}</span>
                  </div>
                  <div className="text-gray-700 mt-0.5">Project: {hack.project}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience / Internships */}
        {data.experience && data.experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase text-gray-900 mb-3 border-b border-gray-300 pb-1">Professional Experience</h2>
            <div className="space-y-4">
              {(data.experience || []).map(exp => (
                <div key={exp.id} className="font-sans">
                  <div className="flex justify-between items-baseline font-bold text-gray-900">
                    <div>{exp.title}</div>
                    <div className="text-xs font-normal">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div>
                  </div>
                  <div className="text-gray-700 font-medium mb-1">{exp.company}</div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {visibleCertifications.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase text-gray-900 mb-2 border-b border-gray-300 pb-1">Certifications</h2>
            <ul className="list-disc list-inside font-sans text-sm text-gray-700 space-y-1">
              {visibleCertifications.map(cert => (
                <li key={cert.id}>
                  <span className="font-semibold text-gray-900">{cert.title}</span> – {cert.issuer}
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}
