import { Question, QuestionProps } from "../../components/baseComponents/Question";
import { AssessmentProps } from "../../components/baseComponents/Assessment";
import { MultipleChoice } from "../../components/answerFields/MultipleChoice";

function GenerateAssessmentProps() {
    const props: QuestionProps[] = [{title: "titleA", detail: "detailA", questionType: "SliderEntry"},
    {title: "titleB", detail: "detailB", questionType: "MultipleChoice"}];
    return props;
}

function GenerateQuestionProps() {
    let props: QuestionProps = {title: "testTitle", detail: "testDetail", questionType: "MultipleChoice"};
    return props;
}


export {GenerateAssessmentProps, GenerateQuestionProps}