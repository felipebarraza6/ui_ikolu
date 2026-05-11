import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
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
  Alert,
  Tooltip,
} from "antd";
import { FaMapMarkerAlt, FaSatelliteDish, FaChartBar, FaWifi, FaExclamationTriangle, FaEye, FaHome } from "react-icons/fa";
import { CloseOutlined } from "@ant-design/icons";
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
  const isAdmin = state.user?.is_staff || state.user?.is_superuser;

  // 🛡️ Usuarios normales: SIEMPRE usan sus puntos asignados.
  // NUNCA llamar al endpoint global que retorna todos los puntos del sistema.
  const userProfiles = !isAdmin
    ? (initialProfiles?.length > 0 ? initialProfiles : state.profile_client) || []
    : (initialProfiles || []);

  const [profiles, setProfiles] = useState(userProfiles);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  useBreakpoint(); // se mantiene la llamada para futura lógica responsiva

  // ✅ Auto-refresh silencioso cada 60 segundos
  // 🆕 Carga puntos desde endpoints específicos según el tipo de usuario
  const fetchFreshData = async (silent = false, pointId = null) => {
    if (!silent) setLoading(true);
    try {
      if (pointId) {
        // Si hay un punto seleccionado explícitamente, cargar su summary
        const response = await sh.getPointSummary(pointId);
        if (response && response.id) {
          setProfiles([response]);
          setLastRefresh(new Date());
        }
      } else if (isAdmin) {
        // Solo admin puede ver el resumen global de todos los puntos
        const response = await sh.getPointsSummary();
        const freshProfiles = response.points || response.results || response || [];
        setProfiles(freshProfiles);
        setLastRefresh(new Date());
      } else {
        // Usuario normal: SIEMPRE usar /api/ik/my_points/ para obtener SOLO sus puntos
        const response = await sh.getMyPoints();
        // my_points puede responder un array directo o un objeto con points/results
        const myPoints = Array.isArray(response)
          ? response
          : (response.points || response.results || []);
        setProfiles(myPoints);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      // Fallback: usar los puntos que ya teníamos (del login o props)
      setProfiles(userProfiles);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Solo pasar pointId cuando initialProfiles tiene exactamente 1 elemento
    // (punto seleccionado explícitamente). Si tiene 0 o >1, es lista de puntos.
    const explicitPointId = initialProfiles?.length === 1 ? initialProfiles[0]?.id : null;
    fetchFreshData(false, explicitPointId);
    // Auto-refresh cada 60 segundos para todos (admin: points_summary, normal: my_points)
    const interval = setInterval(() => fetchFreshData(true, explicitPointId), 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfiles.length, isAdmin, initialProfiles?.length]);

  const stats = useDataStatistics(profiles);

  // Logger statuses ya vienen robustos desde el hook useDataStatistics
  const loggerStatusesFinal = stats.loggerStatuses || [];

  // --- Detectar si AL MENOS UN punto tiene TOTALIZADO o CAUDAL ---
  // 🆕 Acepta tanto formato antiguo (objetos con type_variable) como nuevo (strings)
  const hasAnyTotalizado = profiles.some(p => {
    const vars = p?.profile_ikolu?.vars || p?.config_data?.vars || p?.config_data?.variables || [];
    return vars.some(v => {
      if (typeof v === "string") return v.includes("TOTALIZADO");
      return v.type_variable?.includes("TOTALIZADO");
    });
  });

  // Mostrar sección de consumo solo si hay al menos un punto con TOTALIZADO
  const showConsumoSection = hasAnyTotalizado;
  const showServiceSection = true; // Estado del Servicio siempre visible

  // 🆕 Detectar si los perfiles tienen datos de telemetría (vienen de points_summary)
  // o son simples (vienen de my_points: solo id, title, project_name, is_owner, is_viewer)
  const hasTelemetryData = profiles.some(p => p.latest_telemetry || p.config_data || p.dga);
  const isSimpleMode = !hasTelemetryData && profiles.length > 0 && !isAdmin;

  // Handler para seleccionar un punto desde la lista simple
  const handleSelectPoint = (point) => {
    dispatch({
      type: "CHANGE_SELECTED_PROFILE",
      payload: { selected_profile: { ...point, key: point.id } },
    });
  };

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
      {/* HEADER ELEGANTE */}
      <Flex align="center" justify="flex-end" style={{ marginBottom: 20 }}>
        <Flex gap={8}>
          {loading && <Spin size="small" />}
          {puntosDesconectados.length > 0 && (
            <Badge
              count={puntosDesconectados.length}
              style={{ backgroundColor: "#ff4d4f" }}
            >
              <Tag icon={<FaExclamationTriangle />} color="error">
                Desconectados
              </Tag>
            </Badge>
          )}
        </Flex>
      </Flex>

      {/* KPIs MODERNOS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Total de Puntos */}
        <Col xs={12} sm={6} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(31, 52, 97, 0.25)",
            }}
            bodyStyle={{ padding: "20px 16px" }}
          >
            <Flex align="center" gap="small">
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <FaMapMarkerAlt style={{ fontSize: 20, color: "white" }} />
              </div>
              <div>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "block" }}>
                  Total Puntos
                </Text>
                <Text style={{ fontSize: 28, color: "white", fontWeight: 700, lineHeight: 1 }}>
                  {stats.totalProfiles}
                </Text>
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Con GPS */}
        <Col xs={12} sm={6} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #2A4A7A 0%, #3B6CA8 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(42, 74, 122, 0.25)",
            }}
            bodyStyle={{ padding: "20px 16px" }}
          >
            <Flex align="center" gap="small">
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <FaSatelliteDish style={{ fontSize: 20, color: "white" }} />
              </div>
              <div>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "block" }}>
                  Con GPS
                </Text>
                <Text style={{ fontSize: 28, color: "white", fontWeight: 700, lineHeight: 1 }}>
                  {conGPS.length}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>/{stats.totalProfiles}</span>
                </Text>
              </div>
            </Flex>
          </Card>
        </Col>

        {/* Consumo Hoy */}
        {showConsumoSection && (
        <Col xs={12} sm={6} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #1F3461 0%, #2A4A7A 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(31, 52, 97, 0.25)",
            }}
            bodyStyle={{ padding: "20px 16px" }}
          >
            <Flex align="center" gap="small">
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <FaChartBar style={{ fontSize: 20, color: "white" }} />
              </div>
              <div>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "block" }}>
                  Consumo Hoy
                </Text>
                <Text style={{ fontSize: 28, color: "white", fontWeight: 700, lineHeight: 1 }}>
                  {formatInteger(totalHoy)}
                </Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>m³</Text>
              </div>
            </Flex>
          </Card>
        </Col>
        )}

        {/* Total Histórico */}
        {showConsumoSection && (
        <Col xs={12} sm={6} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #1B2D52 0%, #1F3461 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(27, 45, 82, 0.25)",
              cursor: "pointer",
            }}
            bodyStyle={{ padding: "20px 16px" }}
            onClick={() => setModalVisible(true)}
          >
            <Flex align="center" gap="small">
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <IoIosWater style={{ fontSize: 20, color: "white" }} />
              </div>
              <div>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "block" }}>
                  Histórico Total
                </Text>
                <Text style={{ fontSize: 28, color: "white", fontWeight: 700, lineHeight: 1 }}>
                  {formatInteger(totalHistoricoPorPunto.reduce((acc, p) => acc + p.total, 0))}
                </Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>m³ · Click para detalle</Text>
              </div>
            </Flex>
          </Card>
        </Col>
        )}
      </Row>

      {/* Estado del Servicio + Consumo */}
      {showServiceSection && (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card
            size="small"
            title={
              <Flex align="center" gap="small">
                <FaWifi style={{ color: "#52C41A" }} />
                <span>Estado del Servicio</span>
              </Flex>
            }
            style={{ borderRadius: 16, height: "100%" }}
            headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          >
            <Flex align="center" justify="space-between" style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Salud del sistema</Text>
              <Tag color={getStatusColor(serviceHealth)} style={{ fontWeight: 600 }}>
                {getStatusText(serviceHealth)}
              </Tag>
            </Flex>
            <Progress
              percent={serviceHealth}
              strokeColor={getStatusColor(serviceHealth)}
              format={(percent) => `${Math.round(percent)}%`}
              strokeWidth={10}
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card size="small" style={{ background: "#f2f5fa", border: "none", borderRadius: 8, textAlign: "center" }}>
                  <Text style={{ fontSize: 12, color: "#1F3461", display: "block" }}>Activos hoy</Text>
                  <Text style={{ fontSize: 24, fontWeight: 700, color: "#1F3461" }}>{activosHoy}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: inactivosHoy > 0 ? "#FFF2F0" : "#f2f5fa", border: "none", borderRadius: 8, textAlign: "center" }}>
                  <Text style={{ fontSize: 12, color: inactivosHoy > 0 ? "#FF6B35" : "#1F3461", display: "block" }}>Sin datos hoy</Text>
                  <Text style={{ fontSize: 24, fontWeight: 700, color: inactivosHoy > 0 ? "#FF6B35" : "#1F3461" }}>{inactivosHoy}</Text>
                </Card>
              </Col>
            </Row>

            <div style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                {isSimpleMode ? "Mis Puntos" : "Estado por punto"}
              </Text>
              {isSimpleMode ? (
                <List
                  size="small"
                  dataSource={profiles}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: "10px 12px",
                        border: "none",
                        fontSize: 13,
                        cursor: "pointer",
                        borderRadius: 8,
                        background: state.selected_profile?.id === item.id ? "#e6f7ff" : "#f6ffed",
                        marginBottom: 4,
                        border: state.selected_profile?.id === item.id ? "1px solid #1890ff" : "1px solid transparent",
                        transition: "all 0.2s",
                      }}
                      onClick={() => handleSelectPoint(item)}
                    >
                      <Flex align="center" gap="small" style={{ width: "100%" }}>
                        {/* Indicador de telemetría */}
                        <Badge
                          status={item.is_telemetry ? "processing" : "default"}
                          color={item.is_telemetry ? "#52C41A" : "#d9d9d9"}
                          style={{ flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Flex align="center" gap={4}>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</span>
                            {item.is_owner ? (
                              <Tooltip title="Propietario">
                                <FaHome style={{ color: "#52c41a", fontSize: 12 }} />
                              </Tooltip>
                            ) : item.is_viewer ? (
                              <Tooltip title="Observador">
                                <FaEye style={{ color: "#1890ff", fontSize: 12 }} />
                              </Tooltip>
                            ) : null}
                          </Flex>
                          <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                            {item.project_name}
                            {item.frecuency && (
                              <Tag size="small" style={{ fontSize: 10, marginLeft: 6, marginRight: 0 }}>
                                {item.frecuency}min
                              </Tag>
                            )}
                          </Text>
                        </div>
                        {/* Badge de alertas (preparado para cuando el backend lo envíe) */}
                        {item.alerts_count > 0 && (
                          <Badge
                            count={item.alerts_count}
                            style={{ backgroundColor: "#ff4d4f", flexShrink: 0 }}
                          />
                        )}
                      </Flex>
                    </List.Item>
                  )}
                  locale={{ emptyText: "Sin puntos asignados" }}
                />
              ) : (
                <>
                  <List
                    size="small"
                    dataSource={loggerStatusesFinal}
                    renderItem={(item) => {
                      const isTelemetry = item.is_telemetry ?? item.config_data?.is_telemetry === true;
                      const isToday = item.is_today ?? false;
                      return (
                        <List.Item style={{ padding: "4px 0", border: "none", fontSize: 12 }}>
                          <Flex align="center" gap="small" style={{ width: "100%" }}>
                            <Badge
                              status={isTelemetry ? (isToday ? "success" : "error") : "default"}
                              color={isTelemetry ? (isToday ? "#52C41A" : "#ff4d4f") : "#d9d9d9"}
                            />
                            <span style={{ flex: 1 }}>{item.name}</span>
                            <Tag
                              size="small"
                              color={isTelemetry ? (isToday ? "success" : "error") : "default"}
                              style={{ fontSize: 10, margin: 0 }}
                            >
                              {isTelemetry ? (isToday ? "OK" : "Sin datos") : "No telemetría"}
                            </Tag>
                          </Flex>
                        </List.Item>
                      );
                    }}
                    locale={{ emptyText: "Sin puntos" }}
                  />
                  {puntosDesconectados.length > 0 && (
                    <Alert
                      message={`${puntosDesconectados.length} punto(s) sin datos hoy`}
                      description={puntosDesconectados.join(", ")}
                      type="warning"
                      showIcon
                      size="small"
                      style={{ marginTop: 8, fontSize: 11 }}
                    />
                  )}
                </>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card
            size="small"
            title={
              <Flex align="center" gap="small">
                <FaChartBar style={{ color: "#1890ff" }} />
                <span>Resumen de Consumo</span>
              </Flex>
            }
            style={{ borderRadius: 16, height: "100%" }}
            headStyle={{ borderBottom: "1px solid #f0f0f0" }}
          >
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <div style={{ textAlign: "center", padding: "12px 0", background: "#f2f5fa", borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, color: "#1F3461", display: "block" }}>Hoy</Text>
                  <Text style={{ fontSize: 22, fontWeight: 700, color: "#1F3461" }}>{formatInteger(totalHoy)}</Text>
                  <Text style={{ fontSize: 11, color: "#1F3461" }}>m³</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center", padding: "12px 0", background: "#f2f5fa", borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, color: "#1F3461", display: "block" }}>Diferencia</Text>
                  <Text style={{ fontSize: 22, fontWeight: 700, color: totalHoy >= totalAyer ? "#1F3461" : "#FF6B35" }}>
                    {totalHoy >= totalAyer ? "+" : "-"}{formatInteger(Math.abs(totalHoy - totalAyer))}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#1F3461" }}>m³</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center", padding: "12px 0", background: "#f2f5fa", borderRadius: 12 }}>
                  <Text style={{ fontSize: 11, color: "#1F3461", display: "block" }}>Ayer</Text>
                  <Text style={{ fontSize: 22, fontWeight: 700, color: "#1F3461" }}>{formatInteger(totalAyer)}</Text>
                  <Text style={{ fontSize: 11, color: "#1F3461" }}>m³</Text>
                </div>
              </Col>
            </Row>

            <Table
              size="small"
              pagination={false}
              dataSource={Object.keys(consumoPorNombre).map((punto) => {
                const profile = profilesByName[punto];
                const vars = profile?.profile_ikolu?.vars || profile?.config_data?.vars || profile?.config_data?.variables || [];
                const hasTotalizado = vars.some(v => v.type_variable?.includes("TOTALIZADO"));
                const hoy = consumoPorNombre[punto]?.hoy || 0;
                const ayer = consumoPorNombre[punto]?.ayer || 0;
                const diferencia = hoy - ayer;
                return {
                  key: punto,
                  punto,
                  hasTotalizado,
                  hoy,
                  ayer,
                  diferencia,
                };
              })}
              columns={[
                {
                  title: "Punto",
                  dataIndex: "punto",
                  key: "punto",
                  render: (text, record) => !record.hasTotalizado ? (
                    <Text type="secondary" style={{ fontSize: 11 }}>{text} <Tag size="small" style={{ fontSize: 10 }}>Sin totalizado</Tag></Text>
                  ) : text,
                },
                {
                  title: "Diferencia",
                  dataIndex: "diferencia",
                  key: "diferencia",
                  align: "right",
                  render: (val, record) => !record.hasTotalizado ? "—" : (
                    <span style={{ color: val > 0 ? "#fa8c16" : val < 0 ? "#1976d2" : "#666", fontWeight: 600 }}>
                      {val > 0 ? "+" : val < 0 ? "-" : ""}{formatInteger(Math.abs(val))} m³
                    </span>
                  ),
                },
                {
                  title: "Hoy",
                  dataIndex: "hoy",
                  key: "hoy",
                  align: "right",
                  render: (val, record) => !record.hasTotalizado ? "—" : <b>{formatInteger(val)} m³</b>,
                },
                {
                  title: "Ayer",
                  dataIndex: "ayer",
                  key: "ayer",
                  align: "right",
                  render: (val, record) => !record.hasTotalizado ? "—" : <span style={{ color: "#888" }}>{formatInteger(val)} m³</span>,
                },
              ]}
              locale={{ emptyText: "Sin datos de consumo" }}
            />
            {caudalesExcedidos.length > 0 && (
              <Alert
                message="Caudales excedidos"
                description={caudalesExcedidos.map(c => `${c.name}: ${c.maxFlow?.toFixed?.(1) || 0} L/s vs ${c.flowGranted} L/s autorizado`).join(" · ")}
                type="error"
                showIcon
                size="small"
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        </Col>
      </Row>
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
