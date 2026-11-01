import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Assessment from "../../../../components/baseComponents/Assessment";
import { QuestionProps } from "../../../../components/baseComponents/Question";
import { apiAssessment, apiQuestionOptionOrdered } from "@/api/django-API";
import { apiLoadMyMovement, apiSaveMyMovement } from "@/api/my_pain_api_helpers";
import { weekRangeLabel } from "../../../../constants/date";
import { fieldsFor, titles } from "../../../healthInfo/sectionSummaryFields";

const SECTION_NAME = "My Movement"

// most hours in a week for Q1
const MAX_ACTIVE_HOURS = 168;
const MAX_REFLECTION_LENGTH = 300;

// the single choice questions, in the order they are asked
const CHOICE_QUESTIONS = [
    { key: "walking", title: "Walking Impacts" },
    { key: "lifting", title: "Lifting Impacts" },
    { key: "sitting", title: "Sitting Impacts" },
    { key: "standing", title: "Standing Impacts" },
];

type MovementOption = { id: string; text: string };

async function loadOptions(questionKey: string): Promise<MovementOption[]> {
    const options = await apiQuestionOptionOrdered('select', {
        app_section: 'my_movement',
        question_key: questionKey,
    });
    return options
        .filter((o: any) => o.is_active)
        .sort((a: any, b: any) => a.option_number - b.option_number)
        .map((o: any) => ({ id: o.id, text: o.text }));
}

const idsOf = (options: MovementOption[], selected: string[] = []) =>
    options.filter((option) => selected.includes(option.text)).map((option) => option.id);

const textsOf = (options: MovementOption[], ids: string[] = []) =>
    options.filter((option) => ids.includes(option.id)).map((option) => option.text);

const idOf = (options: MovementOption[], text?: string) =>
    options.find((option) => option.text === text)?.id ?? null;

const textOf = (options: MovementOption[], id?: string | null) =>
    options.find((option) => option.id === id)?.text;

export default function MovementSection() {
    const { assessmentId } = useLocalSearchParams<{ assessmentId?: string }>();

    // each question's options as {id, text}, by question key
    const [options, setOptions] = useState<Record<string, MovementOption[]> | null>(null);
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
        const keys = ["general_impacts", ...CHOICE_QUESTIONS.map((q) => q.key)];
        Promise.all(keys.map((key) => loadOptions(`movement_${key}`)))
            // stores option text as Object { general_impacts: [...], walking: [...], etc. }
            .then((loaded) => setOptions(Object.fromEntries(keys.map((key, i) => [key, loaded[i]]))))
            .catch((e) => {
                console.warn("Could not load movement options", e);
                // sets every key to empty list
                setOptions(Object.fromEntries(keys.map((key) => [key, []])));
            });
        if (assessmentId) {
            apiLoadMyMovement(assessmentId)
                .then(setSaved)
                .catch((e) => {
                    console.warn("Could not load saved My Movement", e);
                    setSaved(null);
                });
        } else {
            setSaved(null);
        }
    }, [assessmentId]);

    if (options == null || saved === undefined || weekStarting === undefined) {
        return null;
    }

    const savedAnswers = saved && {
        activeHours: saved.active_hours == null ? undefined : String(saved.active_hours),
        generalImpacts: { selected: textsOf(options.general_impacts, saved.general_impacts), other: "" },
        walking: textOf(options.walking, saved.walking),
        lifting: textOf(options.lifting, saved.lifting),
        sitting: textOf(options.sitting, saved.sitting),
        standing: textOf(options.standing, saved.standing),
        reflection: saved.reflection ?? undefined,
    };

    const questions: QuestionProps[] = [
        {
            section: SECTION_NAME,
            answerKey: "activeHours",
            title: "Active hours",
            detail: "On average, how many hours per day were you able to stay \
active or mobile this week?",
            questionType: "NumberEntry",
            numberMax: MAX_ACTIVE_HOURS,
            description: "Staying active could mean doing your typical activities like working, \
driving, doing house chores, meeting with people, et cetera"},
        {
            section: SECTION_NAME,
            answerKey: "generalImpacts",
            title: "General movement",
            detail: "Select all relevant statements:",
            questionType: "MultiSelect",
            questionOptions: options.general_impacts.map((option) => option.text),
            minSelections: 1},
        ...CHOICE_QUESTIONS.map((q): QuestionProps => ({
            section: SECTION_NAME,
            answerKey: q.key,
            title: q.title,
            detail: "Select the most relevant statement:",
            questionType: "MultipleChoice",
            questionOptions: options[q.key].map((option) => option.text)})),
        {
            section: SECTION_NAME,
            answerKey: "reflection",
            title: "Reflection on your movement",
            detail: "Write any reflections of pain impacts on your mobility.",
            questionType: "TextEntry",
            textMax: MAX_REFLECTION_LENGTH,
            textLines: 5,
            optional: true,
            placeholder: "For instance, when the pain occured, you lie down for the whole day"},
    ];

    // create or update My Movement record
    const saveMyMovement = async (answers: Record<string, any>) => {
        if (!assessmentId) {
            throw new Error("No assessment to save My Movement to");
        }
        await apiSaveMyMovement(assessmentId, {
            active_hours: answers.activeHours == null ? null : Number(answers.activeHours),
            general_impacts: idsOf(options.general_impacts, answers.generalImpacts?.selected),
            walking: idOf(options.walking, answers.walking),
            lifting: idOf(options.lifting, answers.lifting),
            sitting: idOf(options.sitting, answers.sitting),
            standing: idOf(options.standing, answers.standing),
            reflection: answers.reflection || null,
        });
    };

    const review = {
        title: titles.my_movement,
        period: weekStarting ? weekRangeLabel(weekStarting) : undefined,
        fields: (answers: Record<string, any>): [string, string][] => {
            const rows = fieldsFor("my_movement", {
                activeHours: answers.activeHours == null ? null : Number(answers.activeHours),
                general: (answers.generalImpacts?.selected ?? []).join(", "),
                walking: answers.walking,
                lifting: answers.lifting,
                sitting: answers.sitting,
                standing: answers.standing,
            });
            return answers.reflection ? [...rows, ["Reflection", answers.reflection]] : rows;
        },
    };

    return(
        <Assessment title="Assessment_title" questions={questions} onSubmit={saveMyMovement}
            initialAnswers={savedAnswers ?? undefined} review={review}></Assessment>
    );
}
