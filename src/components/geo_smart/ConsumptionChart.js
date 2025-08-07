import React, { useState, useEffect, useContext } from "react";
import { Line, Area } from "@ant-design/plots";
import {
  Spin,
  Flex,
  Alert,
  DatePicker,
  Button,
  Card,
  Typography,
  Row,
  Col,
} from "antd";
import { AppContext } from "../../App";
import moment from "moment";
import { formatVolume } from "../../utils/numberFormatter";
import sh from "../../api/sh/endpoints";
import { FaCalendarAlt, FaChartLine } from "react-icons/fa";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const ConsumptionChart = () => {
  const { state } = useContext(AppContext);
  const [data, setData] = useState({});
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
      let pointsData = {};
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
              flow: Number(d.flow) || 0,
              total: Number(d.total) || 0,
            }))
            .sort((a, b) => moment(a.fullTime) - moment(b.fullTime));

          pointsData[profileName] = todayData;
        }
      });

      setData(pointsData);

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
          <Spin tip="Cargando gráficos de consumo..." />
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

  if (Object.keys(data).length === 0) {
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

  // Configuración base para los gráficos
  const getChartConfig = (pointData, pointName, chartType = "line") => {
    const baseConfig = {
      data: pointData,
      xField: "time",
      yField: "value",
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
          style: { fontSize: 12, fontWeight: "bold" },
        },
        label: {
          formatter: (v) => v,
          style: { fontSize: 10 },
        },
      },
      yAxis: {
        title: {
          text: "Consumo (m³)",
          style: { fontSize: 12, fontWeight: "bold" },
        },
        label: {
          formatter: (v) => formatVolume(v),
          style: { fontSize: 10 },
        },
      },
      tooltip: {
        formatter: (datum) => ({
          name: pointName,
          value: `${formatVolume(datum.value)} m³ a las ${datum.time}`,
        }),
      },
      height: 300,
      color: ["#1677ff"],
    };

    if (chartType === "area") {
      return {
        ...baseConfig,
        areaStyle: {
          fill: "l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff",
        },
      };
    }

    return baseConfig;
  };

  const totalToday = Object.values(data).reduce(
    (sum, pointData) =>
      sum + pointData.reduce((pointSum, item) => pointSum + item.value, 0),
    0
  );
  const uniquePoints = Object.keys(data);

  return (
    <Card
      title={
        <Flex justify="start">
          <Title level={4}>Gráficos por punto de captación</Title>
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
        <div style={{ fontSize: 12, color: "#666" }}>
          Datos de {uniquePoints.length} puntos de captación activos - Total
        </div>
      </div>

      {/* Gráficos individuales por punto de captación */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {uniquePoints.map((pointName, index) => {
          const pointData = data[pointName];
          const pointTotal = pointData.reduce(
            (sum, item) => sum + item.value,
            0
          );

          // Encontrar máximo con su hora
          const maxItem = pointData.reduce(
            (max, item) => (item.value > max.value ? item : max),
            pointData[0]
          );
          const maxValue = maxItem.value;
          const maxTime = maxItem.time;

          // Lógica para el mínimo: valor más cercano a cero pero mayor que cero
          let minValue = 0;
          let minTime = "N/A";
          const positiveValues = pointData
            .map((item) => item.value)
            .filter((value) => value > 0);

          if (positiveValues.length === 0) {
            // Si no hay valores positivos, mínimo es 0
            minValue = 0;
            minTime = "N/A";
          } else if (positiveValues.length === 1) {
            // Si hay solo un valor positivo, mínimo es 0
            minValue = 0;
            minTime = "N/A";
          } else {
            // Si hay múltiples valores positivos, mínimo es el más cercano a cero
            minValue = Math.min(...positiveValues);
            const minItem = pointData.find((item) => item.value === minValue);
            minTime = minItem ? minItem.time : "N/A";
          }

          // Obtener rango de horas
          const firstTime = pointData[0]?.time || "00:00";
          const lastTime = pointData[pointData.length - 1]?.time || "23:59";
          const currentDate = moment().format("DD/MM/YYYY");

          // Determinar el tipo de gráfico: primer punto usa área, los demás línea
          const chartType = index === 0 ? "area" : "line";

          return (
            <Card
              key={pointName}
              size="small"
              title={
                <Flex align="center" justify="space-between">
                  <Text strong style={{ fontSize: 14 }}>
                    {pointName}
                  </Text>
                  <Flex gap="small">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Total: {formatVolume(pointTotal)} m³
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Máx: {formatVolume(maxValue)} m³ ({maxTime})
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Mín: {formatVolume(minValue)} m³ ({minTime})
                    </Text>
                  </Flex>
                </Flex>
              }
              style={{ marginBottom: 0 }}
            >
              {/* Información del rango de horas */}
              <div
                style={{
                  marginBottom: 12,
                  padding: "8px 12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 4,
                  fontSize: 12,
                  color: "#666",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text type="secondary">📅 {currentDate}</Text>
                <Text type="secondary">
                  🕐 Rango: {firstTime} - {lastTime}
                </Text>
                <Text type="secondary">📊 {pointData.length} mediciones</Text>
              </div>
              {chartType === "area" ? (
                <Area {...getChartConfig(pointData, pointName, "area")} />
              ) : (
                <Line {...getChartConfig(pointData, pointName, "line")} />
              )}
            </Card>
          );
        })}
      </div>

      {Object.keys(data).length > 0 && (
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
