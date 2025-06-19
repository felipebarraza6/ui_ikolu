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
        padding: isMobile ? "10px" : "0px",
        minHeight: "90vh",
      }}
    >
      {/* Indicadores */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            style={{
              backgroundColor: "#FF6B35",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "16px", textAlign: "center" }}
          >
            <BellOutlined
              style={{ fontSize: 24, color: "white", marginBottom: 8 }}
            />
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                  Alertas Activas
                </span>
              }
              value={formatInteger(alertasActivas)}
              valueStyle={{ color: "white", fontSize: isMobile ? 16 : 18 }}
              suffix={
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>
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
              backgroundColor: "#1F3461",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "16px", textAlign: "center" }}
          >
            <AlertOutlined
              style={{ fontSize: 24, color: "white", marginBottom: 8 }}
            />
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                  Total Alertas
                </span>
              }
              value={formatInteger(totalAlertas)}
              valueStyle={{ color: "white", fontSize: isMobile ? 16 : 18 }}
              suffix={
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>
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
              backgroundColor: "#52C41A",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "16px", textAlign: "center" }}
          >
            <CheckCircleOutlined
              style={{ fontSize: 24, color: "white", marginBottom: 8 }}
            />
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                  Alertas Resueltas
                </span>
              }
              value={formatInteger(alertasResueltas)}
              valueStyle={{ color: "white", fontSize: isMobile ? 16 : 18 }}
              suffix={
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>
                  completadas
                </span>
              }
            />
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            style={{
              backgroundColor: "#722ED1",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: "16px", textAlign: "center" }}
          >
            <AlertOutlined
              style={{ fontSize: 24, color: "white", marginBottom: 8 }}
            />
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                  Última Alerta
                </span>
              }
              value={
                ultimaAlerta ? ultimaAlerta.type_notification : "Sin alertas"
              }
              valueStyle={{ color: "white", fontSize: isMobile ? 12 : 14 }}
              suffix={
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>
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
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  borderBottom: "2px solid #FF6B35",
                  paddingBottom: "12px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Crear Alerta
                </h3>
              </div>

              <Alert
                description="Las alertas operan bajo el último dato almacenado."
                type="info"
                showIcon
                style={{
                  marginBottom: "16px",
                  borderColor: "#FF6B35",
                  backgroundColor: "#FFF8F0",
                }}
              />

              <FormAlert update={update} setUpdate={setUpdate} />
            </div>
          </Col>

          <Col span={24}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  borderBottom: "2px solid #1F3461",
                  paddingBottom: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Mis Alertas
                </h3>
                <Tag color="#FF6B35" style={{ fontWeight: "500" }}>
                  {tickets.length} alertas
                </Tag>
              </div>

              <TableAlerts data={tickets} />
            </div>
          </Col>
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={10} lg={8} xl={8}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  borderBottom: "2px solid #FF6B35",
                  paddingBottom: "12px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  Crear Alerta
                </h3>
              </div>

              <Alert
                description="Las alertas operan bajo el último dato almacenado."
                type="info"
                showIcon
                style={{
                  marginBottom: "16px",
                  borderColor: "#FF6B35",
                  backgroundColor: "#FFF8F0",
                }}
              />

              <FormAlert update={update} setUpdate={setUpdate} />
            </div>
          </Col>

          <Col xs={24} sm={24} md={14} lg={16} xl={16}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  borderBottom: "2px solid #1F3461",
                  paddingBottom: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#1F3461",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  Mis Alertas
                </h3>
                <Tag color="#FF6B35" style={{ fontWeight: "500" }}>
                  {tickets.length} alertas
                </Tag>
              </div>

              <TableAlerts data={tickets} />
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ResponsiveAlerts;
