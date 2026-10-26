import {
  toApiDate,
  parseApiDate,
  formatDate,
  formatShortDate,
  weekRangeLabel,
  daysBetween,
} from "../../constants/date";

describe("toApiDate", () => {
  test("formats a Date as YYYY-MM-DD with zero padding", () => {
    expect(toApiDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("parseApiDate", () => {
  test("gives local midnight on the same day", () => {
    const d = parseApiDate("2026-10-23");
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 23, 0]);
  });

  test("round trips with toApiDate", () => {
    expect(toApiDate(parseApiDate("2026-02-28"))).toBe("2026-02-28");
  });
});

describe("formatDate", () => {
  test("formats as day, short month and year", () => {
    expect(formatDate("2026-10-23")).toMatch(/^23\s+Oct\s+2026$/);
  });
});

describe("weekRangeLabel", () => {
  test("whole week inside one month shows the month once", () => {
    expect(weekRangeLabel("2026-02-02")).toBe("2-8 February");
  });

  test("week crossing a month shows both months", () => {
    expect(weekRangeLabel("2026-02-26")).toBe("26 February - 4 March");
  });
});

describe("formatShortDate", () => {
  test("day and short month by default", () => {
    expect(formatShortDate("2026-11-03")).toBe("3 Nov");
  });

  test("includes a two-digit year when asked", () => {
    expect(formatShortDate("2026-11-03", true)).toBe("3 Nov 26");
  });
});

describe("daysBetween", () => {
  test("counts whole days between two YYYY-MM-DD strings", () => {
    expect(daysBetween("2026-01-01", "2026-01-08")).toBe(7);
  });
});
