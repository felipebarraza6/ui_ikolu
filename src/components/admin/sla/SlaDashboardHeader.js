import React from 'react';
import { Flex, Typography, Badge, Button, Tooltip } from 'antd';
import {
  ReloadOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

/**
 * SlaDashboardHeader — Header moderno y genérico para el módulo SLA
 *
 * Identidad visual limpia, sin marca específica.
 */
const SlaDashboardHeader = ({
  metrics,
  loading,
  onRefresh,
  lastRefresh,
  onCreateTicket,
}) => {
  const { porVencer, total, activos, resueltos } = metrics || {};

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decoración de fondo */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          right: 80,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.02)',
        }}
      />

      <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
        <Flex align="center" gap={16} style={{ zIndex: 1 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SafetyCertificateOutlined style={{ fontSize: 24, color: '#60A5FA' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 700 }}>
              Centro de Gestión SLA
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
              Tickets de soporte, seguimiento de tiempos y control de calidad
            </Text>
          </div>
        </Flex>

        <Flex align="center" gap={12} style={{ zIndex: 1 }}>
          {porVencer > 0 && (
            <Badge
              count={porVencer}
              style={{ backgroundColor: '#EF4444', fontSize: 11, fontWeight: 600 }}
            >
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  paddingRight: 24,
                }}
              >
                <Text style={{ color: '#FCA5A5', fontSize: 12, fontWeight: 500 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  Por vencer SLA
                </Text>
              </div>
            </Badge>
          )}

          {lastRefresh && (
            <Tooltip title={dayjs(lastRefresh).format('DD/MM/YYYY HH:mm:ss')}>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {dayjs(lastRefresh).fromNow()}
              </Text>
            </Tooltip>
          )}

          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            Refrescar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateTicket}
            style={{
              background: '#fff',
              color: '#0F172A',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Nuevo ticket
          </Button>
        </Flex>
      </Flex>

      {/* Quick stats bar */}
      <Flex gap={24} style={{ marginTop: 20, zIndex: 1, position: 'relative' }} wrap="wrap">
        {[
          { label: 'Total', value: total || 0, color: '#60A5FA' },
          { label: 'Activos', value: activos || 0, color: '#FBBF24' },
          { label: 'Resueltos', value: resueltos || 0, color: '#34D399' },
        ].map((stat) => (
          <div key={stat.label}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, display: 'block' }}>
              {stat.label}
            </Text>
            <Text
              style={{
                color: stat.color,
                fontSize: 20,
                fontWeight: 700,
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              {stat.value}
            </Text>
          </div>
        ))}
      </Flex>
    </div>
  );
};

export default React.memo(SlaDashboardHeader);
