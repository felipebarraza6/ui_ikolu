import React, { useState, useEffect, useContext } from "react";
import { Card, Typography, Row, Col, Statistic, Alert, Tag, Flex } from "antd";
import {
  AlertOutlined,
  PlusCircleOutlined,
  BellOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import FormAlert from "./FormAlert";
import TableAlerts from "./TableAlerts";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";
import { formatInteger } from "../../utils/numberFormatter";

const { Title } = Typography;

const ResponsiveAlerts = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { state } = useContext(AppContext);
  const [update, setUpdate] = useState(false);
  const selected_id = state.selected_profile.id;
  const [pageActive, setPageActve] = useState(1);
  const [pageOld, setPageOld] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [ticketsActives, setTicketsActives] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getTickets = async () => {
    const rq = await sh.notifications
      .get(selected_id, pageOld, "ALERT")
      .then((res) => {
        setTickets(res.results || []);
      });
  };

  const getActiveTickets = async () => {
    const rq = await sh.notifications
      .actives(selected_id, pageActive, "ALERT")
      .then((res) => {
        setTicketsActives(res.results || []);
      });
  };

  useEffect(() => {
    getActiveTickets();
    getTickets();
  }, [update]);

  const totalAlertas = tickets ? tickets.length : 0;
  const alertasActivas = ticketsActives ? ticketsActives.length : 0;
  const alertasResueltas = totalAlertas - alertasActivas;
  const ultimaAlerta = tickets && tickets.length > 0 ? tickets[0] : null;

  // Función segura para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    try {
      return fecha.slice(0, 10);
    } catch (error) {
      return "";
    }
  };

  return (
    <div
      style={{
        maxWidth: "1600px",
        padding: isMobile ? "10px" : "0px",
        minHeight: "90vh",
      }}
    >
      {/* Header del módulo */}
      <div
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          background: "#1F3461", // Color sólido, sin gradiente
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          padding: "24px",
        }}
      >
        <Flex align="center" gap="middle">
          <AlertOutlined style={{ fontSize: 32, color: "white" }} />
          <Title level={3} style={{ margin: 0, color: "white" }}>
            Sistema de Alertas
          </Title>
        </Flex>
      </div>

      {/* Indicadores */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(255,107,53,0.3)",
              transition: "transform 0.2s ease",
            }}
            bodyStyle={{ padding: "20px", textAlign: "center" }}
            hoverable
          >
            <BellOutlined
              style={{ fontSize: 28, color: "white", marginBottom: 12 }}
            />
            <Statistic
              title={
                <span
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Alertas Activas
                </span>
              }
              value={formatInteger(alertasActivas)}
              valueStyle={{
                color: "white",
                fontSize: isMobile ? 20 : 24,
                fontWeight: "bold",
              }}
              suffix={
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                  pendientes
                </span>
              }
            />
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            style={{
              background: "linear-gradient(135deg, #1F3461 0%, #2E5A8A 100%)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(31,52,97,0.3)",
              transition: "transform 0.2s ease",
            }}
            bodyStyle={{ padding: "20px", textAlign: "center" }}
            hoverable
          >
            <AlertOutlined
              style={{ fontSize: 28, color: "white", marginBottom: 12 }}
            />
            <Statistic
              title={
                <span
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Total Alertas
                </span>
              }
              value={formatInteger(totalAlertas)}
              valueStyle={{
                color: "white",
                fontSize: isMobile ? 20 : 24,
                fontWeight: "bold",
              }}
              suffix={
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                  historial
                </span>
              }
            />
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            style={{
              background: "linear-gradient(135deg, #52C41A 0%, #73D13D 100%)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(82,196,26,0.3)",
              transition: "transform 0.2s ease",
            }}
            bodyStyle={{ padding: "20px", textAlign: "center" }}
            hoverable
          >
            <CheckCircleOutlined
              style={{ fontSize: 28, color: "white", marginBottom: 12 }}
            />
            <Statistic
              title={
                <span
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Alertas Resueltas
                </span>
              }
              value={formatInteger(alertasResueltas)}
              valueStyle={{
                color: "white",
                fontSize: isMobile ? 20 : 24,
                fontWeight: "bold",
              }}
              suffix={
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                  completadas
                </span>
              }
            />
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              background: "linear-gradient(135deg, #722ED1 0%, #9254DE 100%)",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(114,46,209,0.3)",
              transition: "transform 0.2s ease",
            }}
            bodyStyle={{ padding: "20px", textAlign: "center" }}
            hoverable
          >
            <AlertOutlined
              style={{ fontSize: 28, color: "white", marginBottom: 12 }}
            />
            <Statistic
              title={
                <span
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Última Alerta
                </span>
              }
              value={
                ultimaAlerta ? ultimaAlerta.type_notification : "Sin alertas"
              }
              valueStyle={{
                color: "white",
                fontSize: isMobile ? 14 : 16,
                fontWeight: "bold",
              }}
              suffix={
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                  {ultimaAlerta && ultimaAlerta.created_at
                    ? formatFecha(ultimaAlerta.created_at)
                    : ""}
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Contenido principal */}
      {isMobile ? (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              style={{
                borderRadius: "12px",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  borderBottom: "3px solid #FF6B35",
                  paddingBottom: "16px",
                }}
              >
                <Title level={4} style={{ margin: 0, color: "#1F3461" }}>
                  Crear Alerta
                </Title>
              </div>

              <Alert
                description="Las alertas operan bajo el último dato almacenado."
                type="info"
                showIcon
                style={{
                  marginBottom: "20px",
                  borderColor: "#FF6B35",
                  backgroundColor: "#FFF8F0",
                  borderRadius: "8px",
                }}
              />

              <FormAlert update={update} setUpdate={setUpdate} />
            </Card>
          </Col>

          <Col span={24}>
            <Card
              style={{
                borderRadius: "12px",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
              }}
              bodyStyle={{ padding: "20px" }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  borderBottom: "3px solid #1F3461",
                  paddingBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={4} style={{ margin: 0, color: "#1F3461" }}>
                  Mis Alertas
                </Title>
                <Tag
                  color="#FF6B35"
                  style={{
                    fontWeight: "600",
                    fontSize: "12px",
                    padding: "4px 12px",
                    borderRadius: "6px",
                  }}
                >
                  {tickets.length} alertas
                </Tag>
              </div>

              <TableAlerts data={tickets} />
            </Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={10} lg={8} xl={8}>
            <Card
              style={{
                borderRadius: "12px",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
                height: "fit-content",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  borderBottom: "3px solid #FF6B35",
                  paddingBottom: "16px",
                }}
              >
                <Title level={4} style={{ margin: 0, color: "#1F3461" }}>
                  Crear Alerta
                </Title>
              </div>

              <Alert
                description="Las alertas operan bajo el último dato almacenado."
                type="info"
                showIcon
                style={{
                  marginBottom: "20px",
                  borderColor: "#FF6B35",
                  backgroundColor: "#FFF8F0",
                  borderRadius: "8px",
                }}
              />

              <FormAlert update={update} setUpdate={setUpdate} />
            </Card>
          </Col>

          <Col xs={24} sm={24} md={14} lg={16} xl={16}>
            <Card
              style={{
                borderRadius: "12px",
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  borderBottom: "3px solid #1F3461",
                  paddingBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={4} style={{ margin: 0, color: "#1F3461" }}>
                  Mis Alertas
                </Title>
                <Tag
                  color="#FF6B35"
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    padding: "6px 16px",
                    borderRadius: "8px",
                  }}
                >
                  {tickets.length} alertas
                </Tag>
              </div>

              <TableAlerts data={tickets} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ResponsiveAlerts;
