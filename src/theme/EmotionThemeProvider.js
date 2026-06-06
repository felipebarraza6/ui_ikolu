import { useMemo } from "react";
import { ThemeProvider } from "@emotion/react";
import { theme } from "antd";

const IkoluEmotionProvider = ({ children }) => {
  const { token } = theme.useToken();

  const emotionTheme = useMemo(() => ({
    token,
    colors: {
      corporateBlue: token.colorPrimary,
      corporateBlueLight: token.colorPrimaryHover || "#2A4A8A",
      corporateBlueMid: "#3B6CA8",
      corporateBlueBright: "#1976d2",
      accentOrange: "#FF6B35",
      backgroundLight: "#f2f5fa",
      borderLight: token.colorBorder || "#f0f0f0",
      greyText: token.colorTextSecondary || "#8c8c8c",
      greyTextMid: "#595959",
      greyTextLight: "#bfbfbf",
      greyTextDisabled: "#bdbdbd",
      blueTint: "#e3f2fd",
      blueBg: "#f0f5ff",
      redBg: "#FFF2F0",
      greenText: "#43a047",
      greenDarkText: "#388e3c",
      white: "#ffffff",
      black: "#000000",
      success: token.colorSuccess || "#52c41a",
      warning: token.colorWarning || "#faad14",
      error: token.colorError || "#f5222d",
      info: token.colorInfo || "#1890ff",
    },
    shadows: {
      card: token.boxShadow || "0 4px 12px rgba(0, 0, 0, 0.08)",
      cardHover: "0 8px 24px rgba(0, 0, 0, 0.12)",
      nav: "0 -2px 8px rgba(0, 0, 0, 0.06)",
      primary: "0 2px 6px rgba(24, 144, 255, 0.25)",
    },
    radii: {
      xs: token.borderRadiusXS || 4,
      small: token.borderRadiusSM || 6,
      default: token.borderRadius || 8,
      large: token.borderRadiusLG || 12,
      xl: 16,
    },
    fontSizes: {
      small: 11,
      base: 12,
      mid: 13,
      large: token.fontSize || 14,
      xl: token.fontSizeLG || 16,
      "2xl": 18,
      "3xl": 22,
      "4xl": 24,
    },
    gradients: {
      primary: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover || "#2A4A8A"} 100%)`,
      secondary: `linear-gradient(135deg, ${token.colorPrimaryHover || "#2A4A8A"} 0%, #3B6CA8 100%)`,
      info: `linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)`,
    },
  }), [token]);

  return <ThemeProvider theme={emotionTheme}>{children}</ThemeProvider>;
};

export default IkoluEmotionProvider;
