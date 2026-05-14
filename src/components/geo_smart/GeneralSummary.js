import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { AppContext } from "../../App";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { useDashboardData } from "../../hooks/useDashboardData";
import ModuleTour from "../common/ModuleTour";
import { centroControlTour } from "../../config/tours";
import { useDataStatistics } from "./hooks/useDataValidation";
import ConsumptionChart from "./ConsumptionChart";
import CombinedVariablesChart from "./CombinedVariablesChart";
import KPICard from "./KPICard";
import ServiceStatusCard from "./ServiceStatusCard";
import ConsumptionSummaryCard from "./ConsumptionSummaryCard";
import {
  Row,
  Col,
  Flex,
  Typography,
  Spin,
  Badge,
  Tag,
  Modal,
  Table,
} from "antd";
import {
  FaMapMarkerAlt,
  FaSatelliteDish,
  FaChartBar,
  FaExclamationTriangle,
} from "react-icons/fa";
import { IoIosWater } from "react-icons/io";
import { formatInteger } from "../../utils/numberFormatter";
import { formatSafeDate } from "../../utils/dateFormatter";

const { Text } = Typography;

/**
 * GeneralSummary — Dashboard principal optimizado
 *
 * Cambios clave de optimización:
 * - Usa contextos especializados (useAuth, useData) en lugar de AppContext monolítico
 * - Sub-componentes memoizados (KPICard, ServiceStatusCard, ConsumptionSummaryCard)
 * - Hook useDashboardData con batch requests y throttle
 * - React.memo en export para evitar re-renders del padre
 */
const GeneralSummary = ({ profiles: initialProfiles }) => {
  const { state, dispatch } = useContext(AppContext);
  const { user } = useAuth();
  const { selected_profile } = useData();

  const isAdmin = user?.is_staff || user?.is_superuser;

  // 🛡️ Usuarios normales: SIEMPRE usan sus puntos asignados
  const userProfiles = !isAdmin
    ? (initialProfiles?.length > 0 ? initialProfiles : (state.profile_client || state.points_list)) || []
    : (initialProfiles || []);

  // Hook optimizado de dashboard (usa batch nativo)
  const {
    profiles: fetchedProfiles,
    loading,
    lastRefresh,
    refresh,
  } = useDashboardData({
    autoRefresh: true,
    refreshInterval: 60000,
    useBatch: true,
  });

  // Merge: usar datos del hook si están disponibles, sino los props/legacy
  const profiles = fetchedProfiles.length > 0 ? fetchedProfiles : userProfiles;

  const [modalVisible, setModalVisible] = useState(false);

  // Estadísticas computadas (memoizado internamente)
  const stats = useDataStatistics(profiles);

  // --- Detección de TOTALIZADO ---
  const hasAnyTotalizado = useMemo(() => {
    return profiles.some(p => {
      const vars = p?.profile_ikolu?.vars || p?.config_data?.vars || p?.config_data?.variables || [];
      return vars.some(v => {
        if (typeof v === "string") return v.includes("TOTALIZADO");
        return v.type_variable?.includes("TOTALIZADO");
      });
    });
  }, [profiles]);

  const showConsumoSection = hasAnyTotalizado;

  // --- Detectar si los perfiles tienen datos de telemetría ---
  const hasTelemetryData = profiles.some(p => p.latest_telemetry || p.config_data || p.dga);
  const isSimpleMode = !hasTelemetryData && profiles.length > 0 && !isAdmin;

  // --- Handler para seleccionar punto ---
  const handleSelectPoint = useCallback((point) => {
    dispatch({
      type: "CHANGE_SELECTED_PROFILE",
      payload: { selected_profile: { ...point, key: point.id } },
    });
  }, [dispatch]);

  // --- Mapa auxiliar por nombre ---
  const profilesByName = useMemo(() => {
    return profiles.reduce((acc, p) => {
      if (p?.title) acc[p.title] = p;
      return acc;
    }, {});
  }, [profiles]);

  // --- Resumen de consumo ---
  const totalHoy = stats.totals?.today || 0;
  const totalAyer = stats.totals?.yesterday || 0;

  const consumoPorPunto = useMemo(() => {
    return (stats.consumptionChanges || []).map((c) => ({
      name: c.name,
      hoy: c.todaySum || 0,
      ayer: c.yesterdaySum || 0,
    }));
  }, [stats.consumptionChanges]);

  const consumoPorNombre = useMemo(() => {
    return consumoPorPunto.reduce((acc, item) => {
      acc[item.name] = item;
      return acc;
    }, {});
  }, [consumoPorPunto]);

  // --- GPS ---
  const conGPS = useMemo(() => {
    return profiles.filter(
      (p) => p.lat && p.lon && p.lat !== "0" && p.lon !== "0" && p.lat !== "" && p.lon !== ""
    );
  }, [profiles]);

  // --- Total Histórico ---
  const totalHistoricoPorPunto = useMemo(() => {
    return profiles.map((p) => {
      const computedHist = p._computed?.historical;
      return {
        name: p.title,
        total: computedHist?.total ?? 0,
        fecha: computedHist?.date ?? "—",
      };
    });
  }, [profiles]);

  // --- Estado del servicio ---
  const loggerStatuses = stats.loggerStatuses || [];
  const totalPerfiles = loggerStatuses.length || profiles.length;
  const activosHoy = loggerStatuses.filter((s) => s.is_today).length;
  const inactivosHoy = totalPerfiles - activosHoy;
  const serviceHealth = totalPerfiles > 0 ? Math.round((activosHoy / totalPerfiles) * 100) : 0;

  const puntosDesconectados = useMemo(() => {
    return loggerStatuses
      .filter((s) => !s.is_today && s.is_telemetry)
      .map((s) => s.name);
  }, [loggerStatuses]);

  // --- Caudales excedidos ---
  const caudalesExcedidos = useMemo(() => {
    return (stats.highestFlows || [])
      .map((hf) => {
        const profile = profilesByName[hf.name];
        const flowGranted = profile?.dga?.flow_granted_dga !== undefined
          ? Number(profile.dga.flow_granted_dga) || 0
          : 0;
        const excedido = flowGranted > 0 && hf.value !== null && hf.value > flowGranted;
        return { name: hf.name, maxFlow: hf.value, flowGranted, excedido };
      })
      .filter((item) => item.excedido);
  }, [stats.highestFlows, profilesByName]);

  // Loading inicial
  if (loading && profiles.length === 0) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
        <Spin size="large" tip="Cargando datos actualizados desde la API..." />
      </Flex>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* HEADER */}
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

      {/* KPIs */}
      <Row id="cc-kpi-cards" gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaMapMarkerAlt style={{ fontSize: 20, color: "white" }} />}
            label="Total Puntos"
            value={stats.totalProfiles}
            gradient="linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)"
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaSatelliteDish style={{ fontSize: 20, color: "white" }} />}
            label="Con GPS"
            value={`${conGPS.length}`}
            suffix={`/${stats.totalProfiles}`}
            gradient="linear-gradient(135deg, #2A4A7A 0%, #3B6CA8 100%)"
          />
        </Col>
        {showConsumoSection && (
          <>
            <Col xs={12} sm={6} md={6}>
              <KPICard
                icon={<FaChartBar style={{ fontSize: 20, color: "white" }} />}
                label="Consumo Hoy"
                value={formatInteger(totalHoy)}
                sublabel="m³"
              />
            </Col>
            <Col xs={12} sm={6} md={6}>
              <KPICard
                icon={<IoIosWater style={{ fontSize: 20, color: "white" }} />}
                label="Histórico Total"
                value={formatInteger(totalHistoricoPorPunto.reduce((acc, p) => acc + p.total, 0))}
                sublabel="m³ · Click para detalle"
                onClick={() => setModalVisible(true)}
              />
            </Col>
          </>
        )}
      </Row>

      {/* Estado del Servicio + Consumo */}
      <Row id="cc-geo-map" gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <ServiceStatusCard
            serviceHealth={serviceHealth}
            activosHoy={activosHoy}
            inactivosHoy={inactivosHoy}
            loggerStatuses={loggerStatuses}
            puntosDesconectados={puntosDesconectados}
            isSimpleMode={isSimpleMode}
            profiles={profiles}
            selectedProfileId={selected_profile?.id}
            onSelectPoint={handleSelectPoint}
          />
        </Col>
        <Col xs={24} md={16}>
          <ConsumptionSummaryCard
            totalHoy={totalHoy}
            totalAyer={totalAyer}
            consumoPorNombre={consumoPorNombre}
            profilesByName={profilesByName}
            caudalesExcedidos={caudalesExcedidos}
          />
        </Col>
      </Row>

      {/* Variables en Tiempo Real */}
      <div id="cc-consumption-chart" style={{ marginTop: 32 }}>
        <Text strong style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
          Detalle por punto en tiempo real
        </Text>
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
          Selecciona un punto en el desplegable para ver sus variables (caudal, consumo, niveles) en un solo gráfico y en una tabla navegable.
        </Text>
        <CombinedVariablesChart profiles={profiles} />
      </div>

      <ModuleTour
        tourKey={centroControlTour.key}
        steps={centroControlTour.steps}
        requiresPoint={centroControlTour.requiresPoint}
        hasPoint={true}
        autoStart={true}
        delay={1000}
      />

      {/* Modal Histórico */}
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

// 🚀 React.memo: evita re-renders cuando el padre cambia pero las props son iguales
export default React.memo(GeneralSummary);
