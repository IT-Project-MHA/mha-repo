import { useEffect, useState } from "react";
import Assessment from "../../../../components/baseComponents/Assessment";
import { QuestionProps } from "../../../../components/baseComponents/Question";
import { apiQuestionOption } from "@/api/django-API";

const SECTION_NAME = "My Pain"

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
    ];

    return(
        <Assessment title="Assessment_title" questions={questions}></Assessment>
    );
}
