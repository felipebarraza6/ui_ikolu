import React, { useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import ReactApexChart from "react-apexcharts";
import { Flex } from "antd";
import { COLORS } from "./constants/chartColors";

const getStrokeConfig = (type, metric) => {
  if (type === 'bar' || metric === 'nivel' || metric === 'water_table') {
    return { curve: 'straight', width: 0 };
  }
  if (metric === 'caudal') {
    return { curve: 'smooth', width: 2 };
  }
  return { curve: 'stepline', width: 2 };
};

const getFillConfig = (type, metric) => {
  if (type === 'bar' || metric === 'nivel' || metric === 'water_table') {
    return { type: 'solid', opacity: 0.85 };
  }
  if (metric === 'caudal') {
    return {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.15,
        stops: [0, 50, 100]
      }
    };
  }
  return { type: 'solid', opacity: 0.25 };
};

const getMarkersConfig = (type, metric, chartColor) => {
  if (type === 'bar' || metric === 'nivel' || metric === 'water_table') {
    return { size: 0, hover: { size: 0 } };
  }
  if (metric === 'caudal') {
    return {
      size: 3,
      colors: ['#fff'],
      strokeColors: chartColor,
      strokeWidth: 1.5,
      hover: { size: 5, sizeOffset: 2 }
    };
  }
  return { size: 0, hover: { size: 4, sizeOffset: 2 } };
};

const buildSeries = (processedData, title, metric, maxInfo, minInfo) => [{
  name: title || metric,
  data: processedData.map(d => ({
    x: d.x,
    y: d.y,
    fillColor: d.y === maxInfo?.value ? COLORS.max : d.y === minInfo?.value ? COLORS.min : undefined,
  }))
}];

const buildAnnotations = (yAnnotations, avgInfo, yMin, yMax, cleanData, maxInfo, minInfo) => {
  const combinedYAnnotations = [...yAnnotations];
  if (avgInfo != null && avgInfo >= yMin && avgInfo <= yMax) {
    combinedYAnnotations.push({
      y: avgInfo,
      borderColor: COLORS.avg,
      strokeDashArray: 4,
      borderWidth: 2,
      label: {
        borderColor: 'transparent',
        style: { color: COLORS.avg, background: 'transparent', fontSize: '10px', fontWeight: 600 },
        text: `${Number(avgInfo).toFixed(2)}`,
        position: 'left',
        offsetX: -5,
      }
    });
  }

  return {
    yaxis: combinedYAnnotations,
    points: [
      ...(maxInfo?.value != null ? [{
        x: cleanData.find(d => d.y === maxInfo.value)?.x || '',
        y: maxInfo.value,
        marker: { size: 4, fillColor: COLORS.max, strokeColor: '#fff', strokeWidth: 1.5 },
        label: { text: '', style: { fontSize: '9px', background: 'transparent' } }
      }] : []),
      ...(minInfo?.value != null ? [{
        x: cleanData.find(d => d.y === minInfo.value)?.x || '',
        y: minInfo.value,
        marker: { size: 4, fillColor: COLORS.min, strokeColor: '#fff', strokeWidth: 1.5 },
        label: { text: '', style: { fontSize: '9px', background: 'transparent' } }
      }] : [])
    ]
  };
};

const buildDefaultTooltip = (token, title, metric, unit, maxInfo, minInfo, avgInfo) => {
  return function({ series, seriesIndex, dataPointIndex, w }) {
    if (dataPointIndex < 0 || !w.config.series[seriesIndex]) return '';
    const point = w.config.series[seriesIndex].data[dataPointIndex];
    if (!point) return '';
    const time = point.x || w.config.xaxis.categories[dataPointIndex] || '';
    const isMax = point.y === maxInfo?.value;
    const isMin = point.y === minInfo?.value;
    let suffix = '';
    if (isMax) suffix = ' (MÁXIMO)';
    if (isMin) suffix = ' (MÍNIMO)';
    
    const exceedsAvg = avgInfo != null && point.y > avgInfo;
    const avgDiff = avgInfo != null ? (point.y - avgInfo).toFixed(2) : null;
    
    return `
      <div style="padding: 8px 12px; background: ${token.colorBgElevated}; border-radius: 8px; box-shadow: ${token.boxShadowSecondary};">
        <div style="font-size: 12px; color: ${token.colorTextSecondary}; margin-bottom: 4px;">${time} hrs</div>
        <div style="font-size: 13px; color: ${token.colorText}; font-weight: 500;">
          ${title || metric}${suffix}: <strong>${Number(point.y).toFixed(unit.includes('m³') ? 0 : unit.includes('L/s') ? 1 : 2)} ${unit}</strong>
        </div>
        ${avgInfo != null ? `
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid ${token.colorBorderSecondary}; font-size: 11px; color: ${COLORS.avg};">
          ${exceedsAvg ? '<span style="color:#ff4d4f">▲ Supera promedio</span>' : 'Bajo promedio'} ${avgInfo.toFixed(2)} (${avgDiff > 0 ? '+' : ''}${avgDiff})
        </div>
        ` : ''}
      </div>
    `;
  };
};

export const ApexChartWrapper = ({ 
  type, 
  data, 
  metric, 
  token, 
  color, 
  title, 
  minInfo, 
  maxInfo, 
  avgInfo,
  unit = "",
  pointName,
  date,
  yAnnotations = [],
  customTooltip = null,
  invertible = false,
  forcedYMin,
  forcedYMax,
  series: externalSeries,
  colors: externalColors,
  reversed: forceReversed,
  fill: externalFill,
  stroke: externalStroke,
  markers: externalMarkers,
  yAxisTickAmount,
  showLegend = true,
  showDownload = true,
  showSelection = true,
  showZoom = true,
  showZoomIn = true,
  showZoomOut = true,
  showPan = true,
  showReset = true,
  customToolbarIcons = []
}) => {
  const chartRef = useRef(null);
  const [inverted, setInverted] = useState(false);

  const chartColor = color || token.colorPrimary;
  
  if (externalSeries && externalSeries.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 200 }} vertical>
        <span style={{ fontSize: 12, color: token.colorTextSecondary }}>Sin datos</span>
      </Flex>
    );
  }

  if (!externalSeries && (!data || data.length === 0)) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 200 }} vertical>
        <span style={{ fontSize: 12, color: token.colorTextSecondary }}>Sin datos</span>
      </Flex>
    );
  }

  const cleanData = externalSeries ? [] : data
    .filter(d => d[metric] != null && !isNaN(Number(d[metric])))
    .map(d => ({
      x: d.datetime || d.time,
      y: Number(d[metric]),
    }));

  const processedData = inverted && !externalSeries ? [...cleanData].reverse() : cleanData;
  const series = externalSeries || buildSeries(processedData, title, metric, maxInfo, minInfo);
  
  if (!externalSeries && cleanData.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 200 }} vertical>
        <span style={{ fontSize: 12, color: token.colorTextSecondary }}>Sin datos válidos</span>
      </Flex>
    );
  }

  const vals = externalSeries ? [] : cleanData.map(d => d.y);
  const dataMin = externalSeries ? 0 : (vals.length ? Math.min(...vals) : 0);
  const dataMax = externalSeries ? 0 : (vals.length ? Math.max(...vals) : 0);
  const dataRange = dataMax - dataMin;
  const padding = dataRange > 0 ? dataRange * 0.15 : Math.abs(dataMax) * 0.05 || 1;
  const hasZero = externalSeries ? false : vals.some(v => v === 0);
  const autoYMin = hasZero ? 0 : dataMin - padding;
  const autoYMax = dataMax + padding;
  const yMin = forcedYMin != null ? forcedYMin : autoYMin;
  const yMax = forcedYMax != null ? forcedYMax : autoYMax;

  const annotations = buildAnnotations(yAnnotations, avgInfo, yMin, yMax, cleanData, maxInfo, minInfo);

  const options = {
    chart: {
      type: type,
      toolbar: {
        show: true,
        tools: {
          download: showDownload,
          selection: showSelection,
          zoom: showZoom,
          zoomin: showZoomIn,
          zoomout: showZoomOut,
          pan: showPan,
          reset: showReset,
          customIcons: [
            ...(invertible ? [{
              icon: `<div style="font-size: 14px; font-weight: bold; color: ${inverted ? COLORS.consumo : token.colorTextSecondary}; padding: 0 4px;">⇅</div>`,
              title: inverted ? 'Orden: más reciente primero' : 'Orden: más antiguo primero',
              index: 'menu',
              class: 'apexcharts-toolbar-invert',
              click: () => setInverted(prev => !prev),
            }] : []),
            ...customToolbarIcons
          ],
        },
        autoSelected: 'zoom',
        export: {
          csv: {
            filename: pointName && date ? `${pointName}_${metric}_${format(parseISO(date), "ddMM")}` : `${title || metric}_data`,
            headerCategory: 'Fecha',
            headerValue: 'Valor',
          },
          svg: {
            filename: pointName && date ? `${pointName}_${metric}_${format(parseISO(date), "ddMM")}` : `${title || metric}_chart`,
          },
          png: {
            filename: pointName && date ? `${pointName}_${metric}_${format(parseISO(date), "ddMM")}` : `${title || metric}_chart`,
          }
        }
      },
      animations: { enabled: false },
      fontFamily: 'inherit',
      sparkline: { enabled: false },
      zoom: { enabled: true },
      selection: { enabled: true },
    },
    locales: [{
      name: 'es',
      options: {
        toolbar: {
          selection: 'Seleccionar área',
          selectionZoom: 'Zoom selección',
          zoomIn: 'Acercar',
          zoomOut: 'Alejar',
          pan: 'Mover',
          reset: 'Restablecer zoom',
        }
      }
    }],
    defaultLocale: 'es',
    grid: {
      padding: { left: 40, right: -10 },
    },
    colors: externalColors || [chartColor],
    stroke: externalStroke || getStrokeConfig(type, metric),
    fill: externalFill || getFillConfig(type, metric),
    plotOptions: type === 'bar' ? {
      bar: {
        borderRadius: 3,
        columnWidth: '85%',
      }
    } : {},
    dataLabels: { enabled: false },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.85,
        }
      }
    },
    xaxis: {
      categories: series[0].data.map(d => d.x),
      labels: {
        style: {
          colors: token.colorTextSecondary,
          fontSize: '11px'
        },
        rotate: -45,
        rotateAlways: true,
      },
      axisBorder: { color: token.colorBorder },
      axisTicks: { color: token.colorBorder }
    },
    yaxis: {
      min: yMin,
      max: yMax,
      tickAmount: yAxisTickAmount,
      reversed: forceReversed != null ? forceReversed : metric === 'water_table',
      labels: {
        style: {
          colors: token.colorTextSecondary,
          fontSize: '11px'
        },
        formatter: (value) => {
          return Number(value).toFixed(unit.includes('m³') ? 0 : unit.includes('L/s') ? 1 : 2);
        }
      },
      title: {
        text: unit,
        style: {
          color: token.colorTextSecondary,
          fontSize: '12px',
          fontWeight: 'bold'
        }
      }
    },
    grid: {
      borderColor: token.colorBorderSecondary + '50',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      custom: customTooltip || buildDefaultTooltip(token, title, metric, unit, maxInfo, minInfo, avgInfo)
    },
    legend: {
      show: showLegend,
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      labels: { colors: token.colorText },
      onItemClick: { toggleDataSeries: false },
      onItemHover: { highlightDataSeries: false }
    },
    annotations,
    markers: externalMarkers || getMarkersConfig(type, metric, chartColor)
  };

  return (
    <div style={{ width: '100%' }}>
      <ReactApexChart
        ref={chartRef}
        options={options}
        series={series}
        type={type}
        height={420}
        width="100%"
      />
    </div>
  );
};

export default ApexChartWrapper;
