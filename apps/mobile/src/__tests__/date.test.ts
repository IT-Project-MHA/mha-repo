import { toApiDate, parseApiDate, formatDate } from "../../constants/date";

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