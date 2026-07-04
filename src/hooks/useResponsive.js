import { useMemo } from "react";
import { Grid } from "antd";

/**
 * Hook reusable para consultar breakpoints de Ant Design.
 *
 * Devuelve helpers comunes para adaptar layouts entre mobile, tablet y desktop.
 */
export const useResponsive = () => {
  const screens = Grid.useBreakpoint();

  return useMemo(() => {
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;
    const isDesktop = screens.lg;
    const isXs = !!screens.xs && !screens.sm;
    const isSm = !!screens.sm && !screens.md;

    return {
      screens,
      isMobile,
      isTablet,
      isDesktop,
      isXs,
      isSm,
    };
  }, [screens]);
};

export default useResponsive;
