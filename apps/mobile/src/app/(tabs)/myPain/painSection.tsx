import { useEffect, useState } from "react";
import Assessment from "../../../../components/baseComponents/Assessment";
import { QuestionProps } from "../../../../components/baseComponents/Question";
import { apiQuestionOption } from "@/api/django-API";

async function loadPainLocations() {
    const options = await apiQuestionOption('select', {
        app_section: 'my_pain',
        question_key: 'pain_location',
    });
    return options
        .filter((o: any) => o.is_active)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((o: any) => o.text);
}

export default function PainSection() {
    const [painLocations, setPainLocations] = useState<string[] | null>(null);

    useEffect(() => {
        loadPainLocations()
            .then(setPainLocations)
            .catch((e) => {
                console.warn("Could not load pain locations", e);
                setPainLocations([]);
            });
    }, []);

    if (painLocations == null) {
        return null;
    }

    const questions: QuestionProps[] = [
        {
            title: "Pain location", 
            detail: "I have had pain in these areas last week.", 
            questionType: "MultiSelect", 
            questionOptions: painLocations},
    ];

    return(
        <Assessment title="Assessment_title" questions={questions}></Assessment>
    );
}
