// pain values from the patient's most recent weekly assessments, filled into the suggested
// questions. A value is left out when no assessment has it
export type PainSummary = {
  locations: string[]; // pain locations of the most recent week that has them
  average?: number; // average pain over the 2 most recent weeks, or the 1 week if there's only 1
  worst?: number; // worst pain of the most recent week that has it
  mildest?: number; // mildest pain of the most recent week that has it
  current?: number; // current pain of the most recent week that has it
};

// used while the patient's values load, or when they can't be loaded
export const NO_PAIN_DATA: PainSummary = { locations: [] };

type SuggestedQuestion = {
  // the question, {placeholders} are filled from PainSummary: {locations}, {average}, {worst},
  // {mildest}. A question whose placeholder has no value isn't shown
  template: string;
  // shown only when this is true, for questions that need more than their placeholders
  showIf?: (pain: PainSummary) => boolean;
};

// suggested questions shown under each heading, a checkbox is made for each question
export const SUGGESTED_QUESTIONS: { key: string; heading: string; questions: SuggestedQuestion[] }[] = [
  {
    key: 'location',
    heading: 'Pain location',
    questions: [
      { template: 'What could be causing pain in my {locations}?' },
      {
        template: 'Are these areas related, or are they likely separate issues?',
        showIf: (pain) => pain.locations.length > 1,
      },
    ],
  },
  {
    key: 'intensity',
    heading: 'Pain intensity',
    questions: [
      { template: 'My average pain over the past two weeks has been around {average} — what does this indicate?' },
      {
        template: 'Even though I don’t have pain right now, I’ve had severe pain at times (up to {worst}). What could explain these flare-ups?',
        showIf: (pain) => pain.current === 0,
      },
      { template: 'Is it normal for pain to vary between mild ({mildest}) and very severe ({worst})?' },
      { template: 'What can I do to better manage days when the pain is high?' },
    ],
  },
  {
    key: 'impact',
    heading: 'Pain impact',
    questions: [
      { template: 'What treatments or therapies could help improve my mobility?' },
      { template: 'Would physiotherapy or a specific exercise program be appropriate for me?' },
      { template: 'Are there movements or activities I should avoid right now?' },
      { template: 'My pain is making it hard to take care of myself independently — what can we do to improve this?' },
      { template: 'Are there strategies, aids, or supports that could help with daily tasks?' },
      { template: 'Should we adjust my treatment plan given how much this is affecting my independence?' },
      { template: 'Is this level of impact typical for my condition?' },
      { template: 'What options are available to improve my quality of life?' },
    ],
  },
  {
    key: 'management',
    heading: 'Management',
    questions: [
      { template: 'Are there additional investigations or referrals that might help?' },
      { template: 'How can I prevent the pain from becoming severe again?' },
      { template: 'What are realistic goals for improving my function and independence?' },
    ],
  },
];

// any word inside {}
const PLACEHOLDER = /\{(\w+)\}/g;

// a list of words as written in a sentence, e.g. 'neck and knee', 'lower back, neck, and knee'
const listText = (items: string[]) => {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

// value filled into a placeholder, undefined when the patient has no value for it
const placeholderValue = (name: string, pain: PainSummary) => {
  if (name === 'locations') {
    return pain.locations.length > 0
      ? listText(pain.locations.map((location) => location.toLowerCase()))
      : undefined;
  }
  const value = pain[name as 'average' | 'worst' | 'mildest' | 'current'];
  return value === undefined ? undefined : String(value);
};

// the question with the patient's values filled in, or null when it shouldn't be shown
const fillQuestion = ({ template, showIf }: SuggestedQuestion, pain: PainSummary) => {
  if (showIf && !showIf(pain)) return null;
  let missing = false;
  const text = template.replace(PLACEHOLDER, (_, name: string) => {
    const value = placeholderValue(name, pain);
    if (value === undefined) missing = true;
    return value ?? '';
  });
  return missing ? null : text;
};

// matches a question's text with any values in place of its placeholders
const templatePattern = (template: string) =>
  new RegExp(
    `^${template
      .split(PLACEHOLDER)
      // split keeps the placeholder names at the odd places & skip regex special chars 
      .map((part, index) => (index % 2 ? '.+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      .join('')}$`,
  );

/**
 * Whether a question's text is one of the suggested questions, with any values in its
 * placeholders. A question saved before its suggestion's wording was changed doesn't match, so it is
 * shown with the questions written by the user instead.
 */
export const isSuggestedText = (text: string) =>
  SUGGESTED_QUESTIONS.some(({ questions }) =>
    questions.some(({ template }) => templatePattern(template).test(text)),
  );

/**
 * The suggested questions to show under each heading, filled in with the patient's pain values.
 * saved is the saved question whose text matches the suggestion, which keeps the text it was saved
 * with so its values don't change later. A question without the values it needs is left out, and so
 * is a heading with no questions. checkboxId only tells the checkboxes apart on the page, it isn't
 * saved, unlike a saved question's id.
 */
export const fillSuggestedQuestions = <T extends { text: string }>(
  pain: PainSummary,
  savedQuestions: T[] = [],
) =>
  SUGGESTED_QUESTIONS.map(({ key, heading, questions }) => ({
    key,
    heading,
    questions: questions
      .map((question, index) => {
        const pattern = templatePattern(question.template);
        const saved = savedQuestions.find((item) => pattern.test(item.text));
        return {
          checkboxId: `${key}${index + 1}`,
          text: saved?.text ?? fillQuestion(question, pain),
          saved,
        };
      })
      .filter(
        (question): question is { checkboxId: string; text: string; saved: T | undefined } =>
          question.text !== null,
      ),
    // remove headings with no questions
  })).filter(({ questions }) => questions.length > 0);
