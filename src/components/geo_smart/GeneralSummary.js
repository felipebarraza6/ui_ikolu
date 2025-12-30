import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../App";
import optimizedSh from "../../api/sh/optimizedEndpoints";
import AnalysisPrompt from "./AnalysisPrompt";
import ConsumptionChart from "./ConsumptionChart";
import CombinedVariablesChart from "./CombinedVariablesChart";
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
  Modal,
  Table,
  Spin,
} from "antd";
import { FaMapMarkerAlt, FaSatelliteDish, FaChartBar } from "react-icons/fa";
import { CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import { useDataStatistics } from "./hooks/useDataValidation";
import { formatInteger } from "../../utils/numberFormatter";
import { parseSafeDate, formatSafeDate } from "../../utils/dateFormatter";
import { IoIosWater } from "react-icons/io";

import "./GeneralSummary.css";

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
 * OPTIMIZADO: Usa endpoints con deduplicación y caché automático
 */
const GeneralSummary = ({ profiles: initialProfiles }) => {
  const { state, dispatch } = useContext(AppContext);
  const [profiles, setProfiles] = useState(initialProfiles || []);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  useBreakpoint(); // se mantiene la llamada para futura lógica responsiva

  // ✅ OPTIMIZADO: Usa endpoint con deduplicación y caché
  const fetchFreshData = async () => {
    setLoading(true);
    try {
      // Usa versión optimizada que incluye deduplicación
      const response = await optimizedSh.get_profile();
      if (response && response.user && response.user.catchment_points) {
        const freshProfiles = response.user.catchment_points;
        setProfiles(freshProfiles);
        setLastRefresh(new Date());

        // Actualizar el contexto global con los datos frescos
        dispatch({
          type: "UPDATE",
          payload: {
            user: response.user,
            selected_profile: state.selected_profile || freshProfiles[0],
          },
        });
      }
    } catch (error) {
      console.error("Error fetching fresh profile data:", error);
      // Si falla, usar los datos del contexto o los iniciales
      setProfiles(state.profile_client || initialProfiles || []);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos frescos al montar el componente
  useEffect(() => {
    fetchFreshData();
  }, []); // Solo al montar

  const stats = useDataStatistics(profiles);

  // Logger statuses ya vienen robustos desde el hook useDataStatistics
  const loggerStatusesFinal = stats.loggerStatuses || [];

  // --- Detectar si AL MENOS UN punto tiene TOTALIZADO o CAUDAL ---
  const hasAnyTotalizado = profiles.some(p => {
    const vars = p?.profile_ikolu?.vars || p?.config_data?.vars || p?.config_data?.variables || [];
    return vars.some(v => v.type_variable?.includes("TOTALIZADO"));
  });

  const hasAnyCaudal = profiles.some(p => {
    const vars = p?.profile_ikolu?.vars || p?.config_data?.vars || p?.config_data?.variables || [];
    return vars.some(v => v.type_variable?.includes("CAUDAL"));
  });

  // Mostrar secciones solo si hay al menos un punto con la variable correspondiente
  const showConsumoSection = hasAnyTotalizado;
  const showAnalysisSection = hasAnyTotalizado || hasAnyCaudal; // Solo si hay datos de consumo/caudal
  const showServiceSection = true; // Estado del Servicio siempre visible

  // --- Mapa auxiliar por nombre de punto ---
  const profilesByName = profiles.reduce((acc, p) => {
    if (p?.title) {
      acc[p.title] = p;
    }
    return acc;
  }, {});

  // --- RESUMEN DE CONSUMO BASADO EN TELEMETRÍA REAL ---
  // Usamos las estadísticas del hook (modules.today/yesterday) para
  // que el centro de control muestre lo mismo que el módulo de telemetría.
  const totalHoy = stats.totals?.today || 0;
  const totalAyer = stats.totals?.yesterday || 0;

  // Lista por punto usando consumptionChanges (todaySum / yesterdaySum)
  const consumoPorPunto = (stats.consumptionChanges || []).map((c) => ({
    name: c.name,
    hoy: c.todaySum || 0,
    ayer: c.yesterdaySum || 0,
  }));

  const consumoPorNombre = consumoPorPunto.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
  }, {});

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

  // 5. Total Histórico: mostrar el último total (m1.total o último total disponible) de todos los puntos y la fecha de esa medición
  const totalHistoricoPorPunto = profiles.map((p) => {
    // Usar los datos pre-calculados por useDataStatistics si existen (vienen en _computed)
    const computedHist = p._computed?.historical;
    
    return {
      name: p.title,
      total: computedHist?.total ?? 0,
      fecha: computedHist?.date ?? "—",
    };
  });

  const [modalVisible, setModalVisible] = useState(false);

  // --- ESTADO DEL SERVICIO Y CONECTIVIDAD ---
  const loggerStatuses = stats.loggerStatuses || [];
  const totalPerfiles = loggerStatuses.length || profiles.length; // Usar profiles.length si loggerStatuses está vacío

  const activosHoy = loggerStatuses.filter((s) => s.is_today).length;
  const inactivosHoy = totalPerfiles - activosHoy;

  const serviceHealth =
    totalPerfiles > 0 ? Math.round((activosHoy / totalPerfiles) * 100) : 0;

  const puntosDesconectados = loggerStatuses
    .filter((s) => !s.is_today && s.is_telemetry)
    .map((s) => s.name);

  // --- DETECCIÓN DE CAUDALES ELEVADOS/EXCEDIDOS ---
  // Usamos highestFlows (máximo caudal del día) y el caudal autorizado DGA (flow_granted_dga).
  const caudalesExcedidos = (stats.highestFlows || [])
    .map((hf) => {
      const profile = profilesByName[hf.name];
      const flowGranted =
        profile?.dga?.flow_granted_dga !== undefined
          ? Number(profile.dga.flow_granted_dga) || 0
          : 0;

      const excedido =
        flowGranted > 0 && hf.value !== null && hf.value > flowGranted;

      return {
        name: hf.name,
        maxFlow: hf.value,
        flowGranted,
        excedido,
      };
    })
    .filter((item) => item.excedido);

  // Mostrar indicador de carga mientras se obtienen datos frescos
  if (loading && profiles.length === 0) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
        <Spin size="large" tip="Cargando datos actualizados desde la API..." />
      </Flex>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Botón de refresco manual */}
      <Flex justify="flex-end" style={{ marginBottom: 16 }}>
        <Flex align="center" gap={12}>
          {lastRefresh && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Última actualización: {lastRefresh.toLocaleTimeString()}
            </Text>
          )}
          <button
            onClick={fetchFreshData}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              background: loading ? "#f5f5f5" : "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
          >
            <ReloadOutlined spin={loading} />
            {loading ? "Actualizando..." : "Actualizar datos"}
          </button>
        </Flex>
      </Flex>

      {/* Indicadores principales - Siempre visibles */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} justify="center">
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

        {/* Consumo Hoy - Solo si hay TOTALIZADO */}
        {showConsumoSection && (
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
        )}

        {/* Total Acumulado - Solo si hay TOTALIZADO */}
        {showConsumoSection && (
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
        )}
      </Row>

      {/* Estado del servicio - Solo si hay TOTALIZADO o CAUDAL */}
      {showServiceSection && (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Estado del Servicio" bordered style={{ height: "100%" }}>
            {/* Indicador global de salud del sistema basado en puntos con datos HOY */}
            <Flex
              align="center"
              justify="space-between"
              style={{ marginBottom: 8 }}
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
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#666",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                Activos hoy: <b>{activosHoy}</b> / {totalPerfiles}
              </span>
              <span style={{ color: inactivosHoy > 0 ? "#ff4d4f" : "#999" }}>
                Sin datos hoy: <b>{inactivosHoy}</b>
              </span>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  Puntos de telemetría
                </div>
                <List
                  size="small"
                  dataSource={loggerStatusesFinal}
                  renderItem={(item) => {
                    const isTelemetry =
                      item.is_telemetry ??
                      item.config_data?.is_telemetry === true;
                    const isToday = item.is_today ?? false;

                    return (
                      <List.Item
                        style={{
                          padding: "2px 0",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                        }}
                      >
                        {isTelemetry ? (
                          isToday ? (
                            <Badge
                              status="processing"
                              color="#52c41a"
                              text={
                                <span style={{ color: "#52c41a" }}>OK hoy</span>
                              }
                            />
                          ) : (
                            <Badge
                              status="error"
                              color="#ff4d4f"
                              text={
                                <span style={{ color: "#ff4d4f" }}>
                                  Sin datos hoy
                                </span>
                              }
                            />
                          )
                        ) : (
                          <CloseOutlined
                            style={{ color: "red", marginRight: 4 }}
                          />
                        )}
                        <span>{item.name}</span>
                      </List.Item>
                    );
                  }}
                  locale={{ emptyText: "—" }}
                />
                {puntosDesconectados.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "#ff4d4f",
                    }}
                  >
                    Posibles desconexiones: {puntosDesconectados.join(", ")}
                  </div>
                )}
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
                  value={formatInteger(Math.max(0, totalAyer - totalHoy))}
                  suffix="m³"
                  valueStyle={{ color: "orange" }}
                />
              </Col>

              <Col span={8}>
                <Statistic
                  title="Ayer"
                  value={formatInteger(totalAyer)}
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
                  {Object.keys(consumoPorNombre)
                    .map((punto) => {
                    // Verificar si el punto tiene TOTALIZADO
                    const profile = profilesByName[punto];
                    const vars = profile?.profile_ikolu?.vars || profile?.config_data?.vars || profile?.config_data?.variables || [];
                    const hasTotalizado = vars.some(v => v.type_variable?.includes("TOTALIZADO"));
                    
                    if (!hasTotalizado) {
                      // Mostrar fila indicando que no tiene totalizado
                      return (
                        <tr key={punto}>
                          <td style={{ padding: "2px 0" }}>{punto}</td>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "center",
                              color: "#999",
                              fontStyle: "italic",
                              fontSize: 11,
                            }}
                          >
                            Punto sin totalizado
                          </td>
                        </tr>
                      );
                    }
                    
                    // Mostrar datos normales para puntos con totalizado
                    const hoy = consumoPorNombre[punto].hoy || 0;
                    const ayer = consumoPorNombre[punto].ayer || 0;
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
                  })}
                </tbody>
              </table>
              {/* Línea de debug para validar suma de columna Hoy */}
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                Suma columna Hoy: {formatInteger(totalHoy)} m³
              </div>
              {/* Resumen rápido de caudales excedidos según caudal autorizado (DGA) */}
              {caudalesExcedidos.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#ff4d4f",
                  }}
                >
                  Puntos con caudal sobre el autorizado:{" "}
                  {caudalesExcedidos
                    .map(
                      (c) =>
                        `${c.name} (máx ${
                          c.maxFlow?.toFixed?.(1) || 0
                        } L/s vs ${c.flowGranted} L/s)`
                    )
                    .join(", ")}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      )}

      {/* Análisis inteligente del día - Solo si hay TOTALIZADO o CAUDAL */}
      {showAnalysisSection && (
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <Text strong style={{ fontSize: 14 }}>
          Análisis inteligente del día
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Aquí se resume cómo han cambiado los consumos, qué puntos bajaron y
          cómo está la conexión de los loggers.
        </Text>
      </div>
      )}
      {showAnalysisSection && (
      <AnalysisPrompt profiles={profiles} />
      )}

      {/* Variables en Tiempo Real - Siempre visible */}
      <div style={{ marginTop: 32 }}>
        <Text
          strong
          style={{ fontSize: 14, display: "block", marginBottom: 4 }}
        >
          Detalle por punto en tiempo real
        </Text>
        <Text
          type="secondary"
          style={{ fontSize: 12, display: "block", marginBottom: 12 }}
        >
          Selecciona un punto en el desplegable para ver sus variables (caudal,
          consumo, niveles) en un solo gráfico y en una tabla navegable.
        </Text>
        <CombinedVariablesChart profiles={profiles} />
      </div>

      {/* Gráfica de consumo histórico */}

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
