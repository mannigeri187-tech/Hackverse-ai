
import { User, Globe, MapPin, Mail, Phone, Briefcase, Award, GraduationCap, Code } from 'lucide-react';
import type { ResumeData } from '../../types/resumeBuilder';

interface Props {
  data: ResumeData;
}

export function ResumePreview({ data }: Props) {
  const visibleProjects = data.projects.filter(p => p.included);
  const visibleHackathons = data.hackathons.filter(h => h.included);
  const visibleCertifications = data.certifications.filter(c => c.included);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-600"></div>
      
      <div className="border-b border-slate-200 pb-6 mb-6">
        <h3 className="text-3xl font-bold text-slate-900">{data.personal.name || 'Your Name'}</h3>
        {data.personal.title && (
          <p className="text-lg text-primary-600 font-medium mt-1">{data.personal.title}</p>
        )}
        
        <div className="text-slate-500 mt-4 flex flex-wrap gap-4 text-sm">
          {data.personal.email && (
            <div className="flex items-center gap-1.5"><Mail className="w-4 h-4"/> {data.personal.email}</div>
          )}
          {data.personal.phone && (
            <div className="flex items-center gap-1.5"><Phone className="w-4 h-4"/> {data.personal.phone}</div>
          )}
          {data.personal.location && (
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {data.personal.location}</div>
          )}
          {data.personal.github && (
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4"/> GitHub</div>
          )}
          {data.personal.linkedin && (
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4"/> LinkedIn</div>
          )}
          {data.personal.portfolio && (
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4"/> Portfolio</div>
          )}
        </div>
      </div>

      {data.summary && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" /> Summary
          </h4>
          <p className="text-slate-700 text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-slate-400" /> Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400" /> Experience
          </h4>
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-slate-900">{exp.title}</h5>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-sm font-medium text-primary-600 mb-2">{exp.company} • {exp.location}</div>
                <p className="text-sm text-slate-600 whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-slate-400" /> Education
          </h4>
          <div className="space-y-4">
            {data.education.map((edu, i) => (
              <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-slate-900">{edu.degree} {edu.field && `in ${edu.field}`}</h5>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {edu.startYear} - {edu.endYear}
                  </span>
                </div>
                <div className="text-sm font-medium text-primary-600 mb-2">{edu.institution} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
                {edu.description && <p className="text-sm text-slate-600 whitespace-pre-line">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleProjects.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400" /> Projects
          </h4>
          <div className="space-y-4">
            {visibleProjects.map((proj, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-slate-900">{proj.name}</h5>
                  {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-xs">View Code</a>}
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {proj.technologies.map((tech, j) => (
                      <span key={j} className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleHackathons.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400" /> Hackathons
          </h4>
          <div className="space-y-3">
            {visibleHackathons.map((hack, i) => (
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
        </div>
      )}

      {data.achievements && data.achievements.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400" /> Achievements
          </h4>
          <div className="space-y-3">
            {data.achievements.map((ach, i) => (
              <div key={i} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-slate-900 text-sm">{ach.title}</h5>
                  <span className="text-xs text-slate-500">{ach.date}</span>
                </div>
                <div className="text-xs font-medium text-primary-600 mb-1">{ach.organization}</div>
                <p className="text-xs text-slate-600">{ach.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleCertifications.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400" /> Certifications
          </h4>
          <ul className="list-disc pl-5 space-y-2">
            {visibleCertifications.map((cert, i) => (
              <li key={i} className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{cert.title}</span> — {cert.issuer}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
