const CORPORATE_BLUE = "#203562";
const CORPORATE_BLUE_LIGHT = "#3A68AA";
const CORPORATE_BLUE_MID = "#4D7FBD";
const CORPORATE_BLUE_BRIGHT = "#1976d2";

const ACCENT_YELLOW_GREEN = "#CCCF07";

const BACKGROUND_LIGHT = "#F0EFF4";
const BORDER_LIGHT = "#E8E8E8";

const GREY_TEXT = "#8C8C8C";
const GREY_TEXT_MID = "#595959";
const GREY_TEXT_LIGHT = "#BFBFBF";
const GREY_TEXT_DISABLED = "#BDBDBD";

const BLUE_TINT = "#EBF0F8";
const BLUE_BG = "#F0F5FF";
const RED_BG = "#FEF2F2";
const GREEN_TEXT = "#69812A";
const GREEN_DARK_TEXT = "#5A7024";

export const createIkoluTheme = (algorithm = null) => ({
  algorithm,
  token: {
    colorPrimary: CORPORATE_BLUE,
    colorLink: CORPORATE_BLUE,
    colorLinkHover: CORPORATE_BLUE_LIGHT,
    colorLinkActive: CORPORATE_BLUE,
    colorSuccess: "#69812A",
    colorWarning: "#CCCF07",
    colorError: "#DC2626",
    colorInfo: "#3A68AA",
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
  },
  components: {
    Button: {
      colorPrimary: CORPORATE_BLUE,
    },
    Card: {
      borderRadiusLG: 16,
      borderRadius: 12,
    },
    Layout: {
      colorBgHeader: CORPORATE_BLUE,
    },
    Table: {
      headerBg: CORPORATE_BLUE,
      headerColor: "white",
      headerSortActiveBg: CORPORATE_BLUE,
      headerSortHoverBg: CORPORATE_BLUE_LIGHT,
      headerBgDark: "#1A2A4A",
      headerColorDark: "#fff",
    },
    Progress: {
      defaultColor: CORPORATE_BLUE,
    },
    Menu: {
      darkItemBg: CORPORATE_BLUE,
      darkSubMenuItemBg: "#16264a",
      darkItemSelectedBg: "rgba(255,255,255,0.15)",
    },
  },
});

export const ikoluTheme = createIkoluTheme();

export const ikoluTokens = {
  colorCorporateBlue: CORPORATE_BLUE,
  colorSuccess: "#69812A",
  colorWarning: "#CCCF07",
  colorError: "#DC2626",
  colorInfo: "#3A68AA",
  colorText: "rgba(0, 0, 0, 0.88)",
  colorTextSecondary: GREY_TEXT,
  colorBgLayout: "#f5f5f5",
  colorBgContainer: "#ffffff",
  colorCorporateBlueLight: CORPORATE_BLUE_LIGHT,
  colorCorporateBlueMid: CORPORATE_BLUE_MID,
  colorCorporateBlueBright: CORPORATE_BLUE_BRIGHT,
  colorAccentYellowGreen: ACCENT_YELLOW_GREEN,
  colorBackgroundLight: BACKGROUND_LIGHT,
  colorBorderLight: BORDER_LIGHT,
  colorGreyText: GREY_TEXT,
  colorGreyTextMid: GREY_TEXT_MID,
  colorGreyTextLight: GREY_TEXT_LIGHT,
  colorGreyTextDisabled: GREY_TEXT_DISABLED,
  colorBlueTint: BLUE_TINT,
  colorBlueBg: BLUE_BG,
  colorRedBg: RED_BG,
  colorGreenText: GREEN_TEXT,
  colorGreenDarkText: GREEN_DARK_TEXT,
  colorWhite: "#ffffff",
  colorBlack: "#000000",
  shadowCard: "0 4px 12px rgba(32, 53, 98, 0.08)",
  shadowCardHover: "0 8px 24px rgba(32, 53, 98, 0.12)",
  shadowNav: "0 -2px 8px rgba(0, 0, 0, 0.06)",
  shadowPrimary: "0 2px 6px rgba(32, 53, 98, 0.25)",
  radiusXS: 4,
  radiusSmall: 6,
  radiusDefault: 8,
  radiusLarge: 12,
  radiusXL: 16,
  fontSizeSmall: 11,
  fontSizeBase: 12,
  fontSizeMid: 13,
  fontSizeLarge: 14,
  fontSizeXL: 16,
  fontSize2XL: 18,
  fontSize3XL: 22,
  fontSize4XL: 24,
};

export const kpiGradients = {
  primary: `linear-gradient(135deg, ${CORPORATE_BLUE} 0%, ${CORPORATE_BLUE_LIGHT} 100%)`,
  secondary: `linear-gradient(135deg, ${CORPORATE_BLUE_LIGHT} 0%, ${CORPORATE_BLUE_MID} 100%)`,
  info: `linear-gradient(135deg, ${CORPORATE_BLUE_BRIGHT} 0%, #42a5f5 100%)`,
  accent: `linear-gradient(135deg, ${ACCENT_YELLOW_GREEN} 0%, #BDC00C 100%)`,
};

export const styles = {
  cardHeaderFlex: { display: "flex", alignItems: "center", gap: 8 },
  textCenterBlock: { textAlign: "center", display: "block" },
  centerFlex: { display: "flex", alignItems: "center", justifyContent: "center" },
  spaceBetweenFlex: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  absoluteBottomSvg: { position: "absolute", left: 0, bottom: 0, zIndex: 1 },
};

export const CHART_COLORS = {
  primary: CORPORATE_BLUE,
  primaryLight: CORPORATE_BLUE_LIGHT,
  primaryMid: CORPORATE_BLUE_MID,
  success: "#69812A",
  warning: "#CCCF07",
  error: "#DC2626",
  info: "#3A68AA",
  orange: "#fa8c16",
  purple: "#722ed1",
  cyan: "#13c2c2",
  pink: "#eb2f96",
  lime: "#a0d911",
  volcano: "#fa541c",
  geekblue: "#2f54eb",
  magenta: "#eb2f96",
  gold: "#faad14",
};

export const CHART_CONFIG = {
  line: {
    lineWidth: 2,
    point: { size: 2, state: { active: { size: 5 } } },
    area: { style: { fillOpacity: 0.1 } },
    animation: { appear: { animation: "fade-in", duration: 400 } },
  },
  grid: {
    line: { style: { stroke: "rgba(0, 0, 0, 0.08)", lineDash: [4, 4] } },
  },
  tooltip: {
    domStyles: {
      "g2-tooltip": {
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        padding: "12px",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
      },
    },
  },
  axis: {
    gridLine: {
      line: { style: { stroke: "rgba(0, 0, 0, 0.06)", lineDash: [4, 4] } },
    },
  },
};
