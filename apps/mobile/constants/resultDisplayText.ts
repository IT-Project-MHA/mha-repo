/* Stores all the display text for assessment question values. 
E.g. if worst pain is 4, the display text is "The pain is moderate."
 */

export const NA = 'Not available';

// ------------ My Pain ------------

// --- pain intensity ---

export const assessmentPainIntensityText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 0) return 'I have no pain at all';
  if (value <= 3) return 'The pain is very mild';
  if (value <= 6) return 'The pain is moderate';
  if (value <= 8) return 'The pain is fairly severe';
  if (value <= 9) return 'The pain is extremely severe';
  return 'The pain is the worst imaginable';
};

export const currentPainIntensityText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 0) return 'I do not have pain at the moment.';
  if (value <= 3) return 'My current pain is very mild.';
  if (value <= 6) return 'My current pain is moderate.';
  if (value <= 8) return 'My current pain is fairly severe.';
  if (value <= 9) return 'My current pain is extremely severe.';
  return 'My current pain is the worst imaginable.';
};

export const averagePainIntensityText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 0) return 'I have had no pain overall';
  if (value <= 3) return 'I have had mild pain most days';
  if (value <= 6) return 'I have had moderate pain most days';
  if (value <= 8) return 'I have had fairly severe pain most days';
  if (value <= 9) return 'I have had extremely severe pain most days';
  return 'I have had the worst imaginable pain most days';
};

export const worstPainIntensityText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 0) return 'I have had no pain';
  if (value <= 3) return 'My worst pain was very mild.';
  if (value <= 6) return 'My worst pain was moderate.';
  if (value <= 8) return 'My worst pain was fairly severe.';
  if (value <= 9) return 'My worst pain was extremely severe.';
  return 'My worst pain was the worst imaginable.';
};

export const mildestPainIntensityText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 0) return 'I have had no pain';
  if (value <= 3) return 'My mildest pain was very mild.';
  if (value <= 6) return 'My mildest pain was moderate.';
  if (value <= 8) return 'My mildest pain was fairly severe.';
  if (value <= 9) return 'My mildest pain was extremely severe.';
  return 'My mildest pain was the worst imaginable.';
};

// ------------ My Movement ------------

export const averageActivityHourText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  const unit = value === 1 ? 'hour' : 'hours';
  return `Last week, I was able to stay active for approximately ${value} ${unit}`;
};

export const movementScore = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 5) return 'pain does not really impact your movement.';
  if (value <= 10) return 'pain mildly impacts your movement.';
  if (value <= 15) return 'pain moderately impacts your movement.';
  return 'pain significantly impacts your movement.';
};

// ------------ My Personal Care ------------

export const personalCareScore = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 3) return 'pain does not really impact your personal care.';
  if (value <= 5) return 'pain mildly impacts your personal care.';
  if (value <= 10) return 'pain moderately impacts your personal care.';
  return 'pain significantly impacts your personal care.';
};

// ------------ My Social Health ------------

// --- mood ---

export const moodIntensityText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 0) return 'Pain does not impact my mood at all';
  if (value <= 3) return 'Pain slightly affects my mood';
  if (value <= 6) return 'Pain moderately affects my mood';
  if (value <= 8) return 'Pain substantially affects my mood';
  if (value <= 9) return 'Pain extremely affects my mood';
  return 'Pain completely impacts my mood';
};

// --- relationships with others ---

export const relationshipsIntensityText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 0) return 'Pain does not interfere with my relationships with others';
  if (value <= 3) return 'Pain slightly interferes my relationships with others';
  if (value <= 6) return 'Pain moderately interferes my relationships with others';
  if (value <= 8) return 'Pain substantially interferes my relationships with others';
  if (value <= 9) return 'Pain extremely interferes my relationships with others';
  return 'Pain completely interferes with my relationships with others';
};

// --- enjoyment of life ---

export const enjoymentIntensityText = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 0) return 'Pain does not impact my ability to enjoy life';
  if (value <= 3) return 'Pain slightly impacts my ability to enjoy life';
  if (value <= 6) return 'Pain moderately impacts my ability to enjoy life';
  if (value <= 8) return 'Pain substantially impacts my ability to enjoy life';
  if (value <= 9) return 'Pain extremely impacts my ability to enjoy life';
  return 'Pain completely prevents me from enjoying life';
};

// --- social health score ---

export const socialHealthScore = (value: number | null | undefined): string=> {
    if (value == null) return NA;
  if (value <= 10) return 'pain does not really impact your social health.';
  if (value <= 19) return 'pain mildly impacts your social health';
  if (value <= 30) return 'pain moderately impacts your social health.';
  return 'pain significantly impacts your social health.';
};

// ------------ My Management ------------

export const medicationText = (value: string | null | undefined): string=> {
  if (!value) return 'You did not consume any medication this week';
  return `You consumed ${value} this week.`;
};