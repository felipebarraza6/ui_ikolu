import React from "react";
import { GlobalOutlined, EnvironmentOutlined, DashboardOutlined, CompassOutlined } from "@ant-design/icons";
import { Flex } from "antd";

const stepTitle = (icon, color, text) => (
  <Flex align="center" gap={10}>
    <span style={{ color, fontSize: 18, lineHeight: 1 }}>{icon}</span>
    <span style={{ fontWeight: 700, fontSize: 16, color: "#1f3461" }}>{text}</span>
  </Flex>
);

export const centroControlTour = {
  key: "tour-centro-control",
  requiresPoint: false,
  steps: [
    {
      title: stepTitle(<CompassOutlined />, "#1F3461", "Centro de Control"),
      description: "Vista general con resumen consolidado del estado de tus puntos de captación, consumos y alertas recientes.",
      target: null,
      placement: "center",
    },
    {
      title: stepTitle(<DashboardOutlined />, "#1890ff", "Indicadores Clave"),
      description: "Tarjetas con métricas resumidas: caudal total, consumo del día, alertas activas y estado general del sistema.",
      target: () => document.getElementById("cc-kpi-cards"),
      placement: "bottom",
    },
    {
      title: stepTitle(<EnvironmentOutlined />, "#52c41a", "Estado de Puntos"),
      description: "Visualiza el estado de telemetría de todos tus puntos de captación.",
      target: () => document.getElementById("cc-telemetry-tab"),
      placement: "top",
    },
    {
      title: stepTitle(<GlobalOutlined />, "#faad14", "Cumplimiento"),
      description: "Revisa el estado de cumplimiento normativo de cada punto.",
      target: () => document.getElementById("cc-compliance-tab"),
      placement: "top",
    },
  ],
};
