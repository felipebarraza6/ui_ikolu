import React, { useState, useEffect, useContext } from "react";
import { Typography, Row, Col, Button, DatePicker, Card } from "antd";
import GraphicLine from "./GraphicLine";
import { AppContext } from "../../App";
import { ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import QueueAnim from "rc-queue-anim";
import es_ES from "antd/lib/locale/es_ES";
import { Line } from "@ant-design/plots";

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

  // Configuración del gráfico
  const config = {
    data: processedData,
    xField: "hora",
    yField: "caudal",
    smooth: true,
    lineStyle: { lineWidth: 3 },
    point: {
      size: 5,
      shape: "circle",
      style: { fill: "#1677ff", stroke: "#fff", lineWidth: 2 },
    },
    color: "#1677ff",
    tooltip: {
      formatter: (d) => ({
        name: "Caudal",
        value: `${parseFloat(d.caudal).toFixed(1)} L/s a las ${d.hora}`,
      }),
    },
    xAxis: {
      title: { text: "Hora", style: { fontSize: 15, fontWeight: "bold" } },
      label: { formatter: (v) => v },
    },
    yAxis: {
      title: {
        text: "Caudal (L/s)",
        style: { fontSize: 15, fontWeight: "bold" },
      },
    },
    height: 320,
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
