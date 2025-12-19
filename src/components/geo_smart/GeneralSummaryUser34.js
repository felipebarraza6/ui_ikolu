import React, { useState, useContext } from "react";
import { AppContext } from "../../App";
import {
  Card,
  Row,
  Col,
  Statistic,
  Flex,
  Grid,
  Tag,
  Progress,
  List,
  Typography,
  Badge,
  theme,
  Modal,
  Table,
  Tabs,
} from "antd";
import {
  FaMapMarkerAlt,
  FaSatelliteDish,
  FaCheckCircle,
  FaChartBar,
  FaWifi,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { CheckCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useDataStatistics } from "./hooks/useDataValidation";
import { formatInteger } from "../../utils/numberFormatter";
import { IoIosWater } from "react-icons/io";
import ConsumptionChart from "./ConsumptionChart";
import FlowStatusGauges from "./FlowStatusGauges";

import "./GeneralSummary.css";
import moment from "moment";
import { parseSafeDate, formatSafeDate } from "../../utils/dateFormatter";

const { useBreakpoint } = Grid;
const { Text } = Typography;

let colorPrimary = "#1890ff";
let token = { colorPrimary };
try {
  // Si existe theme.useToken (AntD 5+)
  if (typeof require !== "undefined") {
    const { theme } = require("antd");
    if (theme && typeof theme.useToken === "function") {
      token = theme.useToken();
      colorPrimary = token.colorPrimary || colorPrimary;
    }
  }
} catch (e) {}

/**
 * GeneralSummaryUser34
 * Dashboard personalizado para el usuario con ID 34
 * Mantiene: indicadores principales, estado del servicio, resumen de consumo,
 * estado de caudales, gráficos de consumo y caudal por punto de captación
 */
const GeneralSummaryUser34 = ({ profiles }) => {
  const screens = useBreakpoint();
  const stats = useDataStatistics(profiles);
  const { state } = useContext(AppContext);

  // Función para fusionar profiles duplicados por nombre, sumando los consumos
  function mergeProfilesByName(profiles) {
    const merged = {};
    profiles.forEach((p) => {
      const name = p.title;
      if (!merged[name]) {
        merged[name] = {
          ...p,
          modules: {
            ...p.modules,
            total_consumed_today: Number(p.modules?.total_consumed_today) || 0,
            total_consumed_yesterday:
              Number(p.modules?.total_consumed_yesterday) || 0,
          },
        };
      } else {
        merged[name].modules.total_consumed_today +=
          Number(p.modules?.total_consumed_today) || 0;
        merged[name].modules.total_consumed_yesterday +=
          Number(p.modules?.total_consumed_yesterday) || 0;
      }
    });
    return Object.values(merged);
  }

  const mergedProfiles = mergeProfilesByName(profiles);

  // Filtrar solo los puntos con is_telemetry === true (usando mergedProfiles)
  const perfilesTelemetria = mergedProfiles.filter(
    (p) => p.config_data?.is_telemetry
  );
  const activosTelemetria = perfilesTelemetria; // Mostrar todos los puntos con is_telemetry
  const offlineTelemetria = [];
  const totalTelemetria = perfilesTelemetria.length;
  const activosTelemetriaCount = totalTelemetria;

  // Consumo por punto HOY y AYER, usando los datos procesados del hook
  const consumoPorPuntoHoy = (stats.todayConsumers || []).map(c => ({
    name: c.name,
    value: c.value
  }));
  const consumoPorPuntoAyer = (stats.consumptionChanges || []).map(c => ({
    name: c.name,
    value: c.yesterdaySum || 0
  }));

  // En realidad useDataStatistics ya tiene las sumas
  const totalHoy = stats.totals?.today || 0;
  const totalAyer = stats.totals?.yesterday || 0;

  const formatVolume = (value) => {
    return value >= 1000000
      ? (value / 1000000).toFixed(1) + "M"
      : value >= 1000
      ? (value / 1000).toFixed(1) + "K"
      : value;
  };

  const getStatusColor = (health) => {
    if (health >= 90) return "#52c41a";
    if (health >= 50) return "#faad14";
    return "#ff4d4f";
  };

  const getStatusText = (health) => {
    if (health >= 90) return "Excelente";
    if (health >= 50) return "Advertencia";
    return "Crítico";
  };

  // 2. GPS: mostrar cuántos puntos tienen lat y lon válidos
  const conGPS = profiles.filter(
    (p) =>
      p.lat &&
      p.lon &&
      p.lat !== "0" &&
      p.lon !== "0" &&
      p.lat !== "" &&
      p.lon !== ""
  );

  const [modalVisible, setModalVisible] = useState(false);

  // Cálculo de salud del sistema basado en todos los perfiles
  const totalPerfiles = mergedProfiles.length;
  const activosHoy = mergedProfiles.filter(
    (p) => Array.isArray(p.modules?.today) && p.modules.today.length > 0
  ).length;
  const serviceHealth =
    totalPerfiles > 0 ? Math.round((activosHoy / totalPerfiles) * 100) : 0;

  return (
    <Flex gap={"small"} vertical>
      {/* Estado del servicio */}
      <Flex
        gap={"small"}
        style={{ width: "100%" }}
        vertical={window.innerWidth < 768}
      >
        <Card title="Estado del Servicio" bordered style={{ width: "100%" }}>
          <Flex align="center" justify="space-between">
            <span>Salud del sistema</span>
            <Tag color={getStatusColor(serviceHealth)}>
              {getStatusText(serviceHealth)}
            </Tag>
          </Flex>
          <Progress
            percent={serviceHealth}
            strokeColor={getStatusColor(serviceHealth)}
            format={(percent) => `${Math.round(percent)}%`}
          />
          <div style={{ marginTop: 16, display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Activos</div>
              <List
                size="small"
                dataSource={mergedProfiles}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "2px 0",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {item.config_data?.is_telemetry ? (
                      <CheckCircleOutlined
                        style={{ color: "green", marginRight: 4 }}
                      />
                    ) : (
                      <CloseOutlined style={{ color: "red", marginRight: 4 }} />
                    )}
                    <span>{item.title || "Sin nombre"}</span>
                  </List.Item>
                )}
                locale={{ emptyText: "—" }}
              />
            </div>
          </div>
        </Card>
        <Card hoverable title="Resumen " style={{ width: "100%" }} bordered>
          <Table
            dataSource={(() => {
              // Unir todos los puntos únicos
              const puntosSet = new Set([
                ...consumoPorPuntoHoy.map((p) => p.name),
                ...consumoPorPuntoAyer.map((p) => p.name),
              ]);
              const puntos = Array.from(puntosSet);
              return puntos.map((punto) => {
                const hoy =
                  consumoPorPuntoHoy.find((x) => x.name === punto)?.value || 0;
                const ayer =
                  consumoPorPuntoAyer.find((x) => x.name === punto)?.value || 0;
                const diferencia = hoy - ayer;
                let color = "#666";
                if (diferencia > 0) color = "#fa8c16";
                else if (diferencia < 0) color = "#1976d2";

                // Obtener el estado del logger robusto desde stats
                const loggerStat = (stats.loggerStatuses || []).find(s => s.name === punto);
                let ultimaConexion = "Sin datos";
                let isToday = false;
                let isConnected = false;

                if (loggerStat && loggerStat.last_updated) {
                  ultimaConexion = formatSafeDate(loggerStat.last_updated);
                  isToday = loggerStat.is_today;
                  isConnected = true;
                }

                return {
                  key: punto,
                  punto: punto,
                  diferencia: diferencia,
                  hoy: hoy,
                  ayer: ayer,
                  ultimaConexion: ultimaConexion,
                  isToday: isToday,
                  isConnected: isConnected,
                  color: color,
                };
              });
            })()}
            columns={[
              {
                title: "Punto de captación",
                dataIndex: "punto",
                key: "punto",
                render: (text) => (
                  <Text strong style={{ fontSize: 14 }}>
                    {text}
                  </Text>
                ),
              },
              {
                title: "Diferencia",
                dataIndex: "diferencia",
                key: "diferencia",
                align: "right",
                render: (value) => (
                  <Text
                    strong
                    style={{
                      color:
                        value > 0 ? "#fa8c16" : value < 0 ? "#1976d2" : "#666",
                      fontSize: 13,
                    }}
                  >
                    {value > 0 ? "+" : value < 0 ? "-" : ""}
                    {formatInteger(Math.abs(value))} m³
                  </Text>
                ),
              },
              {
                title: "Hoy",
                dataIndex: "hoy",
                key: "hoy",
                align: "right",
                render: (value) => (
                  <Text strong style={{ fontSize: 13 }}>
                    {formatInteger(value)} m³
                  </Text>
                ),
              },
              {
                title: "Ayer",
                dataIndex: "ayer",
                key: "ayer",
                align: "right",
                render: (value) => (
                  <Text strong style={{ fontSize: 13 }}>
                    {formatInteger(value)} m³
                  </Text>
                ),
              },
              {
                title: "Última conexión",
                dataIndex: "ultimaConexion",
                key: "ultimaConexion",
                align: "center",
                render: (text, record) => (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {record.isConnected ? (
                      record.isToday ? (
                        <Badge
                          status="processing"
                          text={
                            <span
                              style={{
                                color: "#1890ff",
                                fontWeight: 600,
                                animation: "blink 2s infinite",
                                fontSize: 12,
                              }}
                            >
                              {text} hrs
                            </span>
                          }
                        />
                      ) : (
                        <Badge
                          status="default"
                          text={
                            <span style={{ color: "#666", fontSize: 12 }}>
                              {text}
                            </span>
                          }
                        />
                      )
                    ) : (
                      <Badge
                        status="error"
                        text={
                          <span
                            style={{
                              color: "#ff4d4f",
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          >
                            Desconectado
                          </span>
                        }
                      />
                    )}
                  </div>
                ),
              },
            ]}
            pagination={false}
            size="small"
          />
        </Card>
      </Flex>

      <ConsumptionChart />
    </Flex>
  );
};

export default GeneralSummaryUser34;
