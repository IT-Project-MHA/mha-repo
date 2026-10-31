import { Question, QuestionProps } from "../../components/baseComponents/Question";
import { AssessmentProps } from "../../components/baseComponents/Assessment";
import { MultipleChoice } from "../../components/answerFields/MultipleChoice";

function GenerateAssessmentProps() {
    const props: QuestionProps[] = [{section: "sectionA", title: "titleA", detail: "detailA", questionType: "SliderEntry"},
    {section: "sectionB", title: "titleB", detail: "detailB", questionType: "MultipleChoice"}];
    return props;
}

function GenerateQuestionProps() {
    let props: QuestionProps = {section: "testSection", title: "testTitle", detail: "testDetail", questionType: "MultipleChoice"};
    return props;
}


export {GenerateAssessmentProps, GenerateQuestionProps}