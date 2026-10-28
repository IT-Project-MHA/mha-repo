import { create } from 'zustand';

//contains the info gained during onboarding
//needs verification_id, phone_number, display_name, pin, accepted_terms, accepted_privacy, 
// device_id, track_health (optional), health (optional)

type OnboardingStorage = {
  verification_id: string;
  phone_number: string;
  display_name: string;
  pin: number;
  accepted_terms: boolean;
  accepted_privacy: boolean;
  device_id: string;
  track_health?: boolean;
  health?: [];

  set: (patch: Partial<Omit<OnboardingStorage, 'set' | 'reset'>>)=>void;
  reset: ()=>void;
}



const initialUser = {verification_id: '', phone_number: '', display_name: '', pin: 0,
   accepted_terms: false,   accepted_privacy: false, device_id: '', }


export const useOnboardingStore = create<OnboardingStorage>((set) => ({
  ...initialUser,
  set: (patch) =>set(patch),
  reset: () => set({...initialUser, track_health: undefined, health: undefined}),
}))