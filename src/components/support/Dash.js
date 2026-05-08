import React, { useState, useEffect, useContext } from "react";
import {
  Flex,
  Card,
  Tag,
  Row,
  Col,
  Button,
  Tabs,
  Statistic,
  Alert,
} from "antd";
import {
  PlusCircleFilled,
  OrderedListOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import FormSupport from "./FormSupport";
import TableSupport from "./TableSupport";
import ActiveTickets from "./ActiveTickets";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";
import { useResponsive } from "../../hooks/useResponsive";

const KPI_CARD_STYLES = {
  activos: {
    borderColor: "#FF6B35",
    iconColor: "#FF6B35",
    bg: "#FFF7F2",
  },
  total: {
    borderColor: "#1F3461",
    iconColor: "#1F3461",
    bg: "#F2F5FA",
  },
  completados: {
    borderColor: "#52C41A",
    iconColor: "#52C41A",
    bg: "#F6FFF0",
  },
  espera: {
    borderColor: "#BDC00C",
    iconColor: "#BDC00C",
    bg: "#FAFBF0",
  },
};

const Dash = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [update, setUpdate] = useState(false);
  const selected_id = state.selected_profile.id;
  const [activeTab, setActiveTab] = useState("nuevo");
  const [pageActive, setPageActve] = useState(1);
  const [pageOld, setPageOld] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [ticketsActives, setTicketsActives] = useState([]);

  const getTickets = async () => {
    const res = await sh.notifications.get(selected_id, pageOld, "SUPPORT");
    setTickets(res.results || []);
  };

  const getActiveTickets = async () => {
    const res = await sh.notifications.actives(selected_id, pageActive, "SUPPORT");
    setTicketsActives(res.results || []);
  };

  useEffect(() => {
    getActiveTickets();
    getTickets();
  }, [update, selected_id]);

  const totalTickets = tickets.length + ticketsActives.length;
  const completados = tickets.length;
  const activos = ticketsActives.length;

  const tabItems = [
    {
      key: "nuevo",
      label: (
        <Flex align="center" gap="small">
          <PlusCircleFilled /> Nuevo Ticket
        </Flex>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10} lg={8}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: "none",
              }}
              bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
            >
              <Alert
                message="soporte@smarthydro.cl"
                description="Nuestro equipo evaluará tu caso en menos de 24 horas."
                type="info"
                showIcon
                style={{
                  marginBottom: 20,
                  borderRadius: 8,
                }}
              />
              <FormSupport update={update} setUpdate={setUpdate} />
            </Card>
          </Col>
          <Col xs={24} md={14} lg={16}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: "none",
              }}
              bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
              title={
                <Flex justify="space-between" align="center">
                  <span style={{ color: "#1F3461", fontWeight: 700 }}>
                    <InboxOutlined style={{ marginRight: 8 }} />
                    Tickets Activos
                  </span>
                  <Tag
                    color="#FF6B35"
                    style={{ fontWeight: 600, borderRadius: 6 }}
                  >
                    {activos} activos
                  </Tag>
                </Flex>
              }
            >
              <ActiveTickets data={ticketsActives} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "historial",
      label: (
        <Flex align="center" gap="small">
          <OrderedListOutlined /> Historial
        </Flex>
      ),
      children: (
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "none",
          }}
          bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
          title={
            <span style={{ color: "#1F3461", fontWeight: 700 }}>
              <OrderedListOutlined style={{ marginRight: 8 }} />
              Historial de Tickets
            </span>
          }
        >
          <TableSupport data={tickets} />
        </Card>
      ),
    },
  ];

  return (
    <div
      style={{
        maxWidth: "1600px",
        margin: isMobile ? "12px auto" : "0 auto",
        padding: isMobile ? "0 8px" : "0",
        minHeight: "90vh",
      }}
    >
      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.activos.borderColor}`,
              background: KPI_CARD_STYLES.activos.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <CustomerServiceOutlined
                style={{ fontSize: 24, color: KPI_CARD_STYLES.activos.iconColor }}
              />
              <Statistic
                title={<span style={{ fontSize: 12, color: "#888" }}>Activos</span>}
                value={activos}
                valueStyle={{ color: "#1F3461", fontSize: 22, fontWeight: 700 }}
              />
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
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
              <InboxOutlined
                style={{ fontSize: 24, color: KPI_CARD_STYLES.total.iconColor }}
              />
              <Statistic
                title={<span style={{ fontSize: 12, color: "#888" }}>Total</span>}
                value={totalTickets}
                valueStyle={{ color: "#1F3461", fontSize: 22, fontWeight: 700 }}
              />
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.completados.borderColor}`,
              background: KPI_CARD_STYLES.completados.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <CheckCircleOutlined
                style={{ fontSize: 24, color: KPI_CARD_STYLES.completados.iconColor }}
              />
              <Statistic
                title={<span style={{ fontSize: 12, color: "#888" }}>Completados</span>}
                value={completados}
                valueStyle={{ color: "#1F3461", fontSize: 22, fontWeight: 700 }}
              />
            </Flex>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.espera.borderColor}`,
              background: KPI_CARD_STYLES.espera.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <ClockCircleOutlined
                style={{ fontSize: 24, color: KPI_CARD_STYLES.espera.iconColor }}
              />
              <div>
                <div style={{ fontSize: 12, color: "#888" }}>Tiempo respuesta</div>
                <div style={{ color: "#1F3461", fontSize: 16, fontWeight: 700 }}>
                  &lt; 24h
                </div>
              </div>
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ background: "white", borderRadius: 12 }}
        items={tabItems}
      />
    </div>
  );
};

export default Dash;
