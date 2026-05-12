import React, { memo } from 'react';
import { Card, Flex, Typography } from 'antd';

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
  style = {},
}) => {
  return (
    <Card
      size="small"
      style={{
        borderRadius: 16,
        background: gradient || 'linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)',
        border: 'none',
        boxShadow: '0 4px 12px rgba(31, 52, 97, 0.25)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      bodyStyle={{ padding: '20px 16px' }}
      onClick={onClick}
    >
      <Flex align="center" gap="small">
        {icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', display: 'block' }}>
            {label}
          </Text>
          <Text style={{ fontSize: 28, color: 'white', fontWeight: 700, lineHeight: 1 }}>
            {value}
            {suffix && (
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>
                {suffix}
              </span>
            )}
          </Text>
          {sublabel && (
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              {sublabel}
            </Text>
          )}
        </div>
      </Flex>
    </Card>
  );
});

KPICard.displayName = 'KPICard';

export default KPICard;
