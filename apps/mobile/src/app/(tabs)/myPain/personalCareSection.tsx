import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Assessment from "../../../../components/baseComponents/Assessment";
import { QuestionProps, QuestionOption, loadOptions, idsOf, textsOf, idOf, textOf } from "../../../../components/baseComponents/Question";
import { apiAssessment } from "@/api/django-API";
import { apiLoadMyPersonalCare, apiSaveMyPersonalCare } from "@/api/my_pain_api_helpers";
import { personalCareScore } from "../../../../constants/resultDisplayText";
import { weekRangeLabel } from "../../../../constants/date";
import { fieldsFor, titles } from "../../../healthInfo/sectionSummaryFields";

const SECTION_NAME = "Personal Care"

const MAX_REFLECTION_LENGTH = 300;

// the single choice questions, in the order they are asked
const CHOICE_QUESTIONS = [
    { key: "personal_care", title: "Personal care (washing, dressing, etc)", detail: "Select the most relevant statement:" },
    { key: "sleeping", title: "Sleeping", detail: "Select the most relevant statement:" },
];

// lowest score of each range for personal care score
const PERSONAL_CARE_SCORE_STARTS = [0, 4, 6, 11];

export default function PersonalCareSection() {
    const { assessmentId } = useLocalSearchParams<{ assessmentId?: string }>();

    // each question's options as {id, text, score}, by question key
    const [options, setOptions] = useState<Record<string, QuestionOption[]> | null>(null);
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
        Promise.all(keys.map((key) => loadOptions('my_personal_care', `care_${key}`)))
            .then((loaded) => setOptions(Object.fromEntries(keys.map((key, i) => [key, loaded[i]]))))
            .catch((e) => {
                console.warn("Could not load personal care options", e);
                setOptions(Object.fromEntries(keys.map((key) => [key, []])));
            });
        if (assessmentId) {
            apiLoadMyPersonalCare(assessmentId)
                .then(setSaved)
                .catch((e) => {
                    console.warn("Could not load saved Personal Care", e);
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
        generalImpacts: { selected: textsOf(options.general_impacts, saved.general_activities_impact), other: "" },
        personal_care: textOf(options.personal_care, saved.personal_care),
        sleeping: textOf(options.sleeping, saved.sleeping),
        reflection: saved.reflection ?? undefined,
    };

    const questions: QuestionProps[] = [
        {
            section: SECTION_NAME,
            answerKey: "generalImpacts",
            title: "General activities",
            detail: "Select all relevant statements:",
            questionType: "MultiSelect",
            questionOptions: options.general_impacts.map((option) => option.text),
            optionScores: options.general_impacts.map((option) => option.score),
            MIN_SELECTIONS: 1},
        ...CHOICE_QUESTIONS.map((q): QuestionProps => ({
            section: SECTION_NAME,
            answerKey: q.key,
            title: q.title,
            detail: q.detail,
            questionType: "MultipleChoice",
            questionOptions: options[q.key].map((option) => option.text),
            optionScores: options[q.key].map((option) => option.score)})),
        {
            section: SECTION_NAME,
            answerKey: "reflection",
            title: "Reflection on your personal care",
            detail: "Write any reflections of pain impacts on your daily life.",
            questionType: "TextEntry",
            maxLength: MAX_REFLECTION_LENGTH,
            numberOfLines: 5,
            optional: true,
            placeholder: "For instance, this week, I felt that I could not do everything at all, \
I felt hopeless, even doing the laundry felt miserable"},
    ];

    // create or update My Personal Care record
    const saveMyPersonalCare = async (answers: Record<string, any>) => {
        if (!assessmentId) {
            throw new Error("No assessment to save Personal Care to");
        }
        await apiSaveMyPersonalCare(assessmentId, {
            general_activities_impact: idsOf(options.general_impacts, answers.generalImpacts?.selected),
            personal_care: idOf(options.personal_care, answers.personal_care),
            sleeping: idOf(options.sleeping, answers.sleeping),
            reflection: answers.reflection || null,
        });
    };

    const review = {
        title: titles.personal_care,
        period: weekStarting ? weekRangeLabel(weekStarting) : undefined,
        score: Object.fromEntries(PERSONAL_CARE_SCORE_STARTS.map((lower) => [lower, personalCareScore(lower)])),
        fields: (answers: Record<string, any>): [string, string][] => {
            const rows = fieldsFor("personal_care", {
                general: (answers.generalImpacts?.selected ?? []).join(", "),
                personalCare: answers.personal_care,
                sleeping: answers.sleeping,
            });
            return answers.reflection ? [...rows, ["Reflection", answers.reflection]] : rows;
        },
    };

    return(
        <Assessment title={SECTION_NAME} questions={questions} onSubmit={saveMyPersonalCare}
            initialAnswers={savedAnswers ?? undefined} review={review}></Assessment>
    );
}
