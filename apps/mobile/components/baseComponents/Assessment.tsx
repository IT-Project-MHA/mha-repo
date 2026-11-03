import type React from "react";
import { useState } from "react";
import { Text, View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { useTheme as usePaperTheme } from "react-native-paper";
import { apiErrorMessage } from "../../src/api/care_planner_api_helpers";
import * as WebBrowser from "expo-web-browser";
import Button from "../atomicUI/Button";
import TextButton from "../atomicUI/TextButton";
import { Question, QuestionProps } from "../../components/baseComponents/Question";
import {EmptyQuestionArrayError} from "../../src/customErrors/QuestionErrors";
import { useTheme, ColourSet } from '../../context/ThemeContext';

type AssessmentProps = {
  title: String;
  questions: QuestionProps[];
  onSubmit?: (answers: Record<string, any>) => Promise<void>;
  // answers to start with by answerKey, e.g. from a record saved earlier
  initialAnswers?: Record<string, any>;
  review: {
    title: string;
    period?: string;
    fields: (answers: Record<string, any>) => [string, string][];
    // lowest score of each range: the text shown for it, e.g. {0: "Mild", 6: "Moderate"}
    score?: Record<number, string>;
    // a sentence shown where the score would be, for sections without a score i.e. My Management
    summary?: (answers: Record<string, any>) => string;
  };
}

// the name a question's answer is stored under
const keyOf = (question: QuestionProps, index: number) => question.answerKey ?? String(index);

// the score of a question's answer, from the optionScores of the options picked
const scoreOf = (question: QuestionProps, answer: any) => {
  if (question.scoreFromValue) return Number(answer) || 0; // slider value is added
  if (!question.optionScores || !question.questionOptions || answer == null) return 0;
  // [answer] if multiple choice, answer.selected if multiselect
  const picked: string[] = typeof answer === "string" ? [answer] : answer.selected ?? [];
  // sum up the score of picked answers
  return picked.reduce(
    (sum, text) => sum + (question.optionScores?.
      // option's position in list, get index -1 if doesn't exist
      [question.questionOptions?.indexOf(text) ?? -1]
       ?? 0), // if index is -1, add 0
       0); // starting sum is 0
};

export default function Assessment({title, questions, onSubmit, initialAnswers, review}: AssessmentProps) {
  const router = useRouter();

  const { colours, theme } = useTheme();
  const styles = createStyles(colours);

  const [currIndex, setNumber] = useState(0);
  // the answer to each question, by index
  const [answers, setAnswers] = useState<any[]>(
    () => (questions ?? []).map((question, index) => initialAnswers?.[keyOf(question, index)]),
  );
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // shown above submit button
  const { colors: paperColours } = usePaperTheme();

  if (questions == null) {
    throw new EmptyQuestionArrayError("properties.questions is null");
  } else if (questions.length < 1) {
    throw new EmptyQuestionArrayError("properties.questions has length " + questions.length);
  }

  let returnRoute = () => {
    router.navigate('/(tabs)/myPain');
  }

  const onReview = currIndex >= questions.length;

  const answersByKey = (list: any[]) =>
    Object.fromEntries(questions.map((question, index) => [keyOf(question, index), list[index]]));

  const reviewFields: [string, string][] = review.fields(answersByKey(answers));

  const totalScore = questions.reduce((sum, question, index) => sum + scoreOf(question, answers[index]), 0);
  // sort review.score & only get the numbers
  const scoreRanges = Object.keys(review.score ?? {}).map(Number).sort((a, b) => a - b);
  // remove score texts where the score value is higher than totalScore, and get highest value out of it
  const rangeStart = scoreRanges.filter((lower) => lower <= totalScore).pop();
  const scoreDescription = rangeStart == null ? undefined : review.score?.[rangeStart];
  let scoreText: React.ReactNode;
  let scoreLink: { label: string; url: string } | undefined;
  // set score & link text 
  if (review.score != null && scoreDescription != null) {
    switch (title) {
      case "My Movement":
        scoreText = (
          <Text style={[theme.body, theme.fontOnSurface]}>
            Your answers indicate that <Text style={{fontWeight: 'bold'}}>{scoreDescription} </Text> 
            With the right support and treatment, your movement and mobility can improve.
          </Text>
        );
        break;
      case "Personal Care":
        scoreText = (
          <Text style={[theme.body, theme.fontOnSurface]}>
            Your answers indicate that <Text style={{fontWeight: 'bold'}}>{scoreDescription} </Text> 
             With the right support and treatment, these tasks can become more manageable over time.
          </Text>
        );
        break;
      case "My Social Health":
        scoreText = (
          <Text style={[theme.body, theme.fontOnSurface]}>
            Your answers indicate that <Text style={{fontWeight: 'bold'}}>{scoreDescription} </Text>
            With the right treatment and support, you can stay more active and connected.
          </Text>
        );
        break;
      default:
        scoreText = (
          <Text style={[theme.body, theme.fontOnSurface]}>N/A</Text>
        );
    }
    switch (title) {
      case "My Movement":
        scoreLink = { label: "Explore tips on managing movement", url: "https://muscha.org/exercise" };
        break;
      case "Personal Care":
        scoreLink = { label: "Explore tips on daily living", 
          url: "https://muscha.org/living-well-with-a-musculoskeletal-condition" };
        break;
      case "My Social Health":
        scoreLink = { label: "Explore tips on managing emotions", 
          url: "https://muscha.org/relaxation" };
        break;
    }
  }
  if (review.summary) {
    scoreText = (
      <Text style={[theme.body, theme.fontOnSurface]}>{review.summary(answersByKey(answers))}</Text>
    );
    scoreLink = { label: "Explore tips on managing pain", 
      url: "https://muscha.org" };
  }

  const goTo = (index: number) => {
    setQuestionError(null);
    setNumber(index);
  }

  const submitAnswer = (answer: any) => {
    const updated = [...answers];
    updated[currIndex] = answer;
    const problem = questions[currIndex].validate?.(answersByKey(updated));
    if (problem) {
      setQuestionError(problem);
      return;
    }
    setAnswers(updated);
    goTo(currIndex + 1);
  }

  // saves every answer at once, then leaves the assessment
  const submitAssessment = async () => {
    // stops a second press saving twice
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit?.(answersByKey(answers));
      returnRoute();
    } catch (saveError) {
      console.error("Failed to save the assessment", saveError);
      setError(apiErrorMessage(saveError, "Your answers could not be saved, please try again"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <Pressable
        style={styles.backButton}
        onPress={() => {
          if (currIndex == 0) {
            returnRoute();
          } else {
            goTo(currIndex - 1);
          }
        }}
        accessibilityRole="button"
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={28} color={colours.onBackground} />
        <Text style={[theme.h6, theme.fontOnBackground]}> Back</Text>
      </Pressable>
      <View style={[{flex: 1}, styles.footer]}>
        {onReview ? (
          <View style={{flex: 1}}>
            <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.reviewContent}>
              <View style={theme.header}>
                <Text style={[theme.h4, theme.leftText, theme.fontOnSurface]}>Review Your Answers</Text>
              </View>
              <View style={[theme.sectionContainer, {gap: 12, marginBottom: 30}]}>
                <View style={{width: '85%', alignSelf: 'center'}}>
                  <Text style={[theme.h4, theme.fontOnSurface]}>{review.title}</Text>
                  <Text style={[theme.body, theme.fontOnSurface]}>{review.period ?? ''}</Text>
                </View>
                <View style={[theme.line, review.score != null && {marginVertical: 12}]} />
                {scoreText != null && (
                  <>
                    <View style={{width: '85%', alignSelf: 'center'}}>
                      {scoreText}
                      {scoreLink && (
                        <View style={{alignSelf: 'flex-end', marginTop: 20}}>
                          <TextButton label={scoreLink.label} fontColour={colours.onSurface}
                            onPress={() => WebBrowser.openBrowserAsync(scoreLink.url)} />
                        </View>
                      )}
                    </View>
                    <View style={[theme.line, {marginVertical: 12}]} />
                  </>
                )}
                {reviewFields.map(([label, value]) => (
                  <View key={label} style={{width: '85%', alignSelf: 'center'}}>
                    <Text style={[theme.h6, theme.fontOnSurface]}>{label}</Text>
                    <Text style={[theme.body, theme.fontOnSurface]}>{value}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.submitButton}>
              {!!error && (
                <Text style={[theme.small, theme.centerText, styles.error, { color: paperColours.error, borderColor: paperColours.error }]}>
                  {error}
                </Text>
              )}
              <Button label={saving ? "Saving..." : "Submit"} onPress={submitAssessment} buttonType="roundButton" />
            </View>
          </View>
        ) : (
          <Question key={currIndex} {...questions[currIndex]}
          onSubmit={submitAnswer} progress={'Progress: ' + (currIndex+1) + '/' + questions.length}
          initialAnswer={answers[currIndex]} error={questionError} />
        )}
      </View>
    </SafeAreaView>
  )
}

function createStyles(colours: ColourSet) {
  return StyleSheet.create({
    footer: {
      paddingBottom: 83,
    },

    reviewContent: {
      paddingBottom: 80,
    },

    error: {
      alignSelf: 'stretch',
      marginBottom: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 15,
      backgroundColor: colours.background,
      overflow: 'hidden',
    },

    submitButton: {
      position: 'absolute',
      bottom: 10,
      width: '90%',
      alignSelf: 'center',
    },

    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
  });
}

export { Assessment, AssessmentProps };
/**
  abstract class Assessment {
  //The section in which certain questions are grouped within
  /* Contains:
  - A section title
  - A last updated date
  - A completion date
  - An array of Questions
  - A 'set question' function(?), setting question number and title
  - An add question function
  - A complete function - sets the date and sends off question answers to database(?)
  - Date completed
  - A StartQuestions function to begin the assessment.
  - A NextQuestion function to cycle to the next question.
  - A ShowSummary function 
  
  private readonly PLACEHOLDER_DATE = new Date("December 31, 1999");

  private title: Text;
  private lastUpdated: Date;
  private dateCompleted: Date;

  private questions: Question[];


  constructor(setTitle: Text);
  constructor(setTitle: Text, setQuestions?: Question[]) {
    this.title = setTitle;
    this.questions = [];
    if (setQuestions) {
      this.setQuestions(setQuestions);
    } 
    this.lastUpdated = this.PLACEHOLDER_DATE;
    this.dateCompleted = this.PLACEHOLDER_DATE;  
  }

  abstract setQuestions(newQuestions: Question[]): void;
  abstract addQuestion(newQuestion: Question, questionIndex: bigint): void;
  abstract addQuestions(newQuestions: Question[], startIndex: bigint): void;
  
  abstract startQuestions(): void;
  abstract nextQuestion(): void;
  abstract completeAssessment(): void; //Set date in here
  abstract showSummary(): void;
}

 */
