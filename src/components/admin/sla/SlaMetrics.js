import React, { memo } from 'react';
import { Row, Col, Card, Flex, Typography } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  FlagOutlined,
  FireOutlined,
  SafetyOutlined,
  UserOutlined,
  HourglassOutlined,
  FileTextOutlined,
  FileAddOutlined,
  MailOutlined,
  DesktopOutlined,
  ToolOutlined,
  TeamOutlined,
  SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * SlaMetrics — KPIs completos de gestión SLA
 */
const SlaMetrics = memo(({ metrics, tickets }) => {
  const {
    total,
    activos,
    resueltos,
    tasaResolucion,
    tiempoPromedioRespuesta,
    tiempoPromedioResolucion,
    porVencer,
  } = metrics || {};

  // Calcular indicadores adicionales desde tickets
  let excedidos = 0;
  let urgentes = 0;
  let sinAsignar = 0;
  let criticos = 0;
  let altos = 0;
  let internos = 0;
  let clientes = 0;
  let dgaCount = 0;
  let smaCount = 0;
  let clientesAtendidosSet = new Set();
  let devSoftware = 0;
  let devHardware = 0;

  let tiempoSolucionInterno = 0;
  let countSolucionInterno = 0;
  let tiempoSolucionExterno = 0;
  let countSolucionExterno = 0;

  if (tickets && tickets.length > 0) {
    const ahora = dayjs();
    tickets.forEach((t) => {
      const horas = ahora.diff(dayjs(t.created), 'hour');
      if (!t.is_read && horas > 48) excedidos++;
      else if (!t.is_read && horas > 24 && horas <= 48) urgentes++;
      if (!t.assigned_to && !t.is_finish) sinAsignar++;
      if (t.priority === 'critical') criticos++;
      if (t.priority === 'high') altos++;
      if (t.source === 'internal') internos++;
      if (t.source === 'client') clientes++;
      if (t.status_dga === 'PENDING' || t.status_dga === 'SENT') dgaCount++;
      if (t.status_sma === 'PENDING' || t.status_sma === 'SENT') smaCount++;
      if (t.client) clientesAtendidosSet.add(t.client);
      if (t.is_read && !t.is_wait && t.is_active && !t.is_finish) {
        if (t.category === 'back') devSoftware++;
        if (t.category === 'hard') devHardware++;
      }

      // Tiempo de solución para tickets resueltos
      if (t.is_finish && t.responses && t.responses.length > 0) {
        const created = dayjs(t.created);
        const lastResponse = dayjs(t.responses[t.responses.length - 1].created);
        const diffHoras = lastResponse.diff(created, 'hour', true);
        if (t.source === 'internal' || !t.source) {
          tiempoSolucionInterno += diffHoras;
          countSolucionInterno++;
        } else {
          tiempoSolucionExterno += diffHoras;
          countSolucionExterno++;
        }
      }
    });
  }

  const tiempoSolInt = countSolucionInterno > 0 ? Math.round(tiempoSolucionInterno / countSolucionInterno) : 0;
  const tiempoSolExt = countSolucionExterno > 0 ? Math.round(tiempoSolucionExterno / countSolucionExterno) : 0;

  const renderCard = (card, idx) => (
    <Col xs={12} sm={8} md={8} lg={4} key={idx}>
      <Card
        size="small"
        style={{
          borderRadius: 12,
          background: card.bg,
          border: `1px solid ${card.border}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'default',
        }}
        bodyStyle={{ padding: '16px 12px', textAlign: 'center' }}
        hoverable
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: `${card.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px', fontSize: 18,
        }}>
          {card.icon}
        </div>
        <Text style={{ fontSize: 24, fontWeight: 700, color: card.color, display: 'block', lineHeight: 1.2 }}>
          {card.value}
        </Text>
        <Text style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 4 }}>{card.label}</Text>
        <Text style={{ fontSize: 10, color: '#94A3B8', display: 'block', marginTop: 2 }}>{card.desc}</Text>
      </Card>
    </Col>
  );

  const mainCards = [
    { label: 'Total Tickets', value: total, icon: <SafetyOutlined style={{ color: '#3B82F6' }} />, color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', desc: 'En sistema' },
    { label: 'Activos', value: activos, icon: <FlagOutlined style={{ color: '#F59E0B' }} />, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', desc: 'Requieren atención' },
    { label: 'Resueltos', value: resueltos, icon: <CheckCircleOutlined style={{ color: '#10B981' }} />, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', desc: 'Completados' },
    { label: 'Tasa Resolución', value: `${tasaResolucion}%`, icon: <ThunderboltOutlined style={{ color: '#8B5CF6' }} />, color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', desc: 'Efectividad' },
    { label: 'Tiempo Prom. Respuesta', value: `${tiempoPromedioRespuesta}h`, icon: <ClockCircleOutlined style={{ color: '#0EA5E9' }} />, color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD', desc: 'Desde creación' },
    { label: 'Tiempo Prom. Resolución', value: `${tiempoPromedioResolucion}h`, icon: <HourglassOutlined style={{ color: '#14B8A6' }} />, color: '#14B8A6', bg: '#F0FDFA', border: '#99F6E4', desc: 'Hasta cierre' },
  ];

  const sourceCards = [
    { label: 'Tickets Internos', value: internos, icon: <FileTextOutlined style={{ color: '#0F172A' }} />, color: '#0F172A', bg: '#F1F5F9', border: '#E2E8F0', desc: 'Creados por staff' },
    { label: 'Tickets de Clientes', value: clientes, icon: <MailOutlined style={{ color: '#3B82F6' }} />, color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', desc: 'Creados por clientes' },
    { label: 'Tickets DGA', value: dgaCount, icon: <FileAddOutlined style={{ color: '#F59E0B' }} />, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', desc: 'Ingresados a DGA' },
    { label: 'Tickets SMA', value: smaCount, icon: <SendOutlined style={{ color: '#8B5CF6' }} />, color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', desc: 'Estado SMA' },
    { label: 'Clientes Atendidos', value: clientesAtendidosSet.size, icon: <TeamOutlined style={{ color: '#10B981' }} />, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', desc: 'Únicos con tickets' },
  ];

  const timeCards = [
    { label: 'Solución Interno', value: `${tiempoSolInt}h`, icon: <ClockCircleOutlined style={{ color: '#0EA5E9' }} />, color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD', desc: 'Tickets staff' },
    { label: 'Solución Externo', value: `${tiempoSolExt}h`, icon: <ClockCircleOutlined style={{ color: '#14B8A6' }} />, color: '#14B8A6', bg: '#F0FDFA', border: '#99F6E4', desc: 'Tickets cliente' },
  ];

  const devCards = [
    { label: 'Desarrollo Software', value: devSoftware, icon: <DesktopOutlined style={{ color: '#3B82F6' }} />, color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', desc: 'Derivación Back' },
    { label: 'Desarrollo Hardware', value: devHardware, icon: <ToolOutlined style={{ color: '#F59E0B' }} />, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', desc: 'Derivación Hard' },
  ];

  const alertCards = [
    { label: 'Excedidos SLA', value: excedidos, icon: <FireOutlined style={{ color: '#EF4444' }} />, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', desc: '>48h sin respuesta' },
    { label: 'Urgentes SLA', value: urgentes, icon: <ExclamationCircleOutlined style={{ color: '#F59E0B' }} />, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', desc: '>24h sin respuesta' },
    { label: 'Sin Asignar', value: sinAsignar, icon: <UserOutlined style={{ color: '#64748B' }} />, color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', desc: 'Sin responsable' },
    { label: 'Prioridad Crítica', value: criticos, icon: <FireOutlined style={{ color: '#7C2D12' }} />, color: '#7C2D12', bg: '#FFF7ED', border: '#FED7AA', desc: 'Atención inmediata' },
    { label: 'Prioridad Alta', value: altos, icon: <ThunderboltOutlined style={{ color: '#EF4444' }} />, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', desc: 'Atención prioritaria' },
  ].filter(c => c.value > 0);

  return (
    <div style={{ marginBottom: 24 }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 15, color: '#0F172A' }}>
          Métricas de Rendimiento
        </Text>
        {porVencer > 0 && (
          <Flex align="center" gap={6} style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '4px 10px',
          }}>
            <FireOutlined style={{ color: '#EF4444', fontSize: 12 }} />
            <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 500 }}>
              {porVencer} ticket{porVencer > 1 ? 's' : ''} por vencer SLA (&gt;48h)
            </Text>
          </Flex>
        )}
      </Flex>

      <Row gutter={[16, 16]}>
        {mainCards.map(renderCard)}
      </Row>

      {/* Origen de tickets */}
      <Text strong style={{ fontSize: 13, color: '#0F172A', display: 'block', margin: '20px 0 12px' }}>
        Origen y Estados
      </Text>
      <Row gutter={[16, 16]}>
        {sourceCards.map(renderCard)}
      </Row>

      {/* Derivación Desarrollo */}
      <Text strong style={{ fontSize: 13, color: '#0F172A', display: 'block', margin: '20px 0 12px' }}>
        Derivación a Desarrollo
      </Text>
      <Row gutter={[16, 16]}>
        {devCards.map(renderCard)}
      </Row>

      {/* Tiempos de solución */}
      <Text strong style={{ fontSize: 13, color: '#0F172A', display: 'block', margin: '20px 0 12px' }}>
        Tiempos de Solución
      </Text>
      <Row gutter={[16, 16]}>
        {timeCards.map(renderCard)}
      </Row>

      {/* Alertas */}
      {alertCards.length > 0 && (
        <>
          <Text strong style={{ fontSize: 13, color: '#0F172A', display: 'block', margin: '20px 0 12px' }}>
            Alertas Activas
          </Text>
          <Row gutter={[16, 16]}>
            {alertCards.map(renderCard)}
          </Row>
        </>
      )}
    </div>
  );
});

SlaMetrics.displayName = 'SlaMetrics';

export default SlaMetrics;
