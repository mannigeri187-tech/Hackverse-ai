import { useState, useRef } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import type { ResumeData, ResumeEducation, ResumeExperience, ResumeAchievement } from '../../types/resumeBuilder';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeEditor({ data, onChange }: Props) {
  const [newSkill, setNewSkill] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string>('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setPhotoError('Please select a valid image (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('File size is too large. Maximum size is 2MB.');
      return;
    }

    // Safe instant preview using object URL
    const objectUrl = URL.createObjectURL(file);
    updatePersonal('profileImage', objectUrl);

    // Read as Base64 for local architecture persistence
    const reader = new FileReader();
    reader.onloadend = () => {
      updatePersonal('profileImage', reader.result as string);
      URL.revokeObjectURL(objectUrl); // Clean up the object URL when appropriate
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoError('');
    updatePersonal('profileImage', '');
  };

  const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !(data.skills || []).includes(newSkill.trim())) {
      onChange({ ...data, skills: [...data.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange({ ...data, skills: (data.skills || []).filter(s => s !== skillToRemove) });
  };

  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: ''
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof ResumeEducation, value: string) => {
    onChange({
      ...data,
      education: (data.education || []).map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: (data.education || []).filter(e => e.id !== id) });
  };

  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: crypto.randomUUID(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const updateExperience = (id: string, field: keyof ResumeExperience, value: any) => {
    onChange({
      ...data,
      experience: (data.experience || []).map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: (data.experience || []).filter(e => e.id !== id) });
  };

  const addAchievement = () => {
    const newAch: ResumeAchievement = {
      id: crypto.randomUUID(),
      title: '',
      organization: '',
      date: '',
      description: ''
    };
    onChange({ ...data, achievements: [...data.achievements, newAch] });
  };

  const updateAchievement = (id: string, field: keyof ResumeAchievement, value: string) => {
    onChange({
      ...data,
      achievements: (data.achievements || []).map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  const removeAchievement = (id: string) => {
    onChange({ ...data, achievements: (data.achievements || []).filter(a => a.id !== id) });
  };

  const toggleInclude = (list: 'projects' | 'hackathons' | 'certifications', id: string) => {
    const arr = data[list] as any[];
    onChange({
      ...data,
      [list]: arr.map(item => item.id === id ? { ...item, included: !item.included } : item)
    });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* 1. Personal Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2"><h3 className="text-lg font-bold text-slate-900">1. Personal Information</h3><span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider self-start sm:self-auto">Imported from HackVerse Profile</span></div>
        
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            {data.personal.profileImage ? (
              <>
                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <img src={data.personal.profileImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-2 items-start">
                  <button onClick={() => fileInputRef.current?.click()} className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors">Change Photo</button>
                  <button onClick={handleRemovePhoto} className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors">Remove Photo</button>
                </div>
              </>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors border border-primary-100 border-dashed">
                + Upload Photo
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>
          {photoError && (
            <p className="mt-2 text-xs text-red-600 font-medium">{photoError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input type="text" value={data.personal.name} onChange={e => updatePersonal('name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Professional Title</label>
            <input type="text" value={data.personal.title || ''} onChange={e => updatePersonal('title', e.target.value)} placeholder="e.g. Full Stack Developer" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
            <input type="email" value={data.personal.email || ''} onChange={e => updatePersonal('email', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
            <input type="text" value={data.personal.phone || ''} onChange={e => updatePersonal('phone', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Location</label>
            <input type="text" value={data.personal.location || ''} onChange={e => updatePersonal('location', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">LinkedIn</label>
            <input type="url" value={data.personal.linkedin || ''} onChange={e => updatePersonal('linkedin', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GitHub</label>
            <input type="url" value={data.personal.github || ''} onChange={e => updatePersonal('github', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Portfolio</label>
            <input type="url" value={data.personal.portfolio || ''} onChange={e => updatePersonal('portfolio', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
          </div>
        </div>
      </div>

      {/* 2. Professional Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">2. Professional Summary</h3>
        <textarea
          value={data.summary || ''}
          onChange={e => onChange({ ...data, summary: e.target.value })}
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
          placeholder="Brief professional summary..."
        />
        <div className="text-right text-xs text-slate-400 mt-1">{(data.summary || '').length}/500</div>
      </div>

      {/* 3. Skills */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2"><h3 className="text-lg font-bold text-slate-900">3. Skills</h3><span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider self-start sm:self-auto">Imported from Team Profile</span></div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(data.skills || []).map((skill, i) => (
            <div key={i} className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
              {skill}
              <button onClick={() => handleRemoveSkill(skill)} className="text-primary-400 hover:text-primary-800 transition-colors ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            placeholder="Add a skill..."
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
          />
          <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Add
          </button>
        </div>
      </div>

      {/* 4. Projects */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2"><h3 className="text-lg font-bold text-slate-900">4. Projects</h3><span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider self-start sm:self-auto">Imported from Workspaces</span></div>
        {data.projects.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No projects found. Add them to HackVerse first.</p>
        ) : (
          <div className="space-y-3">
            {(data.projects || []).map(proj => (
              <div key={proj.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <div className="font-bold text-sm text-slate-900">{proj.name}</div>
                  <div className="text-xs text-slate-500 truncate max-w-xs">{proj.description}</div>
                </div>
                <button onClick={() => toggleInclude('projects', proj.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${proj.included ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'}`}>
                  {proj.included ? <><CheckCircle className="w-3 h-3" /> Included</> : <><Circle className="w-3 h-3" /> Excluded</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Hackathons */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2"><h3 className="text-lg font-bold text-slate-900">5. Hackathons</h3><span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider self-start sm:self-auto">Imported from Workspaces</span></div>
        {data.hackathons.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No hackathons found.</p>
        ) : (
          <div className="space-y-3">
            {(data.hackathons || []).map(hack => (
              <div key={hack.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <div className="font-bold text-sm text-slate-900">{hack.name}</div>
                  <div className="text-xs text-slate-500">{hack.project} • {hack.date}</div>
                </div>
                <button onClick={() => toggleInclude('hackathons', hack.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${hack.included ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'}`}>
                  {hack.included ? <><CheckCircle className="w-3 h-3" /> Included</> : <><Circle className="w-3 h-3" /> Excluded</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Education */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">6. Education</h3>
          <button onClick={addEducation} className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700">
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
        <div className="space-y-4">
          {(data.education || []).map(edu => (
            <div key={edu.id} className="p-4 border border-slate-200 rounded-xl relative">
              <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Institution *</label>
                  <input type="text" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Degree *</label>
                  <input type="text" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Field of Study</label>
                  <input type="text" value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Start Yr</label>
                    <input type="text" value={edu.startYear} onChange={e => updateEducation(edu.id, 'startYear', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">End Yr</label>
                    <input type="text" value={edu.endYear} onChange={e => updateEducation(edu.id, 'endYear', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">GPA / Grade</label>
                  <input type="text" value={edu.gpa || ''} onChange={e => updateEducation(edu.id, 'gpa', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" />
                </div>
              </div>
            </div>
          ))}
          {data.education.length === 0 && <p className="text-sm text-slate-500 italic">No education entries.</p>}
        </div>
      </div>

      {/* 7. Experience */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">7. Experience</h3>
          <button onClick={addExperience} className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700">
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
        <div className="space-y-4">
          {(data.experience || []).map(exp => (
            <div key={exp.id} className="p-4 border border-slate-200 rounded-xl relative">
              <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Company *</label>
                  <input type="text" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Job Title *</label>
                  <input type="text" value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" required />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Location</label>
                  <input type="text" value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Start Date</label>
                  <input type="text" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">End Date</label>
                  <input type="text" value={exp.endDate} disabled={exp.current} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className={`w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm ${exp.current ? 'opacity-50' : ''}`} />
                  <label className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                    <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} />
                    Currently working here
                  </label>
                </div>
                <div className="col-span-1 md:col-span-2 mt-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea rows={3} value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-primary-500 text-sm resize-none"></textarea>
                </div>
              </div>
            </div>
          ))}
          {data.experience.length === 0 && <p className="text-sm text-slate-500 italic">No experience entries.</p>}
        </div>
      </div>

      {/* 8. Achievements */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">8. Achievements</h3>
          <button onClick={addAchievement} className="flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700">
            <Plus className="w-4 h-4" /> Add Achievement
          </button>
        </div>
        <div className="space-y-4">
          {(data.achievements || []).map(ach => (
            <div key={ach.id} className="p-4 border border-slate-200 rounded-xl relative">
              <button onClick={() => removeAchievement(ach.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Title</label>
                  <input type="text" value={ach.title} onChange={e => updateAchievement(ach.id, 'title', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Organization</label>
                  <input type="text" value={ach.organization} onChange={e => updateAchievement(ach.id, 'organization', e.target.value)} className="w-full p-2 border-b border-slate-200 outline-none focus:border-primary-500 text-sm" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea rows={2} value={ach.description} onChange={e => updateAchievement(ach.id, 'description', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-primary-500 text-sm resize-none"></textarea>
                </div>
              </div>
            </div>
          ))}
          {data.achievements.length === 0 && <p className="text-sm text-slate-500 italic">No achievements added.</p>}
        </div>
      </div>

      {/* 9. Certifications */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">9. Certifications</h3>
        {data.certifications.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No certificates found in vault.</p>
        ) : (
          <div className="space-y-3">
            {(data.certifications || []).map(cert => (
              <div key={cert.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                <div>
                  <div className="font-bold text-sm text-slate-900">{cert.title}</div>
                  <div className="text-xs text-slate-500">{cert.issuer} • {cert.date ? new Date(cert.date).toLocaleDateString() : ''}</div>
                </div>
                <button onClick={() => toggleInclude('certifications', cert.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${cert.included ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'}`}>
                  {cert.included ? <><CheckCircle className="w-3 h-3" /> Included</> : <><Circle className="w-3 h-3" /> Excluded</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
