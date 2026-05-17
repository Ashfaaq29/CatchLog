import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

const STORAGE_KEY = 'catchlog.auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrating: boolean;
  setSession: (params: { token: string; user: User }) => void;
  setUser: (user: User) => void;
  setHydrating: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrating: true,
      setSession: ({ token, user }) => set({ token, user, isHydrating: false }),
      setUser: (user) => set({ user }),
      setHydrating: (val) => set({ isHydrating: val }),
      logout: () => set({ token: null, user: null, isHydrating: false }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

export function selectIsAuthenticated(state: AuthState): boolean {
  return Boolean(state.token);
}
