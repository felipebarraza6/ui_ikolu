import React from "react";
import { Flex, Typography } from "antd";
import ApexChartWrapper from "../ApexChartWrapper";
import { COLORS } from "../constants/chartColors";

const { Text } = Typography;

/* ── Area Chart (Consumo) ── */
export const MeasurementsAreaChart = ({ data, metric, token, title, minInfo, maxInfo, avgInfo, pointName, date }) => {
  return (
    <ApexChartWrapper
      type="area"
      data={data}
      metric={metric}
      token={token}
      color={COLORS.consumo}
      title={title || "Consumo"}
      minInfo={minInfo}
      maxInfo={maxInfo}
      avgInfo={avgInfo}
      unit="m³"
      pointName={pointName}
      date={date}
      invertible={true}
    />
  );
};

/* ── Line Chart (Caudal) ── */
export const MeasurementsLineChart = ({ data, metric, token, title, minInfo, maxInfo, avgInfo, pointName, date }) => {
  return (
    <ApexChartWrapper
      type="area"
      data={data}
      metric={metric}
      token={token}
      color={COLORS.caudal}
      title={title || "Caudal"}
      minInfo={minInfo}
      maxInfo={maxInfo}
      avgInfo={avgInfo}
      unit="L/s"
      pointName={pointName}
      date={date}
      invertible={true}
    />
  );
};

/* ── Dual Column Chart (Nivel + Nivel Freático) ── */
export const MeasurementsDualColumnChart = ({ data, token, showOnly, wellConfig, pointName, date, metric, avgInfo }) => {
  if (!data || data.length === 0) return <Flex justify="center" align="center" style={{ height: 220 }} vertical><Text type="secondary" style={{ fontSize: 12 }}>Sin datos</Text></Flex>;

  const wellDepth = wellConfig?.d1 || null;
  const sensorPos = wellConfig?.d3 || null;

  const buildYAnnotations = (dataForMetric) => {
    if (!dataForMetric || dataForMetric.length === 0) return [];
    const vals = dataForMetric.map(d => d[showOnly === 'nivel' ? 'nivel' : 'water_table']).filter(v => v != null).map(Number);
    if (vals.length === 0) return [];
    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    const dataRange = maxVal - minVal;
    const padding = dataRange > 0 ? dataRange * 0.15 : Math.abs(maxVal) * 0.05 || 1;
    const yMin = minVal - padding;
    const yMax = maxVal + padding;
    
    const annotations = [];
    
    if (showOnly === 'nivel' && wellDepth != null && wellDepth >= yMin && wellDepth <= yMax) {
      annotations.push({
        y: wellDepth,
        borderColor: '#ff4d4f',
        strokeDashArray: 8,
        borderWidth: 3,
        label: {
          borderColor: '#ff4d4f',
          style: { color: '#fff', background: '#ff4d4f', fontSize: '11px', fontWeight: 700 },
          text: ` Límite pozo: ${wellDepth}m`,
          position: 'right',
          offsetX: 0,
        }
      });
    }
    
    if (showOnly === 'water_table' && sensorPos != null && sensorPos >= yMin && sensorPos <= yMax) {
      annotations.push({
        y: sensorPos,
        borderColor: '#ff6b35',
        strokeDashArray: 6,
        borderWidth: 2,
        label: {
          borderColor: '#ff6b35',
          style: { color: '#fff', background: '#ff6b35', fontSize: '10px', fontWeight: 600 },
          text: ` Sensor: ${sensorPos}m`,
          position: 'right',
          offsetX: 0,
        }
      });
    }
    
    return annotations;
  };

  const buildCustomTooltip = (color, label, avgValue) => {
    return function({ series, seriesIndex, dataPointIndex, w }) {
      if (dataPointIndex < 0) return '';
      const point = w.config.series[seriesIndex]?.data[dataPointIndex];
      if (!point) return '';
      const time = point.x || w.config.xaxis.categories[dataPointIndex] || '';
      const val = point.y;
      if (val == null) return '';
      
      const allVals = w.config.series[seriesIndex].data.map(d => d.y);
      const maxVal = Math.max(...allVals);
      const minVal = Math.min(...allVals);
      const isMax = val === maxVal;
      const isMin = val === minVal;
      let suffix = '';
      if (isMax) suffix = ' (MÁX)';
      if (isMin) suffix = ' (MÍN)';
      
      let html = `<div style="padding: 8px 12px; background: ${token.colorBgElevated}; border-radius: 8px; box-shadow: ${token.boxShadowSecondary}; min-width: 200px;">`;
      html += `<div style="font-size: 11px; color: ${token.colorTextSecondary}; margin-bottom: 6px; font-weight: 600;">${time} hrs</div>`;
      html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">`;
      html += `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${isMax ? '#ff4d4f' : isMin ? '#52c41a' : color};"></div>`;
      html += `<span style="font-size: 12px; color: ${token.colorText};">${label}: <strong>${Number(val).toFixed(2)} m</strong>${suffix}</span>`;
      html += `</div>`;
      
      html += `<div style="border-top: 1px solid ${token.colorBorderSecondary}; padding-top: 6px; margin-top: 4px;">`;
      
      if (showOnly === 'nivel' && wellDepth != null) {
        const diff = (wellDepth - val).toFixed(2);
        const exceedsDepth = val > wellDepth;
        html += `<div style="font-size: 9px; color: ${token.colorTextSecondary}; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Referencia: Profundidad del pozo</div>`;
        html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">`;
        html += `<div style="width: 6px; height: 6px; border-radius: 50%; background: #ff4d4f;"></div>`;
        html += `<span style="font-size: 10px; color: ${exceedsDepth ? '#ff4d4f' : token.colorTextSecondary};">Límite pozo: ${wellDepth}m</span>`;
        html += `</div>`;
        html += `<div style="font-size: 10px; color: ${token.colorTextSecondary}; margin-left: 12px;">`;
        html += `Diferencia: <strong>${diff}m</strong> ${exceedsDepth ? '<span style="color:#ff4d4f">▲ EXCEDIDO</span>' : 'bajo límite'}`;
        html += `</div>`;
      }
      
      if (showOnly === 'water_table' && sensorPos != null) {
        const diff = (sensorPos - val).toFixed(2);
        const aboveSensor = val < sensorPos;
        html += `<div style="font-size: 9px; color: ${token.colorTextSecondary}; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Referencia: Sensor de nivel</div>`;
        html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">`;
        html += `<div style="width: 6px; height: 6px; border-radius: 50%; background: #ff6b35;"></div>`;
        html += `<span style="font-size: 10px; color: ${token.colorTextSecondary};">Posición sensor: ${sensorPos}m</span>`;
        html += `</div>`;
        html += `<div style="font-size: 10px; color: ${token.colorTextSecondary}; margin-left: 12px;">`;
        html += `Diferencia: <strong>${diff}m</strong> ${aboveSensor ? 'sobre sensor' : 'bajo sensor'}`;
        html += `</div>`;
      }
      
      if (avgValue != null) {
        const exceedsAvg = val > avgValue;
        const avgDiff = (val - avgValue).toFixed(2);
        html += `<div style="border-top: 1px solid ${token.colorBorderSecondary}; padding-top: 6px; margin-top: 4px;">`;
        html += `<div style="font-size: 9px; color: #000000; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Promedio</div>`;
        html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">`;
        html += `<div style="width: 6px; height: 6px; border-radius: 50%; background: #000000;"></div>`;
        html += `<span style="font-size: 10px; color: ${exceedsAvg ? '#ff4d4f' : '#000000'};">`;
        html += `${exceedsAvg ? '<span style="color:#ff4d4f">▲ Supera</span>' : 'Bajo'} promedio: ${avgValue.toFixed(2)}m (${avgDiff > 0 ? '+' : ''}${avgDiff})`;
        html += `</span>`;
        html += `</div>`;
        html += `</div>`;
      }
      
      html += `</div>`;
      html += `</div>`;
      return html;
    };
  };

  if (showOnly === 'nivel') {
    const nivelData = data.filter(d => d.nivel != null);
    if (nivelData.length === 0) return <Flex justify="center" align="center" style={{ height: 220 }} vertical><Text type="secondary" style={{ fontSize: 12 }}>Sin datos de nivel</Text></Flex>;
    
    return (
      <ApexChartWrapper
        type="area"
        data={nivelData}
        metric="nivel"
        token={token}
        color={COLORS.nivel}
        title="Nivel"
        unit="m"
        pointName={pointName}
        date={date}
        avgInfo={avgInfo}
        yAnnotations={buildYAnnotations(nivelData)}
        customTooltip={buildCustomTooltip(COLORS.nivel, 'Nivel', avgInfo)}
        invertible={true}
      />
    );
  }

  if (showOnly === 'water_table') {
    const wtData = data.filter(d => d.water_table != null);
    if (wtData.length === 0) return <Flex justify="center" align="center" style={{ height: 220 }} vertical><Text type="secondary" style={{ fontSize: 12 }}>Sin datos de nivel freático</Text></Flex>;

    return (
      <ApexChartWrapper
        type="area"
        data={wtData}
        metric="water_table"
        token={token}
        color={COLORS.freatico}
        title="Freático"
        unit="m"
        pointName={pointName}
        date={date}
        avgInfo={avgInfo}
        yAnnotations={buildYAnnotations(wtData)}
        customTooltip={buildCustomTooltip(COLORS.freatico, 'Freático', avgInfo)}
        invertible={true}
      />
    );
  }

  return null;
};
