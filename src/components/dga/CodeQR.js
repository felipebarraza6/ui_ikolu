import React, { useState, useContext } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Flex,
  Tag,
  Button,
  Statistic,
  Tooltip,
} from "antd";
import {
  InfoCircleOutlined,
  QrcodeOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CompassOutlined,
  AlertOutlined,
  DashboardOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import ModalQR from "./ModalQR";
import { AppContext } from "../../App";
import { formatFlow, formatInteger } from "../../utils/numberFormatter";
import dayjs from "dayjs";
import logoDga from "../../assets/images/logo_dga.png";

const { Text, Title } = Typography;

const CodeQR = ({ onDiagnoseClick }) => {
  const { state } = useContext(AppContext);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const profile = state.selected_profile || {};
  const { dga: dgaInfo = {}, profile_ikolu = {} } = profile;

  const {
    code_dga,
    send_dga,
    total_granted_dga,
    flow_granted_dga,
    date_start_compliance,
    date_created_code,
    type_dga,
    standard,
  } = dgaInfo;

  const isMeeActive = profile_ikolu?.m2 || false;

  const dataDga = state.selected_profile?.modules?.m2 || [];
  const totalConsumption = state.selected_profile?.modules?.total_consumed_year || 0;

  const latestRecord =
    dataDga.length > 0
      ? [...dataDga].sort(
          (a, b) =>
            new Date(b.date_time_medition) - new Date(a.date_time_medition)
        )[0]
      : null;
  const lastSyncDate = latestRecord ? latestRecord.date_time_medition : null;

  const consumptionPercentage =
    total_granted_dga > 0
      ? Math.min(100, parseFloat(((totalConsumption / total_granted_dga) * 100).toFixed(1)))
      : 0;

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Pequeña notificación silenciosa
  };

  const handleOpenDgaPortal = () => {
    if (code_dga) {
      window.open(
        `https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${code_dga}`,
        "_blank"
      );
    }
  };

  const infoItems = [
    {
      icon: <InfoCircleOutlined style={{ color: "#1F3461" }} />,
      label: "Código de Obra",
      value: code_dga ? (
        <Text strong copyable={{ onCopy: () => handleCopy(code_dga) }}>
          {code_dga}
        </Text>
      ) : (
        "N/A"
      ),
    },
    {
      icon: <CheckCircleOutlined style={{ color: "#52C41A" }} />,
      label: "Estado MEE",
      value: (
        <Tag
          color={send_dga ? "success" : "default"}
          style={{ fontSize: 11, fontWeight: 600, margin: 0 }}
        >
          {send_dga ? "Activado" : "Desactivado"}
        </Tag>
      ),
    },
    {
      icon: <DashboardOutlined style={{ color: "#FF6B35" }} />,
      label: "Caudal Autorizado",
      value: flow_granted_dga ? `${formatFlow(flow_granted_dga)} lt/s` : "N/A",
    },
    {
      icon: <CompassOutlined style={{ color: "#1890FF" }} />,
      label: "Tipo",
      value: type_dga || "N/A",
    },
    {
      icon: <AlertOutlined style={{ color: "#BDC00C" }} />,
      label: "Estándar",
      value:
        standard === "CAUDALES_MUY_PEQUENOS" ? "Muy Pequeños" : standard || "N/A",
    },
    {
      icon: <CalendarOutlined style={{ color: "#888" }} />,
      label: "Inicio cumplimiento",
      value: date_start_compliance
        ? dayjs(date_start_compliance).format("DD/MM/YYYY")
        : "N/A",
    },
  ];

  return (
    <div>
      {/* Header compacto con info DGA */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 16,
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap="middle">
          <Flex align="center" gap="middle">
            <img src={logoDga} alt="DGA" style={{ width: 36, height: 36 }} />
            <div>
              <Title level={5} style={{ margin: 0, color: "#1F3461" }}>
                Información DGA
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {lastSyncDate
                  ? `Última sincronización: ${dayjs(lastSyncDate).format("DD/MM/YYYY HH:mm")}`
                  : "Sin sincronización registrada"}
              </Text>
            </div>
          </Flex>

          <Flex gap="small" wrap="wrap">
            <Button
              icon={<LinkOutlined />}
              onClick={handleOpenDgaPortal}
              disabled={!code_dga}
              style={{ borderRadius: 8 }}
            >
              Validar Sync
            </Button>
            <Button
              icon={<BarChartOutlined />}
              onClick={onDiagnoseClick}
              style={{ borderRadius: 8 }}
            >
              Diagnóstico
            </Button>
            <Button
              icon={<QrcodeOutlined />}
              onClick={showModal}
              style={{ borderRadius: 8 }}
            >
              Código QR
            </Button>
          </Flex>
        </Flex>

        <Row gutter={[8, 8]} style={{ marginTop: 14 }}>
          {infoItems.map((item, idx) => (
            <Col xs={12} sm={8} md={8} lg={4} key={idx}>
              <Flex align="center" gap="small">
                {item.icon}
                <div>
                  <div style={{ fontSize: 10, color: "#888" }}>{item.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1F3461" }}>
                    {item.value}
                  </div>
                </div>
              </Flex>
            </Col>
          ))}
        </Row>
      </Card>

      {/* KPIs de consumo y estado */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 10,
              borderLeft: "3px solid #1890FF",
              background: "#F2F5FA",
              borderColor: "transparent",
            }}
            bodyStyle={{ padding: 12 }}
          >
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Consumo Anual</span>}
              value={totalConsumption}
              formatter={(val) => new Intl.NumberFormat("es-CL").format(val)}
              suffix="m³"
              valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 10,
              borderLeft: "3px solid #52C41A",
              background: "#F6FFED",
              borderColor: "transparent",
            }}
            bodyStyle={{ padding: 12 }}
          >
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Límite Anual</span>}
              value={total_granted_dga || "N/A"}
              formatter={(val) =>
                typeof val === "number"
                  ? new Intl.NumberFormat("es-CL").format(val)
                  : val
              }
              suffix={typeof (total_granted_dga || 0) === "number" ? "m³" : ""}
              valueStyle={{ color: "#1F3461", fontSize: 20, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 10,
              borderLeft: "3px solid #FF6B35",
              background: "#FFF7F2",
              borderColor: "transparent",
            }}
            bodyStyle={{ padding: 12 }}
          >
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>% Consumido</span>}
              value={consumptionPercentage}
              suffix="%"
              valueStyle={{ color: "#FF6B35", fontSize: 20, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 10,
              borderLeft: "3px solid #BDC00C",
              background: "#FAFBF0",
              borderColor: "transparent",
            }}
            bodyStyle={{ padding: 12 }}
          >
            <Statistic
              title={<span style={{ fontSize: 11, color: "#888" }}>Estado Módulo</span>}
              value={isMeeActive ? "Activo" : "Inactivo"}
              valueStyle={{
                color: isMeeActive ? "#52C41A" : "#888",
                fontSize: 18,
                fontWeight: 700,
              }}
            />
          </Card>
        </Col>
      </Row>

      <ModalQR
        isModalVisible={isModalVisible}
        handleCancel={handleCancel}
        codeDga={code_dga}
        profile={profile}
      />
    </div>
  );
};

export default CodeQR;
