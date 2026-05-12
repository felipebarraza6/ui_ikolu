import React, { memo } from 'react';
import { Row, Col, Card, Statistic, Badge, Flex, Typography } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

/**
 * SlaMetrics — KPIs de métricas SLA para el dashboard de tickets
 */
const SlaMetrics = memo(({ metrics }) => {
  const {
    total,
    activos,
    resueltos,
    tasaResolucion,
    tiempoPromedioRespuesta,
    tiempoPromedioResolucion,
    porVencer,
  } = metrics;

  const cards = [
    {
      label: 'Total Tickets',
      value: total,
      icon: <SyncOutlined style={{ color: '#1F3461' }} />,
      color: '#1F3461',
      bg: '#F2F5FA',
    },
    {
      label: 'Activos',
      value: activos,
      icon: <ExclamationCircleOutlined style={{ color: '#FAAD14' }} />,
      color: '#FAAD14',
      bg: '#FFFBE6',
    },
    {
      label: 'Resueltos',
      value: resueltos,
      icon: <CheckCircleOutlined style={{ color: '#52C41A' }} />,
      color: '#52C41A',
      bg: '#F6FFED',
    },
    {
      label: 'Tasa de Resolución',
      value: `${tasaResolucion}%`,
      icon: <ThunderboltOutlined style={{ color: '#722ED1' }} />,
      color: '#722ED1',
      bg: '#F9F0FF',
    },
    {
      label: 'Tiempo Prom. Respuesta',
      value: `${tiempoPromedioRespuesta}h`,
      icon: <ClockCircleOutlined style={{ color: '#1890FF' }} />,
      color: '#1890FF',
      bg: '#E6F7FF',
    },
    {
      label: 'Tiempo Prom. Resolución',
      value: `${tiempoPromedioResolucion}h`,
      icon: <ClockCircleOutlined style={{ color: '#13C2C2' }} />,
      color: '#13C2C2',
      bg: '#E6FFFB',
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>
          Métricas SLA
        </Text>
        {porVencer > 0 && (
          <Badge
            count={porVencer}
            style={{ backgroundColor: '#FF4D4F' }}
          >
            <Text type="danger" style={{ fontSize: 13, marginRight: 8 }}>
              Tickets por vencer SLA (&gt;48h)
            </Text>
          </Badge>
        )}
      </Flex>
      <Row gutter={[16, 16]}>
        {cards.map((card, idx) => (
          <Col xs={12} sm={8} md={8} lg={4} key={idx}>
            <Card
              size="small"
              style={{
                borderRadius: 12,
                background: card.bg,
                border: `1px solid ${card.color}22`,
              }}
              bodyStyle={{ padding: '16px 12px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
              <Statistic
                value={card.value}
                valueStyle={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: card.color,
                }}
              />
              <Text style={{ fontSize: 11, color: '#888' }}>{card.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
});

SlaMetrics.displayName = 'SlaMetrics';

export default SlaMetrics;
