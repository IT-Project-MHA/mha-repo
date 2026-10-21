import { Question, QuestionProps } from "../../components/baseComponents/Question";
import { AssessmentProps } from "../../components/baseComponents/Assessment";
import { MultipleChoice } from "../../components/answerFields/MultipleChoice";

function GenerateAssessmentProps() {
  let props: AssessmentProps = new AssessmentProps;
  let qPropsA: QuestionProps = new QuestionProps;
  qPropsA.title = "titleA";
  qPropsA.detail = "detailA";
  qPropsA.questionType = "EmojiSelect";
  let qPropsB: QuestionProps = new QuestionProps;
  qPropsB.title = "titleB";
  qPropsB.detail = "detailB";
  qPropsB.questionType = "MultipleChoice";
  props.title = "assessmentTitle";
  props.questions = [ qPropsA, qPropsB ];
  return props;
}

function GenerateQuestionProps() {
    let props: QuestionProps = new QuestionProps;
    props.title = "testTitle";
    props.detail = "testDetail";
    props.questionType = "MultipleChoice";
}

function GenerateNullAssessmentProps() {
    let props: AssessmentProps = new AssessmentProps;
    return props;
}

function GenerateNullQuestionProps() {
    let props: QuestionProps = new QuestionProps;
    return props;
}

export {GenerateAssessmentProps, GenerateQuestionProps, GenerateNullAssessmentProps, GenerateNullQuestionProps}