import { create } from 'zustand';

//contains the info gained during onboarding
type OnboardingUserState = {
  isPatient: boolean;
  isSupportPerson: boolean;
  display_name: string;
  phone_number?: string;
  email?: string;

  set: (patch: Partial<Omit<OnboardingUserState, 'set' | 'reset'>>)=>void;
  reset: ()=>void;
}

const initialUser = {isPatient: false, isSupportPerson: false, display_name: ''}


export const useOnboardingUserStore = create<OnboardingUserState>((set) => ({
  ...initialUser,
  set: (patch) =>set(patch),
  reset: () => set({...initialUser, phone_number: undefined, email: undefined}),
}))


//contains patient construction info:
// has_diagnosis, other_conditions, assigned_gender_at_birth, birth_year, pain_types[]
type OnboardingPatientState = {
  hasDiagnosis: boolean;
  birthYear?: number;
  sex?: string;
  diagnosis?: string[];
  additionalDiagnosis?: string;

  set: (patch: Partial<Omit<OnboardingPatientState, 'set' | 'reset'>>)=>void;
  reset: ()=>void;
}

const initialPatient = {hasDiagnosis: false}


export const useOnboardingPatientStore = create<OnboardingPatientState>((set) => ({
  ...initialPatient,
  set: (patch) =>set(patch),
  reset: () => set({...initialPatient, birthYear: undefined, sex: undefined, diagnosis: undefined, additionalDiagnosis: undefined}),
}))
