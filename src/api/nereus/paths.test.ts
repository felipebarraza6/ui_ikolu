import {
  catchmentPointPath,
  interactionDetailJsonPath,
  monthOverridePath,
  monthXlsxPath,
} from "./paths";

describe("endpointPaths", () => {
  test("catchmentPointPath vive bajo ik/", () => {
    expect(catchmentPointPath(42)).toBe("ik/catchment_point/42/");
  });

  test("interactionDetailJsonPath es el recurso de la lectura", () => {
    expect(interactionDetailJsonPath(99)).toBe("ik/interaction_detail_json/99/");
  });

  test("monthXlsxPath es relativo y no fija un host", () => {
    const path = monthXlsxPath(7, "2026-03-15");
    expect(path).toBe(
      "ik/interaction_detail_override_month_xlsx/?catchment_point=7&date_time_medition__month=03&date_time_medition__year=2026"
    );
    expect(path).not.toMatch(/https?:\/\//);
    expect(path).not.toMatch(/smarthydro\.app/);
  });

  test("monthOverridePath filtra el mes del punto", () => {
    expect(monthOverridePath(3, "2026-11-01")).toBe(
      "ik/interaction_detail_override_month/?catchment_point=3&date_time_medition__month=11&date_time_medition__year=2026"
    );
  });
});
