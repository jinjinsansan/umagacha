import { nanoid } from "nanoid";
import { create } from "zustand";

type Toast = {
  id: string;
  message: string;
  tone?: "success" | "error" | "info";
  autoClose?: boolean;
};

type UIState = {
  isLoginBonusOpen: boolean;
  isDrawerOpen: boolean;
  toasts: Toast[];
  setLoginBonusOpen: (value: boolean) => void;
  setDrawerOpen: (value: boolean) => void;
  pushToast: (toast: Omit<Toast, "id"> & { id?: string }) => string;
  dismissToast: (id: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isLoginBonusOpen: false,
  isDrawerOpen: false,
  toasts: [],
  setLoginBonusOpen: (value) => set({ isLoginBonusOpen: value }),
  setDrawerOpen: (value) => set({ isDrawerOpen: value }),
  pushToast: ({ id, ...toast }) => {
    const toastId = id ?? nanoid();
    set((state) => ({ toasts: [...state.toasts, { id: toastId, ...toast }] }));
    return toastId;
  },
  dismissToast: (toastId) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== toastId) })),
}));
