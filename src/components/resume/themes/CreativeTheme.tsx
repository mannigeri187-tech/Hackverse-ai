import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import type { ResumeData } from '../../../types/resumeBuilder';

export function CreativeTheme({ data }: { data: ResumeData }) {
  const visibleProjects = (data.projects || []).filter(p => p.included);
  const visibleCertifications = (data.certifications || []).filter(c => c.included);

  return (
    <div className="bg-stone-50 text-stone-800 font-sans max-w-4xl mx-auto h-full shadow-lg overflow-hidden text-sm flex">
      
      {/* Left Column */}
      <div className="w-1/3 bg-stone-900 text-stone-300 p-8 flex flex-col gap-8">
        
        <header>
          <h1 className="text-4xl font-black text-white mb-2 leading-tight tracking-tighter">
            {data.personal?.name ? data.personal?.name.split(' ').map((n, i) => <div key={i}>{n}</div>) : 'Your Name'}
          </h1>
          {data.personal?.title && <div className="text-amber-500 font-medium tracking-wide uppercase text-xs mt-4">{data.personal?.title}</div>}
        </header>

        <section className="space-y-3 text-xs">
          {data.personal?.email && <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-stone-500" /> <span className="break-all">{data.personal?.email}</span></div>}
          {data.personal?.phone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-stone-500" /> <span>{data.personal?.phone}</span></div>}
          {data.personal?.location && <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-stone-500" /> <span>{data.personal?.location}</span></div>}
        </section>

        <section className="space-y-3 text-xs">
          {data.personal?.portfolio && (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-amber-500" /> 
              <a href={data.personal?.portfolio} className="text-white hover:text-amber-500 font-medium break-all">{data.personal?.portfolio.replace(/^https?:\/\//, '')}</a>
            </div>
          )}
          {data.personal?.linkedin && (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-stone-500" /> 
              <a href={data.personal?.linkedin} className="hover:text-white break-all">LinkedIn</a>
            </div>
          )}
          {data.personal?.github && (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-stone-500" /> 
              <a href={data.personal?.github} className="hover:text-white break-all">GitHub</a>
            </div>
          )}
        </section>

        {data.skills && data.skills.length > 0 && (
          <section className="mt-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {(data.skills || []).map((skill, i) => (
                <span key={i} className="bg-stone-800 text-stone-300 px-3 py-1.5 rounded-full text-[10px] font-medium border border-stone-700">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {visibleCertifications.length > 0 && (
          <section className="mt-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Certifications</h2>
            <div className="space-y-3">
              {visibleCertifications.map(cert => (
                <div key={cert.id}>
                  <div className="text-stone-200 font-medium">{cert.title}</div>
                  <div className="text-stone-500 text-[10px]">{cert.issuer}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right Column */}
      <div className="w-2/3 p-10 bg-white">
        
        {data.summary && (
          <section className="mb-10">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-6 h-px bg-amber-500 mr-3"></span> Profile
            </h2>
            <p className="text-stone-600 leading-relaxed text-sm">{data.summary}</p>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-6 h-px bg-amber-500 mr-3"></span> Experience
            </h2>
            <div className="space-y-8">
              {(data.experience || []).map(exp => (
                <div key={exp.id} className="relative pl-6 border-l border-stone-200">
                  <div className="absolute w-2.5 h-2.5 bg-white border-2 border-amber-500 rounded-full -left-[5px] top-1.5"></div>
                  <div className="text-xs font-bold text-amber-600 mb-1">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 leading-tight">{exp.title}</h3>
                  <div className="text-stone-500 font-medium text-sm mb-2">{exp.company}</div>
                  {exp.description && (
                    <p className="text-stone-600 text-sm whitespace-pre-line leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleProjects.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-6 h-px bg-amber-500 mr-3"></span> Selected Works
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {visibleProjects.map(proj => (
                <div key={proj.id} className="bg-stone-50 p-5 rounded-xl border border-stone-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-stone-900 text-base">{proj.name}</h3>
                    {proj.githubUrl && <a href={proj.githubUrl} className="text-amber-600 text-xs font-medium hover:underline">Link ↗</a>}
                  </div>
                  <p className="text-stone-600 text-sm mb-3">{proj.description}</p>
                  {proj.technologies?.length > 0 && (
                    <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                      {proj.technologies.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education && data.education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-6 h-px bg-amber-500 mr-3"></span> Education
            </h2>
            <div className="space-y-4">
              {(data.education || []).map(edu => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-stone-900">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                    <div className="text-stone-500 text-sm">{edu.institution}</div>
                  </div>
                  <div className="text-stone-400 text-xs font-medium text-right">
                    {edu.startYear} – {edu.endYear}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
