import { create } from "zustand";
import { login as authServiceLogin, validateSession } from "../services/authService";

const STORAGE_KEY = "trinity_client_id";

interface AuthState {
  clientId: string | null;
  clientName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (phone: string) => Promise<void>;
  loginFromUrl: (clientId: string) => void;
  logout: () => void;
  setClientName: (name: string) => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  clientId: null,
  clientName: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const { clientId, name } = await authServiceLogin(phone);
      localStorage.setItem(STORAGE_KEY, clientId);
      set({ clientId, clientName: name, isAuthenticated: true, isLoading: false });
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
    set({ clientId: null, clientName: null, isAuthenticated: false, error: null });
  },

  setClientName: (name: string) => {
    set({ clientName: name });
  },

  init: async () => {
    const clientId = localStorage.getItem(STORAGE_KEY);
    if (!clientId) return;

    set({ isLoading: true });
    try {
      const result = await validateSession(clientId);
      if (result) {
        set({ clientId, clientName: result.name, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem(STORAGE_KEY);
        set({ clientId: null, clientName: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({ clientId: null, clientName: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Initialize on store creation
useAuthStore.getState().init();
