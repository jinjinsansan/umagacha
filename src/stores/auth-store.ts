import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

export type AuthStatus = "idle" | "loading" | "authenticated" | "error";

type AuthState = {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  lastCheckedAt: number | null;
  setUser: (payload: { user: User | null; session: Session | null }) => void;
  setStatus: (status: AuthStatus) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  status: "idle",
  lastCheckedAt: null,
  setUser: ({ user, session }) =>
    set({
      user,
      session,
      status: user ? "authenticated" : "idle",
      lastCheckedAt: Date.now(),
    }),
  setStatus: (status) => set({ status }),
}));
