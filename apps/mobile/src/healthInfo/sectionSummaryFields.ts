// View-model logic for the Assessment Section Summary screen.
import {
  averageActivityHourText,
  averagePainIntensityText,
  currentPainIntensityText,
  enjoymentIntensityText,
  medicationText,
  mildestPainIntensityText,
  moodIntensityText,
  relationshipsIntensityText,
  worstPainIntensityText,
} from "../../constants/resultDisplayText";

export const na = (v?: string | null) => v || "Not available";

// Appends the raw number to a label for number-input fields, e.g. 'My Current pain: 7'
export const withNum = (label: string, n: number | null | undefined) =>
  n == null ? label : `${label}: ${n}`;

// Heading shown for each section key
export const titles: Record<string, string> = {
  my_pain: "My Pain",
  my_movement: "Impacts to Movement",
  personal_care: "Impacts to Personal Care",
  social_health: "Impacts to Social health",
  management: "My Current Management",
};

/**
 * Builds the ordered [label, value] rows for a section's summary card.
 * - returns [] when there is no data yet, or the section key is unknown.
 * - numeric fields are routed through the resultDisplayText helpers; text fields through na().
 */
export const fieldsFor = (
  section: string | undefined,
  data: any
): [string, string][] => {
  if (!data) return [];
  switch (section) {
    case "my_pain":
      return [
        ["My Pain location", na(data.location)],
        [withNum("My Current pain", data.current), currentPainIntensityText(data.current)],
        [withNum("Average pain (2 weeks)", data.average), averagePainIntensityText(data.average)],
        [withNum("Worst pain", data.worst), worstPainIntensityText(data.worst)],
        [withNum("Mildest pain", data.mildest), mildestPainIntensityText(data.mildest)],
        ["Pain characteristics", na(data.characteristics)],
      ];
    case "my_movement":
      return [
        ["Average activity hour", averageActivityHourText(data.activeHours)],
        ["General Movement", na(data.general)],
        ["Walking", na(data.walking)],
        ["Lifting", na(data.lifting)],
        ["Sitting", na(data.sitting)],
        ["Standing", na(data.standing)],
      ];
    case "personal_care":
      return [
        ["General Activities", na(data.general)],
        ["Personal care (washing, dressing, etc)", na(data.personalCare)],
        ["Sleeping", na(data.sleeping)],
      ];
    case "social_health":
      return [
        ["Social life", na(data.socialLife)],
        ["Travelling", na(data.travelling)],
        ["Mood", moodIntensityText(data.mood)],
        ["Relation with others", relationshipsIntensityText(data.relationships)],
        ["Enjoyment of life", enjoymentIntensityText(data.enjoyment)],
      ];
    case "management":
      return [
        ["Medication", medicationText(data.medication)],
        ["Exercise", na(data.exercise)],
        [
          "Emotion",
          data.emotion || "You did not perform any dedicated strategy to manage your mood.",
        ],
      ];
    default:
      return [];
  }
};
