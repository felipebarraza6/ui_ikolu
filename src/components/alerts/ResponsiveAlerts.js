import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Tag,
  Flex,
  Button,
  Drawer,
} from "antd";
import {
  AlertOutlined,
  PlusOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import FormAlert from "./FormAlert";
import TableAlerts from "./TableAlerts";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";
import { formatInteger } from "../../utils/numberFormatter";


const KPI_CARD_STYLES = {
  activas: {
    borderColor: "#FF6B35",
    iconColor: "#FF6B35",
    bg: "#FFF7F2",
  },
  total: {
    borderColor: "#1F3461",
    iconColor: "#1F3461",
    bg: "#F2F5FA",
  },
  resueltas: {
    borderColor: "#52C41A",
    iconColor: "#52C41A",
    bg: "#F6FFF0",
  },
  ultima: {
    borderColor: "#BDC00C",
    iconColor: "#BDC00C",
    bg: "#FAFBF0",
  },
};

const ResponsiveAlerts = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { state } = useContext(AppContext);
  const [update, setUpdate] = useState(false);
  const selected_id = state.selected_profile.id;
  const [tickets, setTickets] = useState([]);
  const [ticketsActives, setTicketsActives] = useState([]);

  // Drawers
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getTickets = async () => {
    const res = await sh.notifications.get(selected_id, 1, "ALERT");
    setTickets(res.results || []);
  };

  const getActiveTickets = async () => {
    const res = await sh.notifications.actives(selected_id, 1, "ALERT");
    setTicketsActives(res.results || []);
  };

  useEffect(() => {
    if (selected_id) {
      getActiveTickets();
      getTickets();
    }
  }, [update, selected_id]);

  const totalAlertas = tickets ? tickets.length : 0;
  const alertasActivas = ticketsActives ? ticketsActives.length : 0;
  const alertasResueltas = Math.max(0, totalAlertas - alertasActivas);
  const ultimaAlerta = tickets && tickets.length > 0 ? tickets[0] : null;

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    try {
      return fecha.slice(0, 10);
    } catch (error) {
      return "";
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    setEditingRecord(null);
    setUpdate((u) => !u);
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingRecord(null);
  };

  const canManageAlerts = state.selected_profile?.profile_ikolu?.m6 || false;

  return (
    <div
      style={{
        maxWidth: "1600px",
        padding: isMobile ? "10px" : "0px",
        minHeight: "90vh",
      }}
    >
      {/* Header minimalista */}
      {canManageAlerts && (
        <Flex justify="flex-end" style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{
              background: "#1F3461",
              borderColor: "#1F3461",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Nueva Alerta
          </Button>
        </Flex>
      )}

      {/* KPIs minimalistas */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.activas.borderColor}`,
              background: KPI_CARD_STYLES.activas.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <BellOutlined
                style={{
                  fontSize: 24,
                  color: KPI_CARD_STYLES.activas.iconColor,
                }}
              />
              <Statistic
                title={
                  <span style={{ fontSize: 12, color: "#888" }}>
                    Alertas Activas
                  </span>
                }
                value={formatInteger(alertasActivas)}
                valueStyle={{
                  color: "#1F3461",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              />
            </Flex>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.total.borderColor}`,
              background: KPI_CARD_STYLES.total.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <AlertOutlined
                style={{
                  fontSize: 24,
                  color: KPI_CARD_STYLES.total.iconColor,
                }}
              />
              <Statistic
                title={
                  <span style={{ fontSize: 12, color: "#888" }}>
                    Total Alertas
                  </span>
                }
                value={formatInteger(totalAlertas)}
                valueStyle={{
                  color: "#1F3461",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              />
            </Flex>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.resueltas.borderColor}`,
              background: KPI_CARD_STYLES.resueltas.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <CheckCircleOutlined
                style={{
                  fontSize: 24,
                  color: KPI_CARD_STYLES.resueltas.iconColor,
                }}
              />
              <Statistic
                title={
                  <span style={{ fontSize: 12, color: "#888" }}>
                    Alertas Resueltas
                  </span>
                }
                value={formatInteger(alertasResueltas)}
                valueStyle={{
                  color: "#1F3461",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              />
            </Flex>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.ultima.borderColor}`,
              background: KPI_CARD_STYLES.ultima.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <ClockCircleOutlined
                style={{
                  fontSize: 24,
                  color: KPI_CARD_STYLES.ultima.iconColor,
                }}
              />
              <div>
                <div style={{ fontSize: 12, color: "#888" }}>Última Alerta</div>
                <div
                  style={{
                    color: "#1F3461",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {ultimaAlerta
                    ? ultimaAlerta.title || ultimaAlerta.type_notification
                    : "Sin alertas"}
                </div>
                {ultimaAlerta && ultimaAlerta.created_at && (
                  <div style={{ fontSize: 11, color: "#aaa" }}>
                    {formatFecha(ultimaAlerta.created_at)}
                  </div>
                )}
              </div>
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Info banner */}
      <Alert
        description="Las alertas operan bajo el último dato almacenado. Recuerda que los emails deben ingresarse como lista y la descripción es libre."
        type="info"
        showIcon
        style={{
          marginBottom: "20px",
          borderRadius: "10px",
          border: "1px solid #d9d9d9",
          background: "#fafafa",
        }}
      />

      {/* Tabla */}
      <Card
        style={{
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "none",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      >
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: "20px" }}
        >
          <span style={{ margin: 0, color: "#1F3461", fontSize: 16, fontWeight: 700 }}>
            Mis Alertas
          </span>
          <Tag
            style={{
              fontWeight: 600,
              fontSize: "12px",
              padding: "4px 12px",
              borderRadius: "6px",
              borderColor: "#1F3461",
              color: "#1F3461",
              background: "#f2f5fa",
            }}
          >
            {tickets.length} alertas
          </Tag>
        </Flex>

        <TableAlerts
          data={tickets}
          update={update}
          setUpdate={setUpdate}
          onEdit={handleEdit}
        />
      </Card>

      {/* Drawer Crear/Editar */}
      <Drawer
        title={
          <span style={{ color: "#BDC00C", fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>
            {editingRecord ? "EDITAR ALERTA" : "NUEVA ALERTA"}
          </span>
        }
        placement="right"
        onClose={handleFormCancel}
        open={formVisible}
        width={isMobile ? "100%" : 520}
        styles={{
          body: { background: "#0a0e27", padding: "24px" },
          header: { background: "#0f152e", borderBottom: "1px solid rgba(255,107,53,0.25)" },
          mask: { background: "rgba(0,0,0,0.75)" },
        }}
        closeIcon={<span style={{ color: "#BDC00C", fontSize: 18 }}>✕</span>}
        destroyOnClose
      >
        <FormAlert
          record={editingRecord}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Drawer>
    </div>
  );
};

export default ResponsiveAlerts;
