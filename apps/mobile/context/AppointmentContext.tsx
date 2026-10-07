import React, { createContext, useContext, useState } from 'react';

// A draft appointment, filled in across the care planner page
export type AppointmentDraft = {
  scheduledDate: Date | null;
  doctor: string;
  healthService: string | null;
};

// A submitted appointment, shown in appointments list
export type Appointment = {
  id: string;
  scheduled_date: string;
  doctor: string;
  health_service: string;
};

const emptyDraft = (): AppointmentDraft => ({
  scheduledDate: null,
  doctor: '',
  healthService: null,
});

// placeholder appointments
const PLACEHOLDER_APPOINTMENTS: Appointment[] = [
  { id: '1', scheduled_date: '2026-10-12', doctor: 'John Doe', health_service: 'General Practitioner' },
  { id: '2', scheduled_date: '2026-10-20', doctor: 'John Doe', health_service: '' },
  { id: '3', scheduled_date: '2026-11-03', doctor: '', health_service: '' },
];

// formats a date as YYYY-MM-DD in local time
const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

type AppointmentState = {
  draft: AppointmentDraft;
  appointments: Appointment[];
  updateDraft: (changes: Partial<AppointmentDraft>) => void;
  resetDraft: () => void;
  submitDraft: () => void;
};

const AppointmentContext = createContext<AppointmentState>({
  draft: emptyDraft(),
  appointments: [],
  updateDraft: () => {},
  resetDraft: () => {},
  submitDraft: () => {},
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

  // adds the draft's create appointment details to the top of the appointments, then clears it
  const submitDraft = () => {
    if (!draft.scheduledDate) return;
    const appointment: Appointment = {
      id: Date.now().toString(),
      scheduled_date: toDateString(draft.scheduledDate),
      doctor: draft.doctor,
      health_service: draft.healthService ?? '',
    };
    setAppointments((previous) => [appointment, ...previous]);
    resetDraft();
  };

  return (
    <AppointmentContext.Provider
      value={{ draft, appointments, updateDraft, resetDraft, submitDraft }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export const useAppointment = () => useContext(AppointmentContext);
