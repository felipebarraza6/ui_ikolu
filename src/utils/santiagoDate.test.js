import { formatDateSantiago } from "./santiagoDate";

describe("formatDateSantiago", () => {
  test("returns null for empty input", () => {
    expect(formatDateSantiago(null)).toBeNull();
    expect(formatDateSantiago(undefined)).toBeNull();
  });

  test("keeps local Chile calendar day after 21:00 (UTC would roll to next day)", () => {
    // 2026-03-15 22:30 America/Santiago = 2026-03-16 01:30 UTC
    const lateEveningChile = new Date("2026-03-16T01:30:00.000Z");
    expect(lateEveningChile.toISOString().split("T")[0]).toBe("2026-03-16");
    expect(formatDateSantiago(lateEveningChile)).toBe("2026-03-15");
  });

  test("formats a plain calendar date string as YYYY-MM-DD", () => {
    expect(formatDateSantiago("2026-06-01")).toBe("2026-06-01");
  });
});
