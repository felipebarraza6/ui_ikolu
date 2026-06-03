// Ocean Theme - Ultra Modern Water/Fluid Design
const OCEAN_DEEP = "#0A2540";
const OCEAN_BLUE = "#0077B6";
const OCEAN_CYAN = "#00B4D8";
const OCEAN_LIGHT = "#90E0EF";
const OCEAN_TEAL = "#2A9D8F";
const OCEAN_CORAL = "#F4A261";
const OCEAN_WARM = "#E76F51";

const BACKGROUND_DEEP = "#050A14";
const SURFACE_LIGHT = "rgba(255, 255, 255, 0.03)";
const BORDER_GLASS = "rgba(255, 255, 255, 0.08)";

export const createIkoluTheme = (algorithm = null) => ({
  algorithm,
  token: {
    colorPrimary: OCEAN_CYAN,
    colorLink: OCEAN_CYAN,
    colorLinkHover: OCEAN_LIGHT,
    colorLinkActive: OCEAN_BLUE,
    colorSuccess: OCEAN_TEAL,
    colorWarning: OCEAN_CORAL,
    colorError: OCEAN_WARM,
    colorInfo: OCEAN_BLUE,
    borderRadius: 12,
    borderRadiusLG: 20,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
  },
  components: {
    Button: {
      colorPrimary: OCEAN_CYAN,
      borderRadius: 12,
    },
    Card: {
      borderRadiusLG: 24,
      borderRadius: 20,
      colorBgContainer: SURFACE_LIGHT,
    },
    Layout: {
      colorBgHeader: BACKGROUND_DEEP,
      colorBgBody: BACKGROUND_DEEP,
    },
    Table: {
      headerBg: "rgba(10, 37, 64, 0.9)",
      headerColor: OCEAN_LIGHT,
      headerSortActiveBg: "rgba(10, 37, 64, 0.95)",
      headerSortHoverBg: "rgba(0, 119, 182, 0.3)",
      borderColor: BORDER_GLASS,
      rowHoverBg: "rgba(0, 180, 216, 0.05)",
      colorBgContainer: "transparent",
    },
    Progress: {
      defaultColor: OCEAN_CYAN,
    },
    Menu: {
      darkItemBg: BACKGROUND_DEEP,
      darkSubMenuItemBg: "rgba(10, 37, 64, 0.8)",
      darkItemSelectedBg: "rgba(0, 180, 216, 0.2)",
      darkItemColor: "rgba(255, 255, 255, 0.7)",
    },
    Drawer: {
      colorBgElevated: "rgba(5, 10, 20, 0.95)",
    },
    Modal: {
      colorBgElevated: "rgba(5, 10, 20, 0.95)",
    },
    Tag: {
      borderRadius: 8,
    },
    Segmented: {
      borderRadius: 12,
      itemSelectedBg: "rgba(0, 180, 216, 0.2)",
      itemSelectedColor: OCEAN_LIGHT,
    },
  },
});

export const ikoluTheme = createIkoluTheme();

export const ikoluTokens = {
  colorPrimary: OCEAN_DEEP,
  colorCyan: OCEAN_CYAN,
  colorBlue: OCEAN_BLUE,
  colorTeal: OCEAN_TEAL,
  colorCoral: OCEAN_CORAL,
  colorWarm: OCEAN_WARM,
  colorSuccess: OCEAN_TEAL,
  colorWarning: OCEAN_CORAL,
  colorError: OCEAN_WARM,
  colorInfo: OCEAN_BLUE,
  colorText: "rgba(255, 255, 255, 0.9)",
  colorTextSecondary: "rgba(255, 255, 255, 0.7)",
  colorBgLayout: BACKGROUND_DEEP,
  colorBgContainer: SURFACE_LIGHT,
  colorBgElevated: "rgba(10, 37, 64, 0.8)",
  colorBorderGlass: BORDER_GLASS,
  colorCyanLight: OCEAN_LIGHT,
  colorCyanBright: "#48CAE4",
  shadowCard: "0 4px 16px rgba(0, 180, 216, 0.12)",
  shadowCardHover: "0 8px 32px rgba(0, 180, 216, 0.2)",
  shadowGlow: "0 0 20px rgba(0, 180, 216, 0.3)",
  shadowGlowStrong: "0 0 30px rgba(0, 180, 216, 0.5)",
  radiusXS: 4,
  radiusSmall: 8,
  radiusDefault: 12,
  radiusLarge: 20,
  radiusXL: 24,
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
  ocean: `linear-gradient(-45deg, ${OCEAN_DEEP}, ${OCEAN_BLUE}, ${OCEAN_CYAN}, ${OCEAN_LIGHT})`,
  oceanDeep: `linear-gradient(135deg, ${BACKGROUND_DEEP} 0%, ${OCEAN_DEEP} 100%)`,
  cyan: `linear-gradient(135deg, ${OCEAN_BLUE} 0%, ${OCEAN_CYAN} 100%)`,
  teal: `linear-gradient(135deg, ${OCEAN_TEAL} 0%, #3DB8A8 100%)`,
  coral: `linear-gradient(135deg, ${OCEAN_CORAL} 0%, ${OCEAN_WARM} 100%)`,
  surface: `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
};

export const styles = {
  cardHeaderFlex: { display: "flex", alignItems: "center", gap: 8 },
  textCenterBlock: { textAlign: "center", display: "block" },
  centerFlex: { display: "flex", alignItems: "center", justifyContent: "center" },
  spaceBetweenFlex: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  absoluteBottomSvg: { position: "absolute", left: 0, bottom: 0, zIndex: 1 },
};

export const CHART_COLORS = {
  primary: OCEAN_DEEP,
  primaryLight: OCEAN_BLUE,
  primaryMid: OCEAN_CYAN,
  success: OCEAN_TEAL,
  warning: OCEAN_CORAL,
  error: OCEAN_WARM,
  info: OCEAN_BLUE,
  cyan: "#48CAE4",
  teal: "#2A9D8F",
  coral: "#F4A261",
  warm: "#E76F51",
  purple: "#a855f7",
  pink: "#ec4899",
  lime: "#84cc16",
  volcano: "#f97316",
  geekblue: "#3b82f6",
  magenta: "#d946ef",
  gold: "#fbbf24",
};

export const CHART_CONFIG = {
  line: {
    lineWidth: 2,
    point: { size: 2, state: { active: { size: 5 } } },
    area: { style: { fillOpacity: 0.15 } },
    animation: { appear: { animation: "fade-in", duration: 400 } },
  },
  grid: {
    line: { style: { stroke: "rgba(255, 255, 255, 0.06)", lineDash: [4, 4] } },
  },
  tooltip: {
    domStyles: {
      "g2-tooltip": {
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 180, 216, 0.2)",
        padding: "16px",
        background: "rgba(5, 10, 20, 0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      },
    },
  },
  axis: {
    gridLine: {
      line: { style: { stroke: "rgba(255, 255, 255, 0.04)", lineDash: [4, 4] } },
    },
  },
};
