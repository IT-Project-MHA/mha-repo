/** Unit tests for constants/resultDisplayText.ts.
 * Tests cover:
 *
 *  intensity texts:
 *    - null and undefined give Not available
 *    - Pain level <=0 returns no pain sentence
 *    - Pain level 1-3 returns mild pain sentence
 *    - Pain level 4-6 returns moderate pain sentence
 *    - Pain level 7-8 returns fairly severe pain sentence
 *    - Pain level 9 returns extremely severe sentence
 *    - worst bucket: 10 and above (final else)
 *  movementScore:
 *    - null: Not available
 *    - score text correctly chosen from boundaries (<=5 / <=10 / <=15 / else)
 *  personalCareScore:
 *    - null: Not available
 *    - score text correctly chosen from boundaries (<=3 / <=5 / <=10 / else)
 *  socialHealthScore:
 *    - null: Not available
 *    - score text correctly chosen from boundaries (<=10 / <=19 / <=30 / else)
 *  averageActivityHourText:
 *    - null: Not available
 *    - exactly 1 uses the singular 'hour'
 *    - every other value uses plural 'hours'
 *  medicationText:
 *    - empty / null / undefined: 'no medication' sentence
 *    - a value is embedded in the sentence
*/

import {
  NA,
  assessmentPainIntensityText,
  currentPainIntensityText,
  averagePainIntensityText,
  worstPainIntensityText,
  mildestPainIntensityText,
  moodIntensityText,
  relationshipsIntensityText,
  enjoymentIntensityText,
  movementScore,
  personalCareScore,
  socialHealthScore,
  averageActivityHourText,
  medicationText,
} from "../../../constants/resultDisplayText";

// the intensity texts share same categories for the same values
type Buckets = {
  none: string;             // 0
  mild: string;             // 1-3
  moderate: string;         // 4-6
  fairlySevere: string;     // 7-8
  extremelySevere: string;  // 9
  worst: string;            // 10
};

const sharedShape: Array<[string, (v: number | null | undefined) => string, Buckets]> = [
  [
    "assessmentPainIntensityText",
    assessmentPainIntensityText,
    {
      none: "I have no pain at all",
      mild: "The pain is very mild",
      moderate: "The pain is moderate",
      fairlySevere: "The pain is fairly severe",
      extremelySevere: "The pain is extremely severe",
      worst: "The pain is the worst imaginable",
    },
  ],
  [
    "currentPainIntensityText",
    currentPainIntensityText,
    {
      none: "I do not have pain at the moment.",
      mild: "My current pain is very mild.",
      moderate: "My current pain is moderate.",
      fairlySevere: "My current pain is fairly severe.",
      extremelySevere: "My current pain is extremely severe.",
      worst: "My current pain is the worst imaginable.",
    },
  ],
  [
    "averagePainIntensityText",
    averagePainIntensityText,
    {
      none: "I have had no pain overall",
      mild: "I have had mild pain most days",
      moderate: "I have had moderate pain most days",
      fairlySevere: "I have had fairly severe pain most days",
      extremelySevere: "I have had extremely severe pain most days",
      worst: "I have had the worst imaginable pain most days",
    },
  ],
  [
    "worstPainIntensityText",
    worstPainIntensityText,
    {
      none: "I have had no pain",
      mild: "My worst pain was very mild.",
      moderate: "My worst pain was moderate.",
      fairlySevere: "My worst pain was fairly severe.",
      extremelySevere: "My worst pain was extremely severe.",
      worst: "My worst pain was the worst imaginable.",
    },
  ],
  [
    "mildestPainIntensityText",
    mildestPainIntensityText,
    {
      none: "I have had no pain",
      mild: "My mildest pain was very mild.",
      moderate: "My mildest pain was moderate.",
      fairlySevere: "My mildest pain was fairly severe.",
      extremelySevere: "My mildest pain was extremely severe.",
      worst: "My mildest pain was the worst imaginable.",
    },
  ],
  [
    "moodIntensityText",
    moodIntensityText,
    {
      none: "Pain does not impact my mood at all",
      mild: "Pain slightly affects my mood",
      moderate: "Pain moderately affects my mood",
      fairlySevere: "Pain substantially affects my mood",
      extremelySevere: "Pain extremely affects my mood",
      worst: "Pain completely impacts my mood",
    },
  ],
  [
    "relationshipsIntensityText",
    relationshipsIntensityText,
    {
      none: "Pain does not interfere with my relationships with others",
      mild: "Pain slightly interferes my relationships with others",
      moderate: "Pain moderately interferes my relationships with others",
      fairlySevere: "Pain substantially interferes my relationships with others",
      extremelySevere: "Pain extremely interferes my relationships with others",
      worst: "Pain completely interferes with my relationships with others",
    },
  ],
  [
    "enjoymentIntensityText",
    enjoymentIntensityText,
    {
      none: "Pain does not impact my ability to enjoy life",
      mild: "Pain slightly impacts my ability to enjoy life",
      moderate: "Pain moderately impacts my ability to enjoy life",
      fairlySevere: "Pain substantially impacts my ability to enjoy life",
      extremelySevere: "Pain extremely impacts my ability to enjoy life",
      worst: "Pain completely prevents me from enjoying life",
    },
  ],
];

// tests input (severity score) boundaries
// uses 1 test for every display text that shares the format of sharedShape
describe.each(sharedShape)("%s", (_name, fn, e) => {
  test("null and undefined give Not available", () => {
    expect(fn(null)).toBe(NA);
    expect(fn(undefined)).toBe(NA);
  });

  test("Pain level <=0 returns no pain sentence", () => {
    expect(fn(-1)).toBe(e.none); // will be rejected at backend
    expect(fn(0)).toBe(e.none);
  });

  test("Pain level 1-3 returns mild pain sentence", () => {
    expect(fn(1)).toBe(e.mild);
    expect(fn(3)).toBe(e.mild);
  });

  test("Pain level 4-6 returns moderate pain sentence", () => {
    expect(fn(4)).toBe(e.moderate);
    expect(fn(6)).toBe(e.moderate); 
  });

  test("Pain level 7-8 returns fairly severe pain sentence", () => {
    expect(fn(7)).toBe(e.fairlySevere);
    expect(fn(8)).toBe(e.fairlySevere); 
  });

  test("Pain level 9 returns extremely severe sentence", () => {
    expect(fn(9)).toBe(e.extremelySevere);
  });

  test("worst bucket: 10 and above (final else)", () => {
    expect(fn(10)).toBe(e.worst);
    expect(fn(11)).toBe(e.worst); // will be rejected at backend
  });
});

// assessment section scores text
describe("movementScore ", () => {
  test("null: Not available", () => {
    expect(movementScore(null)).toBe(NA);
  });
  test("score text correctly chosen from boundaries (<=5 / <=10 / <=15 / else)", () => {
    expect(movementScore(5)).toBe("pain does not really impact your movement.");
    expect(movementScore(6)).toBe("pain mildly impacts your movement.");
    expect(movementScore(10)).toBe("pain mildly impacts your movement.");
    expect(movementScore(11)).toBe("pain moderately impacts your movement.");
    expect(movementScore(15)).toBe("pain moderately impacts your movement.");
    expect(movementScore(16)).toBe("pain significantly impacts your movement.");
  });
});

describe("personalCareScore", () => {
  test("null: Not available", () => {
    expect(personalCareScore(null)).toBe(NA);
  });
  test("score text correctly chosen from boundaries (<=3 / <=5 / <=10 / else)", () => {
    expect(personalCareScore(3)).toBe("pain does not really impact your personal care.");
    expect(personalCareScore(4)).toBe("pain mildly impacts your personal care.");
    expect(personalCareScore(5)).toBe("pain mildly impacts your personal care.");
    expect(personalCareScore(6)).toBe("pain moderately impacts your personal care.");
    expect(personalCareScore(10)).toBe("pain moderately impacts your personal care.");
    expect(personalCareScore(11)).toBe("pain significantly impacts your personal care.");
  });
});

describe("socialHealthScore", () => {
  test("null: Not available", () => {
    expect(socialHealthScore(null)).toBe(NA);
  });
  test("score text correctly chosen from boundaries (<=10 / <=19 / <=30 / else)", () => {
    expect(socialHealthScore(10)).toBe("pain does not really impact your social health.");
    expect(socialHealthScore(11)).toBe("pain mildly impacts your social health");
    expect(socialHealthScore(19)).toBe("pain mildly impacts your social health");
    expect(socialHealthScore(20)).toBe("pain moderately impacts your social health.");
    expect(socialHealthScore(30)).toBe("pain moderately impacts your social health.");
    expect(socialHealthScore(31)).toBe("pain significantly impacts your social health.");
  });
});

describe("averageActivityHourText", () => {
  test("null: Not available", () => {
    expect(averageActivityHourText(null)).toBe(NA);
  });
  test("exactly 1 uses the singular 'hour'", () => {
    expect(averageActivityHourText(1)).toBe(
      "Last week, I was able to stay active for approximately 1 hour"
    );
  });
  test("every other value uses plural 'hours'", () => {
    expect(averageActivityHourText(0)).toBe(
      "Last week, I was able to stay active for approximately 0 hours"
    );
  });
});

describe("medicationText", () => {
  test("empty / null / undefined: 'no medication' sentence", () => {
    const none = "You did not consume any medication this week";
    expect(medicationText("")).toBe(none);
    expect(medicationText(null)).toBe(none);
    expect(medicationText(undefined)).toBe(none);
  });
  test("a value is embedded in the sentence", () => {
    expect(medicationText("Panadol")).toBe("You consumed Panadol this week.");
  });
});
