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
  education: any[];
  experience: any[];
  projects: any[];
  skills: string[];
  hackathons: any[];
  achievements: any[];
  certifications: any[];
};
