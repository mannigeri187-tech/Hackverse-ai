import { create } from 'zustand'

interface Notification {
  id: string
  title: string
  message: string
  type: 'hackathon' | 'deadline' | 'achievement' | 'system' | 'learning' | 'team'
  read: boolean
  createdAt: string
}

interface AppState {
  // Theme
  theme: 'dark' | 'light'
  toggleTheme: () => void
  setTheme: (theme: 'dark' | 'light') => void

  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Search
  globalSearch: string
  setGlobalSearch: (query: string) => void

  // Bookmarks
  bookmarkedHackathons: string[]
  toggleBookmark: (id: string) => void

  // Hackathons
  customHackathons: any[]
  addHackathon: (hackathon: any) => void
  updateHackathon: (id: string, updates: any) => void
  deleteHackathon: (id: string) => void

  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllRead: () => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Theme
  theme: (typeof window !== 'undefined' && localStorage.getItem('hackverse-theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('hackverse-theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
      return { theme: newTheme }
    }),
  setTheme: (theme) => {
    localStorage.setItem('hackverse-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Search
  globalSearch: '',
  setGlobalSearch: (query) => set({ globalSearch: query }),

  // Bookmarks
  bookmarkedHackathons: ['3'],
  toggleBookmark: (id) =>
    set((state) => ({
      bookmarkedHackathons: state.bookmarkedHackathons.includes(id)
        ? state.bookmarkedHackathons.filter((b) => b !== id)
        : [...state.bookmarkedHackathons, id],
    })),

  // Hackathons
  customHackathons: JSON.parse((typeof window !== 'undefined' && localStorage.getItem('hv_custom_hackathons')) || '[]'),
  addHackathon: (hackathon) =>
    set((state) => {
      const updated = [hackathon, ...state.customHackathons];
      if (typeof window !== 'undefined') {
        localStorage.setItem('hv_custom_hackathons', JSON.stringify(updated));
      }
      return { customHackathons: updated };
    }),
  updateHackathon: (id, updates) =>
    set((state) => {
      const updated = state.customHackathons.map((h) => (h.id === id ? { ...h, ...updates } : h));
      if (typeof window !== 'undefined') {
        localStorage.setItem('hv_custom_hackathons', JSON.stringify(updated));
      }
      return { customHackathons: updated };
    }),
  deleteHackathon: (id) =>
    set((state) => {
      const updated = state.customHackathons.filter((h) => h.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hv_custom_hackathons', JSON.stringify(updated));
      }
      return { customHackathons: updated };
    }),

  // Notifications
  notifications: [
    {
      id: '1', title: 'New Hackathon Alert!', message: 'Global AI Innovation Hackathon 2026 registration is now open.',
      type: 'hackathon', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2', title: 'Deadline Approaching', message: 'HealthTech Innovation Challenge registration closes in 3 days.',
      type: 'deadline', read: false, createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3', title: 'Achievement Unlocked!', message: 'You earned the "Code Warrior" badge! +400 XP',
      type: 'achievement', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4', title: 'Daily Learning Reminder', message: 'Continue your React Advanced Patterns course.',
      type: 'learning', read: false, createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  unreadCount: 3,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, id: Date.now().toString(), createdAt: new Date().toISOString(), read: false },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}))
