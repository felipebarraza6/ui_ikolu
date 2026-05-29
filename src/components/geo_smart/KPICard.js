import React, { memo } from 'react';
import { Card, Flex, Typography } from 'antd';
import { Area } from '@ant-design/plots';

const { Text } = Typography;

/**
 * KPICard — Tarjeta de indicador clave memoizada
 * Evita re-renders cuando otros KPIs cambian
 */
const KPICard = memo(({
  icon,
  label,
  value,
  suffix,
  sublabel,
  gradient,
  onClick,
  sparkline,
  style = {},
}) => {
  const sparklineConfig = sparkline?.data && sparkline.data.length > 0 ? {
    data: sparkline.data.map((v, i) => ({ index: i, value: v })),
    xField: 'index',
    yField: 'value',
    smooth: true,
    height: 40,
    padding: 0,
    axis: false,
    line: {
      style: {
        stroke: 'rgba(255,255,255,0.8)',
        lineWidth: 1.5,
      },
    },
    area: {
      style: {
        fill: 'rgba(255,255,255,0.15)',
      },
    },
    tooltip: false,
    animation: false,
  } : null;

  return (
    <Card
      size="small"
      style={{
        borderRadius: 10,
        background: gradient || 'linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)',
        border: 'none',
        boxShadow: '0 2px 8px rgba(31, 52, 97, 0.2)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      bodyStyle={{ padding: sparklineConfig ? '8px 12px 6px' : '12px 14px' }}
      onClick={onClick}
    >
      <Flex vertical gap={sparklineConfig ? 4 : 0}>
        <Flex align="center" gap="small">
          {icon && (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'block' }}>
              {label}
            </Text>
            <Text style={{ fontSize: 20, color: 'white', fontWeight: 700, lineHeight: 1 }}>
              {value}
              {suffix && (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>
                  {suffix}
                </span>
              )}
            </Text>
            {sublabel && (
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                {sublabel}
              </Text>
            )}
          </div>
        </Flex>
        {sparklineConfig && <Area {...sparklineConfig} />}
      </Flex>
    </Card>
  );
});

KPICard.displayName = 'KPICard';

export default KPICard;
