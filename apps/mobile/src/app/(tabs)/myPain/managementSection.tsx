import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Assessment from "../../../../components/baseComponents/Assessment";
import { QuestionProps, QuestionOption, loadOptions, idsOf, textsOf } from "../../../../components/baseComponents/Question";
import { apiAssessment, apiPrescription } from "@/api/django-API";
import { apiLoadMyManagement, apiSaveMyManagement } from "@/api/my_pain_api_helpers";
import { ownPatientProfileId } from "@/api/care_planner_api_helpers";
import { exerciseFrequencyWord, managementSummary } from "../../../../constants/resultDisplayText";
import { weekRangeLabel } from "../../../../constants/date";
import { fieldsFor, titles } from "../../../healthInfo/sectionSummaryFields";

const SECTION_NAME = "My Management"

// char limit for all text inputs
const MAX_TEXT_LENGTH = 300;

type MedicationOption = QuestionOption & { name: string; dose?: string; subtitle: string };

// includes display text for a MedicationOption e.g. "Panadol every 6 hour(s)"
const prescriptionOption = (p: any): MedicationOption => ({
    id: p.id,
    text: `${p.name} every ${p.frequency} ${p.frequency_unit}`,
    score: 0,
    name: p.name,
    dose: p.strength == null ? undefined : `${Number(p.strength)} ${p.strength_unit}`,
    subtitle: `${p.dosage ? `${p.dosage} ` : ""}${p.form} every ${p.frequency} ${p.frequency_unit}`,
});

// get active prescriptions
async function loadMedicationOptions(): Promise<MedicationOption[]> {
    const patientProfileId = await ownPatientProfileId();
    if (!patientProfileId) return [];
    const prescriptions = await apiPrescription('select', { patient_profile: patientProfileId });
    return prescriptions.filter((p: any) => !p.stopped_on).map(prescriptionOption);
}

export default function ManagementSection() {
    const { assessmentId } = useLocalSearchParams<{ assessmentId?: string }>();

    const [medication, setMedication] = useState<MedicationOption[] | null>(null);
    const [exercise, setExercise] = useState<QuestionOption[] | null>(null);
    const [saved, setSaved] = useState<any | null | undefined>(undefined); // saved answers
    const [weekStarting, setWeekStarting] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        if (assessmentId) {
            apiAssessment('select', { id: assessmentId })
                .then((assessment: any) => setWeekStarting(assessment?.week_starting ?? null))
                .catch((e: any) => {
                    console.warn("Could not load the assessment's week", e);
                    setWeekStarting(null);
                });
        } else {
            setWeekStarting(null);
        }
        loadMedicationOptions()
            .then(setMedication)
            .catch((e) => {
                console.warn("Could not load prescriptions", e);
                setMedication([]);
            });
        loadOptions('my_management', 'management_exercise')
            .then(setExercise)
            .catch((e) => {
                console.warn("Could not load exercise options", e);
                setExercise([]);
            });
        if (assessmentId) {
            apiLoadMyManagement(assessmentId)
                .then(setSaved)
                .catch((e) => {
                    console.warn("Could not load saved My Management", e);
                    setSaved(null);
                });
        } else {
            setSaved(null);
        }
    }, [assessmentId]);

    if (medication == null || exercise == null || saved === undefined || weekStarting === undefined) {
        return null;
    }

    const savedAnswers = saved && {
        medication: { selected: textsOf(medication, saved.medication), other: "" },
        otcMedication: saved.otc_medication ?? undefined,
        exercise: exercise.find((option) => option.id === saved.exercise)?.text,
        emotion: saved.emotion ?? undefined,
    };

    const questions: QuestionProps[] = [
        {
            section: SECTION_NAME,
            answerKey: "medication",
            title: "Medication",
            detail: "Over the past week, select medications that you consumed to manage your pain.",
            questionType: "MultiSelect",
            questionOptions: medication.map((option) => option.text),
            optionDetails: medication.map(({ name, dose, subtitle }) => ({ name, dose, subtitle })),
            MIN_SELECTIONS: 0,
            medication: true},
        {
            section: SECTION_NAME,
            answerKey: "otcMedication",
            title: "Medication",
            detail: "Over the past week, did you consume any over the counter (OTC) medication?",
            questionType: "TextEntry",
            maxLength: MAX_TEXT_LENGTH,
            numberOfLines: 3,
            optional: true,
            placeholder: "Input name of over the counter medication"},
        {
            section: SECTION_NAME,
            answerKey: "exercise",
            title: "Exercise",
            detail: "In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?",
            questionType: "MultipleChoice",
            questionOptions: exercise.map((option) => option.text),
            optionScores: exercise.map((option) => option.score),
            exercise: true},
        {
            section: SECTION_NAME,
            answerKey: "emotion",
            title: "Emotions",
            detail: "Over the past week, did you perform any strategies to manage your stress level or emotion?",
            questionType: "TextEntry",
            maxLength: MAX_TEXT_LENGTH,
            numberOfLines: 5,
            optional: true,
            placeholder: "Examples: meditation, journaling, meeting people"},
    ];

    // create or update My Management record
    const saveMyManagement = async (answers: Record<string, any>) => {
        if (!assessmentId) {
            throw new Error("No assessment to save My Management to");
        }
        await apiSaveMyManagement(assessmentId, {
            medication: idsOf(medication, answers.medication?.selected),
            otc_medication: answers.otcMedication || null,
            exercise: exercise.find((option) => option.text === answers.exercise)?.id ?? null,
            emotion: answers.emotion || null,
        });
    };

    // single list of prescriptions & OTC meds (for review display text)
    const medicationTaken = (answers: Record<string, any>): string[] => [
        ...(answers.medication?.selected ?? []),
        ...(answers.otcMedication ? [answers.otcMedication] : []),
    ];

    const review = {
        title: titles.management,
        period: weekStarting ? weekRangeLabel(weekStarting) : undefined,
        summary: (answers: Record<string, any>) => {
            const picked = exercise.find((option) => option.text === answers.exercise);
            return managementSummary(medicationTaken(answers), exerciseFrequencyWord(picked?.score));
        },
        fields: (answers: Record<string, any>): [string, string][] =>
            fieldsFor("management", {
                medication: medicationTaken(answers).join(", "),
                exercise: answers.exercise,
                emotion: answers.emotion,
            }),
    };

    return(
        <Assessment title={SECTION_NAME} questions={questions} onSubmit={saveMyManagement}
            initialAnswers={savedAnswers ?? undefined} review={review}></Assessment>
    );
}
