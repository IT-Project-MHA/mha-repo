import {create } from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type AppState = {
  isOnboarded: boolean;
  completeOnboarding: () => void;
  signOut: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isOnboarded: false,
      completeOnboarding: () => set({isOnboarded: true}),
      signOut: () => set({ isOnboarded: false}),
    }),
    {name: 'app-state', storage: createJSONStorage(() => AsyncStorage)}
  )
);