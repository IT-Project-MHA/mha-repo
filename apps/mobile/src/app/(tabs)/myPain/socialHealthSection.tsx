import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Assessment from "../../../../components/baseComponents/Assessment";
import { QuestionProps, QuestionOption, loadOptions, idOf, textOf } from "../../../../components/baseComponents/Question";
import { apiAssessment } from "@/api/django-API";
import { apiLoadMySocialHealth, apiSaveMySocialHealth } from "@/api/my_pain_api_helpers";
import {
    enjoymentIntensityText, moodIntensityText, relationshipsIntensityText, socialHealthScore,
} from "../../../../constants/resultDisplayText";
import { weekRangeLabel } from "../../../../constants/date";
import { fieldsFor, na, titles } from "../../../healthInfo/sectionSummaryFields";

const SECTION_NAME = "My Social Health"

const MAX_REFLECTION_LENGTH = 300;

// highest value on all sliders
const SLIDER_MAX = 10;

const CHOICE_QUESTIONS = [
    { key: "social_life", title: "Social life", detail: "Select the most relevant statement:" },
    { key: "travelling", title: "Travelling", detail: "Select the most relevant statement:" },
];

const SLIDER_QUESTIONS = [
    { key: "mood", title: "Mood", 
        detail: "Over the past week, how much has pain impacted your mood?",
        label: "mood impact", text: moodIntensityText },
    { key: "relationships", title: "Relationships with others",
        detail: "Over the past week, how much has pain interfered with your relationships with other people?",
        label: "relationship impact", text: relationshipsIntensityText },
    { key: "enjoyment", title: "Enjoyment of life", 
        detail: "Over the past week, how much has pain impacted your ability to enjoy life?",
        label: "enjoyment impact", text: enjoymentIntensityText },
];

// lowest score of each range for review display text
const SOCIAL_SCORE_STARTS = [0, 11, 20, 31];

const toScore = (answer: any) => (answer == null || answer === "" ? null : Number(answer));

const sliderText = (describe: (value: number) => string) =>
    Array.from({ length: SLIDER_MAX + 1 }, (_, value) => describe(value));

export default function SocialHealthSection() {
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
        const keys = [...CHOICE_QUESTIONS.map((q) => q.key), "overall_mood"];
        Promise.all(keys.map((key) => loadOptions('my_social_health', `social_${key}`)))
            .then((loaded) => setOptions(Object.fromEntries(keys.map((key, i) => [key, loaded[i]]))))
            .catch((e) => {
                console.warn("Could not load social health options", e);
                setOptions(Object.fromEntries(keys.map((key) => [key, []])));
            });
        if (assessmentId) {
            apiLoadMySocialHealth(assessmentId)
                .then(setSaved)
                .catch((e) => {
                    console.warn("Could not load saved My Social Health", e);
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
        social_life: textOf(options.social_life, saved.social_life),
        travelling: textOf(options.travelling, saved.travelling),
        mood: saved.mood == null ? undefined : String(saved.mood),
        relationships: saved.relationships == null ? undefined : String(saved.relationships),
        enjoyment: saved.enjoyment_of_life == null ? undefined : String(saved.enjoyment_of_life),
        overall_mood: textOf(options.overall_mood, saved.overall_mood),
        reflection: saved.reflection ?? undefined,
    };  

    console.log("overall_mood options", options.overall_mood);
    
    const questions: QuestionProps[] = [
        ...CHOICE_QUESTIONS.map((q): QuestionProps => ({
            section: SECTION_NAME,
            answerKey: q.key,
            title: q.title,
            detail: q.detail,
            questionType: "MultipleChoice",
            questionOptions: options[q.key].map((option) => option.text),
            optionScores: options[q.key].map((option) => option.score)})),
        ...SLIDER_QUESTIONS.map((q): QuestionProps => ({
            section: SECTION_NAME,
            answerKey: q.key,
            title: q.title,
            detail: q.detail,
            questionType: "SliderEntry",
            scoreLabel: q.label,
            descriptions: sliderText(q.text),
            scoreFromValue: true})),
        {
            section: SECTION_NAME,
            answerKey: "overall_mood",
            title: "Overall mood",
            detail: "Over the past week, how was your mood generally?",
            questionType: "EmojiSelect",
            questionOptions: options.overall_mood.map((option) => option.text),
            optionScores: options.overall_mood.map((option) => option.score)},
        {
            section: SECTION_NAME,
            answerKey: "reflection",
            title: "Mood",
            detail: "What triggered that mood?",
            questionType: "TextEntry",
            maxLength: MAX_REFLECTION_LENGTH,
            numberOfLines: 5,
            optional: true,
            placeholder: "i.e: delayed in work due to pain, inability to meet with friends, etc"},
    ];

    // create or update My Social Health record
    const saveMySocialHealth = async (answers: Record<string, any>) => {
        if (!assessmentId) {
            throw new Error("No assessment to save My Social Health to");
        }
        await apiSaveMySocialHealth(assessmentId, {
            social_life: idOf(options.social_life, answers.social_life),
            travelling: idOf(options.travelling, answers.travelling),
            mood: toScore(answers.mood),
            relationships: toScore(answers.relationships),
            enjoyment_of_life: toScore(answers.enjoyment),
            overall_mood: idOf(options.overall_mood, answers.overall_mood),
            reflection: answers.reflection || null,
        });
    };

    const review = {
        title: titles.social_health,
        period: weekStarting ? weekRangeLabel(weekStarting) : undefined,
        score: Object.fromEntries(SOCIAL_SCORE_STARTS.map((lower) => [lower, socialHealthScore(lower)])),
        fields: (answers: Record<string, any>): [string, string][] => {
            const rows: [string, string][] = [
                ...fieldsFor("social_health", {
                    socialLife: answers.social_life,
                    travelling: answers.travelling,
                    mood: toScore(answers.mood),
                    relationships: toScore(answers.relationships),
                    enjoyment: toScore(answers.enjoyment),
                }),
                ["Overall mood", na(answers.overall_mood)],
            ];
            return answers.reflection ? [...rows, ["Reflection", answers.reflection]] : rows;
        },
    };

    return(
        <Assessment title={SECTION_NAME} questions={questions} onSubmit={saveMySocialHealth}
            initialAnswers={savedAnswers ?? undefined} review={review}></Assessment>
    );
}