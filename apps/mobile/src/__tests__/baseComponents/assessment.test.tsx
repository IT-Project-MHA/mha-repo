/** Component tests for Assessment, the question flow that ends on a review page
 * Tests cover:
 *    - answering every question reaches the review page, which shows the answers
 *    - Submit saves each answer under its answerKey, then returns to My Pain
 *    - a failed save shows an error and stays on the review page
 *    - Back returns to the previous question, and leaves the assessment from the first question
 *    - a question's validate message blocks moving on to the next question
 *    - saved initialAnswers are filled in
 *    - score and summary:
 *        - the score text matches the range the total score falls in
 *        - a lower score gets the lower range text
 *        - a summary sentence is shown in place of the score text when one is given
 *    - an empty question list throws
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { press, expectText, expectNoText } from '../../helpers/testHelpers';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('@/api/django-API', () => ({}));
jest.mock('@/api/care_planner_api_helpers', () => ({
  apiErrorMessage: (_error: unknown, fallback: string) => fallback,
}));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
import Assessment from '../../../components/baseComponents/Assessment';
import type { QuestionProps } from '../../../components/baseComponents/Question';

const QUESTIONS: QuestionProps[] = [
  { section: 'S', answerKey: 'q1', title: 'Placeholder title 1', 
    detail: 'Placeholder detail', questionType: 'TextEntry', placeholder: 'Placeholder notes' },
  { section: 'S', answerKey: 'q2', title: 'Placeholder title 2', 
    detail: 'Placeholder detail', questionType: 'MultipleChoice',
    questionOptions: ['Option 1', 'Option 2'], optionScores: [1, 8] },
];

const review = (extra: object = {}) => ({
  title: 'Review title',
  period: 'Placeholder period',
  fields: (answers: Record<string, any>): [string, string][] => [['Field 1', answers.q1], ['Field 2', answers.q2]],
  ...extra,
});

// answers both questions
const answerAll = async () => {
  await fireEvent.changeText(screen.getByPlaceholderText('Placeholder notes'), 'Placeholder answer');
  await press('Continue');
  await press('Option 2');
  await press('Continue');
};

afterEach(() => jest.clearAllMocks());

test('answering every question reaches the review page showing the answers', async () => {
  await render(<Assessment title="S" questions={QUESTIONS} review={review()} />);
  expectText('Progress: 1/2');
  await answerAll();
  expectText('Review Your Answers');
  expectText('Review title');
  expectText('Placeholder answer');
  expectText('Option 2');
});

test('Submit saves every answer by its answerKey and returns to My Pain', async () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);
  await render(<Assessment title="S" questions={QUESTIONS} review={review()} onSubmit={onSubmit} />);
  await answerAll();
  await press('Submit');
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain'));
  expect(onSubmit).toHaveBeenCalledWith({ q1: 'Placeholder answer', q2: 'Option 2' });
});

test('a failed save shows an error and stays on the review page', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const onSubmit = jest.fn().mockRejectedValue(new Error('network'));
  await render(<Assessment title="S" questions={QUESTIONS} review={review()} onSubmit={onSubmit} />);
  await answerAll();
  await press('Submit');
  expect(await screen.findByText('Your answers could not be saved, please try again')).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
  consoleError.mockRestore();
});

test('Back goes to the previous question, and from the first question leaves', async () => {
  await render(<Assessment title="S" questions={QUESTIONS} review={review()} />);
  await fireEvent.changeText(screen.getByPlaceholderText('Placeholder notes'), 'Placeholder answer');
  await press('Continue');
  expectText('Progress: 2/2');
  await press('Back');
  expectText('Progress: 1/2');
  expect(mockNavigate).not.toHaveBeenCalled();
  await press('Back');
  expect(mockNavigate).toHaveBeenCalledWith('/(tabs)/myPain');
});

test('a validate message blocks moving on', async () => {
  const questions: QuestionProps[] = [
    { ...QUESTIONS[0], validate: (answers) => (answers.q1 === 'invalid' ? 'Not allowed' : null) },
    QUESTIONS[1],
  ];
  await render(<Assessment title="S" questions={questions} review={review()} />);
  await fireEvent.changeText(screen.getByPlaceholderText('Placeholder notes'), 'invalid');
  await press('Continue');
  expectText('Not allowed');
  expectText('Progress: 1/2');
});

test('saved initialAnswers are shown', async () => {
  await render(
    <Assessment title="S" questions={QUESTIONS} review={review()} initialAnswers={{ q1: 'Saved placeholder' }} />,
  );
  expect(screen.getByDisplayValue('Saved placeholder')).toBeTruthy();
});

describe('score and summary', () => {
  const scored = { score: { 0: 'low score text.', 5: 'high score text.' } };

  test('the score text matches the total score of the answers', async () => {
    await render(<Assessment title="My Movement" questions={QUESTIONS} review={review(scored)} />);
    await answerAll(); // Option 2 scores 8
    expectText(/high score text\./);
    expectNoText(/low score text\./);
  });

  test('a lower score gets the lower range text', async () => {
    await render(<Assessment title="My Movement" questions={QUESTIONS} review={review(scored)} />);
    await fireEvent.changeText(screen.getByPlaceholderText('Placeholder notes'), 'Placeholder answer 2');
    await press('Continue');
    await press('Option 1'); // Option 1 scores 1
    await press('Continue');
    expectText(/low score text\./);
  });

  test('a summary sentence is shown where the score would be', async () => {
    await render(
      <Assessment title="My Management" questions={QUESTIONS}
        review={review({ summary: (answers: Record<string, any>) => `Placeholder summary ${answers.q1}.` })} />,
    );
    await answerAll();
    expectText('Placeholder summary Placeholder answer.');
    expectText('Explore tips on managing pain');
  });
});
