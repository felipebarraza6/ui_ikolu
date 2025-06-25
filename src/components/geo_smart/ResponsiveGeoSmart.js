import React from "react";
import { useResponsive } from "../../hooks/useResponsive";
import GeoSmart from "./GeoSmart";

/**
 * 🗺️ GEO SMART RESPONSIVO
 *
 * Wrapper responsivo para el componente GeoSmart
 * Optimiza la experiencia en dispositivos móviles
 */
const ResponsiveGeoSmart = () => {
  const { isMobile } = useResponsive();

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: isMobile ? "12px" : "24px auto",
        padding: isMobile ? "0" : "0 24px",
      }}
    >
      <GeoSmart />
    </div>
  );
};

export default ResponsiveGeoSmart;
