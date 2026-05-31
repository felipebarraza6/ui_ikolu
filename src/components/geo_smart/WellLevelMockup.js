import React from "react";
import { Flex, Typography, Card } from "antd";

const { Text } = Typography;

/*
  MOCKUP VISUAL - Gráfico de Nivel con capas del pozo
  
  Capas (de arriba a abajo):
  1. Profundidad total del pozo (d1) - línea roja punteada
  2. Posición del sensor (d3) - línea naranja punteada  
  3. Nivel freático estático - línea gris punteada
  4. Nivel de agua dinámico - barras azules
*/

const WellLevelMockup = () => {
  // Datos simulados
  const wellDepth = 50;      // d1: Profundidad total del pozo
  const sensorPos = 30;      // d3: Posición del sensor
  const staticWater = 25;    // Nivel freático estático
  const dynamicLevels = [18, 20, 22, 19, 21, 23, 20, 17, 19, 22]; // Nivel de agua dinámico

  const chartHeight = 400;
  const chartWidth = 500;
  const padding = { top: 40, bottom: 40, left: 60, right: 40 };
  const drawHeight = chartHeight - padding.top - padding.bottom;
  const drawWidth = chartWidth - padding.left - padding.right;

  // Escala: 0 en la superficie, max en el fondo
  const maxDepth = wellDepth + 5;
  const yScale = (depth) => padding.top + (depth / maxDepth) * drawHeight;

  const barWidth = drawWidth / dynamicLevels.length * 0.6;
  const barGap = drawWidth / dynamicLevels.length;

  return (
    <Card title="Mockup: Perfil del Pozo con Niveles" style={{ maxWidth: 600 }}>
      <Flex gap="middle" vertical>
        {/* Leyenda */}
        <Flex gap={16} wrap="wrap">
          <Flex align="center" gap={6}>
            <div style={{ width: 20, height: 3, background: '#ff4d4f', borderStyle: 'dashed', borderWidth: 1 }} />
            <Text style={{ fontSize: 12 }}>Profundidad total ({wellDepth}m)</Text>
          </Flex>
          <Flex align="center" gap={6}>
            <div style={{ width: 20, height: 3, background: '#ff6b35', borderStyle: 'dashed', borderWidth: 1 }} />
            <Text style={{ fontSize: 12 }}>Sensor ({sensorPos}m)</Text>
          </Flex>
          <Flex align="center" gap={6}>
            <div style={{ width: 20, height: 3, background: '#8c8c8c', borderStyle: 'dashed', borderWidth: 1 }} />
            <Text style={{ fontSize: 12 }}>Freático estático ({staticWater}m)</Text>
          </Flex>
          <Flex align="center" gap={6}>
            <div style={{ width: 12, height: 12, background: '#1890ff', borderRadius: 2 }} />
            <Text style={{ fontSize: 12 }}>Nivel agua dinámico</Text>
          </Flex>
        </Flex>

        {/* Gráfico SVG */}
        <svg width={chartWidth} height={chartHeight} style={{ background: '#fafafa', borderRadius: 8 }}>
          {/* Eje Y */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartHeight - padding.bottom} stroke="#d9d9d9" strokeWidth={1} />
          <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke="#d9d9d9" strokeWidth={1} />
          
          {/* Labels del eje Y */}
          {[0, 10, 20, 30, 40, 50].map((depth) => (
            <g key={depth}>
              <line x1={padding.left - 5} y1={yScale(depth)} x2={padding.left} y2={yScale(depth)} stroke="#d9d9d9" />
              <text x={padding.left - 10} y={yScale(depth) + 4} textAnchor="end" fontSize={10} fill="#8c8c8c">{depth}m</text>
            </g>
          ))}

          {/* Zona del pozo */}
          <rect x={padding.left + 10} y={yScale(0)} width={drawWidth - 20} height={yScale(wellDepth) - yScale(0)} fill="#e6f7ff" opacity={0.3} />

          {/* Línea: Profundidad total del pozo (d1) */}
          <line x1={padding.left + 10} y1={yScale(wellDepth)} x2={chartWidth - padding.right - 10} y2={yScale(wellDepth)} stroke="#ff4d4f" strokeWidth={2} strokeDasharray="6,4" />
          <text x={chartWidth - padding.right - 5} y={yScale(wellDepth) + 4} textAnchor="end" fontSize={10} fill="#ff4d4f" fontWeight="bold">Pozo: {wellDepth}m</text>

          {/* Línea: Posición del sensor (d3) */}
          <line x1={padding.left + 10} y1={yScale(sensorPos)} x2={chartWidth - padding.right - 10} y2={yScale(sensorPos)} stroke="#ff6b35" strokeWidth={2} strokeDasharray="6,4" />
          <text x={chartWidth - padding.right - 5} y={yScale(sensorPos) + 4} textAnchor="end" fontSize={10} fill="#ff6b35" fontWeight="bold">Sensor: {sensorPos}m</text>

          {/* Línea: Nivel freático estático */}
          <line x1={padding.left + 10} y1={yScale(staticWater)} x2={chartWidth - padding.right - 10} y2={yScale(staticWater)} stroke="#8c8c8c" strokeWidth={2} strokeDasharray="6,4" />
          <text x={chartWidth - padding.right - 5} y={yScale(staticWater) + 4} textAnchor="end" fontSize={10} fill="#8c8c8c">Freático: {staticWater}m</text>

          {/* Barras: Nivel de agua dinámico */}
          {dynamicLevels.map((level, i) => {
            const barHeight = (level / maxDepth) * drawHeight;
            const x = padding.left + 20 + i * barGap;
            const y = yScale(0) + (drawHeight - barHeight);
            const isMax = level === Math.max(...dynamicLevels);
            const isMin = level === Math.min(...dynamicLevels);
            const color = isMax ? '#ff4d4f' : isMin ? '#52c41a' : '#1890ff';
            
            return (
              <g key={i}>
                <rect x={x} y={yScale(level)} width={barWidth} height={yScale(0) - yScale(level)} fill={color} rx={2} opacity={0.8} />
                <text x={x + barWidth / 2} y={yScale(level) - 5} textAnchor="middle" fontSize={9} fill={color} fontWeight="bold">{level}m</text>
              </g>
            );
          })}

          {/* Zona de aire (sobre el agua) */}
          <text x={padding.left + 15} y={yScale(0) + 15} fontSize={10} fill="#8c8c8c">AIRE</text>
          
          {/* Zona de agua */}
          <text x={padding.left + 15} y={yScale(dynamicLevels[0]) + 15} fontSize={10} fill="#1890ff">AGUA</text>
        </svg>

        {/* Explicación */}
        <Flex vertical gap={8} style={{ padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <Text strong style={{ fontSize: 13 }}>Indicadores calculables:</Text>
          <Text style={{ fontSize: 12 }}>• <strong>Sumergencia:</strong> Sensor - Nivel agua = {sensorPos - dynamicLevels[0]}m</Text>
          <Text style={{ fontSize: 12 }}>• <strong>Abatimiento:</strong> Nivel estático - Nivel dinámico = {staticWater - dynamicLevels[0]}m</Text>
          <Text style={{ fontSize: 12 }}>• <strong>Columna de agua:</strong> Profundidad pozo - Nivel agua = {wellDepth - dynamicLevels[0]}m</Text>
          <Text style={{ fontSize: 12 }}>• <strong>% Ocupación:</strong> {(dynamicLevels[0] / wellDepth * 100).toFixed(1)}% del pozo con agua</Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default WellLevelMockup;
