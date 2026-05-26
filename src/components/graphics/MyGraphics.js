import React, { useState, useEffect, useContext } from "react";
import { Typography, Row, Col, Button, DatePicker, Card } from "antd";
import GraphicLine from "./GraphicLine";
import { AppContext } from "../../App";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import QueueAnim from "rc-queue-anim";
import es_ES from "antd/lib/locale/es_ES";
import { Line } from "@ant-design/plots";
import { CHART_COLORS, CHART_CONFIG } from "../../theme";

const { Title } = Typography;

const MyGraphics = () => {
  const { state } = useContext(AppContext);
  const todayData = Array.isArray(state.selected_profile?.modules?.today)
    ? state.selected_profile.modules.today
    : [];

  // Procesar datos para el gráfico: solo datos de hoy, ordenados por hora
  const processedData = todayData
    .map((d) => ({
      ...d,
      hora: d.date_time_medition ? d.date_time_medition.slice(11, 16) : "",
      caudal: Number(d.flow) || 0,
      acumulado: Number(d.total) || 0,
    }))
    .sort((a, b) => (a.date_time_medition > b.date_time_medition ? 1 : -1));

  if (!processedData.length) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "#888" }}>
        No hay datos de hoy para este punto de captación.
      </div>
    );
  }

  // Configuración del gráfico con estilo minimalista
  const config = {
    data: processedData,
    xField: "hora",
    yField: "caudal",
    smooth: true,
    color: CHART_COLORS.primary,
    lineStyle: { lineWidth: 2 },
    point: {
      size: 2,
      shape: "circle",
      style: { fill: CHART_COLORS.primary, stroke: "#fff", lineWidth: 1 },
      state: { active: { size: 5 } },
    },
    area: {
      style: { fill: CHART_COLORS.primary, fillOpacity: 0.08 },
    },
    tooltip: {
      domStyles: {
        "g2-tooltip": {
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          padding: "12px",
          background: "rgba(255, 255, 255, 0.98)",
        },
      },
      formatter: (d) => ({
        name: "Caudal",
        value: `${parseFloat(d.caudal).toFixed(1)} L/s a las ${d.hora}`,
      }),
    },
    xAxis: {
      title: { text: "Hora", style: { fontSize: 13, fontWeight: 500 } },
      label: { formatter: (v) => v },
      grid: {
        line: { style: { stroke: "rgba(0, 0, 0, 0.06)", lineDash: [4, 4] } },
      },
    },
    yAxis: {
      title: { text: "Caudal (L/s)", style: { fontSize: 13, fontWeight: 500 } },
      grid: {
        line: { style: { stroke: "rgba(0, 0, 0, 0.06)", lineDash: [4, 4] } },
      },
    },
    height: 320,
    animation: { appear: { animation: "fade-in", duration: 400 } },
  };

  return (
    <div style={{ padding: 20, width: "100%" }}>
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        Caudal horario de hoy
      </Typography.Title>
      <Line {...config} />
      <div
        style={{
          textAlign: "right",
          color: "#888",
          fontSize: 13,
          marginTop: 8,
        }}
      >
        Última medición: {processedData[processedData.length - 1]?.hora || "-"}
      </div>
    </div>
  );
};

const styles = {
  btnOption: {
    marginRight: "10px",
    marginTop: window.innerWidth > 900 ? "0px" : "10px",
  },
  datePicker: {
    width: window.innerWidth > 900 ? "250px" : "100%",
    marginRight: "10px",
  },
  container: {
    padding: "20px",
  },
};

export default MyGraphics;
