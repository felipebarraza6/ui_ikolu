import {
  showAggregatedControlCenter,
  showUmiPrototype,
  showFormMultiData,
  hideAnalysisNav,
} from "./userFlags";

describe("userFlags", () => {
  test("showAggregatedControlCenter uses API flag, ignores hardcoded id", () => {
    expect(showAggregatedControlCenter({ id: 34 })).toBe(false);
    expect(
      showAggregatedControlCenter({ id: 1, show_aggregated_control_center: true })
    ).toBe(true);
    expect(showAggregatedControlCenter(null)).toBe(false);
  });

  test("showUmiPrototype uses API flag, ignores username", () => {
    expect(showUmiPrototype({ username: "arrocerospti" })).toBe(false);
    expect(showUmiPrototype({ show_umi_prototype: true })).toBe(true);
  });

  test("showFormMultiData uses API flag, ignores demosmart username", () => {
    expect(showFormMultiData({ username: "demosmart" })).toBe(false);
    expect(showFormMultiData({ show_form_multi_data: true })).toBe(true);
  });

  test("hideAnalysisNav uses API flag", () => {
    expect(hideAnalysisNav({ username: "lecheriavalleverde" })).toBe(false);
    expect(hideAnalysisNav({ hide_analysis_nav: true })).toBe(true);
  });
});
