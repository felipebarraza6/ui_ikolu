import React from "react";
import { Row, Col, Typography, Card, Flex, Tooltip, Skeleton, Tag } from "antd";
import {
  IdcardOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ikoluTokens } from "../../theme";

const { Text } = Typography;

const TechInfoRow = ({ icon, label, value, loading = false }) => (
  <Flex
    justify="space-between"
    align="center"
    style={{ padding: "4px 2px", borderBottom: `1px solid ${ikoluTokens.colorBorderLight}` }}
  >
    <Flex align="center" gap="small">
      {icon}
      <Text type="secondary" style={{ fontSize: ikoluTokens.fontSizeMid }}>
        {label}
      </Text>
    </Flex>
    <div style={{ minWidth: 50, height: 14, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      {loading ? (
        <Skeleton.Input active size="small" style={{ width: 50, height: 14 }} />
      ) : (
        <Text strong style={{ fontSize: ikoluTokens.fontSizeBase, lineHeight: "16px" }}>
          {value}
        </Text>
      )}
    </div>
  </Flex>
);

const TechItem = ({ label, value, tooltip, loading = false }) => (
  <Tooltip title={tooltip}>
    <Flex
      justify="space-between"
      align="center"
      style={{ padding: "4px 2px", borderBottom: `1px solid ${ikoluTokens.colorBorderLight}`, minHeight: 26 }}
    >
      <Text type="secondary" style={{ fontSize: ikoluTokens.fontSizeSmall }}>
        {label}
      </Text>
      <div style={{ minWidth: 45, height: 16, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        {loading ? (
          <Skeleton.Input active size="small" style={{ width: 45, height: 14 }} />
        ) : (
          <Text strong style={{ fontSize: ikoluTokens.fontSizeBase, lineHeight: "16px" }}>
            {value}
          </Text>
        )}
      </div>
    </Flex>
  </Tooltip>
);

const StatusBadge = ({ active }) => (
  <Flex align="center" gap={4}>
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: active ? "#52c41a" : "#ff4d4f",
        boxShadow: `0 0 4px ${active ? "#52c41a" : "#ff4d4f"}`,
      }}
    />
    <Text strong style={{ fontSize: ikoluTokens.fontSizeBase, color: active ? "#52c41a" : "#ff4d4f" }}>
      {active ? "Activo" : "Inactivo"}
    </Text>
  </Flex>
);

const SectionTitle = ({ children, tooltip }) => (
  <Flex align="center" gap={4} style={{ marginTop: "4px", marginBottom: "2px", paddingLeft: "2px" }}>
    <Text
      style={{
        display: "block",
        color: "rgb(31, 52, 97)",
        fontWeight: 500,
        fontSize: ikoluTokens.fontSizeSmall,
      }}
      strong
    >
      <u>{children}</u>
    </Text>
    {tooltip && (
      <Tooltip title={tooltip}>
        <InfoCircleOutlined style={{ fontSize: 10, color: "#999" }} />
      </Tooltip>
    )}
  </Flex>
);

const TechnicalSheetContent = ({ profile, loading = false }) => {
  const config_data = profile?.config_data ?? {};
  const dga = profile?.dga ?? {};
  const title = profile?.title ?? "N/A";

  if (!profile) return null;

  return (
    <div style={{ padding: "0 4px" }}>
      <SectionTitle tooltip="Posicionamientos y diametros del pozo">Posicionamientos / Diametros</SectionTitle>
      <Row gutter={[8, 0]}>
        <Col span={12}>
          <TechItem
            label="Bomba"
            value={`${parseFloat(config_data.d2 || 0).toFixed(2)} m`}
            tooltip="Posicionamiento de bomba"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Nivel"
            value={`${parseFloat(config_data.d3 || 0).toFixed(2)} m`}
            tooltip="Posicionamiento de sensor de nivel"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Ducto"
            value={`${parseFloat(config_data.d4 || 0).toFixed(2)} pulg`}
            tooltip="Diametro ducto de salida bomba"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Flujometro"
            value={`${parseFloat(config_data.d5 || 0).toFixed(2)} pulg`}
            tooltip="Diametro flujometro"
            loading={loading}
          />
        </Col>
      </Row>

      <div style={{ marginTop: 10 }} />

      <SectionTitle tooltip="Totalizador y estado del datalogger">Totalizador / Datalogger</SectionTitle>
      <Row gutter={[8, 0]}>
        <Col span={12}>
          <TechItem
            label="m3 Inic."
            value={`${new Intl.NumberFormat("de-DE").format(config_data.d6 || 0)}`}
            tooltip="Metros cubicos iniciales del totalizador"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Estado"
            value={<StatusBadge active={config_data.is_telemetry} />}
            tooltip="Estado de telemetria del datalogger"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Frec."
            value={profile?.frecuency ? `${profile.frecuency} min` : "N/D"}
            tooltip="Frecuencia de medicion"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Inicio"
            value={config_data.date_start_telemetry || "N/A"}
            tooltip="Fecha de inicio del monitoreo"
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  );
};

const TechnicalSheetWithTabs = ({ profile, loading = false }) => {
  if (!profile && !loading) return null;

  return (
    <Card
      style={{
        borderRadius: ikoluTokens.borderRadiusLG,
        boxShadow: ikoluTokens.shadowCard,
        height: "100%",
        border: `1px solid ${ikoluTokens.colorBorderLight}`,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${ikoluTokens.colorBorderLight}`,
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
          <Flex align="center" gap={10}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: ikoluTokens.borderRadius,
                background: "linear-gradient(135deg, #1F3461 0%, #1890ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: ikoluTokens.shadowPrimary,
              }}
            >
              <IdcardOutlined style={{ color: ikoluTokens.colorWhite, fontSize: ikoluTokens.fontSizeXL }} />
            </div>
            <Flex vertical gap={2}>
              <Text strong style={{ fontSize: 15, color: ikoluTokens.colorCorporateBlue, lineHeight: 1.2 }}>
                {loading ? <Skeleton.Input active size="small" style={{ width: 120, height: 16 }} /> : (profile?.title || "Punto de captacion")}
              </Text>
              <Flex align="center" gap={4}>
                <ArrowDownOutlined style={{ fontSize: 10, color: ikoluTokens.colorCorporateBlue }} />
                <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue, fontWeight: 600 }}>
                  {loading ? <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} /> : `${parseFloat(profile?.config_data?.d1 || 0).toFixed(2)} m de profundidad`}
                </Text>
              </Flex>
            </Flex>
          </Flex>

          {profile?.dga?.code_dga && (
            <Tooltip title="Codigo unico de registro en DGA">
              <Flex align="center" gap={6} style={{ background: "#f0f2f5", padding: "4px 10px", borderRadius: ikoluTokens.radiusSmall }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 2,
                    display: "flex",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ flex: 1, background: "#D52B1E" }} />
                  <div style={{ flex: 1, background: "#0039A6" }} />
                </div>
                <Text copyable style={{ fontSize: ikoluTokens.fontSizeBase, color: ikoluTokens.colorCorporateBlue, fontWeight: 700 }}>
                  {profile.dga.code_dga}
                </Text>
              </Flex>
            </Tooltip>
          )}
        </Flex>
      </div>

      <div style={{ padding: "12px 16px 16px" }}>
        <TechnicalSheetContent profile={profile} loading={loading} />
      </div>
    </Card>
  );
};

export { TechInfoRow, TechItem, StatusBadge, SectionTitle, TechnicalSheetContent };
export default React.memo(TechnicalSheetWithTabs);
