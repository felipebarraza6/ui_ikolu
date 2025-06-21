import React, { useContext } from "react";
import { Card, Flex } from "antd";
import QueueAnim from "rc-queue-anim";
import Registers from "./Registers";
import { AppContext } from "../../App";
import CodeQR from "./CodeQR";
import { useResponsive } from "../../hooks/useResponsive";

/**
 * 📊 DGA RESPONSIVO
 *
 * Estructura:
 * - Indicadores arriba (registros totales, caudal autorizado, último registro, estado QR)
 * - Información del punto de captación DGA abajo
 * - Optimizado para móvil y desktop
 */
const ResponsiveDga = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();

  const dataDga = state.selected_profile.modules.m2;
  const profileDga = state.selected_profile.dga;

  const DesktopLayout = () => (
    <Flex gap="large" align="start">
      <div style={{ flex: 1, minWidth: 0 }}>
        <Registers dataDga={dataDga} />
      </div>
      <div style={{ flex: "0 0 300px" }}>
        <CodeQR dataProfile={profileDga} />
      </div>
    </Flex>
  );

  const MobileLayout = () => (
    <Flex vertical gap="large">
      <Registers dataDga={dataDga} />
      <CodeQR dataProfile={profileDga} />
    </Flex>
  );

  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
      <QueueAnim delay={300} type={["top", "left"]}>
        <div key="dga-view">
          {isMobile ? <MobileLayout /> : <DesktopLayout />}
        </div>
      </QueueAnim>
    </div>
  );
};

export default ResponsiveDga;
