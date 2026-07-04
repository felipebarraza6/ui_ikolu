import React from "react";
import { Flex, Typography } from "antd";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import ApexChartWrapper from "../components/ApexChartWrapper";
import { COLORS } from "../constants/chartColors";

const { Text } = Typography;

/* ── Area Chart (Consumo) ── */
export const MeasurementsAreaChart = ({ data, metric, title, minInfo, maxInfo, avgInfo, pointName, date }) => {
  return (
    <ApexChartWrapper
      type="area"
      data={data}
      metric={metric}
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
export const MeasurementsLineChart = ({ data, metric, title, minInfo, maxInfo, avgInfo, pointName, date }) => {
  return (
    <ApexChartWrapper
      type="area"
      data={data}
      metric={metric}
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
export const MeasurementsDualColumnChart = ({ data, showOnly, wellConfig, pointName, date, metric, avgInfo }) => {
  const voidToken = useIkoluToken();
  if (!data || data.length === 0) return <Flex justify="center" align="center" style={{ height: 200, flexDirection: "column", gap: 12 }} vertical><Text style={{ fontSize: 13, color: voidToken.voidTextMuted }}>Sin datos</Text></Flex>;

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
        borderColor: '#E76F51',
        strokeDashArray: 8,
        borderWidth: 3,
        label: {
          borderColor: '#E76F51',
          style: { color: '#fff', background: '#E76F51', fontSize: '11px', fontWeight: 700 },
          text: ` Límite pozo: ${wellDepth}m`,
          position: 'right',
          offsetX: 0,
        }
      });
    }
    
    if (showOnly === 'water_table' && sensorPos != null && sensorPos >= yMin && sensorPos <= yMax) {
      annotations.push({
        y: sensorPos,
        borderColor: '#F4A261',
        strokeDashArray: 6,
        borderWidth: 2,
        label: {
          borderColor: '#F4A261',
          style: { color: '#fff', background: '#F4A261', fontSize: '10px', fontWeight: 600 },
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
      
      let html = `<div style="padding: 8px 12px; background: ${voidToken.voidSurface}; border: 1px solid ${voidToken.voidBorder}; border-radius: 8px; box-shadow: ${voidToken.voidShadow}; min-width: 200px;">`;
      html += `<div style="font-size: 11px; color: ${voidToken.voidTextMuted}; margin-bottom: 6px; font-weight: 600;">${time} hrs</div>`;
      html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">`;
      html += `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${isMax ? '#E76F51' : isMin ? '#2A9D8F' : color};"></div>`;
      html += `<span style="font-size: 12px; color: ${voidToken.voidText};">${label}: <strong>${Number(val).toFixed(2)} m</strong>${suffix}</span>`;
      html += `</div>`;
      
      html += `<div style="border-top: 1px solid ${voidToken.voidBorder}; padding-top: 6px; margin-top: 4px;">`;
      
      if (showOnly === 'nivel' && wellDepth != null) {
        const diff = (wellDepth - val).toFixed(2);
        const exceedsDepth = val > wellDepth;
        html += `<div style="font-size: 9px; color: ${voidToken.voidTextMuted}; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Referencia: Profundidad</div>`;
        html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">`;
        html += `<div style="width: 6px; height: 6px; border-radius: 50%; background: #E76F51;"></div>`;
        html += `<span style="font-size: 10px; color: ${exceedsDepth ? '#E76F51' : voidToken.voidTextMuted};">Límite pozo: ${wellDepth}m</span>`;
        html += `</div>`;
        html += `<div style="font-size: 10px; color: ${voidToken.voidTextMuted}; margin-left: 12px;">`;
        html += `Diferencia: <strong>${diff}m</strong> ${exceedsDepth ? '<span style="color:#E76F51">▲ EXCEDIDO</span>' : 'bajo límite'}`;
        html += `</div>`;
      }
      
      if (showOnly === 'water_table' && sensorPos != null) {
        const diff = (sensorPos - val).toFixed(2);
        const aboveSensor = val < sensorPos;
        html += `<div style="font-size: 9px; color: ${voidToken.voidTextMuted}; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Referencia: Sensor de nivel</div>`;
        html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">`;
        html += `<div style="width: 6px; height: 6px; border-radius: 50%; background: #F4A261;"></div>`;
        html += `<span style="font-size: 10px; color: ${voidToken.voidTextMuted};">Posición sensor: ${sensorPos}m</span>`;
        html += `</div>`;
        html += `<div style="font-size: 10px; color: ${voidToken.voidTextMuted}; margin-left: 12px;">`;
        html += `Diferencia: <strong>${diff}m</strong> ${aboveSensor ? 'sobre sensor' : 'bajo sensor'}`;
        html += `</div>`;
      }
      
      if (avgValue != null) {
        const exceedsAvg = val > avgValue;
        const avgDiff = (val - avgValue).toFixed(2);
        html += `<div style="border-top: 1px solid ${voidToken.voidBorder}; padding-top: 6px; margin-top: 4px;">`;
        html += `<div style="font-size: 9px; color: ${voidToken.voidTextMuted}; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;">Promedio</div>`;
        html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">`;
        html += `<div style="width: 6px; height: 6px; border-radius: 50%; background: ${voidToken.voidTextMuted};"></div>`;
        html += `<span style="font-size: 10px; color: ${exceedsAvg ? '#E76F51' : voidToken.voidTextMuted};">`;
        html += `${exceedsAvg ? '<span style="color:#E76F51">▲ Supera</span>' : 'Bajo'} promedio: ${avgValue.toFixed(2)}m (${avgDiff > 0 ? '+' : ''}${avgDiff})`;
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
    if (nivelData.length === 0) return <Flex justify="center" align="center" style={{ height: 220 }} vertical><Text style={{ fontSize: 12, color: voidToken.voidTextMuted }}>Sin datos de nivel</Text></Flex>;
    
    return (
      <ApexChartWrapper
        type="area"
        data={nivelData}
        metric="nivel"
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
    if (wtData.length === 0) return <Flex justify="center" align="center" style={{ height: 220 }} vertical><Text style={{ fontSize: 12, color: voidToken.voidTextMuted }}>Sin datos de nivel freático</Text></Flex>;

    return (
      <ApexChartWrapper
        type="area"
        data={wtData}
        metric="water_table"
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

/* ── Combined Level Chart (Pozo: 4 zonas dinámicas con rangeArea) ── */
export const MeasurementsCombinedLevelChart = ({ data, wellConfig, pointName, date, onExportCSV, onExportPNG }) => {
  const voidToken = useIkoluToken();
  if (!data || data.length === 0) return <Flex justify="center" align="center" style={{ height: 200, flexDirection: "column", gap: 12 }} vertical><Text style={{ fontSize: 13, color: voidToken.voidTextMuted }}>Sin datos</Text></Flex>;

  const wellDepth = wellConfig?.d1 || 100;
  const sensorPos = wellConfig?.d3 || null;

  const nivelData = data.filter(d => d.nivel != null);
  const wtData = data.filter(d => d.water_table != null);

  if (nivelData.length === 0 && wtData.length === 0) {
    return <Flex justify="center" align="center" style={{ height: 220 }} vertical><Text style={{ fontSize: 12, color: voidToken.voidTextMuted }}>Sin datos de niveles</Text></Flex>;
  }

  const series = [];
  const colors = [];

  if (wtData.length > 0 && sensorPos != null && wellDepth != null) {
    // Zona de aire
    series.push({
      name: 'Zona de aire',
      type: 'rangeArea',
      data: wtData.map(d => ({ x: d.datetime || d.time, y: [0, Number(d.water_table)] }))
    });
    colors.push('rgba(255, 255, 255, 0.12)');

    // Zona estática: sensor → fondo
    series.push({
      name: 'Zona estática',
      type: 'rangeArea',
      data: wtData.map(d => ({ x: d.datetime || d.time, y: [sensorPos, wellDepth] }))
    });
    colors.push('rgba(255, 255, 255, 0.04)');

    // Zona de agua: freático → sensor
    series.push({
      name: 'Zona de agua',
      type: 'rangeArea',
      data: wtData.map(d => ({ x: d.datetime || d.time, y: [Number(d.water_table), sensorPos] }))
    });
    colors.push('rgba(255, 255, 255, 0.08)');

    // Línea del nivel freático
    series.push({
      name: 'Nivel freático',
      type: 'line',
      data: wtData.map(d => ({ x: d.datetime || d.time, y: Number(d.water_table) }))
    });
    colors.push('rgba(255, 255, 255, 0.7)');
  } else if (nivelData.length > 0) {
    // Fallback: solo línea de nivel (sin water_table no podemos hacer rangeArea)
    series.push({
      name: 'Nivel',
      type: 'line',
      data: nivelData.map(d => ({ x: d.datetime || d.time, y: Number(d.nivel) }))
    });
    colors.push('rgba(255, 255, 255, 0.7)');
  }

  // Calcular máximo del eje Y
  const allVals = series.flatMap(s =>
    s.data.map(d => (Array.isArray(d.y) ? d.y : [d.y]))
  ).flat().filter(v => v != null);
  const dataMax = allVals.length ? Math.max(...allVals) : 0;
  const maxDepth = Math.max(wellDepth, dataMax);

  // Anotaciones horizontales (sensor + fondo)
  const yAnnotations = [];

  if (sensorPos != null) {
    yAnnotations.push({
      y: sensorPos,
      borderColor: '#F4A261',
      strokeDashArray: 6,
      borderWidth: 2,
      label: {
        borderColor: '#F4A261',
        style: { color: '#fff', background: '#F4A261', fontSize: '10px', fontWeight: 600 },
        text: ` Posicionamiento Sensor: ${sensorPos}m`,
        position: 'right',
      }
    });
  }

  if (wellDepth != null) {
    yAnnotations.push({
      y: wellDepth,
      borderColor: '#E76F51',
      strokeDashArray: 8,
      borderWidth: 3,
      label: {
        borderColor: '#E76F51',
        style: { color: '#fff', background: '#E76F51', fontSize: '11px', fontWeight: 700 },
        text: ` Profundidad: ${wellDepth}m`,
        position: 'right',
      }
    });
  }

  // Configuración de stroke y fill según número de series
  const strokeConfig = series.length === 4
    ? { curve: 'straight', width: [0, 0, 0, 2] }
    : series.length === 2
    ? { curve: 'straight', width: [0, 2] }
    : { curve: 'straight', width: 2 };

  const fillConfig = series.length === 4
    ? { type: 'solid', opacity: [0.6, 0.35, 0.25, 0] }
    : series.length === 2
    ? { type: 'solid', opacity: [0.35, 0] }
    : { type: 'solid', opacity: 0 };

  const buildTooltip = () => {
    return function({ dataPointIndex, w }) {
      if (dataPointIndex < 0) return '';

      const t = w.config.series[0]?.data[dataPointIndex]?.x || '';

      const wtSeriesIdx = w.config.series.findIndex(s => s.name === 'Nivel freático');
      const wtVal = wtSeriesIdx >= 0 && w.config.series[wtSeriesIdx]?.data[dataPointIndex]?.y != null
        ? Number(w.config.series[wtSeriesIdx].data[dataPointIndex].y)
        : null;

      // Calcular nivel como sensorPos - water_table (altura del agua sobre el sensor)
      const nivelVal = (wtVal != null && sensorPos != null)
        ? sensorPos - wtVal
        : null;

      let html = `<div style="padding: 10px 12px; background: ${voidToken.voidSurface}; border: 1px solid ${voidToken.voidBorder}; border-radius: 10px; box-shadow: ${voidToken.voidShadow}; min-width: 170px; position: relative; z-index: 99999;">`;
      html += `<div style="font-size: 10px; color: ${voidToken.voidTextMuted}; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;">${t} hrs</div>`;

      html += `<div style="border-bottom: 1px solid ${voidToken.voidBorder}; padding-bottom: 8px; margin-bottom: 8px;">`;

      // Primero: Nivel (medición del sensor)
      if (nivelVal != null) {
        html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">`;
        html += `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${voidToken.voidTextHeading};"></div>`;
        html += `<div style="font-size: 12px; color: ${voidToken.voidTextHeading};"><strong>Nivel:</strong> ${nivelVal.toFixed(2)} m</div>`;
        html += `</div>`;
      }

      // Segundo: Nivel freático
      if (wtVal != null) {
        html += `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">`;
        html += `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${voidToken.voidText};"></div>`;
        html += `<div style="font-size: 12px; color: ${voidToken.voidTextHeading};"><strong>Nivel freático:</strong> ${wtVal.toFixed(2)} m</div>`;
        html += `</div>`;
      }

      // Tercero: Posicionamiento
      if (sensorPos != null) {
        html += `<div style="display: flex; align-items: center; gap: 6px;">`;
        html += `<div style="width: 8px; height: 8px; border-radius: 50%; background: #F4A261;"></div>`;
        html += `<div style="font-size: 11px; color: ${voidToken.voidTextMuted};">Posicionamiento: ${sensorPos} m</div>`;
        html += `</div>`;
      }
      html += `</div>`;

      const zonaA = wtVal || 0;
      const zonaB = sensorPos ? sensorPos - zonaA : 0;
      const zonaC = wellDepth - (sensorPos || 0);

      const barWidth = 160;
      const barHeight = 200;
      const total = wellDepth || 1;
      const pctA = (zonaA / total) * 100;
      const pctB = (zonaB / total) * 100;
      const pctC = (zonaC / total) * 100;

      html += `<div style="margin-bottom: 6px; padding: 4px 8px; background: ${voidToken.voidSurface}; border-radius: 4px; border-left: 3px solid ${voidToken.voidBorderStrong};">`;
      html += `<div style="font-size: 9px; font-weight: 700; color: ${voidToken.voidTextHeading}; text-transform: uppercase; letter-spacing: 1px;">PERFIL HIDROGEOLÓGICO</div>`;
      html += `</div>`;

      html += `<div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">`;

      // Línea lateral indicadora
      html += `<div style="display: flex; flex-direction: column; align-items: center; padding-top: 8px;">`;
      html += `<div style="width: 2px; height: ${barHeight - 16}px; background: linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.25), rgba(255,255,255,0.05)); border-radius: 1px;"></div>`;
      html += `</div>`;

      html += `<div style="display: flex; flex-direction: column; gap: 1px; width: ${barWidth}px; height: ${barHeight}px; border: 1px solid ${voidToken.voidBorder}; border-radius: 4px; overflow: hidden; position: relative;">`;

      // Zona de aire
      if (pctA > 0) {
        html += `<div style="height: ${Math.max(pctA, 10)}%; min-height: 18px; background: rgba(255, 255, 255, 0.12); display: flex; align-items: center; justify-content: center; font-size: 11px; color: ${voidToken.voidTextMuted}; font-weight: 700; position: relative;">`;
        html += `<span style="z-index: 2;">ZONA DE AIRE</span>`;
        html += `<div style="position: absolute; bottom: 4px; right: 6px; font-size: 10px; color: ${voidToken.voidTextMuted}; font-weight: 700;">${zonaA.toFixed(1)}m</div>`;
        html += `</div>`;
      }

      // Capa saturada (zona de agua)
      if (pctB > 0) {
        html += `<div style="height: ${Math.max(pctB, 10)}%; min-height: 18px; background: rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: center; font-size: 11px; color: ${voidToken.voidTextMuted}; font-weight: 700; position: relative;">`;
        html += `<span style="z-index: 2;">ZONA DINÁMICA</span>`;
        html += `<div style="position: absolute; bottom: 4px; right: 6px; font-size: 10px; color: ${voidToken.voidTextMuted}; font-weight: 700;">${zonaB.toFixed(1)}m</div>`;
        html += `</div>`;
      }

      // Zona estática
      if (pctC > 0) {
        html += `<div style="height: ${Math.max(pctC, 10)}%; min-height: 18px; background: rgba(255, 255, 255, 0.04); display: flex; align-items: center; justify-content: center; font-size: 11px; color: ${voidToken.voidTextMuted}; font-weight: 700; position: relative;">`;
        html += `<span style="z-index: 2;">ZONA ESTÁTICA</span>`;
        html += `<div style="position: absolute; bottom: 4px; right: 6px; font-size: 10px; color: ${voidToken.voidTextMuted}; font-weight: 700;">${zonaC.toFixed(1)}m</div>`;
        html += `</div>`;
      }

      html += `</div>`;
      html += `</div>`;

      // Línea de suma
      html += `<div style="display: flex; align-items: center; gap: 4px; margin-top: 4px; padding: 6px 0; border-top: 1px dashed ${voidToken.voidBorder}; font-size: 10px; color: ${voidToken.voidTextMuted};">`;
      html += `<div style="display: flex; align-items: center; gap: 4px;">`;
      html += `<span style="font-weight: 700;">Σ</span>`;
      html += `<span>${zonaA.toFixed(1)} + ${zonaB.toFixed(1)} + ${zonaC.toFixed(1)} = ${wellDepth.toFixed(1)} m</span>`;
      html += `</div>`;
      html += `</div>`;

      html += `</div>`;
      return html;
    };
  };

  return (
    <ApexChartWrapper
      type="rangeArea"
      unit="Metros"
      pointName={pointName}
      date={date}
      colors={colors}
      series={series}
      forcedYMin={0}
      forcedYMax={maxDepth}
      reversed={true}
      yAxisTickAmount={6}
      yAnnotations={yAnnotations}
      customTooltip={buildTooltip()}
      invertible={true}
      fill={fillConfig}
      stroke={strokeConfig}
      showLegend={false}
      showDownload={false}
      customToolbarIcons={[
        ...(onExportCSV ? [{
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c8c8c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
          title: 'Exportar CSV',
          index: 'menu',
          click: onExportCSV,
        }] : []),
        ...(onExportPNG ? [{
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c8c8c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
          title: 'Exportar PNG',
          index: 'menu',
          click: onExportPNG,
        }] : []),
      ]}
    />
  );
};
