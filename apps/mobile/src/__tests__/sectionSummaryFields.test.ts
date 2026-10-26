// Unit tests for sectionSummaryFields logic in assessmentSectionSummary tab in myHealth
// tests the 5 possible summaries for each section, and for valid/missing data
import { na, withNum, titles, fieldsFor } from "../healthInfo/sectionSummaryFields";

describe("na", () => {
  test("falls back to 'Not available' for empty/null/undefined", () => {
    expect(na("")).toBe("Not available");
    expect(na(null)).toBe("Not available");
    expect(na(undefined)).toBe("Not available");
  });
  test("passes a real value through unchanged", () => {
    expect(na("Lower back")).toBe("Lower back");
  });
});

describe("withNum", () => {
  test("omits the suffix when the number is null/undefined", () => {
    expect(withNum("Worst pain", null)).toBe("Worst pain");
    expect(withNum("Worst pain", undefined)).toBe("Worst pain");
  });
  test("appends the number when present - including 0", () => {
    expect(withNum("Worst pain", 7)).toBe("Worst pain: 7");
    expect(withNum("Worst pain", 0)).toBe("Worst pain: 0");
  });
});

describe("titles", () => {
  test("maps each known section key to its heading", () => {
    expect(titles.my_pain).toBe("My Pain");
    expect(titles.my_movement).toBe("Impacts to Movement");
    expect(titles.personal_care).toBe("Impacts to Personal Care");
    expect(titles.social_health).toBe("Impacts to Social health");
    expect(titles.management).toBe("My Current Management");
  });
  test("has no entry for an unknown key (screen falls back to 'Assessment')", () => {
    expect(titles["Unknown section"]).toBeUndefined();
  });
});

describe("fieldsFor", () => {
  test("returns [] when there is no data yet", () => {
    expect(fieldsFor("my_pain", null)).toEqual([]);
    expect(fieldsFor("unknown_section", undefined)).toEqual([]);
  });

  test("returns [] for an unknown / missing section key", () => {
    expect(fieldsFor("not_a_section", { data: 1 })).toEqual([]);
    expect(fieldsFor(undefined, { anything: 1 })).toEqual([]);
  });

  // The backend validates sections so that every field is answered so don't check
  // partially filled states

  // only My Pain section has numbers in the data headings
  test("my_pain: filled shows correct display text", () => {
    const rows = fieldsFor("my_pain", {
      location: "Lower back",
      current: 7,
      average: 5,
      worst: 9,
      mildest: 2,
      characteristics: "Aching",
    });
    expect(rows).toEqual([
      ["My Pain location", "Lower back"],
      ["My Current pain: 7", "My current pain is fairly severe."],
      ["Average pain (2 weeks): 5", "I have had moderate pain most days"],
      ["Worst pain: 9", "My worst pain was extremely severe."],
      ["Mildest pain: 2", "My mildest pain was very mild."],
      ["Pain characteristics", "Aching"],
    ]);
  });

  test("my_pain: empty shows NA text", () => {
    const rows = fieldsFor("my_pain", {
      location: "",
      current: null,
      average: null,
      worst: null,
      mildest: null,
      characteristics: "",
    });
    expect(rows).toEqual([
      ["My Pain location", "Not available"],
      ["My Current pain", "Not available"],
      ["Average pain (2 weeks)", "Not available"],
      ["Worst pain", "Not available"],
      ["Mildest pain", "Not available"],
      ["Pain characteristics", "Not available"],
    ]);
  });

  test("my_movement: filled shows correct display text", () => {
    const rows = fieldsFor("my_movement", {
      activeHours: 2,
      general: "I walk more slowly than usual because of my pain, I sit down most of the day because of my pain",
      walking: "Pain prevents me from walking more than 1 kilometre",
      lifting: "I can lift heavy weights but it gives extra pain",
      sitting: "Pain prevents me sitting more than one hour",
      standing: "Pain prevents me standing more than 30 minutes",
    });
    expect(rows).toEqual([
      ["Average activity hour", "Last week, I was able to stay active for approximately 2 hours"],
      ["General Movement", "I walk more slowly than usual because of my pain, I sit down most of the day because of my pain"],
      ["Walking", "Pain prevents me from walking more than 1 kilometre"],
      ["Lifting", "I can lift heavy weights but it gives extra pain"],
      ["Sitting", "Pain prevents me sitting more than one hour"],
      ["Standing", "Pain prevents me standing more than 30 minutes"],
    ]);
  });

  test("my_movement: empty shows NA text", () => {
    const rows = fieldsFor("my_movement", {
      activeHours: null,
      general: "",
      walking: "",
      lifting: "",
      sitting: "",
      standing: "",
    });
    expect(rows).toEqual([
      ["Average activity hour", "Not available"],
      ["General Movement", "Not available"],
      ["Walking", "Not available"],
      ["Lifting", "Not available"],
      ["Sitting", "Not available"],
      ["Standing", "Not available"],
    ]);
  });

  test("personal_care: filled shows correct display text", () => {
    const rows = fieldsFor("personal_care", {
      general: "I sleep less well because of my pain",
      personalCare: "I can look after myself normally but it causes extra pain",
      sleeping: "My sleep is occasionally disturbed by pain",
    });
    expect(rows).toEqual([
      ["General Activities", "I sleep less well because of my pain"],
      ["Personal care (washing, dressing, etc)", "I can look after myself normally but it causes extra pain"],
      ["Sleeping", "My sleep is occasionally disturbed by pain"],
    ]);
  });

  test("personal_care: empty shows NA text", () => {
    const rows = fieldsFor("personal_care", {
      general: "",
      personalCare: "",
      sleeping: "",
    });
    expect(rows).toEqual([
      ["General Activities", "Not available"],
      ["Personal care (washing, dressing, etc)", "Not available"],
      ["Sleeping", "Not available"],
    ]);
  });

  test("social_health: filled shows correct display text", () => {
    const rows = fieldsFor("social_health", {
      socialLife: "My social life is normal but increases the degree of pain",
      travelling: "I can travel anywhere but it gives me extra pain",
      mood: 4,
      relationships: 5,
      enjoyment: 10,
    });
    expect(rows).toEqual([
      ["Social life", "My social life is normal but increases the degree of pain"],
      ["Travelling", "I can travel anywhere but it gives me extra pain"],
      ["Mood", "Pain moderately affects my mood"],
      ["Relation with others", "Pain moderately interferes my relationships with others"],
      ["Enjoyment of life", "Pain completely prevents me from enjoying life"],
    ]);
  });

  test("social_health: empty shows NA text", () => {
    const rows = fieldsFor("social_health", {
      socialLife: "",
      travelling: "",
      mood: null,
      relationships: null,
      enjoyment: null,
    });
    expect(rows).toEqual([
      ["Social life", "Not available"],
      ["Travelling", "Not available"],
      ["Mood", "Not available"],
      ["Relation with others", "Not available"],
      ["Enjoyment of life", "Not available"],
    ]);
  });

  test("management: filled shows correct display text", () => {
    const rows = fieldsFor("management", {
      medication: "Panadol",
      exercise: "Every day",
      emotion: "Meditation",
    });
    expect(rows).toEqual([
      ["Medication", "You consumed Panadol this week."],
      ["Exercise", "Every day"],
      ["Emotion", "Meditation"],
    ]);
  });

  test("management: empty - dedicated fallback sentences, not generic 'Not available'", () => {
    const rows = fieldsFor("management", {
      medication: "",
      exercise: "",
      emotion: "",
    });
    expect(rows).toEqual([
      ["Medication", "You did not consume any medication this week"],
      ["Exercise", "Not available"],
      ["Emotion", "You did not perform any dedicated strategy to manage your mood."],
    ]);
  });
});
