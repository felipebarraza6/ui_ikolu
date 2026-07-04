import { useMemo } from "react";
import { theme } from "antd";
import { useAppTheme } from "../contexts/ThemeContext";
import { smarthydroColors as c } from "../theme/smarthydro.tokens";

export const useIkoluToken = () => {
  const { token } = theme.useToken();
  const { isDark } = useAppTheme();

  return useMemo(() => ({
    ...token,
    isDark,
    colorAccent: c.accent[400],
    colorAccentHover: c.accent[300],
    colorCorporateBlue: isDark ? c.primary[400] : c.primary[500],
    colorCorporateBlueLight: c.primary[400],
    colorCorporateBlueMid: c.primary[300],
    gradientPrimary: isDark
      ? `linear-gradient(135deg, ${c.primary[400]} 0%, ${c.primary[300]} 100%)`
      : `linear-gradient(135deg, ${c.primary[500]} 0%, ${c.primary[400]} 100%)`,
    gradientAccent: `linear-gradient(135deg, ${c.accent[400]} 0%, ${c.accent[500]} 100%)`,
    colorHeaderBg: isDark ? "#030c18" : c.primary[500],
    colorHeaderBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.15)",
    glassBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255, 255, 255, 0.6)",
    glassBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(32, 53, 98, 0.08)",
    // Paleta Void para admin/staff
    voidBg: "#030c18",
    voidSurface: "rgba(255,255,255,0.05)",
    voidSurfaceHover: "rgba(255,255,255,0.09)",
    voidBorder: "rgba(255,255,255,0.08)",
    voidBorderStrong: "rgba(255,255,255,0.12)",
    voidTextHeading: "#f2f5fa",
    voidText: "rgba(242,245,250,0.85)",
    voidTextMuted: "rgba(200,214,240,0.60)",
    voidRadius: 16,
    voidShadow: "0 4px 24px rgba(0,0,0,0.35)",
    voidMono: "'JetBrains Mono', monospace",
  }), [token, isDark]);
};

export default useIkoluToken;
