// suggested questions shown under each heading, a checkbox is made for each question
export const SUGGESTED_QUESTIONS: { key: string; heading: string; questions: string[] }[] = [
  {
    key: 'location',
    heading: 'Pain location',
    questions: [
      'What could be causing pain in my lower back, neck, and knee?',
      'Are these areas related, or are they likely separate issues?',
    ],
  },
  {
    key: 'intensity',
    heading: 'Pain intensity',
    questions: [
      'My average pain over the past two weeks has been around 7 — what does this indicate?',
      'Even though I don’t have pain right now, I’ve had severe pain at times (up to 9). What could explain these flare-ups?',
      'Is it normal for pain to vary between mild (2) and very severe (9)?',
      'What can I do to better manage days when the pain is high?',
    ],
  },
  {
    key: 'impact',
    heading: 'Pain impact',
    questions: [
      'What treatments or therapies could help improve my mobility?',
      'Would physiotherapy or a specific exercise program be appropriate for me?',
      'Are there movements or activities I should avoid right now?',
      'My pain is making it hard to take care of myself independently — what can we do to improve this?',
      'Are there strategies, aids, or supports that could help with daily tasks?',
      'Should we adjust my treatment plan given how much this is affecting my independence?',
      'Is this level of impact typical for my condition?',
      'What options are available to improve my quality of life?'
    ],
  },
  {
    key: 'management',
    heading: 'Management',
    questions: [
      'Are there additional investigations or referrals that might help?',
      'How can I prevent the pain from becoming severe again?',
      'What are realistic goals for improving my function and independence?'
    ],
  },
];

//  a suggested question's checkbox id is its category key and number, e.g. 'location1'
export const suggestedId = (key: string, index: number) => `${key}${index + 1}`;
