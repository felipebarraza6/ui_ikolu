import React, { useState, useMemo, useCallback } from "react";
import { useData } from "../../contexts/DataContext";
import { useControlCenter } from "../../hooks/useControlCenter";
import { Row, Col, Card, Flex, Typography, Spin, Table, Badge, Tag, Progress, Alert, Modal, theme } from "antd";
import { FaMapMarkerAlt, FaSatelliteDish, FaChartBar, FaWifi, FaExclamationTriangle } from "react-icons/fa";
import { IoIosWater } from "react-icons/io";
import KPICard from "./KPICard";
import { formatInteger } from "../../utils/numberFormatter";
import ModuleTour from "../common/ModuleTour";
import { centroControlTour } from "../../config/tours";
import { ikoluTokens, kpiGradients } from "../../theme";

const { Text } = Typography;
const { useToken } = theme;

/**
 * ControlCenter — Nuevo Centro de Control optimizado
 *
 * Consume datos en formato plano (daily_summary) ya sea del endpoint nativo
 * o transformado desde datos legacy. Diseñado para ser eficiente, limpio y
 * fácil de mantener.
 */

// Columnas de la tabla definidas fuera del componente para evitar recreación en cada render.
// Usan ikoluTokens porque no pueden acceder a useToken() fuera de un componente React.
const pointsColumns = [
  {
    title: "Punto",
    dataIndex: "title",
    key: "title",
    render: (text, record) => (
      <Flex vertical gap={2}>
        <Text strong style={{ fontSize: ikoluTokens.fontSizeMid, color: ikoluTokens.colorCorporateBlue }}>
          {text || "—"}
        </Text>
        {record.project_name && record.project_name !== "—" && (
          <Text style={{ fontSize: ikoluTokens.fontSizeBase, color: ikoluTokens.colorGreyText }}>
            {record.project_name}
          </Text>
        )}
      </Flex>
    ),
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status) => (
      <Badge
        status={status.color === "success" ? "success" : status.color === "error" ? "error" : "warning"}
        text={<span style={{ fontSize: ikoluTokens.fontSizeBase }}>{status.label}</span>}
      />
    ),
  },
  {
    title: "Última medición",
    dataIndex: "latest_telemetry",
    key: "latest",
    width: 140,
    render: (lt) => (
      <Text style={{ fontSize: ikoluTokens.fontSizeBase, color: ikoluTokens.colorGreyTextMid }}>
        {lt.date_formatted || "—"}
      </Text>
    ),
  },
  {
    title: "Caudal",
    dataIndex: "latest_telemetry",
    key: "flow",
    width: 100,
    align: "right",
    render: (lt) =>
      lt.flow_lps != null ? <b>{(Number(lt.flow_lps) || 0).toFixed(2)} L/s</b> : "—",
  },
  {
    title: "Nivel",
    dataIndex: "latest_telemetry",
    key: "nivel",
    width: 100,
    align: "right",
    render: (lt) =>
      lt.nivel_m != null ? `${(Number(lt.nivel_m) || 0).toFixed(2)} m` : "—",
  },
  {
    title: "Total",
    dataIndex: "latest_telemetry",
    key: "total",
    width: 120,
    align: "right",
    render: (lt) =>
      lt.total_m3 != null ? `${formatInteger(lt.total_m3)} m³` : "—",
  },
  {
    title: "Alertas",
    dataIndex: "alerts",
    key: "alerts",
    width: 90,
    align: "center",
    render: (alerts) =>
      alerts.count > 0 ? (
        <Tag color="error" style={{ fontSize: ikoluTokens.fontSizeSmall, fontWeight: 700 }}>
          {alerts.count}
        </Tag>
      ) : (
        <span style={{ color: ikoluTokens.colorGreyTextLight, fontSize: ikoluTokens.fontSizeBase }}>0</span>
      ),
  },
];

const ControlCenter = () => {
  const { dispatch } = useData();
  const { data, loading, error, refresh, isReady, source } = useControlCenter({
    autoRefresh: true,
    refreshInterval: 60000,
  });
  const { token } = useToken();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectPoint = useCallback((point) => {
    dispatch({
      type: "CHANGE_SELECTED_PROFILE",
      payload: { selected_profile: { ...point, key: point.id } },
    });
  }, [dispatch]);

  // ── Datos derivados del formato plano ──
  const overview = data?.overview || {};
  const consumption = data?.consumption || {};
  const service = data?.service_status || {};
  const points = data?.points || [];
  const historical = data?.historical || {};
  const meta = data?.meta || {};

  const hasTotalizado = points.some((p) =>
    (p.config_data?.variables || []).some((v) =>
      typeof v === "string" ? v.includes("TOTALIZADO") : v.type_variable?.includes("TOTALIZADO")
    )
  );

  // ── Caudales excedidos (calculado en frontend con datos planos) ──
  const caudalesExcedidos = useMemo(() => {
    return points
      .filter((p) => {
        const flow = p.latest_telemetry?.flow_lps;
        const granted = p.dga?.flow_granted_lps;
        return granted > 0 && flow != null && flow > granted;
      })
      .map((p) => ({
        name: p.title,
        maxFlow: p.latest_telemetry.flow_lps,
        flowGranted: p.dga.flow_granted_lps,
      }));
  }, [points]);

  // ── Loading ──
  if (loading && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
        <Spin size="large" tip="Cargando Centro de Control..." />
      </Flex>
    );
  }

  // ── Error sin datos ──
  if (error && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }} vertical gap={16}>
        <Text type="danger" strong style={{ fontSize: token.fontSizeLG }}>
          Error cargando el Centro de Control
        </Text>
        <Text type="secondary">{error.message}</Text>
        <button onClick={refresh} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Reintentar
        </button>
      </Flex>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* HEADER */}
      <Flex align="center" justify="space-between" style={{ marginBottom: 20 }}>
        <div>
          <Text strong style={{ fontSize: token.fontSize2XL, color: ikoluTokens.colorCorporateBlue }}>
            Centro de Control
          </Text>
          {meta.date_formatted && (
            <Text style={{ fontSize: ikoluTokens.fontSizeBase, color: ikoluTokens.colorGreyText, display: "block" }}>
              {meta.date_formatted}
            </Text>
          )}
        </div>
        <Flex gap={8} align="center">
          {loading && <Spin size="small" />}
          {source === "legacy" && (
            <Tag color="warning" style={{ fontSize: ikoluTokens.fontSizeSmall }}>
              Modo compatibilidad
            </Tag>
          )}
          {service.disconnected_today > 0 && (
            <Badge count={service.disconnected_today} style={{ backgroundColor: token.colorError }}>
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
            icon={<FaMapMarkerAlt style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Total Puntos"
            value={overview.total_points || 0}
            gradient={kpiGradients.primary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaSatelliteDish style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Con GPS"
            value={`${overview.points_with_gps || 0}`}
            suffix={`/${overview.total_points || 0}`}
            gradient={kpiGradients.secondary}
          />
        </Col>
        {hasTotalizado && (
          <>
            <Col xs={12} sm={6} md={6}>
              <KPICard
                icon={<FaChartBar style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
                label="Consumo Hoy"
                value={formatInteger(consumption.today_m3 || 0)}
                sublabel="m³"
              />
            </Col>
            <Col xs={12} sm={6} md={6}>
              <KPICard
                icon={<IoIosWater style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
                label="Histórico Total"
                value={formatInteger(historical.total_accumulated_m3 || 0)}
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
          <Card
            size="small"
            title={
              <Flex align="center" gap="small">
                <FaWifi style={{ color: token.colorSuccess }} />
                <span>Estado del Servicio</span>
              </Flex>
            }
            style={{ borderRadius: token.borderRadiusLG, height: "100%" }}
            headStyle={{ borderBottom: `1px solid ${ikoluTokens.colorBorderLight}` }}
          >
            <Flex align="center" justify="space-between" style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: ikoluTokens.fontSizeMid }}>
                Salud del sistema
              </Text>
              <Tag color={service.health_color || token.colorSuccess} style={{ fontWeight: 600 }}>
                {service.health_label || "Óptimo"}
              </Tag>
            </Flex>
            <Progress
              percent={service.health_percent || 0}
              strokeColor={service.health_color || token.colorSuccess}
              format={(percent) => `${Math.round(percent)}%`}
              strokeWidth={10}
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    background: ikoluTokens.colorBackgroundLight,
                    border: "none",
                    borderRadius: token.borderRadius,
                    textAlign: "center",
                  }}
                >
                  <Text style={{ fontSize: ikoluTokens.fontSizeBase, color: ikoluTokens.colorCorporateBlue, display: "block" }}>
                    Activos hoy
                  </Text>
                  <Text style={{ fontSize: token.fontSize4XL || 24, fontWeight: 700, color: ikoluTokens.colorCorporateBlue }}>
                    {service.connected_today || 0}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    background: (service.disconnected_today || 0) > 0 ? ikoluTokens.colorRedBg : ikoluTokens.colorBackgroundLight,
                    border: "none",
                    borderRadius: token.borderRadius,
                    textAlign: "center",
                  }}
                >
                  <Text style={{ fontSize: ikoluTokens.fontSizeBase, color: (service.disconnected_today || 0) > 0 ? ikoluTokens.colorAccentOrange : ikoluTokens.colorCorporateBlue, display: "block" }}>
                    Sin datos hoy
                  </Text>
                  <Text style={{ fontSize: token.fontSize4XL || 24, fontWeight: 700, color: (service.disconnected_today || 0) > 0 ? ikoluTokens.colorAccentOrange : ikoluTokens.colorCorporateBlue }}>
                    {service.disconnected_today || 0}
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card
            size="small"
            title={
              <Flex align="center" gap="small">
                <FaChartBar style={{ color: token.colorInfo }} />
                <span>Resumen de Consumo</span>
              </Flex>
            }
            style={{ borderRadius: token.borderRadiusLG, height: "100%" }}
            headStyle={{ borderBottom: `1px solid ${ikoluTokens.colorBorderLight}` }}
          >
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "12px 0",
                    background: ikoluTokens.colorBackgroundLight,
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue, display: "block" }}>
                    Hoy
                  </Text>
                  <Text style={{ fontSize: ikoluTokens.fontSize3XL, fontWeight: 700, color: ikoluTokens.colorCorporateBlue }}>
                    {formatInteger(consumption.today_m3 || 0)}
                  </Text>
                  <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue }}>m³</Text>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "12px 0",
                    background: ikoluTokens.colorBackgroundLight,
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue, display: "block" }}>
                    Diferencia
                  </Text>
                  <Text
                    style={{
                      fontSize: ikoluTokens.fontSize3XL,
                      fontWeight: 700,
                      color: (consumption.difference_m3 || 0) >= 0 ? ikoluTokens.colorCorporateBlue : ikoluTokens.colorAccentOrange,
                    }}
                  >
                    {(consumption.difference_m3 || 0) >= 0 ? "+" : "-"}
                    {formatInteger(Math.abs(consumption.difference_m3 || 0))}
                  </Text>
                  <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue }}>m³</Text>
                </div>
              </Col>
              <Col span={8}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "12px 0",
                    background: ikoluTokens.colorBackgroundLight,
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue, display: "block" }}>
                    Ayer
                  </Text>
                  <Text style={{ fontSize: ikoluTokens.fontSize3XL, fontWeight: 700, color: ikoluTokens.colorCorporateBlue }}>
                    {formatInteger(consumption.yesterday_m3 || 0)}
                  </Text>
                  <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue }}>m³</Text>
                </div>
              </Col>
            </Row>

            {caudalesExcedidos.length > 0 && (
              <Alert
                message="Caudales excedidos"
                description={caudalesExcedidos
                  .map((c) => `${c.name}: ${(Number(c.maxFlow) || 0).toFixed(1)} L/s vs ${c.flowGranted} L/s autorizado`)
                  .join(" · ")}
                type="error"
                showIcon
                size="small"
                style={{ marginBottom: 16 }}
              />
            )}

            <Text type="secondary" style={{ fontSize: ikoluTokens.fontSizeBase, display: "block", marginBottom: 8 }}>
              {consumption.date_label_today || "Hoy"} vs {consumption.date_label_yesterday || "Ayer"}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Tabla de puntos */}
      <div id="cc-consumption-chart" style={{ marginTop: 32 }}>
        <Text strong style={{ fontSize: ikoluTokens.fontSizeLarge, display: "block", marginBottom: 4 }}>
          Estado de mis puntos
        </Text>
        <Text type="secondary" style={{ fontSize: ikoluTokens.fontSizeBase, display: "block", marginBottom: 12 }}>
          Última telemetría recibida y estado de conexión de cada punto de captación.
        </Text>
        <Table
          dataSource={points}
          columns={pointsColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{ emptyText: "No hay puntos disponibles" }}
          onRow={(record) => ({
            onClick: () => handleSelectPoint(record),
            style: { cursor: "pointer" },
          })}
        />
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
            <IoIosWater style={{ color: ikoluTokens.colorCorporateBlueBright }} />
            Detalle Total Histórico
          </Flex>
        }
        width={620}
      >
        <Table
          size="small"
          bordered
          style={{ marginTop: 20 }}
          pagination={false}
          dataSource={points.map((p) => ({
            name: p.title,
            total: p.latest_telemetry?.total_m3 || 0,
          }))}
          rowKey="name"
          columns={[
            { title: "Punto", dataIndex: "name", key: "name" },
            {
              title: "Total acumulado",
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

export default React.memo(ControlCenter);
