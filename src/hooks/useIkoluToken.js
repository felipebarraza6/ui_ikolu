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
    colorHeaderBg: isDark ? "#0A152A" : c.primary[500],
    colorHeaderBorder: isDark ? "#1A1F3A" : "rgba(255,255,255,0.15)",
    glassBg: isDark ? "rgba(32, 53, 98, 0.15)" : "rgba(255, 255, 255, 0.6)",
    glassBorder: isDark ? "rgba(58, 104, 170, 0.2)" : "rgba(32, 53, 98, 0.08)",
  }), [token, isDark]);
};

export default useIkoluToken;
