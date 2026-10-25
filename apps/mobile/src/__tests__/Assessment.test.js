
import {Question, QuestionProps} from "../../components/baseComponents/Question";
import {Assessment, AssessmentProps} from "../../components/baseComponents/Assessment";
import { GenerateAssessmentProps, GenerateQuestionProps, GenerateNullAssessmentProps, GenerateNullQuestionProps } from "../testSupport/AssessmentTestHelpers";
import {Button} from "react-native";
import {render, fireEvent, getByText, queryByText, waitFor} from '@testing-library/react';
import {screen, toBeInTheDocument} from '@testing-library/dom';
import '@testing-library/jest-dom';
import {userEvent} from '@testing-library/user-event'
import {expect, jest, test, toThrow} from '@jest/globals';
import { EmptyQuestionArrayError, InvalidQuestionTypeError } from "../customErrors/QuestionErrors";
import ENTRY_COMPONENTS, {ENTRY_TYPE} from "../../components/answerFields/EntryRegistry";


test('When reaching the end of a question array, the submit button no longer itterates', () => {
    let props = GenerateAssessmentProps();
    render(<Assessment properties={props} />);
    const button = screen.getByText(/Record/i);
    for (i = 0; i <= props.questions.length; i++) {
        fireEvent.click(button);
    }
    const questionCounter = screen.getByText(/Progress:/i);
    expect(questionCounter).toHaveTextContent('Progress: ' + props.questions.length + '/' + props.questions.length);
});

test('Question number incremements', async () => {
  let props = GenerateAssessmentProps();
  render(<Assessment properties={props} />);
  const buttonElement = screen.getByText(/Record/i);
  fireEvent.click(buttonElement);
  const questionCounter = screen.getByText(/Progress:/i);
  expect(questionCounter).toHaveTextContent('Progress: 2/' + props.questions.length);
});

test('Invalid question types will throw an error', () => {
  let props = GenerateNullQuestionProps();
  props.questionType = "invalidType";
  expect(() => {
    render(<Question qProperties={props}/>)}).toThrowError(InvalidQuestionTypeError);
})

test('Empty / null question array values return an error', () => {
    let props = GenerateNullQuestionProps
    expect(() => {
        render(<Assessment properties={props}/>)
    }).toThrowError(EmptyQuestionArrayError)
});
