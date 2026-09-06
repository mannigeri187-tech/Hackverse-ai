import type { ResumeData } from '../../../types/resumeBuilder';

export function ATSProTheme({ data }: { data: ResumeData }) {
  const visibleProjects = data.projects.filter(p => p.included);
  const visibleHackathons = data.hackathons.filter(h => h.included);
  const visibleCertifications = data.certifications.filter(c => c.included);

  return (
    <div className="bg-white text-black p-8 font-serif max-w-4xl mx-auto h-full shadow-sm border border-slate-200">
      {/* Header */}
      <header className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-1">{data.personal.name || 'Your Name'}</h1>
        {data.personal.title && <p className="text-lg mb-2">{data.personal.title}</p>}
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>• {data.personal.phone}</span>}
          {data.personal.location && <span>• {data.personal.location}</span>}
          {data.personal.linkedin && <span>• LinkedIn</span>}
          {data.personal.github && <span>• GitHub</span>}
          {data.personal.portfolio && <span>• Portfolio</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider">Professional Summary</h2>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider">Technical Skills</h2>
          <p className="text-sm">
            {data.skills.join(', ')}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider">Professional Experience</h2>
          <div className="space-y-3">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-sm">
                  <span>{exp.title}</span>
                  <span className="font-normal">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="flex justify-between items-baseline text-sm italic mb-1">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                {exp.description && (
                  <p className="text-sm whitespace-pre-line pl-4 border-l-2 border-slate-200 mt-1">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {visibleProjects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider">Projects</h2>
          <div className="space-y-3">
            {visibleProjects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline font-bold text-sm">
                  <span>{proj.name} {proj.technologies?.length > 0 && <span className="font-normal italic">| {proj.technologies.join(', ')}</span>}</span>
                  {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="font-normal underline">GitHub</a>}
                </div>
                <p className="text-sm whitespace-pre-line mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hackathons */}
      {visibleHackathons.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider">Hackathons</h2>
          <div className="space-y-2">
            {visibleHackathons.map(hack => (
              <div key={hack.id} className="flex justify-between items-baseline text-sm">
                <span><span className="font-bold">{hack.name}</span> — {hack.project}</span>
                <span>{hack.date ? new Date(hack.date).toLocaleDateString() : 'Participant'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider">Education</h2>
          <div className="space-y-2">
            {data.education.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline font-bold text-sm">
                  <span>{edu.institution}</span>
                  <span className="font-normal">{edu.startYear} – {edu.endYear}</span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span>{edu.degree} {edu.field && `in ${edu.field}`}</span>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
                {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider">Achievements</h2>
          <div className="space-y-2">
            {data.achievements.map(ach => (
              <div key={ach.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{ach.title}</span>
                  <span>{ach.date}</span>
                </div>
                <div className="italic">{ach.organization}</div>
                <p className="mt-0.5">{ach.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {visibleCertifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wider">Certifications</h2>
          <div className="text-sm space-y-1">
            {visibleCertifications.map(cert => (
              <div key={cert.id} className="flex justify-between">
                <span><span className="font-bold">{cert.title}</span> ({cert.issuer})</span>
                <span>{cert.date ? new Date(cert.date).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
