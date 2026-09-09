import { create } from 'zustand';
import { User, SharedSpace, Notification } from '@/lib/types';

interface AuthState {
  user: User | null;
  space: SharedSpace | null;
  token: string | null;
  notifications: Notification[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setSpace: (space: SharedSpace | null) => void;
  setToken: (token: string | null) => void;
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  space: null,
  token: null,
  notifications: [],
  loading: true,
  setUser: (user) => set({ user }),
  setSpace: (space) => set({ space }),
  setToken: (token) => set({ token }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  setNotifications: (notifications) => set({ notifications }),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}));

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: typeof window !== 'undefined' ? (localStorage.getItem('theme') as any) || 'light' : 'light',
  sidebarOpen: true,
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    set({ theme });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
