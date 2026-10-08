import React, { createContext, useContext, useState } from 'react';
import { toDateString } from '../constants/date';

// Support person details
export type SupportPerson = {
  name: string;
  phone: string;
  email: string;
  canAddQuestions: boolean;
  canAddAnswers: boolean;
};

// A question to ask the doctor, source matches the backend's AppointmentQuestion source:
// 'suggested' for questions ticked from the suggestions, 'patient' for the patient's own
// suggestedId is the checkbox a suggested question came from, so it can be ticked again
export type AppointmentQuestion = {
  text: string;
  source: 'suggested' | 'patient';
  suggestedId?: string;
};

// A draft appointment, filled in across the care planner page
export type AppointmentDraft = {
  scheduledDate: Date | null;
  doctor: string;
  healthService: string | null;
  supportPerson1: SupportPerson | null;
  supportPerson2: SupportPerson | null;
  questions: AppointmentQuestion[];
};

// A submitted appointment, shown in appointments list
export type Appointment = {
  id: string;
  scheduled_date: string;
  doctor: string;
  health_service: string;
  supportPerson1: SupportPerson | null;
  supportPerson2: SupportPerson | null;
  questions: AppointmentQuestion[];
};

const emptyDraft = (): AppointmentDraft => ({
  scheduledDate: null,
  doctor: '',
  healthService: null,
  supportPerson1: null,
  supportPerson2: null,
  questions: [],
});

// placeholder appointments
const PLACEHOLDER_APPOINTMENTS: Appointment[] = [
  { id: '1', scheduled_date: '2026-10-12', doctor: 'John Doe', health_service: 'General Practitioner', supportPerson1: null, supportPerson2: null, questions: [] },
  { id: '2', scheduled_date: '2026-10-20', doctor: 'John Doe', health_service: '', supportPerson1: null, supportPerson2: null, questions: [] },
  { id: '3', scheduled_date: '2026-11-03', doctor: '', health_service: '', supportPerson1: null, supportPerson2: null, questions: [] },
];

type AppointmentState = {
  draft: AppointmentDraft;
  appointments: Appointment[];
  updateDraft: (changes: Partial<AppointmentDraft>) => void;
  resetDraft: () => void;
  submitDraft: () => void;
  updateAppointment: (id: string, changes: Partial<Appointment>) => void;
};

const AppointmentContext = createContext<AppointmentState>({
  draft: emptyDraft(),
  appointments: [],
  updateDraft: () => {},
  resetDraft: () => {},
  submitDraft: () => {},
  updateAppointment: () => {},
});

/**
 * Shares the appointment being created between the care planner pages, and keeps the submitted
 * appointments so they are shown on the care planner.
 */
export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<AppointmentDraft>(emptyDraft);
  const [appointments, setAppointments] = useState<Appointment[]>(PLACEHOLDER_APPOINTMENTS);

  const updateDraft = (changes: Partial<AppointmentDraft>) =>
    setDraft((previous) => ({ ...previous, ...changes }));

  const resetDraft = () => setDraft(emptyDraft());

  // adds the draft to the top of the appointments, then clears it
  const submitDraft = () => {
    if (!draft.scheduledDate) return;
    const appointment: Appointment = {
      id: Date.now().toString(),
      scheduled_date: toDateString(draft.scheduledDate),
      doctor: draft.doctor,
      health_service: draft.healthService ?? '',
      supportPerson1: draft.supportPerson1,
      supportPerson2: draft.supportPerson2,
      questions: draft.questions,
    };
    setAppointments((previous) => [appointment, ...previous]);
    resetDraft();
  };

  // changes the fields of a submitted appointment, e.g. its support persons
  const updateAppointment = (id: string, changes: Partial<Appointment>) =>
    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === id ? { ...appointment, ...changes } : appointment,
      ),
    );

  return (
    <AppointmentContext.Provider
      value={{ draft, appointments, updateDraft, resetDraft, submitDraft, updateAppointment }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export const useAppointment = () => useContext(AppointmentContext);
