import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isDemo: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  enterDemo: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isDemo: false,
  isLoading: true,
  setSession: (session) =>
    set((state) => ({
      session,
      user: session?.user ?? null,
      isLoading: false,
      isDemo: session ? false : state.isDemo,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  enterDemo: () =>
    set({
      isDemo: true,
      session: null,
      user: null,
      isLoading: false,
    }),
  signOut: () => set({ session: null, user: null, isDemo: false }),
}));
