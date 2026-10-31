import { useEffect, useState } from "react";
import Assessment from "../../../../components/baseComponents/Assessment";
import { QuestionProps } from "../../../../components/baseComponents/Question";
import { apiQuestionOption } from "@/api/django-API";
import { assessmentPainIntensityText } from "../../../../constants/resultDisplayText";

const SECTION_NAME = "My Pain"

// highest value on the pain intensity sliders
const PAIN_SLIDER_MAX = 10;

// the text for every pain intensity slider value 0 to PAIN_SLIDER_MAX
const PAIN_INTENSITY_DESCRIPTIONS = Array.from(
    { length: PAIN_SLIDER_MAX + 1 },
    (_, value) => assessmentPainIntensityText(value),
);

// load options for multiple choice from backend
async function loadOptions(questionKey: string) {
    const options = await apiQuestionOption('select', {
        app_section: 'my_pain',
        question_key: questionKey,
    });
    return options
        .filter((o: any) => o.is_active)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((o: any) => o.text);
}

export default function PainSection() {
    const [painLocations, setPainLocations] = useState<string[] | null>(null);
    const [painCharacteristics, setPainCharacteristics] = useState<string[] | null>(null);

    useEffect(() => {
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
    }, []);

    if (painLocations == null || painCharacteristics == null) {
        return null;
    }

    const questions: QuestionProps[] = [
        {
            section: SECTION_NAME,
            title: "Pain location", 
            detail: "I have had pain in these areas last week.", 
            questionType: "MultiSelect", 
            questionOptions: painLocations},
        {
            section: SECTION_NAME,
            title: "Pain characteristics",
            detail: "My pain felt like this last week.",
            questionType: "MultiSelect",
            questionOptions: painCharacteristics},
        {
            section: SECTION_NAME,
            title: "Pain intensity:",
            detail: "current",
            questionType: "SliderEntry",
            sliderLabel: "current pain",
            sliderDescriptions: PAIN_INTENSITY_DESCRIPTIONS},
        {
            section: SECTION_NAME,
            title: "Pain intensity:",
            detail: "mildest",
            questionType: "SliderEntry",
            sliderLabel: "mildest pain",
            sliderDescriptions: PAIN_INTENSITY_DESCRIPTIONS},
        {
            section: SECTION_NAME,
            title: "Pain intensity:",
            detail: "worst",
            questionType: "SliderEntry",
            sliderLabel: "worst pain",
            sliderDescriptions: PAIN_INTENSITY_DESCRIPTIONS},
        {
            section: SECTION_NAME,
            title: "Pain intensity:",
            detail: "average",
            questionType: "SliderEntry",
            sliderLabel: "average pain",
            sliderDescriptions: PAIN_INTENSITY_DESCRIPTIONS},
    ];

    return(
        <Assessment title="Assessment_title" questions={questions}></Assessment>
    );
}
