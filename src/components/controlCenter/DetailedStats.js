import { Card, Col, Row, Space, Tag, Typography } from "antd";
import {
  ThunderboltOutlined,
} from "@ant-design/icons";
import React from "react";

const { Text } = Typography;

const DetailedStats = ({ stats, standardStats }) => {
  // Solo mostrar si hay puntos con código de obra
  const hasCodePoints = stats.dgaPoints > 0 || stats.smaPoints > 0;

  if (!hasCodePoints) {
    return null;
  }

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
      <Col xs={24}>
        <Card
          title={
            <>
              <ThunderboltOutlined style={{ marginRight: "8px" }} />
              Cumplimiento y Estándar
            </>
          }
          size="small"
        >
          <Row gutter={[16, 12]}>
            {/* Columna izquierda: DGA y SMA */}
            <Col xs={24} sm={12}>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Space>
                    <ThunderboltOutlined style={{ color: "#006FB3" }} />
                    <Text>DGA (OB)</Text>
                  </Space>
                  <Tag color="blue">
                    {stats.dgaPoints}
                  </Tag>
                </Space>
                {stats.smaPoints > 0 && (
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Space>
                      <ThunderboltOutlined style={{ color: "#722ed1" }} />
                      <Text>SMA</Text>
                    </Space>
                    <Tag color="purple">
                      {stats.smaPoints}
                    </Tag>
                  </Space>
                )}
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text>Enviando a DGA</Text>
                  <Tag color="green">
                    {stats.dgaSending}
                  </Tag>
                </Space>
              </Space>
            </Col>

            {/* Columna derecha: Estándares */}
            <Col xs={24} sm={12}>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Text strong style={{ fontSize: "12px" }}>
                  Estándares DGA:
                </Text>
                {standardStats.MAYOR > 0 && (
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: "12px" }}>Mayor</Text>
                    <Tag color="red" style={{ fontSize: "11px" }}>
                      {standardStats.MAYOR}
                    </Tag>
                  </Space>
                )}
                {standardStats.MEDIO > 0 && (
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: "12px" }}>Medio</Text>
                    <Tag color="orange" style={{ fontSize: "11px" }}>
                      {standardStats.MEDIO}
                    </Tag>
                  </Space>
                )}
                {standardStats.MENOR > 0 && (
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: "12px" }}>Menor</Text>
                    <Tag color="green" style={{ fontSize: "11px" }}>
                      {standardStats.MENOR}
                    </Tag>
                  </Space>
                )}
                {standardStats.CAUDALES_MUY_PEQUENOS > 0 && (
                  <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: "12px" }}>Muy Pequeños</Text>
                    <Tag color="lime" style={{ fontSize: "11px" }}>
                      {standardStats.CAUDALES_MUY_PEQUENOS}
                    </Tag>
                  </Space>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default DetailedStats;
