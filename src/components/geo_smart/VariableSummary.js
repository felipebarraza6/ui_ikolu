import React from "react";
import { Card, Col, Row, Statistic, Typography, Flex, Progress } from "antd";
import {
  BarChartOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { FaHandHoldingDroplet } from "react-icons/fa6";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";

const { Text, Title } = Typography;

const VariableSummary = ({ stats, geoData, loading }) => {
  // --- Cálculos para Caudal ---
  const pointsWithFlow = geoData.filter((p) => p.currentCaudal > 0).length;
  const pointsExceeded = geoData.filter(
    (p) => p.flowGranted > 0 && p.currentCaudal > p.flowGranted
  ).length;

  // --- Cálculos para Consumo ---
  const { totalConsumption, yesterdayConsumption } = stats;
  const consumptionChange =
    yesterdayConsumption > 0
      ? ((totalConsumption - yesterdayConsumption) / yesterdayConsumption) * 100
      : 0;

  const renderConsumptionChange = () => {
    if (yesterdayConsumption === 0) return null;
    const isPositive = consumptionChange >= 0;
    return (
      <Flex align="center" gap="small">
        {isPositive ? (
          <ArrowUpOutlined style={{ color: "red" }} />
        ) : (
          <ArrowDownOutlined style={{ color: "green" }} />
        )}
        <Text style={{ color: isPositive ? "red" : "green" }}>
          {consumptionChange.toFixed(1)}% vs ayer
        </Text>
      </Flex>
    );
  };

  return (
    <Row gutter={[16, 16]}>
      {/* Resumen de Caudal */}
      <Col xs={24} md={8}>
        <Card title="Resumen de Caudal" extra={<BarChartOutlined />}>
          <Statistic
            title="Caudal Total Actual"
            value={formatFlow(stats.totalCaudal)}
            suffix="L/s"
            loading={loading}
          />
          <Flex justify="space-between" style={{ marginTop: 16 }}>
            <Text type="secondary">{pointsWithFlow} puntos con caudal</Text>
            <Text type="secondary">{pointsExceeded} puntos excedidos</Text>
          </Flex>
          <Progress
            percent={(pointsExceeded / pointsWithFlow) * 100}
            status="exception"
            showInfo={false}
          />
        </Card>
      </Col>

      {/* Resumen de Consumo */}
      <Col xs={24} md={8}>
        <Card title="Resumen de Consumo" extra={<FaHandHoldingDroplet />}>
          <Statistic
            title="Consumo Total Hoy"
            value={formatInteger(stats.totalConsumption)}
            suffix="m³"
            loading={loading}
          />
          <Flex justify="space-between" style={{ marginTop: 16 }}>
            <Text type="secondary">
              Ayer: {formatInteger(yesterdayConsumption)} m³
            </Text>
            {renderConsumptionChange()}
          </Flex>
        </Card>
      </Col>

      {/* Resumen de Nivel Freático (Placeholder) */}
      <Col xs={24} md={8}>
        <Card
          title="Resumen de Nivel Freático"
          extra={<CloudDownloadOutlined />}
        >
          <Text type="secondary">
            Próximamente: Estadísticas detalladas sobre el nivel freático de los
            pozos.
          </Text>
        </Card>
      </Col>
    </Row>
  );
};

export default VariableSummary;
