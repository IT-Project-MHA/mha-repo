
import {Question, QuestionProps} from "../../components/baseComponents/Question";
import {Assessment, AssessmentProps} from "../../components/baseComponents/Assessment";
import { GenerateAssessmentProps, GenerateQuestionProps} from "../testSupport/AssessmentTestHelpers";
import {render, screen, fireEvent, getByText, queryByText, waitFor} from '@testing-library/react-native';
import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';
import {expect, jest, test } from '@jest/globals';
import { EmptyQuestionArrayError, InvalidQuestionTypeError } from "../customErrors/QuestionErrors";
import ENTRY_COMPONENTS, {ENTRY_TYPE} from "../../components/answerFields/EntryRegistry";

beforeAll( async () => {
    global.TextEncoder = require('util').TextEncoder;
    global.TextDecoder = require('util').TextDecoder;
    //Object.assign(global, { TextDecoder, TextEncoder });
});

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

test('When reaching the end of a question array, the submit button routes', async () => {
    let props = GenerateAssessmentProps();
    await render(<Assessment title="testTitle" questions={props} />);
    const button = screen.getByText('Record');
    for (i = 0; i < props.length; i++) {
        await fireEvent.press(button);
    }
    expect(mockNavigate).toHaveBeenCalledTimes(1);
});

test('Question number incremements', async () => {
  let props = GenerateAssessmentProps();
  await render(<Assessment title="testTitle" questions={GenerateAssessmentProps()} />);
  const buttonElement = screen.getByText('Record');
  await fireEvent.press(buttonElement);
  expect('Progress: 2/' + props.length).toBeOnTheScreen;
});

// test('Invalid question types will throw an error', () => {
//   expect(() =>
//     render(<Question title="validTitle" detail="validDetail" questionType="invalidType"/>)).toThrow('InvalidQuestionTypeError: invalidType is not a valid question type');
// })

test('Empty / null question array values return an error', () => {
    expect(() => {
        render(<Assessment title="validTitle"></Assessment>)
    }).toThrow('EmptyQuestionArray: properties.questions is null')
});
