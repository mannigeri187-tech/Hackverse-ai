import { create } from 'zustand';

export interface UserSession {
  id: string;
  email: string;
  role: 'STUDENT' | 'MENTOR' | 'RECRUITER' | 'COMPANY' | 'ADMIN';
  fullName: string;
  avatarUrl?: string;
  xp: number;
  streak: number;
  level: number;
  coins: number;
}

interface AppState {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  bookmarks: string[];
  toggleBookmark: (hackathonId: string) => void;
  notifications: Array<{ id: string; title: string; message: string; read: boolean }>;
  markNotificationRead: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: 'user-demo-1',
    email: 'alex.vance@hackverse.ai',
    role: 'STUDENT',
    fullName: 'Alex Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    xp: 14250,
    streak: 19,
    level: 14,
    coins: 850,
  },
  setUser: (user) => set({ user }),
  bookmarks: ['global-ai-agentic-hackathon-2026'],
  toggleBookmark: (hackathonId) =>
    set((state) => ({
      bookmarks: state.bookmarks.includes(hackathonId)
        ? state.bookmarks.filter((id) => id !== hackathonId)
        : [...state.bookmarks, hackathonId],
    })),
  notifications: [
    { id: '1', title: '🚀 Hackathon Starting', message: 'Global AI Agentic Hackathon starts in 3 days!', read: false },
    { id: '2', title: '🎯 Resume Score Updated', message: 'Your ATS Resume Score increased to 94/100.', read: false },
    { id: '3', title: '🏆 XP Earned', message: 'You earned +250 XP for completing an AI Mock Hackathon!', read: true },
  ],
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: 'All',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
