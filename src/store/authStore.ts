import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:4000/api/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar: string;
  role: 'student' | 'organizer' | 'admin';
  emailVerified: boolean;
  college?: string;
  year?: string;
  branch?: string;
  level?: number;
  xp?: number;
  streak?: number;
  hackathonsWon?: number;
  hackathonsJoined?: number;
  recruiterViews?: number;
  preparationScore?: number;
  resumeScore?: number;
  mockTestScore?: number;
  skills?: string[];
  interests?: string[];
  linkedin?: string;
  github?: string;
  joinedDate?: string;
}

interface SignupResponse {
  message: string;
  email: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingEmailForVerification: string | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: 'student' | 'organizer';
    college?: string;
    year?: string;
    branch?: string;
  }) => Promise<SignupResponse>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<string>;
  loginWithGoogle: (googleData: { name: string; email: string; avatar?: string; role?: 'student' | 'organizer' }) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<boolean>;
  setUser: (user: User) => void;
  updateProfile: (updates: Partial<User>) => void;
}

const getStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem('hv_access_token') || localStorage.getItem('hv_access_token');
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const raw = sessionStorage.getItem('hv_user_profile') || localStorage.getItem('hv_user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setSessionStorage = (token: string | null, user: User | null) => {
  try {
    if (token && user) {
      sessionStorage.setItem('hv_access_token', token);
      sessionStorage.setItem('hv_user_profile', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('hv_access_token');
      sessionStorage.removeItem('hv_user_profile');
      localStorage.removeItem('hv_access_token');
      localStorage.removeItem('hv_user_profile');
    }
  } catch (e) {
    console.warn('[AuthStore Session Error]:', e);
  }
};

const initialToken = getStoredToken();
const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  accessToken: initialToken,
  isAuthenticated: !!(initialToken && initialUser && initialUser.emailVerified),
  isLoading: false,
  pendingEmailForVerification: null,

  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresVerification && data.email) {
          set({ pendingEmailForVerification: data.email, isLoading: false });
        }
        throw new Error(data.error || 'Invalid email or password.');
      }

      const fullUser: User = {
        ...data.user,
        college: 'RV College of Engineering',
        year: '3rd Year',
        branch: 'Computer Science',
        level: 5,
        xp: 2500,
        streak: 15,
        hackathonsWon: 3,
        hackathonsJoined: 8,
        recruiterViews: 120,
        preparationScore: 95,
        resumeScore: 92,
        mockTestScore: 94,
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS'],
        interests: ['AI / ML', 'Web Dev', 'FinTech'],
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        joinedDate: new Date().toISOString(),
      };

      setSessionStorage(data.accessToken, fullUser);

      set({
        user: fullUser,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        pendingEmailForVerification: null,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (signupData) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Account registration failed.');
      }

      set({
        pendingEmailForVerification: data.email,
        isLoading: false,
      });

      return data as SignupResponse;
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (email: string, code: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      const fullUser: User = {
        ...data.user,
        college: 'Engineering College',
        year: '3rd Year',
        branch: 'Computer Science',
        level: 1,
        xp: 100,
        streak: 1,
        hackathonsWon: 0,
        hackathonsJoined: 0,
        recruiterViews: 0,
        preparationScore: 75,
        resumeScore: 80,
        mockTestScore: 82,
        skills: ['JavaScript', 'React'],
        interests: ['AI / ML'],
        linkedin: '',
        github: '',
        joinedDate: new Date().toISOString(),
      };

      setSessionStorage(data.accessToken, fullUser);

      set({
        user: fullUser,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        pendingEmailForVerification: null,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  resendVerification: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification code.');
      }

      return data.message || 'Verification code resent successfully.';
    } catch (error: any) {
      throw error;
    }
  },

  loginWithGoogle: async (googleData) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed.');
      }

      const fullUser: User = {
        ...data.user,
        college: 'RV College of Engineering',
        year: '3rd Year',
        branch: 'Computer Science',
        level: 3,
        xp: 1500,
        streak: 7,
        hackathonsWon: 1,
        hackathonsJoined: 4,
        recruiterViews: 60,
        preparationScore: 88,
        resumeScore: 85,
        mockTestScore: 90,
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        interests: ['AI / ML', 'Web3'],
        linkedin: '',
        github: '',
        joinedDate: new Date().toISOString(),
      };

      setSessionStorage(data.accessToken, fullUser);

      set({
        user: fullUser,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        pendingEmailForVerification: null,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkSession: async () => {
    const token = get().accessToken;
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setSessionStorage(null, null);
        set({ user: null, accessToken: null, isAuthenticated: false });
        return false;
      }

      const data = await response.json();
      const fullUser = { ...get().user, ...data.user };
      setSessionStorage(token, fullUser);
      set({ user: fullUser, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    setSessionStorage(null, null);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      pendingEmailForVerification: null,
    });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
