import { Card, Col, Flex, Progress, Row, Space, Typography } from "antd";
import {
  EnvironmentOutlined,
  FileTextOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import React from "react";

const { Text, Title } = Typography;

const StatsCards = ({ stats, percentages }) => {
  // Determinar cuántas cards mostrar
  const hasDga = stats.dgaPoints > 0;
  const hasSma = stats.smaPoints > 0;
  const cardsCount = 3 + (hasDga ? 1 : 0) + (hasSma ? 1 : 0); // Base: 3 cards + DGA + SMA
  const colSize = cardsCount === 3 ? 8 : cardsCount === 4 ? 6 : 24 / cardsCount;

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
      {/* Card 1: Total de Puntos */}
      <Col xs={24} sm={12} lg={colSize}>
        <Card hoverable style={{ height: "100%" }} size="small">
          <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Total de Puntos
            </Text>
            <Space size={8} align="center">
              <EnvironmentOutlined
                style={{ color: "#1F3461", fontSize: "22px" }}
              />
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#1F3461",
                  fontSize: "28px",
                  lineHeight: 1,
                }}
              >
                {stats.totalPoints}
              </Title>
            </Space>
            <Progress
              percent={100}
              showInfo={false}
              strokeColor="#1F3461"
              size="small"
              style={{ width: "100%" }}
              strokeWidth={6}
            />
          </Space>
        </Card>
      </Col>

      {/* Card 2: Telemetría (conectados vs total telemetría) */}
      <Col xs={24} sm={12} lg={colSize}>
        <Card
          hoverable
          style={{ height: "100%" }}
          size="small"
          bodyStyle={{ padding: "16px" }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Telemetría
            </Text>
            <Space size={8} align="center">
              <WifiOutlined style={{ color: "#52c41a", fontSize: "22px" }} />
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#52c41a",
                  fontSize: "28px",
                  lineHeight: 1,
                }}
              >
                {stats.connectedPoints}/{stats.telemetryPoints}
              </Title>
            </Space>
            <Progress
              percent={
                stats.telemetryPoints > 0
                  ? Math.round(
                      (stats.connectedPoints / stats.telemetryPoints) * 100
                    )
                  : 0
              }
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
              style={{ width: "100%" }}
              strokeWidth={6}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {stats.connectedPoints} conectados de {stats.telemetryPoints}
            </Text>
          </Space>
        </Card>
      </Col>

      {/* Card 3: DGA (OB) - Solo si hay al menos 1 punto DGA */}
      {hasDga && (
        <Col xs={24} sm={12} lg={colSize}>
          <Card
            hoverable
            style={{ height: "100%" }}
            size="small"
            bodyStyle={{ padding: "16px" }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                DGA (OB)
              </Text>
              <Space size={10} align="center">
                <Flex gap="3px" align="center">
                  <div
                    style={{
                      width: "12px",
                      height: "10px",
                      background: "#006FB3",
                      borderRadius: "2px",
                    }}
                  />
                  <div
                    style={{
                      width: "12px",
                      height: "10px",
                      background: "#FE6565",
                      borderRadius: "2px",
                    }}
                  />
                </Flex>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: "#006FB3",
                    fontSize: "28px",
                    lineHeight: 1,
                  }}
                >
                  {stats.dgaPoints}
                </Title>
              </Space>
              <Progress
                percent={
                  stats.totalPoints > 0
                    ? Math.round((stats.dgaPoints / stats.totalPoints) * 100)
                    : 0
                }
                showInfo={false}
                strokeColor="#006FB3"
                size="small"
                style={{ width: "100%" }}
                strokeWidth={6}
              />
              <Text type="secondary" style={{ fontSize: "11px" }}>
                {stats.totalPoints > 0
                  ? Math.round((stats.dgaPoints / stats.totalPoints) * 100)
                  : 0}
                % del total
              </Text>
            </Space>
          </Card>
        </Col>
      )}

      {/* Card 4: SMA - Solo si hay al menos 1 punto SMA */}
      {hasSma && (
        <Col xs={24} sm={12} lg={colSize}>
          <Card
            hoverable
            style={{ height: "100%" }}
            size="small"
            bodyStyle={{ padding: "16px" }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                SMA
              </Text>
              <Space size={10} align="center">
                <Flex gap="3px" align="center">
                  <div
                    style={{
                      width: "12px",
                      height: "10px",
                      background: "#722ed1",
                      borderRadius: "2px",
                    }}
                  />
                  <div
                    style={{
                      width: "12px",
                      height: "10px",
                      background: "#eb2f96",
                      borderRadius: "2px",
                    }}
                  />
                </Flex>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: "#722ed1",
                    fontSize: "28px",
                    lineHeight: 1,
                  }}
                >
                  {stats.smaPoints}
                </Title>
              </Space>
              <Progress
                percent={
                  stats.totalPoints > 0
                    ? Math.round((stats.smaPoints / stats.totalPoints) * 100)
                    : 0
                }
                showInfo={false}
                strokeColor="#722ed1"
                size="small"
                style={{ width: "100%" }}
                strokeWidth={6}
              />
              <Text type="secondary" style={{ fontSize: "11px" }}>
                {stats.totalPoints > 0
                  ? Math.round((stats.smaPoints / stats.totalPoints) * 100)
                  : 0}
                % del total
              </Text>
            </Space>
          </Card>
        </Col>
      )}

      {/* Card 5: Formulario Manual */}
      <Col xs={24} sm={12} lg={colSize}>
        <Card hoverable style={{ height: "100%" }} size="small">
          <Space direction="vertical" size="small" style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Ingreso Manual
            </Text>
            <Space size={8} align="center">
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#13c2c2",
                  fontSize: "28px",
                  lineHeight: 1,
                }}
              >
                {stats.manualEntryPoints}
              </Title>
            </Space>
            <Progress
              percent={
                stats.totalPoints > 0
                  ? Math.round(
                      (stats.manualEntryPoints / stats.totalPoints) * 100
                    )
                  : 0
              }
              strokeColor="#13c2c2"
              size="small"
              style={{ width: "100%" }}
              strokeWidth={6}
            />
            <Text type="secondary" style={{ fontSize: "11px" }}>
              {stats.totalPoints > 0
                ? Math.round(
                    (stats.manualEntryPoints / stats.totalPoints) * 100
                  )
                : 0}
              % del total
            </Text>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default StatsCards;
