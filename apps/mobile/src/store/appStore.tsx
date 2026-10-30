import {create } from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type AppState = {
  isOnboarded: boolean;
  token: string | null;
  deviceId: string | null;
  completeOnboarding: (token?: string) => void;
  setToken: (token: string | null) => void
  setDeviceId: (id: string | null) => void
  signOut: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isOnboarded: false,
      token: null,
      deviceId: null,
      completeOnboarding: (token) => 
        set( (s)=>({isOnboarded: true, token: token ?? s.token})),
      setToken: (token) => set({token}),
      setDeviceId: (deviceId) => set({deviceId}),
      signOut: () => set({ isOnboarded: false, token:null, deviceId: null}),
    }),
    {name: 'app-state', storage: createJSONStorage(() => AsyncStorage)}
  )
);