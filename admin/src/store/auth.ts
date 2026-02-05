import { create } from "zustand";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  initialized: boolean;
  user: AppUser | null;
  setInitialized: (v: boolean) => void;
  setUser: (u: AppUser | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  initialized: false,
  user: null,
  setInitialized: (v) => set({ initialized: v }),
  setUser: (u) => set({ user: u }),
}));
``