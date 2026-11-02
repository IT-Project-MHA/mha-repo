import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Assessment from "../../../../components/baseComponents/Assessment";
import { QuestionProps, idsOf, textsOf } from "../../../../components/baseComponents/Question";
import { apiAssessment, apiQuestionOption } from "@/api/django-API";
import { apiLoadMyPain, apiSaveMyPain } from "@/api/my_pain_api_helpers";
import { assessmentPainIntensityText } from "../../../../constants/resultDisplayText";
import { weekRangeLabel } from "../../../../constants/date";
import { fieldsFor, titles } from "../../../healthInfo/sectionSummaryFields";

const SECTION_NAME = "My Pain"

// most characters the "Other" details can have
const OTHER_DETAILS_LIMIT = 100;

// highest value on the pain intensity sliders
const PAIN_SLIDER_MAX = 10;

// the text for every pain intensity slider value 0 to PAIN_SLIDER_MAX
const PAIN_INTENSITY_DESCRIPTIONS = Array.from(
    { length: PAIN_SLIDER_MAX + 1 },
    (_, value) => assessmentPainIntensityText(value),
);

type PainOption = { id: string; text: string };

async function loadOptions(questionKey: string): Promise<PainOption[]> {
    const options = await apiQuestionOption('select', {
        app_section: 'my_pain',
        question_key: questionKey,
    });
    return options
        .filter((o: any) => o.is_active)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((o: any) => ({ id: o.id, text: o.text }));
}

// a saved "other" text means Other was ticked, so it is shown ticked even if its option isn't saved
const withOther = (selected: string[], other?: string | null) =>
    other && !selected.includes("Other") ? [...selected, "Other"] : selected;

const toScore =(answer: any) => (answer == null || answer === "" ? null : Number(answer));

// backend checks these pain orders (e.g. mildest must be <= current)
const PAIN_ORDER: [string, string][] = [
    ["Mildest", "current"],
    ["Current", "worst"],
    ["Mildest", "average"],
    ["Average", "worst"],
    ["Mildest", "worst"],
];

// takes one value to validate (e.g. "current") and checks it to every pair in PAIN_ORDER
const painScoreCheck = (key: string) => (answers: Record<string, any>) => {
    for (const [lower, higher] of PAIN_ORDER) {
        if (key !== lower && key !== higher) continue;
        const low = toScore(answers[lower]);
        const high = toScore(answers[higher]);
        if (low != null && high != null && low > high) {
            return `${lower} pain cannot be higher than ${higher} pain`;
        }
    }
    return null;
};

export default function PainSection() {
    const { assessmentId } = useLocalSearchParams<{ assessmentId?: string }>();

    // each multiselect options as {id, text}
    const [painLocations, setPainLocations] = useState<PainOption[] | null>(null);
    const [painCharacteristics, setPainCharacteristics] = useState<PainOption[] | null>(null);

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
        loadOptions('pain_location')
            .then(setPainLocations)
            .catch((e) => {
                console.warn("Could not load pain locations", e);
                setPainLocations([]);
            });
        loadOptions('pain_characteristic')
            .then(setPainCharacteristics)
            .catch((e) => {
                console.warn("Could not load pain characteristics", e);
                setPainCharacteristics([]);
            });
        // shows the answers already saved this week, if the section has been done before
        if (assessmentId) {
            apiLoadMyPain(assessmentId)
                .then(setSaved)
                .catch((e) => {
                    console.warn("Could not load saved My Pain", e);
                    setSaved(null);
                });
        } else {
            setSaved(null);
        }
    }, [assessmentId]);

    if (painLocations == null || painCharacteristics == null || saved === undefined || weekStarting === undefined) {
        return null;
    }

    const savedAnswers = saved && {
        locations: { 
            selected: withOther(textsOf(painLocations, saved.locations), saved.other_location),
            other: saved.other_location ?? "" },
        characteristics: { 
            selected: withOther(textsOf(painCharacteristics, saved.characteristics), saved.other_characteristic),
            other: saved.other_characteristic ?? "" },
        current: saved.current == null ? undefined : String(saved.current),
        mildest: saved.mildest == null ? undefined : String(saved.mildest),
        worst: saved.worst == null ? undefined : String(saved.worst),
        average: saved.average == null ? undefined : String(saved.average),
    };

    const questions: QuestionProps[] = [
        {
            section: SECTION_NAME,
            answerKey: "locations",
            title: "Pain location", 
            detail: "I have had pain in these areas last week.", 
            questionType: "MultiSelect", 
            questionOptions: painLocations.map((option) => option.text),
            MIN_SELECTIONS: 1,
            otherAttribute: true,
            otherAttributeSizeLimit: OTHER_DETAILS_LIMIT},
        {
            section: SECTION_NAME,
            answerKey: "characteristics",
            title: "Pain characteristics",
            detail: "My pain felt like this last week.",
            questionType: "MultiSelect",
            questionOptions: painCharacteristics.map((option) => option.text),
            MIN_SELECTIONS: 1,
            otherAttribute: true,
            otherAttributeSizeLimit: OTHER_DETAILS_LIMIT},
        {
            section: SECTION_NAME,
            title: "Pain intensity:",
            answerKey: "current",
            detail: "current",
            questionType: "SliderEntry",
            scoreLabel: "current pain",
            validate: painScoreCheck("current"),
            descriptions: PAIN_INTENSITY_DESCRIPTIONS},
        {
            section: SECTION_NAME,
            title: "Pain intensity:",
            answerKey: "mildest",
            detail: "mildest",
            questionType: "SliderEntry",
            scoreLabel: "mildest pain",
            validate: painScoreCheck("mildest"),
            descriptions: PAIN_INTENSITY_DESCRIPTIONS},
        {
            section: SECTION_NAME,
            title: "Pain intensity:",
            answerKey: "worst",
            detail: "worst",
            questionType: "SliderEntry",
            scoreLabel: "worst pain",
            validate: painScoreCheck("worst"),
            descriptions: PAIN_INTENSITY_DESCRIPTIONS},
        {
            section: SECTION_NAME,
            title: "Pain intensity:",
            answerKey: "average",
            detail: "average",
            questionType: "SliderEntry",
            scoreLabel: "average pain",
            validate: painScoreCheck("average"),
            descriptions: PAIN_INTENSITY_DESCRIPTIONS},
    ];

    // create or update My Pain record
    const saveMyPain = async (answers: Record<string, any>) => {
        if (!assessmentId) {
            throw new Error("No assessment to save My Pain to");
        }
        await apiSaveMyPain(assessmentId, {
            locations: idsOf(painLocations, answers.locations?.selected),
            other_location: answers.locations?.other || null,
            characteristics: idsOf(painCharacteristics, answers.characteristics?.selected),
            other_characteristic: answers.characteristics?.other || null,
            current: toScore(answers.current),
            mildest: toScore(answers.mildest),
            worst: toScore(answers.worst),
            average: toScore(answers.average),
        });
    };

    const review = {
        title: titles.my_pain,
        period: weekStarting ? weekRangeLabel(weekStarting) : undefined,
        fields: (answers: Record<string, any>): [string, string][] => {
            // the picked options with the user's own text instead of "Other"
            const joined = (picked?: { selected?: string[]; other?: string }) =>
                [...(picked?.selected ?? []).filter((option) => option !== "Other"),
                    ...(picked?.other ? [picked.other] : [])].join(", ");
            const rows = fieldsFor("my_pain", {
                location: joined(answers.locations),
                characteristics: joined(answers.characteristics),
                current: toScore(answers.current),
                average: toScore(answers.average),
                worst: toScore(answers.worst),
                mildest: toScore(answers.mildest),
            });
            // override the default average text in sectionSummaryfields.ts
            return rows.map(([label, value]) => [label.replace(" (2 weeks)", ""), value]);
        },
    };

    return(
        <Assessment title="Assessment_title" questions={questions} onSubmit={saveMyPain}
            initialAnswers={savedAnswers ?? undefined} review={review}></Assessment>
    );
}
