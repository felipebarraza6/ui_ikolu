import { Card, Col, Row, Space, Typography } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import React from "react";

const { Text } = Typography;

const SystemInfo = ({ profiles, stats, percentages }) => {
  return (
    <Card
      title={
        <>
          <InfoCircleOutlined style={{ marginRight: "8px" }} />
          Información del Sistema
        </>
      }
      style={{ marginTop: "12px" }}
      size="small"
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <ClockCircleOutlined
              style={{ fontSize: "20px", color: "#1890ff" }}
            />
            <Text strong style={{ fontSize: "13px" }}>
              Última Actualización
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {new Date().toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <EnvironmentOutlined
              style={{ fontSize: "20px", color: "#52c41a" }}
            />
            <Text strong style={{ fontSize: "13px" }}>
              Puntos Totales
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {profiles.length} registrados
            </Text>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <CheckCircleOutlined
              style={{ fontSize: "20px", color: "#52c41a" }}
            />
            <Text strong style={{ fontSize: "13px" }}>
              Tasa de Conexión
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {percentages.connected}% conectados
            </Text>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <DashboardOutlined
              style={{ fontSize: "20px", color: "#722ed1" }}
            />
            <Text strong style={{ fontSize: "13px" }}>
              Estado General
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {stats.withErrors === 0
                ? "Sistema OK"
                : `${stats.withErrors} errores`}
            </Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default SystemInfo;
