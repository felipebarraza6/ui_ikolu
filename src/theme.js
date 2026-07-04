import { smarthydroColors as c } from "./theme/smarthydro.tokens";

export const createIkoluTheme = (algorithm = null, isDark = false) => {
  const token = {
    // === Colores corporativos ===
    colorPrimary: isDark ? c.primary[400] : c.primary[500],
    colorPrimaryHover: isDark ? c.primary[300] : c.primary[400],
    colorPrimaryActive: isDark ? c.primary[500] : c.primary[600],
    colorLink: isDark ? c.primary[400] : c.primary[500],
    colorLinkHover: isDark ? c.primary[300] : c.primary[400],
    colorLinkActive: isDark ? c.primary[500] : c.primary[600],

    // === Colores semánticos ===
    colorSuccess: c.semantic.success,
    colorWarning: c.semantic.warning,
    colorError: c.semantic.error,
    colorInfo: c.semantic.info,

    // === Fondos y superficies ===
    colorBgLayout: isDark ? "#030c18" : c.neutral[50],
    colorBgContainer: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
    colorBgElevated: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
    colorBgSpotlight: isDark ? "#0a1525" : "#1f1f1f",
    colorTextLightSolid: "#ffffff",

    // === Textos ===
    colorText: isDark ? "rgba(242,245,250,0.90)" : c.neutral[900],
    colorTextSecondary: isDark ? "rgba(200,214,240,0.60)" : c.neutral[600],
    colorTextTertiary: isDark ? "rgba(200,214,240,0.45)" : c.neutral[500],
    colorTextQuaternary: isDark ? "rgba(200,214,240,0.30)" : c.neutral[400],

    // === Bordes ===
    colorBorder: isDark ? "rgba(255,255,255,0.08)" : c.neutral[200],
    colorBorderSecondary: isDark ? "rgba(255,255,255,0.06)" : c.neutral[100],

    // === Otros ===
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    wireframe: false,
  };

  return {
    algorithm,
    token,
    components: {
      Card: {
        borderRadiusLG: 16,
        borderRadius: 12,
        colorBgContainer: token.colorBgContainer,
      },
      Layout: {
        colorBgHeader: isDark ? "#030c18" : c.primary[500],
        colorBgBody: token.colorBgLayout,
        colorBgTrigger: isDark ? "#030c18" : c.primary[600],
      },
      Table: {
        headerBg: isDark ? "rgba(255,255,255,0.07)" : c.primary[500],
        headerColor: "#ffffff",
        headerSortActiveBg: isDark ? "rgba(255,255,255,0.09)" : c.primary[500],
        headerSortHoverBg: isDark ? "rgba(255,255,255,0.11)" : c.primary[400],
        rowHoverBg: isDark ? "rgba(255,255,255,0.04)" : c.neutral[100],
        colorBgContainer: token.colorBgContainer,
      },
      Menu: {
        darkItemBg: "#030c18",
        darkSubMenuItemBg: "#030c18",
        darkItemSelectedBg: "rgba(255,255,255,0.12)",
        darkItemColor: "rgba(242,245,250,0.80)",
        darkItemSelectedColor: "#ffffff",
      },
      Input: {
        colorBgContainer: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
        colorBorder: token.colorBorder,
        colorText: token.colorText,
      },
      Select: {
        colorBgContainer: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
        colorBorder: token.colorBorder,
        colorText: token.colorText,
      },
      Modal: {
        colorBgElevated: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
      },
      Drawer: {
        colorBgElevated: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
      },
      Button: {
        colorPrimary: token.colorPrimary,
        colorPrimaryHover: token.colorPrimaryHover,
        colorPrimaryActive: token.colorPrimaryActive,
      },
    },
  };
};

export const ikoluTheme = createIkoluTheme();

// Legacy exports - deprecated, usar theme.useToken()
export const ikoluTokens = {
  colorCorporateBlue: c.primary[500],
  colorSuccess: c.semantic.success,
  colorWarning: c.semantic.warning,
  colorError: c.semantic.error,
  colorInfo: c.semantic.info,
  colorText: "rgba(0, 0, 0, 0.88)",
  colorTextSecondary: c.neutral[500],
  colorBgLayout: "#f5f5f5",
  colorBgContainer: "#ffffff",
  colorCorporateBlueLight: c.primary[400],
  colorCorporateBlueMid: c.primary[300],
  colorAccentYellowGreen: c.accent[400],
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
  primary: `linear-gradient(135deg, ${c.primary[500]} 0%, ${c.primary[400]} 100%)`,
  secondary: `linear-gradient(135deg, ${c.primary[400]} 0%, ${c.primary[300]} 100%)`,
  info: `linear-gradient(135deg, ${c.primary[300]} 0%, ${c.primary[200]} 100%)`,
  accent: `linear-gradient(135deg, ${c.accent[400]} 0%, ${c.accent[500]} 100%)`,
};

export const styles = {
  cardHeaderFlex: { display: "flex", alignItems: "center", gap: 8 },
  textCenterBlock: { textAlign: "center", display: "block" },
  centerFlex: { display: "flex", alignItems: "center", justifyContent: "center" },
  spaceBetweenFlex: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  absoluteBottomSvg: { position: "absolute", left: 0, bottom: 0, zIndex: 1 },
};

export const getChartColors = (isDark = false) => ({
  primary: c.primary[500],
  primaryLight: c.primary[400],
  primaryMid: c.primary[300],
  success: c.semantic.success,
  warning: c.semantic.warning,
  error: c.semantic.error,
  info: c.semantic.info,
  orange: "#fa8c16",
  purple: "#722ed1",
  cyan: "#13c2c2",
  pink: "#eb2f96",
  lime: "#a0d911",
  volcano: "#fa541c",
  geekblue: "#2f54eb",
  magenta: "#eb2f96",
  gold: "#faad14",
});

export const getChartConfig = (isDark = false) => ({
  line: {
    lineWidth: 2,
    point: { size: 2, state: { active: { size: 5 } } },
    area: { style: { fillOpacity: 0.1 } },
    animation: { appear: { animation: "fade-in", duration: 400 } },
  },
  grid: {
    line: { style: { stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", lineDash: [4, 4] } },
  },
  tooltip: {
    domStyles: {
      "g2-tooltip": {
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        padding: "12px",
        background: isDark ? "rgba(15, 22, 41, 0.98)" : "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
        color: isDark ? "#fff" : "#000",
      },
    },
  },
  axis: {
    gridLine: {
      line: { style: { stroke: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", lineDash: [4, 4] } },
    },
  },
});

// Legacy static exports
export const CHART_COLORS = getChartColors(false);
export const CHART_CONFIG = getChartConfig(false);
