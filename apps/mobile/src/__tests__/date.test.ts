import { toApiDate } from "../../constants/date";

describe("toApiDate", () => {
  test("formats a Date as YYYY-MM-DD with zero padding", () => {
    expect(toApiDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
