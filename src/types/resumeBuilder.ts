export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  gpa?: string;
  description?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  included: boolean;
}

export interface ResumeHackathon {
  id: string;
  name: string;
  project: string;
  role?: string;
  placement?: string;
  date: string;
  url?: string;
  included: boolean;
}

export interface ResumeCertification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  url?: string;
  included: boolean;
}

export interface ResumeAchievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
}

export type ResumeData = {
  personal: {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    profileImage?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary?: string;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  skills: string[];
  hackathons: ResumeHackathon[];
  achievements: ResumeAchievement[];
  certifications: ResumeCertification[];
};
