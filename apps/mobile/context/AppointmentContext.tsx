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

// Question to ask the doctor
export type AppointmentQuestion = {
  text: string;
  source: 'suggested' | 'patient' | 'support';
  addedBy?: 'support'; // left out when the patient added it
  suggestedId?: string;
  answer?: string;
  recording?: string; // file uri
};

// Draft appointment, filled in across the care planner page
export type AppointmentDraft = {
  scheduledDate: Date | null;
  doctor: string;
  healthService: string | null;
  supportPerson1: SupportPerson | null;
  supportPerson2: SupportPerson | null;
  questions: AppointmentQuestion[];
};

// Submitted appointment, shown in appointments list
export type Appointment = {
  id: string;
  scheduled_date: string;
  doctor: string;
  health_service: string;
  supportPerson1: SupportPerson | null;
  supportPerson2: SupportPerson | null;
  questions: AppointmentQuestion[];
  doctorPermission?: boolean;
  doctorSignature?: string; // PNG data URL
};

// Appointment another patient has shared with this user as their support person
export type SharedAppointment = Appointment & {
  patientId: string;
  patientName: string;
  // what the patient has allowed this user to do in the appointment
  canAddQuestions: boolean;
  canAddAnswers: boolean;
};

// Active support link, a patient who has made this user their support person
export type SupportLink = {
  patientId: string;
  patientName: string;
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
// upon integration replace this with all appointments of user id
const PLACEHOLDER_APPOINTMENTS: Appointment[] = [
  { id: '1', scheduled_date: '2026-10-12', doctor: 'John Doe', health_service: 'General Practitioner', supportPerson1: null, supportPerson2: null, questions: [] },
  { id: '2', scheduled_date: '2026-10-20', doctor: 'John Doe', health_service: '', supportPerson1: null, supportPerson2: null, questions: [] },
  { id: '3', scheduled_date: '2026-11-03', doctor: '', health_service: '', supportPerson1: null, supportPerson2: null, questions: [] },
];

// placeholder shared appointments, newest shared first
// upon integration replace this with the appointments shared with user id
const PLACEHOLDER_SHARED_APPOINTMENTS: SharedAppointment[] = [
  {
    id: 's1', patientId: 'p1', patientName: 'Jean doe', scheduled_date: '2026-10-15', doctor: 'Jane Deo', health_service: 'Physiotherapist', supportPerson1: null, supportPerson2: null,
    canAddQuestions: true, canAddAnswers: true,
    questions: [
      { text: 'Q1', source: 'suggested', suggestedId: 'impact2' },
      { text: 'Q2', source: 'patient' },
      { text: 'q3', source: 'suggested', addedBy: 'support', suggestedId: 'intensity4', answer: 'test' },
      { text: 'q4', source: 'support', addedBy: 'support' },
    ],
  },
];

// placeholder active support links
// upon integration replace this with the active support links of user id
const PLACEHOLDER_SUPPORT_LINKS: SupportLink[] = [
  { patientId: 'p1', patientName: 'Jean doe' },
  { patientId: 'p2', patientName: 'Jane Doe' },
];

type AppointmentState = {
  draft: AppointmentDraft;
  appointments: Appointment[];
  sharedAppointments: SharedAppointment[];
  supportLinks: SupportLink[];
  findAppointment: (id: string) => Appointment | undefined;
  updateDraft: (changes: Partial<AppointmentDraft>) => void;
  resetDraft: () => void;
  submitDraft: () => void;
  updateAppointment: (id: string, changes: Partial<Appointment>) => void;
  updateQuestion: (id: string, index: number, changes: Partial<AppointmentQuestion>) => void;
};

const AppointmentContext = createContext<AppointmentState>({
  draft: emptyDraft(),
  appointments: [],
  sharedAppointments: [],
  supportLinks: [],
  findAppointment: () => undefined,
  updateDraft: () => {},
  resetDraft: () => {},
  submitDraft: () => {},
  updateAppointment: () => {},
  updateQuestion: () => {},
});

/**
 * Shares the appointment being created between the care planner pages, and keeps the submitted
 * appointments so they are shown on the care planner.
 */
export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<AppointmentDraft>(emptyDraft);
  const [appointments, setAppointments] = useState<Appointment[]>(PLACEHOLDER_APPOINTMENTS);
  const [sharedAppointments, setSharedAppointments] = useState<SharedAppointment[]>(PLACEHOLDER_SHARED_APPOINTMENTS);
  const [supportLinks] = useState<SupportLink[]>(PLACEHOLDER_SUPPORT_LINKS);

  // looks in both the user's own and shared appointments, their ids don't overlap
  const findAppointment = (id: string) =>
    appointments.find((item) => item.id === id) ??
    sharedAppointments.find((item) => item.id === id);

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
  const updateAppointment = (id: string, changes: Partial<Appointment>) => {
    const update = <T extends Appointment>(previous: T[]) =>
      previous.map((appointment) =>
        appointment.id === id ? { ...appointment, ...changes } : appointment,
      );
    setAppointments(update);
    setSharedAppointments(update);
  };

  // changes one question of a submitted appointment, works from the latest appointments so it is
  // safe to call after the page that called it has closed
  const updateQuestion = (id: string, index: number, changes: Partial<AppointmentQuestion>) => {
    const update = <T extends Appointment>(previous: T[]) =>
      previous.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              questions: appointment.questions.map((question, questionIndex) =>
                questionIndex === index ? { ...question, ...changes } : question,
              ),
            }
          : appointment,
      );
    setAppointments(update);
    setSharedAppointments(update);
  };

  return (
    <AppointmentContext.Provider
      value={{
        draft,
        appointments,
        sharedAppointments,
        supportLinks,
        findAppointment,
        updateDraft,
        resetDraft,
        submitDraft,
        updateAppointment,
        updateQuestion,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export const useAppointment = () => useContext(AppointmentContext);
