import React, { useState, useContext, useEffect } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Space,
  Progress,
  notification,
  Statistic,
  Flex,
  Tag,
} from "antd";
import {
  InfoCircleOutlined,
  QrcodeOutlined,
  LinkOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CopyOutlined,
  CompassOutlined,
  AlertOutlined,
  DashboardOutlined,
  PieChartOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import ModalQR from "./ModalQR";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import dayjs from "dayjs";
import logoDga from "../../assets/images/logo_dga.png";
import { formatFlow, formatInteger } from "../../utils/numberFormatter";

const { Text, Title } = Typography;

const DetailItem = ({ icon, title, content }) => (
  <Flex align="center" justify="space-between" style={{ width: "100%" }}>
    <Flex align="center" gap="small">
      {icon}
      <Text>{title}</Text>
    </Flex>
    {typeof content === "string" ? <Text strong>{content}</Text> : content}
  </Flex>
);

const CodeQR = ({ onDiagnoseClick, loading = false }) => {
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
    compliance_days: complianceDays = "N/A",
    type_dga,
    standard,
  } = dgaInfo;

  const { m2: hasExportPermission } = profile_ikolu;
  const isMeeActive = profile_ikolu?.m2 || false;

  const hasDgaData = flow_granted_dga && total_granted_dga;

  // Obtener datos de consumo desde el perfil (módulo m2) - estos vienen actualizados desde ResponsiveDga
  const dataDga = state.selected_profile?.modules?.m2 || [];
  const first_actual_year =
    state.selected_profile?.modules?.first_actual_year?.total || 0;

  const d6_profile = state?.selected_profile?.config_data?.d6 || 0;

  // Calcular el consumo total desde los registros
  const totalConsumption = state.selected_profile?.modules?.total_consumed_year;

  // Obtener la fecha del registro más reciente (última sincronización)
  const getLastSyncDate = () => {
    if (dataDga.length === 0) return null;

    // Ordenar por fecha de medición y tomar el más reciente
    const sortedData = [...dataDga].sort(
      (a, b) => new Date(b.date_time_medition) - new Date(a.date_time_medition),
    );

    return sortedData[0].date_time_medition;
  };

  const lastSyncDate = getLastSyncDate();

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    notification.success({
      message: "Copiado",
      description: "El código de obra ha sido copiado al portapapeles.",
      placement: "bottomRight",
    });
  };

  const handleOpenDgaPortal = () => {
    if (code_dga) {
      window.open(
        `https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${code_dga}`,
        "_blank",
      );
    } else {
      notification.warning({
        message: "Código DGA no disponible",
        description:
          "Este punto de captación no tiene un código de obra para validar.",
      });
    }
  };

  const consumptionPercentage =
    total_granted_dga > 0
      ? parseFloat(((totalConsumption / total_granted_dga) * 100).toFixed(1))
      : 0;

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Columna Izquierda - Detalles */}
        <Col xs={24} md={12} lg={8}>
          <Card className="dga-details-card" style={{ height: "100%" }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Flex align="center" gap="middle">
                <img
                  src={logoDga}
                  alt="Logo DGA"
                  style={{ width: 40, height: 40 }}
                />
                <Title level={5} style={{ margin: 0 }}>
                  Información DGA
                </Title>
              </Flex>
              <DetailItem
                icon={<InfoCircleOutlined />}
                title="Código de Obra"
                content={
                  <Text
                    strong
                    copyable={{ onCopy: () => handleCopy(code_dga) }}
                  >
                    {code_dga || "N/A"}
                  </Text>
                }
              />
              <DetailItem
                icon={<CalendarOutlined />}
                title="Creación código"
                content={
                  date_created_code
                    ? dayjs(date_created_code).format("DD/MM/YYYY")
                    : "N/A"
                }
              />
              <DetailItem
                icon={<CalendarOutlined />}
                title="Inicio cumplimiento"
                content={
                  date_start_compliance
                    ? dayjs(date_start_compliance).format("DD/MM/YYYY")
                    : "N/A"
                }
              />
              <DetailItem
                icon={<CheckCircleOutlined />}
                title="Estado MEE"
                content={
                  <Tag color={send_dga ? "green-inverse" : "default"}>
                    {send_dga ? "Activado" : "Desactivado"}
                  </Tag>
                }
              />

              <DetailItem
                icon={<CalendarOutlined />}
                title="Última Sincronización"
                content={
                  <div style={{ textAlign: "right" }}>
                    {lastSyncDate
                      ? dayjs(lastSyncDate).format("DD/MM/YYYY HH:mm")
                      : "N/A"}
                  </div>
                }
              />
              <DetailItem
                icon={<CompassOutlined />}
                title="Tipo"
                content={type_dga || "No especificado"}
              />
              <DetailItem
                icon={<AlertOutlined />}
                title="Estándar"
                content={
                  standard === "CAUDALES_MUY_PEQUENOS"
                    ? "Muy Pequeños"
                    : standard
                }
              />
              <DetailItem
                icon={<DashboardOutlined />}
                title="Caudal Autorizado"
                content={
                  hasDgaData ? (
                    `${formatFlow(flow_granted_dga)} lt/s`
                  ) : (
                    <Tag color="orange">En Procesamiento</Tag>
                  )
                }
              />
            </Space>
          </Card>
        </Col>

        {/* Columna Central - Consumo */}
        <Col xs={24} md={12} lg={8}>
          <Card className="dga-details-card" style={{ height: "100%" }}>
            <Flex
              vertical
              justify="space-between"
              align="center"
              style={{ height: "100%" }}
            >
              <Title level={5}>Consumo Anual</Title>
              <Progress
                type="dashboard"
                percent={consumptionPercentage}
                format={(percent) => `${percent}%`}
                strokeColor={{
                  "0%": "#87d068",
                  "90%": "#ffc107",
                  "100%": "#ff4d4f",
                }}
              />
              <Statistic
                title="Consumo acumulado"
                value={totalConsumption}
                formatter={(val) => new Intl.NumberFormat("es-CL").format(val)}
                suffix="m³"
              />
              <Text type="secondary">
                Límite:{" "}
                {new Intl.NumberFormat("es-CL").format(total_granted_dga || 0)}{" "}
                m³
              </Text>
            </Flex>
          </Card>
        </Col>

        {/* Columna Derecha - Acciones */}
        <Col xs={24} md={24} lg={8}>
          <Flex vertical style={{ height: "100%" }} gap={16}>
            <Card
              hoverable
              className="dga-card"
              onClick={handleOpenDgaPortal}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Space
                direction="vertical"
                align="center"
                style={{ width: "100%" }}
              >
                <LinkOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
                <Text strong>Validar Sync DGA</Text>
              </Space>
            </Card>
            <Row gutter={16} style={{ flex: 1 }}>
              <Col xs={12} span={12}>
                <Card
                  hoverable
                  className="dga-card"
                  onClick={onDiagnoseClick}
                  style={{ height: "100%" }}
                >
                  <Space
                    direction="vertical"
                    align="center"
                    style={{ width: "100%" }}
                  >
                    <BarChartOutlined
                      style={{ fontSize: "24px", color: "#1890ff" }}
                    />
                    <Text strong>Diagnóstico Inteligente</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={12} span={12}>
                <Card
                  hoverable
                  className="dga-card"
                  onClick={showModal}
                  style={{ height: "100%" }}
                >
                  <Space
                    direction="vertical"
                    align="center"
                    style={{ width: "100%" }}
                  >
                    <QrcodeOutlined
                      style={{ fontSize: "24px", color: "#1890ff" }}
                    />
                    <Text strong>Ver Código QR</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Flex>
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
