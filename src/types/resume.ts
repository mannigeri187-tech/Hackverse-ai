export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
};

export type ResumeContent = {
  name: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  hackathons: Project[]; // Reusing Project type as structure is similar
  skills: string;
  certifications: string;
  achievements: string;
};

export type Resume = {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
};

export const defaultResumeContent: ResumeContent = {
  name: '',
  email: '',
  phone: '',
  location: '',
  github: '',
  linkedin: '',
  portfolio: '',
  summary: '',
  education: [],
  experience: [],
  projects: [],
  hackathons: [],
  skills: '',
  certifications: '',
  achievements: ''
};
