import { create } from "zustand";
import { login as authServiceLogin } from "../services/authService";

const STORAGE_KEY = "trinity_client_id";

interface AuthState {
  clientId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (phone: string) => Promise<void>;
  loginFromUrl: (clientId: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  clientId: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const clientId = await authServiceLogin(phone);
      localStorage.setItem(STORAGE_KEY, clientId);
      set({ clientId, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      set({ isLoading: false, error: message });
    }
  },

  loginFromUrl: (clientId: string) => {
    localStorage.setItem(STORAGE_KEY, clientId);
    set({ clientId, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ clientId: null, isAuthenticated: false, error: null });
  },

  init: () => {
    const clientId = localStorage.getItem(STORAGE_KEY);
    if (clientId) {
      set({ clientId, isAuthenticated: true });
    }
  },
}));

// Initialize on store creation
useAuthStore.getState().init();
