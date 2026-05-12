import React, { memo, useMemo } from 'react';
import { Card, Flex, Typography, Row, Col, Table, Alert } from 'antd';
import { FaChartBar } from 'react-icons/fa';
import { formatInteger } from '../../utils/numberFormatter';

const { Text } = Typography;

/**
 * ConsumptionSummaryCard — Resumen de consumo memoizado
 */
const ConsumptionSummaryCard = memo(({
  totalHoy,
  totalAyer,
  consumoPorNombre,
  profilesByName,
  caudalesExcedidos,
}) => {
  const dataSource = useMemo(() => {
    return Object.keys(consumoPorNombre).map((punto) => {
      const profile = profilesByName[punto];
      const vars = profile?.profile_ikolu?.vars || profile?.config_data?.vars || profile?.config_data?.variables || [];
      const hasTotalizado = vars.some(v => v.type_variable?.includes('TOTALIZADO'));
      const hoy = consumoPorNombre[punto]?.hoy || 0;
      const ayer = consumoPorNombre[punto]?.ayer || 0;
      const diferencia = hoy - ayer;
      return {
        key: punto,
        punto,
        hasTotalizado,
        hoy,
        ayer,
        diferencia,
      };
    });
  }, [consumoPorNombre, profilesByName]);

  const columns = [
    {
      title: 'Punto',
      dataIndex: 'punto',
      key: 'punto',
      render: (text, record) => !record.hasTotalizado ? (
        <Text type="secondary" style={{ fontSize: 11 }}>{text} <span style={{ fontSize: 10, color: '#999' }}>Sin totalizado</span></Text>
      ) : text,
    },
    {
      title: 'Diferencia',
      dataIndex: 'diferencia',
      key: 'diferencia',
      align: 'right',
      render: (val, record) => !record.hasTotalizado ? '—' : (
        <span style={{ color: val > 0 ? '#fa8c16' : val < 0 ? '#1976d2' : '#666', fontWeight: 600 }}>
          {val > 0 ? '+' : val < 0 ? '-' : ''}{formatInteger(Math.abs(val))} m³
        </span>
      ),
    },
    {
      title: 'Hoy',
      dataIndex: 'hoy',
      key: 'hoy',
      align: 'right',
      render: (val, record) => !record.hasTotalizado ? '—' : <b>{formatInteger(val)} m³</b>,
    },
    {
      title: 'Ayer',
      dataIndex: 'ayer',
      key: 'ayer',
      align: 'right',
      render: (val, record) => !record.hasTotalizado ? '—' : <span style={{ color: '#888' }}>{formatInteger(val)} m³</span>,
    },
  ];

  return (
    <Card
      size="small"
      title={
        <Flex align="center" gap="small">
          <FaChartBar style={{ color: '#1890ff' }} />
          <span>Resumen de Consumo</span>
        </Flex>
      }
      style={{ borderRadius: 16, height: '100%' }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <div style={{ textAlign: 'center', padding: '12px 0', background: '#f2f5fa', borderRadius: 12 }}>
            <Text style={{ fontSize: 11, color: '#1F3461', display: 'block' }}>Hoy</Text>
            <Text style={{ fontSize: 22, fontWeight: 700, color: '#1F3461' }}>{formatInteger(totalHoy)}</Text>
            <Text style={{ fontSize: 11, color: '#1F3461' }}>m³</Text>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'center', padding: '12px 0', background: '#f2f5fa', borderRadius: 12 }}>
            <Text style={{ fontSize: 11, color: '#1F3461', display: 'block' }}>Diferencia</Text>
            <Text style={{ fontSize: 22, fontWeight: 700, color: totalHoy >= totalAyer ? '#1F3461' : '#FF6B35' }}>
              {totalHoy >= totalAyer ? '+' : '-'}{formatInteger(Math.abs(totalHoy - totalAyer))}
            </Text>
            <Text style={{ fontSize: 11, color: '#1F3461' }}>m³</Text>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'center', padding: '12px 0', background: '#f2f5fa', borderRadius: 12 }}>
            <Text style={{ fontSize: 11, color: '#1F3461', display: 'block' }}>Ayer</Text>
            <Text style={{ fontSize: 22, fontWeight: 700, color: '#1F3461' }}>{formatInteger(totalAyer)}</Text>
            <Text style={{ fontSize: 11, color: '#1F3461' }}>m³</Text>
          </div>
        </Col>
      </Row>

      <Table
        size="small"
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        locale={{ emptyText: 'Sin datos de consumo' }}
      />
      {caudalesExcedidos.length > 0 && (
        <Alert
          message="Caudales excedidos"
          description={caudalesExcedidos.map(c => `${c.name}: ${c.maxFlow?.toFixed?.(1) || 0} L/s vs ${c.flowGranted} L/s autorizado`).join(' · ')}
          type="error"
          showIcon
          size="small"
          style={{ marginTop: 12 }}
        />
      )}
    </Card>
  );
});

ConsumptionSummaryCard.displayName = 'ConsumptionSummaryCard';

export default ConsumptionSummaryCard;
