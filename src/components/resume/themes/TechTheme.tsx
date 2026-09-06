import { Terminal } from 'lucide-react';
import type { ResumeData } from '../../../types/resumeBuilder';

export function TechTheme({ data }: { data: ResumeData }) {
  const visibleProjects = (data.projects || []).filter(p => p.included);
  const visibleHackathons = (data.hackathons || []).filter(h => h.included);
  const visibleCertifications = (data.certifications || []).filter(c => c.included);

  return (
    <div className="bg-slate-900 text-slate-300 font-mono max-w-4xl mx-auto h-full shadow-lg border border-slate-700 overflow-hidden text-sm">
      
      {/* Header */}
      <header className="bg-slate-950 p-6 border-b border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <h1 className="text-3xl font-bold text-green-400 mb-1 flex items-center gap-2">
              <Terminal className="w-6 h-6" /> {data.personal?.name || 'guest@hackverse'}
            </h1>
            {data.personal?.title && <div className="text-slate-400 text-lg">~/{data.personal?.title.toLowerCase().replace(/ /g, '-')}</div>}
          </div>
          
          <div className="text-xs space-y-1 text-slate-400 text-right">
            {data.personal?.email && <div>{data.personal?.email}</div>}
            {data.personal?.github && <div className="text-green-400">{data.personal?.github}</div>}
            {data.personal?.portfolio && <div className="text-blue-400">{data.personal?.portfolio}</div>}
            {data.personal?.linkedin && <div>{data.personal?.linkedin}</div>}
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        
        {/* Summary */}
        {data.summary && (
          <section>
            <div className="text-green-400 font-bold mb-2">$ cat summary.txt</div>
            <p className="text-slate-300 leading-relaxed pl-4 border-l-2 border-slate-700">{data.summary}</p>
          </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <section>
            <div className="text-green-400 font-bold mb-3">$ ls ./skills/</div>
            <div className="flex flex-wrap gap-2 pl-4">
              {(data.skills || []).map((skill, i) => (
                <span key={i} className="bg-slate-800 text-green-300 px-2 py-0.5 rounded border border-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section>
            <div className="text-green-400 font-bold mb-4">$ ./experience.sh</div>
            <div className="space-y-6 pl-4">
              {(data.experience || []).map(exp => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-5 top-1.5 w-2 h-2 bg-slate-700 rounded-full"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h3 className="font-bold text-slate-100">{exp.title} <span className="text-blue-400">@ {exp.company}</span></h3>
                    <span className="text-xs text-slate-500">[{exp.startDate} - {exp.current ? 'HEAD' : exp.endDate}]</span>
                  </div>
                  {exp.description && (
                    <p className="text-slate-400 whitespace-pre-line mt-2 text-xs">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects & Hackathons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {visibleProjects.length > 0 && (
            <section>
              <div className="text-green-400 font-bold mb-4">$ cd ./projects</div>
              <div className="space-y-4 pl-4">
                {visibleProjects.map(proj => (
                  <div key={proj.id} className="bg-slate-950 p-3 border border-slate-800 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-blue-400">{proj.name}</h3>
                      {proj.githubUrl && <a href={proj.githubUrl} className="text-xs text-slate-500 hover:text-green-400">[repo]</a>}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className="text-[10px] text-slate-500">{proj.technologies.join(' · ')}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleHackathons.length > 0 && (
            <section>
              <div className="text-green-400 font-bold mb-4">$ htop --hackathons</div>
              <div className="space-y-3 pl-4">
                {visibleHackathons.map(hack => (
                  <div key={hack.id} className="border-b border-slate-800 pb-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-200">{hack.name}</span>
                      <span className="text-xs text-slate-500">{hack.date ? new Date(hack.date).getFullYear() : ''}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Built: <span className="text-blue-300">{hack.project}</span></div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Education & Certs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.education && data.education.length > 0 && (
            <section>
              <div className="text-green-400 font-bold mb-4">$ ./education.sh</div>
              <div className="space-y-3 pl-4">
                {(data.education || []).map(edu => (
                  <div key={edu.id}>
                    <div className="font-bold text-slate-200">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                    <div className="text-slate-400 text-xs my-1">{edu.institution}</div>
                    <div className="text-slate-500 text-[10px]">{edu.startYear} - {edu.endYear}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleCertifications.length > 0 && (
            <section>
              <div className="text-green-400 font-bold mb-4">$ find . -name "*.cert"</div>
              <div className="space-y-2 pl-4">
                {visibleCertifications.map(cert => (
                  <div key={cert.id} className="text-xs">
                    <span className="text-slate-300">- {cert.title}</span> <span className="text-slate-500">({cert.issuer})</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

      </div>
    </div>
  );
}
