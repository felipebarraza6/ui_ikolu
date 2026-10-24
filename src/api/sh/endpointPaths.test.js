import {
  catchmentPointPath,
  interactionDetailJsonPath,
  monthXlsxPath,
  monthOverridePath,
} from "./endpointPaths";

describe("endpointPaths", () => {
  test("catchmentPointPath uses point id on catchment_point resource", () => {
    expect(catchmentPointPath(42)).toBe("catchment_point/42/");
  });

  test("interactionDetailJsonPath is for reading/record ids only", () => {
    expect(interactionDetailJsonPath(99)).toBe("interaction_detail_json/99/");
  });

  test("monthXlsxPath is relative (no hardcoded api.smarthydro.app host)", () => {
    const path = monthXlsxPath(7, "2026-03-15");
    expect(path).toBe(
      "interaction_detail_override_month_xlsx/?catchment_point=7&date_time_medition__month=03&date_time_medition__year=2026"
    );
    expect(path).not.toMatch(/https?:\/\//);
    expect(path).not.toMatch(/smarthydro\.app/);
  });

  test("monthOverridePath matches month filter for DGA/analysis monthly views", () => {
    expect(monthOverridePath(3, "2026-11-01")).toBe(
      "interaction_detail_override_month/?catchment_point=3&date_time_medition__month=11&date_time_medition__year=2026"
    );
  });
});
