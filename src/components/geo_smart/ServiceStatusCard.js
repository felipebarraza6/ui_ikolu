import React, { memo } from 'react';
import { Card, Flex, Typography, Progress, Row, Col, Badge, Tag, List, Alert } from 'antd';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

const { Text } = Typography;

/**
 * ServiceStatusCard — Estado del servicio memoizado
 * Solo se re-renderiza cuando cambian los estados de logger
 */
const ServiceStatusCard = memo(({
  serviceHealth,
  activosHoy,
  inactivosHoy,
  loggerStatuses,
  puntosDesconectados,
  isSimpleMode,
  profiles,
  selectedProfileId,
  onSelectPoint,
}) => {
  const getStatusColor = (health) => {
    if (health >= 90) return '#52c41a';
    if (health >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const getStatusText = (health) => {
    if (health >= 90) return 'Excelente';
    if (health >= 50) return 'Advertencia';
    return 'Crítico';
  };

  return (
    <Card
      size="small"
      title={
        <Flex align="center" gap="small">
          <FaWifi style={{ color: '#52C41A' }} />
          <span>Estado del Servicio</span>
        </Flex>
      }
      style={{ borderRadius: 16, height: '100%' }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Flex align="center" justify="space-between" style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>Salud del sistema</Text>
        <Tag color={getStatusColor(serviceHealth)} style={{ fontWeight: 600 }}>
          {getStatusText(serviceHealth)}
        </Tag>
      </Flex>
      <Progress
        percent={serviceHealth}
        strokeColor={getStatusColor(serviceHealth)}
        format={(percent) => `${Math.round(percent)}%`}
        strokeWidth={10}
      />
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card size="small" style={{ background: '#f2f5fa', border: 'none', borderRadius: 8, textAlign: 'center' }}>
            <Text style={{ fontSize: 12, color: '#1F3461', display: 'block' }}>Activos hoy</Text>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#1F3461' }}>{activosHoy}</Text>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ background: inactivosHoy > 0 ? '#FFF2F0' : '#f2f5fa', border: 'none', borderRadius: 8, textAlign: 'center' }}>
            <Text style={{ fontSize: 12, color: inactivosHoy > 0 ? '#FF6B35' : '#1F3461', display: 'block' }}>Sin datos hoy</Text>
            <Text style={{ fontSize: 24, fontWeight: 700, color: inactivosHoy > 0 ? '#FF6B35' : '#1F3461' }}>{inactivosHoy}</Text>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          {isSimpleMode ? 'Mis Puntos' : 'Estado por punto'}
        </Text>
        {isSimpleMode ? (
          <List
            size="small"
            dataSource={profiles}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '10px 12px',
                  border: 'none',
                  fontSize: 13,
                  cursor: onSelectPoint ? 'pointer' : 'default',
                  borderRadius: 8,
                  background: selectedProfileId === item.id ? '#e6f7ff' : '#f6ffed',
                  marginBottom: 4,
                  border: selectedProfileId === item.id ? '1px solid #1890ff' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
                onClick={() => onSelectPoint && onSelectPoint(item)}
              >
                <Flex align="center" gap="small" style={{ width: '100%' }}>
                  <Badge
                    status={item.is_telemetry ? 'processing' : 'default'}
                    color={item.is_telemetry ? '#52C41A' : '#d9d9d9'}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</span>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                      {item.project_name}
                    </Text>
                  </div>
                </Flex>
              </List.Item>
            )}
            locale={{ emptyText: 'Sin puntos asignados' }}
          />
        ) : (
          <>
            <List
              size="small"
              dataSource={loggerStatuses}
              renderItem={(item) => {
                const isTelemetry = item.is_telemetry ?? item.config_data?.is_telemetry === true;
                const isToday = item.is_today ?? false;
                return (
                  <List.Item style={{ padding: '4px 0', border: 'none', fontSize: 12 }}>
                    <Flex align="center" gap="small" style={{ width: '100%' }}>
                      <Badge
                        status={isTelemetry ? (isToday ? 'success' : 'error') : 'default'}
                        color={isTelemetry ? (isToday ? '#52C41A' : '#ff4d4f') : '#d9d9d9'}
                      />
                      <span style={{ flex: 1 }}>{item.name}</span>
                      <Tag
                        size="small"
                        color={isTelemetry ? (isToday ? 'success' : 'error') : 'default'}
                        style={{ fontSize: 10, margin: 0 }}
                      >
                        {isTelemetry ? (isToday ? 'OK' : 'Sin datos') : 'No telemetría'}
                      </Tag>
                    </Flex>
                  </List.Item>
                );
              }}
              locale={{ emptyText: 'Sin puntos' }}
            />
            {puntosDesconectados.length > 0 && (
              <Alert
                message={`${puntosDesconectados.length} punto(s) sin datos hoy`}
                description={puntosDesconectados.join(', ')}
                type="warning"
                showIcon
                size="small"
                style={{ marginTop: 8, fontSize: 11 }}
              />
            )}
          </>
        )}
      </div>
    </Card>
  );
});

ServiceStatusCard.displayName = 'ServiceStatusCard';

export default ServiceStatusCard;
