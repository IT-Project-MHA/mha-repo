import React, { createContext, useContext, useState } from 'react';

// Support person details
export type SupportPerson = {
  name: string;
  phone: string;
  canAddQuestions: boolean;
  canAddAnswers: boolean;
  supportLinkId?: string; // set when picked from My Support Links, left out when entered by hand
};

// Question to ask the doctor
export type AppointmentQuestion = {
  id?: string; // the server's id, left out until it is saved
  text: string;
  source: 'suggested' | 'patient' | 'support';
  addedBy?: 'support'; // left out when the patient added it
  suggestedId?: string;
  answerId?: string; // the server's id of the answer, left out until one is saved
  answer?: string;
  recording?: string; // file uri, or the server's download URL
};

// Draft appointment, filled in across the care planner page
export type AppointmentDraft = {
  appointmentId: string | null; // set once the create appointment page has saved it to the server
  scheduledDate: Date | null;
  doctor: string;
  healthService: string | null;
  supportPeople: SupportPerson[];
  questions: AppointmentQuestion[];
};

// Submitted appointment, shown in appointments list
export type Appointment = {
  id: string;
  scheduled_date: string; // ISO date and time
  doctor: string;
  health_service: string;
  supportPeople: SupportPerson[];
  questions: AppointmentQuestion[];
  doctorPermission?: boolean;
  doctorSignature?: string; // PNG data URL
};

// Appointment as the server lists it, without its questions & support persons
export type ApiAppointment = {
  id: string;
  created_at: string;
  scheduled_date: string; // ISO date and time
  doctor: string;
  health_service: string;
  patient_profile: string;
};

// Appointment another patient has shared with this user as their support person
export type SharedAppointment = Appointment & {
  patientId: string;
  patientName: string;
  // what the patient has allowed this user to do in the appointment
  canAddQuestions: boolean;
  canAddAnswers: boolean;
};

// A patient who has made this user their support person, from an active support link
export type SupportLink = {
  patientId: string;
  patientName: string;
};

// support link chosen on My Support Links, waiting for the support person form to use it
export type PickedSupportLink = { id: string; phone: string };

const emptyDraft = (): AppointmentDraft => ({
  appointmentId: null,
  scheduledDate: null,
  doctor: '',
  healthService: null,
  supportPeople: [],
  questions: [],
});

type AppointmentState = {
  draft: AppointmentDraft;
  appointments: Appointment[];
  sharedAppointments: SharedAppointment[];
  findAppointment: (id: string) => Appointment | undefined;
  updateDraft: (changes: Partial<AppointmentDraft>) => void;
  resetDraft: () => void;
  submitDraft: () => void;
  pickedSupportLink: PickedSupportLink | null;
  pickSupportLink: (link: PickedSupportLink | null) => void;
  updateAppointment: (id: string, changes: Partial<Appointment>) => void;
  updateQuestion: (id: string, index: number, changes: Partial<AppointmentQuestion>) => void;
  rememberAppointment: (appointment: Appointment) => void;
  rememberSharedAppointment: (appointment: SharedAppointment) => void;
};

const AppointmentContext = createContext<AppointmentState>({
  draft: emptyDraft(),
  appointments: [],
  sharedAppointments: [],
  findAppointment: () => undefined,
  updateDraft: () => {},
  resetDraft: () => {},
  submitDraft: () => {},
  pickedSupportLink: null,
  pickSupportLink: () => {},
  updateAppointment: () => {},
  updateQuestion: () => {},
  rememberAppointment: () => {},
  rememberSharedAppointment: () => {},
});

/**
 * Shares the appointment being created between the care planner pages, and keeps the submitted
 * appointments & the ones loaded from the server, so the pages opened from an appointment can find
 * it.
 */
export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<AppointmentDraft>(emptyDraft);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sharedAppointments, setSharedAppointments] = useState<SharedAppointment[]>([]);
  const [pickedSupportLink, pickSupportLink] = useState<PickedSupportLink | null>(null);

  // looks in both the user's own and shared appointments, their ids don't overlap
  const findAppointment = (id: string) =>
    appointments.find((item) => item.id === id) ??
    sharedAppointments.find((item) => item.id === id);

  const updateDraft = (changes: Partial<AppointmentDraft>) =>
    setDraft((previous) => ({ ...previous, ...changes }));

  const resetDraft = () => setDraft(emptyDraft());

  // adds the draft to the top of the appointments with the id the server gave it, then clears it.
  // Each page of the create appointment flow has already saved its part to the server
  const submitDraft = () => {
    if (!draft.appointmentId || !draft.scheduledDate) return;
    const appointment: Appointment = {
      id: draft.appointmentId,
      scheduled_date: draft.scheduledDate.toISOString(),
      doctor: draft.doctor,
      health_service: draft.healthService ?? '',
      supportPeople: draft.supportPeople,
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

  // keeps an appointment loaded from the server, replacing the copy kept before
  const replaceOrAdd = <T extends Appointment>(appointment: T) => (previous: T[]) =>
    previous.some((item) => item.id === appointment.id)
      ? previous.map((item) => (item.id === appointment.id ? appointment : item))
      : [appointment, ...previous];
  const rememberAppointment = (appointment: Appointment) =>
    setAppointments(replaceOrAdd(appointment));
  const rememberSharedAppointment = (appointment: SharedAppointment) =>
    setSharedAppointments(replaceOrAdd(appointment));

  return (
    <AppointmentContext.Provider
      value={{
        draft,
        appointments,
        sharedAppointments,
        findAppointment,
        updateDraft,
        resetDraft,
        submitDraft,
        pickedSupportLink,
        pickSupportLink,
        updateAppointment,
        updateQuestion,
        rememberAppointment,
        rememberSharedAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export const useAppointment = () => useContext(AppointmentContext);
