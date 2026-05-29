import React, { useRef } from "react";
import ReactApexChart from "react-apexcharts";
import { Flex } from "antd";

export const ApexChartWrapper = ({ 
  type, 
  data, 
  metric, 
  token, 
  color, 
  title, 
  minInfo, 
  maxInfo, 
  unit = ""
}) => {
  const chartRef = useRef(null);

  const chartColor = color || token.colorPrimary;
  
  if (!data || data.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 220 }} vertical>
        <span style={{ fontSize: 12, color: token.colorTextSecondary }}>Sin datos</span>
      </Flex>
    );
  }

  const cleanData = data
    .filter(d => d[metric] != null && !isNaN(Number(d[metric])))
    .map(d => ({
      x: d.time,
      y: Number(d[metric]),
    }));

  const series = [{
    name: title || metric,
    data: cleanData.map(d => ({
      x: d.x,
      y: d.y,
      fillColor: d.y === maxInfo?.value ? '#ff4d4f' : d.y === minInfo?.value ? '#52c41a' : undefined,
    }))
  }];
  
  if (cleanData.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 220 }} vertical>
        <span style={{ fontSize: 12, color: token.colorTextSecondary }}>Sin datos válidos</span>
      </Flex>
    );
  }

  const options = {
    chart: {
      type: type,
      height: 300,
      toolbar: {
        show: false
      },
      animations: {
        enabled: false,
      },
      fontFamily: 'inherit',
    },
    colors: [chartColor],
    stroke: type === 'line' || type === 'area' ? {
      curve: 'smooth',
      width: 3
    } : {
      show: true,
      width: 1,
      colors: [token.colorBorder]
    },
    fill: type === 'area' ? {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    } : { type: 'solid' },
    dataLabels: {
      enabled: false
    },
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
      axisBorder: {
        color: token.colorBorder
      },
      axisTicks: {
        color: token.colorBorder
      }
    },
    yaxis: {
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
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        if (!point) return '';
        const isMax = point.y === maxInfo?.value;
        const isMin = point.y === minInfo?.value;
        let suffix = '';
        if (isMax) suffix = ' (MÁXIMO)';
        if (isMin) suffix = ' (MÍNIMO)';
        
        return `
          <div style="padding: 8px 12px; background: ${token.colorBgElevated}; border-radius: 8px; box-shadow: ${token.boxShadowSecondary};">
            <div style="font-size: 12px; color: ${token.colorTextSecondary}; margin-bottom: 4px;">${point.x} hrs</div>
            <div style="font-size: 13px; color: ${token.colorText}; font-weight: 500;">
              ${title || metric}${suffix}: <strong>${Number(point.y).toFixed(unit.includes('m³') ? 0 : unit.includes('L/s') ? 1 : 2)} ${unit}</strong>
            </div>
          </div>
        `;
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      labels: {
        colors: token.colorText
      }
    },
    annotations: { points: [] },
    markers: {
      size: 5,
      colors: ['#fff'],
      strokeColors: chartColor,
      strokeWidth: 2.5,
      hover: {
        size: 7,
        sizeOffset: 3
      }
    }
  };

  return (
    <div>
      <ReactApexChart
        ref={chartRef}
        options={options}
        series={series}
        type={type}
        height={300}
      />
    </div>
  );
};

export default ApexChartWrapper;
