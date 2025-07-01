import React, { useState } from "react";
import AnalysisPrompt from "./AnalysisPrompt";
import FlowStatusGauges from "./FlowStatusGauges";
import ConsumptionChart from "./ConsumptionChart";
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
import { CloseOutlined } from "@ant-design/icons";
import { useDataStatistics } from "./hooks/useDataValidation";
import { formatInteger } from "../../utils/numberFormatter";
import { IoIosWater } from "react-icons/io";

import "./GeneralSummary.css";
import { CheckCircleOutlined } from "@ant-design/icons";

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
 * GeneralSummary
 * Dashboard principal con resumen completo de todos los puntos de captación
 */
const GeneralSummary = ({ profiles }) => {
  const screens = useBreakpoint();
  const stats = useDataStatistics(profiles);

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

  // Consumo individual por punto
  const consumoIndividual = stats.todayConsumers.map((tc) => ({
    name: tc.name,
    consumo: tc.value,
  }));

  // Acumulado individual por punto
  const acumuladoIndividual = profiles
    .map((p) => {
      const today = Array.isArray(p.modules?.today) ? p.modules.today : [];
      const last = today[today.length - 1];
      return {
        name: p.title,
        acumulado: last && last.total ? Number(last.total) : 0,
      };
    })
    .filter((item) => item.acumulado > 0);

  // Consumo por punto HOY y AYER, directo de mergedProfiles
  const consumoPorPuntoHoy = mergedProfiles.map((p) => ({
    name: p.title,
    value: Number(p.modules?.total_consumed_today) || 0,
  }));
  const consumoPorPuntoAyer = mergedProfiles.map((p) => ({
    name: p.title,
    value: Number(p.modules?.total_consumed_yesterday) || 0,
  }));
  // Total de hoy (debería ser igual a la suma de la columna Hoy de la tabla)
  const totalHoy = consumoPorPuntoHoy.reduce((acc, p) => acc + p.value, 0);

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

  // 3. Mayores Caudales: todos los puntos con today, ordenados de mayor a menor consumo hoy, sin hora
  const picosConsumo = profiles
    .filter(
      (p) => Array.isArray(p.modules?.today) && p.modules.today.length > 0
    )
    .map((p) => ({
      name: p.title,
      value: p.modules?.total_consumed_today
        ? Number(p.modules.total_consumed_today)
        : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // 4. Mayores Bajas: todos los puntos con today, ordenados por mayor baja (hoy vs ayer)
  const bajasConsumo = profiles
    .filter(
      (p) => Array.isArray(p.modules?.today) && p.modules.today.length > 0
    )
    .map((p) => {
      const hoy = p.modules?.total_consumed_today
        ? Number(p.modules.total_consumed_today)
        : 0;
      const ayer = p.modules?.total_consumed_yesterday
        ? Number(p.modules.total_consumed_yesterday)
        : 0;
      return {
        name: p.title,
        change: ayer - hoy,
      };
    })
    .sort((a, b) => b.change - a.change);

  // 5. Total Histórico: mostrar el último total (m1.total o último total disponible) de todos los puntos y la fecha de esa medición
  const totalHistoricoPorPunto = profiles.map((p) => {
    let total = 0;
    let fecha = "";
    if (p.modules?.m1 && p.modules.m1.total) {
      total = Number(p.modules.m1.total);
      fecha = p.modules.m1.date_time_medition
        ? p.modules.m1.date_time_medition.slice(0, 10)
        : "";
    } else if (Array.isArray(p.modules?.today) && p.modules.today.length > 0) {
      const last = p.modules.today[p.modules.today.length - 1];
      total = last && last.total ? Number(last.total) : 0;
      fecha =
        last && last.date_time_medition
          ? last.date_time_medition.slice(0, 10)
          : "";
    }
    return {
      name: p.title,
      total,
      fecha,
    };
  });

  const [modalVisible, setModalVisible] = useState(false);

  // Cálculo de salud del sistema basado en todos los perfiles
  const totalPerfiles = mergedProfiles.length;
  const activosHoy = mergedProfiles.filter(
    (p) => Array.isArray(p.modules?.today) && p.modules.today.length > 0
  ).length;
  const serviceHealth =
    totalPerfiles > 0 ? Math.round((activosHoy / totalPerfiles) * 100) : 0;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Indicadores principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Total de Puntos */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered
            className="general-summary-card"
            style={{
              textAlign: "center",
              minHeight: 200,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Statistic
              title={
                <Flex align="center" justify="center" gap="small">
                  <FaMapMarkerAlt style={{ color: "#1976d2" }} />
                  <Text>Total de Puntos</Text>
                </Flex>
              }
              value={stats.totalProfiles}
            />
          </Card>
        </Col>

        {/* Con GPS */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered
            className="general-summary-card"
            style={{
              textAlign: "center",
              minHeight: 200,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Statistic
              title={
                <Flex align="center" justify="center" gap="small">
                  <FaSatelliteDish style={{ color: "#43a047" }} />
                  <Text>GPS</Text>
                </Flex>
              }
              value={conGPS.length}
              suffix={
                <span style={{ color: "#888" }}>/ {stats.totalProfiles}</span>
              }
            />
          </Card>
        </Col>

        {/* Consumo Hoy */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered
            className="general-summary-card"
            style={{
              textAlign: "center",
              minHeight: 200,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="card-waves">
              <svg
                viewBox="0 0 800 50"
                width="200%"
                height="50"
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  zIndex: 0,
                  animation: "waveMove 8s linear infinite",
                }}
                preserveAspectRatio="none"
              >
                <path
                  d="M0,30 Q100,50 200,30 T400,30 T600,30 T800,30 V50 H0 Z"
                  fill="#e3f2fd"
                  opacity="0.7"
                />
              </svg>
            </div>
            <Statistic
              title={
                <Flex align="center" justify="center" gap="small">
                  <FaChartBar style={{ color: "#1976d2" }} />
                  <Text>Consumo Hoy</Text>
                </Flex>
              }
              value={formatInteger(totalHoy)}
              suffix=" m³"
            />
          </Card>
        </Col>

        {/* Total Acumulado */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered
            className="general-summary-card"
            style={{
              textAlign: "center",
              minHeight: 200,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => setModalVisible(true)}
          >
            <div className="card-waves">
              <svg
                viewBox="0 0 800 50"
                width="200%"
                height="50"
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  zIndex: 0,
                  animation: "waveMove 8s linear infinite",
                }}
                preserveAspectRatio="none"
              >
                <path
                  d="M0,30 Q100,50 200,30 T400,30 T600,30 T800,30 V50 H0 Z"
                  fill="#e3f2fd"
                  opacity="0.7"
                />
              </svg>
            </div>
            <div className="card-content">
              <Statistic
                title={
                  <Flex align="center" justify="center" gap="small">
                    <IoIosWater style={{ color: "#1976d2" }} />
                    <Text>Total Histórico</Text>
                  </Flex>
                }
                value={formatInteger(
                  totalHistoricoPorPunto.reduce((acc, p) => acc + p.total, 0)
                )}
                suffix="m³"
              />
              <div style={{ marginTop: 12, fontSize: 12 }}>
                Click para ver detalle
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Estado del servicio */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Estado del Servicio" bordered style={{ height: "100%" }}>
            <Flex
              align="center"
              justify="space-between"
              style={{ marginBottom: 16 }}
            >
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
                        <CloseOutlined
                          style={{ color: "red", marginRight: 4 }}
                        />
                      )}
                      <span>{item.title || "Sin nombre"}</span>
                    </List.Item>
                  )}
                  locale={{ emptyText: "—" }}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Resumen de Consumo" bordered>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Hoy"
                  value={formatInteger(totalHoy)}
                  suffix="m³"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Diferencia"
                  value={formatInteger(
                    Math.max(0, stats.totals.yesterday - totalHoy)
                  )}
                  suffix="m³"
                  valueStyle={{ color: "orange" }}
                />
              </Col>

              <Col span={8}>
                <Statistic
                  title="Ayer"
                  value={formatInteger(stats.totals.yesterday)}
                  suffix="m³"
                  valueStyle={{ color: "#666" }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "4px 0" }}>
                      Punto
                    </th>
                    <th style={{ textAlign: "right", padding: "4px 0" }}>
                      Diferencia
                    </th>
                    <th style={{ textAlign: "right", padding: "4px 0" }}>
                      Hoy
                    </th>
                    <th style={{ textAlign: "right", padding: "4px 0" }}>
                      Ayer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Unir todos los puntos únicos
                    const puntosSet = new Set([
                      ...consumoPorPuntoHoy.map((p) => p.name),
                      ...consumoPorPuntoAyer.map((p) => p.name),
                    ]);
                    const puntos = Array.from(puntosSet);
                    return puntos.map((punto) => {
                      const hoy =
                        consumoPorPuntoHoy.find((x) => x.name === punto)
                          ?.value || 0;
                      const ayer =
                        consumoPorPuntoAyer.find((x) => x.name === punto)
                          ?.value || 0;
                      const diferencia = hoy - ayer;
                      let color = "#666";
                      if (diferencia > 0) color = "#fa8c16";
                      else if (diferencia < 0) color = "#1976d2";
                      return (
                        <tr key={punto}>
                          <td style={{ padding: "2px 0" }}>{punto}</td>
                          <td
                            style={{
                              textAlign: "right",
                              color,
                              fontWeight: 600,
                            }}
                          >
                            {diferencia > 0 ? "+" : diferencia < 0 ? "-" : ""}
                            {formatInteger(Math.abs(diferencia))} m³
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {formatInteger(hoy)} m³
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {formatInteger(ayer)} m³
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              {/* Línea de debug para validar suma de columna Hoy */}
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                Suma columna Hoy: {formatInteger(totalHoy)} m³
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Análisis general y tarjetas */}
      <AnalysisPrompt profiles={profiles} />

      {/* Gráficas de caudal y gauges */}

      <div style={{ marginTop: 24 }}>
        <ConsumptionChart />
      </div>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title={
          <Flex align="center" gap="small">
            <IoIosWater style={{ color: "#1976d2" }} />
            Detalle Total Histórico
          </Flex>
        }
        width={620}
      >
        <Table
          size="small"
          bordered
          style={{ marginTop: "20px" }}
          pagination={false}
          dataSource={totalHistoricoPorPunto}
          rowKey={(item) => item.name + item.fecha}
          columns={[
            { title: "Punto", dataIndex: "name", key: "name" },
            { title: "Fecha", dataIndex: "fecha", key: "fecha" },
            {
              title: "Total",
              dataIndex: "total",
              key: "total",
              align: "right",
              render: (val) => <b>{formatInteger(val)} m³</b>,
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default GeneralSummary;
