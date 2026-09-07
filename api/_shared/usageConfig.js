export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium'
};

export const FEATURE_LIMITS = {
  [PLANS.FREE]: {
    ai_generation: { type: 'quota', limit: 10, window: '1 d' },
    api_request: { type: 'rate', limit: 30, window: '1 m' },
    resume_generation: { type: 'quota', limit: 5, window: '1 d' },
    resume_download: { type: 'quota', limit: 5, window: '1 d' },
    certificate_upload: { type: 'quota', limit: 10, window: '1 d' },
    max_resumes: { type: 'resource', limit: 2, table: 'resumes' },
    max_projects: { type: 'resource', limit: 3, table: 'workspaces' },
    max_certificates: { type: 'resource', limit: 5, table: 'certificates' },
    max_skills: { type: 'resource', limit: 15, table: 'user_skills' }
  },
  [PLANS.PRO]: {
    ai_generation: { type: 'quota', limit: 100, window: '1 d' },
    api_request: { type: 'rate', limit: 100, window: '1 m' },
    resume_generation: { type: 'quota', limit: 50, window: '1 d' },
    resume_download: { type: 'quota', limit: 50, window: '1 d' },
    certificate_upload: { type: 'quota', limit: 50, window: '1 d' },
    max_resumes: { type: 'resource', limit: 10, table: 'resumes' },
    max_projects: { type: 'resource', limit: 20, table: 'workspaces' },
    max_certificates: { type: 'resource', limit: 50, table: 'certificates' },
    max_skills: { type: 'resource', limit: 50, table: 'user_skills' }
  },
  [PLANS.PREMIUM]: {
    ai_generation: { type: 'quota', limit: 1000, window: '1 d' },
    api_request: { type: 'rate', limit: 300, window: '1 m' },
    resume_generation: { type: 'quota', limit: 500, window: '1 d' },
    resume_download: { type: 'quota', limit: 500, window: '1 d' },
    certificate_upload: { type: 'quota', limit: 500, window: '1 d' },
    max_resumes: { type: 'resource', limit: 100, table: 'resumes' },
    max_projects: { type: 'resource', limit: 100, table: 'workspaces' },
    max_certificates: { type: 'resource', limit: 100, table: 'certificates' },
    max_skills: { type: 'resource', limit: 100, table: 'user_skills' }
  }
};
