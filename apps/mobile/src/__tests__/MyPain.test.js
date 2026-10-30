import {Question, QuestionProps} from "../../components/baseComponents/Question";
import {Assessment, AssessmentProps} from "../../components/baseComponents/Assessment";
import { GenerateAssessmentProps, GenerateQuestionProps} from "../testSupport/AssessmentTestHelpers";
import { Tab, FindLastMonday } from "../app/(tabs)/myPain/index";
import {Button} from "react-native";
import {render, fireEvent, getByText, queryByText, waitFor} from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
import {screen, toBeInTheDocument} from '@testing-library/dom';
import '@testing-library/jest-dom';
import {userEvent} from '@testing-library/user-event'
import {expect, jest, test, toThrow} from '@jest/globals';
import { EmptyQuestionArrayError, InvalidQuestionTypeError } from "../customErrors/QuestionErrors";
import ENTRY_COMPONENTS, {ENTRY_TYPE} from "../../components/answerFields/EntryRegistry";

test('My pain displays a valid Monday when a week begins in a seperate year to local date', () => {
    currDate = new Date("January 2, 2027");
    lastMonday = FindLastMonday(currDate);
    expect(lastMonday).toBe("28/12");
});

test('Number of completed assessments corresponds with the number of \'updated\' assessments', () => {

});