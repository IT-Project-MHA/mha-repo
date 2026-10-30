import { create } from 'zustand';

//contains the info gained during onboarding
//needs verification_id, phone_number, display_name, pin, accepted_terms, accepted_privacy, 
// device_id, track_health (optional), health (optional)

type Health = {
  has_diagnosis: boolean;
  other_conditions: string;
  assigned_gender_at_birth: string;
  birth_year: number;
  pain_types: string[];
}

type OnboardingStorage = {
  verification_id: string;
  phone_number: string;
  display_name: string;
  pin: number;
  accepted_terms: boolean;
  accepted_privacy: boolean;
  device_id: string;
  track_health?: boolean;
  health?: Health;

  set: (patch: Partial<Omit<OnboardingStorage, 'set' | 'reset'>>)=>void;
  reset: ()=>void;
}



const initialUser = {verification_id: '', phone_number: '', display_name: '', pin: 0,
   accepted_terms: true,   accepted_privacy: true, device_id: '', }


export const useOnboardingStore = create<OnboardingStorage>((set) => ({
  ...initialUser,
  set: (patch) =>set(patch),
  reset: () => set({...initialUser, track_health: undefined, 
    health: {has_diagnosis: false, other_conditions: '', assigned_gender_at_birth: '', birth_year: 0, pain_types: ['']}}),
}))