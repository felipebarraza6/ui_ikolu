import React, { useMemo } from "react";
import { Button, Dropdown, Tooltip, Badge } from "antd";
import { QuestionCircleOutlined, ReloadOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useTours } from "../../contexts/TourContext";
import { TOURS_BY_ROUTE, generalTour } from "../../config/tours";

/**
 * TourHelpButton — Botón de ayuda global para tours de capacitación.
 *
 * Se ubica típicamente en el HeaderNav. Ofrece:
 * - Ver guía de esta pantalla
 * - Ver tour de bienvenida
 * - Reiniciar toda la capacitación
 */
const TourHelpButton = () => {
  const { startTour, resetTours, isTourCompleted } = useTours();
  const location = useLocation();

  const currentModuleTour = TOURS_BY_ROUTE[location.pathname];
  const hasUnseenModuleTour = currentModuleTour && !isTourCompleted(currentModuleTour.key);

  const menuItems = useMemo(() => {
    const items = [];

    if (currentModuleTour) {
      items.push({
        key: "module",
        label: `Ver guía de ${getModuleLabel(location.pathname)}`,
        icon: <PlayCircleOutlined />,
        onClick: () => startTour(currentModuleTour.key),
      });
    }

    items.push({
      key: "general",
      label: isTourCompleted(generalTour.key)
        ? "Ver tour de bienvenida de nuevo"
        : "Ver tour de bienvenida",
      icon: <PlayCircleOutlined />,
      onClick: () => startTour(generalTour.key),
    });

    items.push({
      type: "divider",
    });

    items.push({
      key: "reset",
      label: "Reiniciar toda la capacitación",
      icon: <ReloadOutlined />,
      danger: true,
      onClick: () => {
        resetTours();
        window.location.reload();
      },
    });

    return items;
  }, [currentModuleTour, location.pathname, startTour, resetTours, isTourCompleted]);

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={["click"]}
    >
        <Badge dot={hasUnseenModuleTour} color="#FF6B35" offset={[-2, 2]}>
          <Button
            shape="circle"
            icon={<QuestionCircleOutlined style={{ fontSize: 16, color: "#1F3461" }} />}
            style={{
              background: "#ffffff",
              border: "1px solid #e8e8e8",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          />
        </Badge>
    </Dropdown>
  );
};

function getModuleLabel(pathname) {
  const labels = {
    "/": "Centro de Control",
    "/telemetry": "Telemetría",
    "/analysis": "Análisis",
    "/dga": "DGA",
    "/download": "Descargas",
    "/extraction-data": "Descargas",
  };
  return labels[pathname] || "esta pantalla";
}

export default TourHelpButton;
