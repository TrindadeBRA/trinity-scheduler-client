import { create } from 'zustand';
import type { Service, Professional, AddonService } from '../lib/types';

interface BookingState {
  currentStep: number;
  selectedService: Service | null;
  selectedAddons: AddonService[];
  selectedProfessional: Professional | null;
  selectedDate: string | null;
  selectedTime: string | null;

  setService: (service: Service) => void;
  toggleAddon: (addon: AddonService) => void;
  setProfessional: (professional: Professional | null) => void;
  setDateTime: (date: string, time: string) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  selectedService: null,
  selectedAddons: [] as AddonService[],
  selectedProfessional: null,
  selectedDate: null,
  selectedTime: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setService: (service) => set({ selectedService: service }),

  toggleAddon: (addon) =>
    set((state) => {
      const exists = state.selectedAddons.some((a) => a.id === addon.id);
      return {
        selectedAddons: exists
          ? state.selectedAddons.filter((a) => a.id !== addon.id)
          : [...state.selectedAddons, addon],
      };
    }),

  setProfessional: (professional) => set({ selectedProfessional: professional }),

  setDateTime: (date, time) => set({ selectedDate: date, selectedTime: time }),

  goToStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),

  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  reset: () => set(initialState),
}));
