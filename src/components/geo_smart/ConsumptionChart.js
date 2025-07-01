import React, { useState, useEffect, useContext } from "react";
import { Line } from "@ant-design/plots";
import { Spin, Flex, Alert, DatePicker, Button, Card, Typography } from "antd";
import { AppContext } from "../../App";
import moment from "moment";
import { formatVolume } from "../../utils/numberFormatter";
import sh from "../../api/sh/endpoints";
import { FaCalendarAlt, FaChartLine } from "react-icons/fa";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const ConsumptionChart = () => {
  const { state } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Solo datos de hoy
  const processTodayData = () => {
    if (!state.profile_client || state.profile_client.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let allPointsData = [];
      let activePoints = 0;

      state.profile_client.forEach((profile) => {
        if (
          profile.modules &&
          profile.modules.today &&
          profile.modules.today.length > 0
        ) {
          activePoints++;
          const profileName = profile.title || `Punto ${profile.id}`;

          // Procesar datos de hoy, ordenados por hora
          const todayData = profile.modules.today
            .map((d) => ({
              time: moment(d.date_time_medition).format("HH:mm"),
              fullTime: moment(d.date_time_medition).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
              value: Number(d.total_diff) || 0,
              category: profileName,
              flow: Number(d.flow) || 0,
              total: Number(d.total) || 0,
            }))
            .sort((a, b) => moment(a.fullTime) - moment(b.fullTime));

          allPointsData.push(...todayData);
        }
      });

      // Ordenar todos los datos por tiempo
      allPointsData.sort((a, b) => moment(a.fullTime) - moment(b.fullTime));

      setData(allPointsData);

      if (activePoints === 0) {
        setError("No hay puntos de captación con datos de hoy disponibles.");
      }
    } catch (err) {
      setError("No se pudieron procesar los datos para el gráfico.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processTodayData();
  }, [state.profile_client]);

  if (loading) {
    return (
      <Card>
        <Flex justify="center" align="center" style={{ height: 200 }}>
          <Spin tip="Cargando gráfico de consumo..." />
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert message={error} type="error" showIcon />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <Alert
          message="No hay datos de consumo disponibles para mostrar en el gráfico."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const config = {
    data,
    xField: "time",
    yField: "value",
    seriesField: "category",
    smooth: true,
    lineStyle: { lineWidth: 2 },
    point: {
      size: 4,
      shape: "circle",
      style: { fill: "#1677ff", stroke: "#fff", lineWidth: 1 },
    },
    xAxis: {
      title: {
        text: "Hora de Hoy",
        style: { fontSize: 14, fontWeight: "bold" },
      },
      label: {
        formatter: (v) => v,
        style: { fontSize: 12 },
      },
    },
    yAxis: {
      title: {
        text: "Consumo (m³)",
        style: { fontSize: 14, fontWeight: "bold" },
      },
      label: {
        formatter: (v) => formatVolume(v),
        style: { fontSize: 12 },
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.category,
        value: `${formatVolume(datum.value)} m³ a las ${datum.time}`,
      }),
      title: (datum) => `Consumo - ${datum.time}`,
    },
    legend: {
      position: "top",
      itemHeight: 20,
      itemSpacing: 8,
    },
    height: 400,
    color: ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2"],
  };

  const totalToday = data.reduce((sum, item) => sum + item.value, 0);
  const uniquePoints = [...new Set(data.map((item) => item.category))];

  return (
    <Card
      title={
        <Flex align="center" gap="small">
          <FaChartLine style={{ color: "#1677ff" }} />
          <span>Consumo de Agua</span>
          <span style={{ fontSize: 12, color: "#666", fontWeight: "normal" }}>
            (Hoy - {uniquePoints.length} puntos activos)
          </span>
        </Flex>
      }
    >
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          backgroundColor: "#f6ffed",
          borderRadius: 6,
          border: "1px solid #b7eb8f",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: "#52c41a",
            marginBottom: 4,
          }}
        >
          Consumo total de hoy: {formatVolume(totalToday)} m³
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          Datos de {uniquePoints.length} puntos de captación activos
        </div>
      </div>
      <Line {...config} />
      {data.length > 0 && (
        <div
          style={{
            marginTop: 16,
            textAlign: "right",
            fontSize: 12,
            color: "#888",
          }}
        >
          Última actualización: {moment().format("DD/MM/YYYY HH:mm")}
        </div>
      )}
    </Card>
  );
};

export default ConsumptionChart;
