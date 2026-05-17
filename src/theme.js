/**
 * ============================================================================
 * TEMA CENTRALIZADO IKOLU — Ant Design 5
 * ============================================================================
 *
 * Objetivo: eliminar colores/shadows/radii hardcodeados dispersos en 100+
 * archivos. Todo componente nuevo o refactorizado debe consumir estos tokens.
 *
 * Uso dentro de componentes React:
 *   import { theme } from "antd";
 *   const { token } = theme.useToken();
 *
 * Uso fuera de React (ej: columnas de tabla definidas globalmente):
 *   import { ikoluTokens } from "../theme";
 *
 * Uso en ConfigProvider (src/index.js):
 *   import { ikoluTheme } from "./theme";
 *   <ConfigProvider theme={ikoluTheme}>...</ConfigProvider>
 */

// ── Paleta corporativa ─────────────────────────────────────────────────────
const CORPORATE_BLUE = "#1F3461";
const CORPORATE_BLUE_LIGHT = "#2A4A8A";
const CORPORATE_BLUE_MID = "#3B6CA8";
const CORPORATE_BLUE_BRIGHT = "#1976d2";

const ACCENT_ORANGE = "#FF6B35";

const BACKGROUND_LIGHT = "#f2f5fa";
const BORDER_LIGHT = "#f0f0f0";

const GREY_TEXT = "#8c8c8c";
const GREY_TEXT_MID = "#595959";
const GREY_TEXT_LIGHT = "#bfbfbf";
const GREY_TEXT_DISABLED = "#bdbdbd";

const BLUE_TINT = "#e3f2fd";
const BLUE_BG = "#f0f5ff";
const RED_BG = "#FFF2F0";
const GREEN_TEXT = "#43a047";
const GREEN_DARK_TEXT = "#388e3c";

// ── Tema oficial para ConfigProvider (Ant Design 5) ────────────────────────
export const ikoluTheme = {
  token: {
    colorPrimary: CORPORATE_BLUE,
    colorLink: CORPORATE_BLUE,
    colorLinkHover: CORPORATE_BLUE_LIGHT,
    colorLinkActive: CORPORATE_BLUE,
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#f5222d",
    colorInfo: "#1890ff",
    colorPrimaryBorder: "#ffffff",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f5f5f5",
    colorText: "rgba(0, 0, 0, 0.88)",
    colorTextSecondary: GREY_TEXT,
    colorBorder: BORDER_LIGHT,
    colorBorderSecondary: BORDER_LIGHT,
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    boxShadow:
      "0 4px 12px rgba(0, 0, 0, 0.08)",
    boxShadowSecondary:
      "0 2px 8px rgba(0, 0, 0, 0.06)",
    boxShadowTertiary:
      "0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)",
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
  },
  components: {
    Tabs: {
      colorBgContainer: CORPORATE_BLUE,
      itemSelectedColor: "#ffffff",
      itemHoverColor: CORPORATE_BLUE,
      itemColor: CORPORATE_BLUE,
    },
    Badge: {
      colorInfo: CORPORATE_BLUE,
    },
    Button: {
      colorPrimary: CORPORATE_BLUE,
      borderColor: "#ffffff",
    },
    Card: {
      borderRadiusLG: 16,
      borderRadius: 12,
    },
    Layout: {
      colorBgHeader: CORPORATE_BLUE,
      colorBgBody: "#f5f5f5",
    },
    Menu: {
      darkItemBg: CORPORATE_BLUE,
      darkSubMenuItemBg: "#16264a",
      darkItemSelectedBg: "rgba(255,255,255,0.15)",
    },
    Table: {
      borderRadius: 8,
    },
    Progress: {
      defaultColor: CORPORATE_BLUE,
    },
  },
};

// ── Tokens custom para import directo (fuera de hooks) ─────────────────────
export const ikoluTokens = {
  // Colores
  colorCorporateBlue: CORPORATE_BLUE,
  colorSuccess: "#52c41a",
  colorWarning: "#faad14",
  colorError: "#f5222d",
  colorInfo: "#1890ff",
  colorText: "rgba(0, 0, 0, 0.88)",
  colorTextSecondary: GREY_TEXT,
  colorBgLayout: "#f5f5f5",
  colorBgContainer: "#ffffff",
  colorCorporateBlueLight: CORPORATE_BLUE_LIGHT,
  colorCorporateBlueMid: CORPORATE_BLUE_MID,
  colorCorporateBlueBright: CORPORATE_BLUE_BRIGHT,
  colorAccentOrange: ACCENT_ORANGE,
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

  // Sombras
  shadowCard: "0 4px 12px rgba(0, 0, 0, 0.08)",
  shadowCardHover: "0 8px 24px rgba(0, 0, 0, 0.12)",
  shadowNav: "0 -2px 8px rgba(0, 0, 0, 0.06)",
  shadowPrimary: "0 2px 6px rgba(24, 144, 255, 0.25)",

  // Radios
  radiusXS: 4,
  radiusSmall: 6,
  radiusDefault: 8,
  radiusLarge: 12,
  radiusXL: 16,

  // Tamaños de fuente
  fontSizeSmall: 11,
  fontSizeBase: 12,
  fontSizeMid: 13,
  fontSizeLarge: 14,
  fontSizeXL: 16,
  fontSize2XL: 18,
  fontSize3XL: 22,
  fontSize4XL: 24,
};

// ── Gradientes reutilizables (KPICard, hero banners, etc.) ─────────────────
export const kpiGradients = {
  primary: `linear-gradient(135deg, ${CORPORATE_BLUE} 0%, ${CORPORATE_BLUE_LIGHT} 100%)`,
  secondary: `linear-gradient(135deg, ${CORPORATE_BLUE_LIGHT} 0%, ${CORPORATE_BLUE_MID} 100%)`,
  info: `linear-gradient(135deg, ${CORPORATE_BLUE_BRIGHT} 0%, #42a5f5 100%)`,
};

// ── Utilidades de estilo para reemplazar objetos inline repetidos ──────────
export const styles = {
  cardHeaderFlex: { display: "flex", alignItems: "center", gap: 8 },
  textCenterBlock: { textAlign: "center", display: "block" },
  centerFlex: { display: "flex", alignItems: "center", justifyContent: "center" },
  spaceBetweenFlex: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  absoluteBottomSvg: { position: "absolute", left: 0, bottom: 0, zIndex: 1 },
};
