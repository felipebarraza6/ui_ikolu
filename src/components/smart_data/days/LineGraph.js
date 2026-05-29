import React, { useRef, useState } from "react";
import { Area, Line } from "@ant-design/plots";
import { Button, Space } from "antd";
import { DownloadOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const commonConfig = {
  xAxis: {
    label: {
      formatter: (text) => {
        var time = `${text.slice(11, 16)} hrs`;
        return time;
      },
    },
    title: {
      text: "Hora",
      style: {
        fontSize: 14,
        fontWeight: "bold",
      },
    },
  },
  yAxis: {
    label: {
      formatter: (text) => parseFloat(text).toFixed(2),
    },
    title: {
      style: {
        fontSize: 14,
        fontWeight: "bold",
      },
    },
  },
  legend: {
    position: "top-right",
  },
  point: {
    size: 4,
    shape: "circle",
    style: {
      fillOpacity: 1,
    },
  },
};

const ChartWrapper = ({ children, chartRef, title }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!chartRef.current) return;
    setDownloading(true);
    try {
      chartRef.current.downloadImage({
        type: "image/png",
        fileName: `${title}_${new Date().toISOString().slice(0, 10)}.png`,
      });
    } catch (err) {
      console.error("Error descargando gráfico:", err);
    }
    setDownloading(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          display: "flex",
          gap: 8,
        }}
      >
        <Button
          type="text"
          size="small"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          loading={downloading}
          title="Descargar gráfico como imagen"
          style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        />
      </div>
      {children}
    </div>
  );
};

export const FlowArea = ({ data, caudalMax, caudalMin }) => {
  const chartRef = useRef(null);
  const [showLabels, setShowLabels] = useState(true);

  data.forEach((item) => {
    item.flow = parseFloat(item.flow);
  });

  const annotations = [];
  if (showLabels && caudalMax && caudalMax.value) {
    const maxIndex = data.findIndex(
      (d) => d.flow === caudalMax.value && d.date_time_medition.slice(11, 16) === caudalMax.hour
    );
    if (maxIndex >= 0) {
      annotations.push({
        type: "marker",
        start: [data[maxIndex].date_time_medition, caudalMax.value],
        style: {
          stroke: "#ff4d4f",
          lineWidth: 2,
          fill: "#ff4d4f",
          r: 6,
        },
        text: {
          content: `Máx: ${caudalMax.value} lt/s (${caudalMax.hour} hrs)`,
          position: "top",
          style: {
            fill: "#ff4d4f",
            fontSize: 11,
            fontWeight: "bold",
            textAlign: "center",
          },
          offsetY: -8,
        },
      });
    }
  }
  if (showLabels && caudalMin && caudalMin.value && caudalMin.value !== 0) {
    const minIndex = data.findIndex(
      (d) => d.flow === caudalMin.value && d.date_time_medition.slice(11, 16) === caudalMin.hour
    );
    if (minIndex >= 0) {
      annotations.push({
        type: "marker",
        start: [data[minIndex].date_time_medition, caudalMin.value],
        style: {
          stroke: "#52c41a",
          lineWidth: 2,
          fill: "#52c41a",
          r: 6,
        },
        text: {
          content: `Mín: ${caudalMin.value} lt/s (${caudalMin.hour} hrs)`,
          position: "bottom",
          style: {
            fill: "#52c41a",
            fontSize: 11,
            fontWeight: "bold",
            textAlign: "center",
          },
          offsetY: 8,
        },
      });
    }
  }

  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "flow",
    seriesField: "flow",
    smooth: true,
    color: "rgb(31, 52, 97)",
    meta: {
      flow: { alias: "Caudal (lt/s)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Caudal",
        value: `${datum.flow} lt/s`,
        title: `${datum.date_time_medition.slice(11, 16)} hrs`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.flow)),
      max: Math.max(...data.map((d) => d.flow)),
      title: {
        text: "Caudal (lt/s)",
        style: {},
      },
    },
    annotations,
    onReady: (chart) => {
      chartRef.current = chart;
    },
  };

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="text"
          size="small"
          icon={showLabels ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={() => setShowLabels(!showLabels)}
          style={{ fontSize: 12 }}
        >
          {showLabels ? "Ocultar indicadores" : "Mostrar indicadores"}
        </Button>
      </div>
      <ChartWrapper chartRef={chartRef} title="Caudal">
        <Area {...config} />
      </ChartWrapper>
    </div>
  );
};

export const TotalLine = ({ data }) => {
  const chartRef = useRef(null);

  data.forEach((item) => {
    item.total = parseInt(item.total);
  });

  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "total",
    seriesField: "total",
    smooth: true,
    color: "rgb(31, 52, 97)",
    meta: {
      flow: { alias: "Acumulado (m³)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Acumulado",
        value: `${datum.total.toLocaleString("es-CL")} m³`,
        title: `${datum.date_time_medition.slice(11, 16)} hrs`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      max: Math.max(...data.map((d) => d.total)) + 3,
      min: Math.min(...data.map((d) => d.total)) - 3,
      title: {
        text: "Acumulado (m³)",
      },
    },
    onReady: (chart) => {
      chartRef.current = chart;
    },
  };

  return (
    <ChartWrapper chartRef={chartRef} title="Acumulado">
      <Line {...config} />
    </ChartWrapper>
  );
};

export const TotalHour = ({ data, minConsumoHora, maxConsumoHora }) => {
  const chartRef = useRef(null);
  const [showLabels, setShowLabels] = useState(true);

  data.forEach((item) => {
    item.total_diff = parseInt(item.total_diff);
  });

  const annotations = [];
  if (showLabels && maxConsumoHora && maxConsumoHora.value) {
    const maxIndex = data.findIndex(
      (d) => d.total_diff === maxConsumoHora.value && d.date_time_medition.slice(11, 16) === maxConsumoHora.hour
    );
    if (maxIndex >= 0) {
      annotations.push({
        type: "marker",
        start: [data[maxIndex].date_time_medition, maxConsumoHora.value],
        style: {
          stroke: "#ff4d4f",
          lineWidth: 2,
          fill: "#ff4d4f",
          r: 6,
        },
        text: {
          content: `Máx: ${maxConsumoHora.value} m³/h (${maxConsumoHora.hour} hrs)`,
          position: "top",
          style: {
            fill: "#ff4d4f",
            fontSize: 11,
            fontWeight: "bold",
            textAlign: "center",
          },
          offsetY: -8,
        },
      });
    }
  }
  if (showLabels && minConsumoHora && minConsumoHora.value && minConsumoHora.value !== 0) {
    const minIndex = data.findIndex(
      (d) => d.total_diff === minConsumoHora.value && d.date_time_medition.slice(11, 16) === minConsumoHora.hour
    );
    if (minIndex >= 0) {
      annotations.push({
        type: "marker",
        start: [data[minIndex].date_time_medition, minConsumoHora.value],
        style: {
          stroke: "#52c41a",
          lineWidth: 2,
          fill: "#52c41a",
          r: 6,
        },
        text: {
          content: `Mín: ${minConsumoHora.value} m³/h (${minConsumoHora.hour} hrs)`,
          position: "bottom",
          style: {
            fill: "#52c41a",
            fontSize: 11,
            fontWeight: "bold",
            textAlign: "center",
          },
          offsetY: 8,
        },
      });
    }
  }

  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "total_diff",
    seriesField: "total_diff",
    smooth: true,
    color: "rgb(31, 52, 97)",
    meta: {
      flow: { alias: "Consumo (m³/h)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Consumo",
        value: `${datum.total_diff.toLocaleString("es-CL")} m³/h`,
        title: `${datum.date_time_medition.slice(11, 16)} hrs`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.total_diff)),
      max: Math.max(...data.map((d) => d.total_diff)) + 5,
      title: {
        text: "Consumo (m³/h)",
      },
    },
    annotations,
    onReady: (chart) => {
      chartRef.current = chart;
    },
  };

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="text"
          size="small"
          icon={showLabels ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={() => setShowLabels(!showLabels)}
          style={{ fontSize: 12 }}
        >
          {showLabels ? "Ocultar indicadores" : "Mostrar indicadores"}
        </Button>
      </div>
      <ChartWrapper chartRef={chartRef} title="Consumo_Hora">
        <Area {...config} />
      </ChartWrapper>
    </div>
  );
};

export const TotalDay = ({ data, minConsumoHora, maxConsumoHora }) => {
  const chartRef = useRef(null);
  const [showLabels, setShowLabels] = useState(true);

  data.forEach((item) => {
    item.total_today_diff = parseInt(item.total_today_diff);
  });

  const annotations = [];
  if (showLabels && maxConsumoHora && maxConsumoHora.value) {
    const maxIndex = data.findIndex(
      (d) => d.total_today_diff === maxConsumoHora.value && d.date_time_medition.slice(11, 16) === maxConsumoHora.hour
    );
    if (maxIndex >= 0) {
      annotations.push({
        type: "marker",
        start: [data[maxIndex].date_time_medition, maxConsumoHora.value],
        style: {
          stroke: "#ff4d4f",
          lineWidth: 2,
          fill: "#ff4d4f",
          r: 6,
        },
        text: {
          content: `Máx: ${maxConsumoHora.value} m³/d (${maxConsumoHora.hour} hrs)`,
          position: "top",
          style: {
            fill: "#ff4d4f",
            fontSize: 11,
            fontWeight: "bold",
            textAlign: "center",
          },
          offsetY: -8,
        },
      });
    }
  }
  if (showLabels && minConsumoHora && minConsumoHora.value && minConsumoHora.value !== 0) {
    const minIndex = data.findIndex(
      (d) => d.total_today_diff === minConsumoHora.value && d.date_time_medition.slice(11, 16) === minConsumoHora.hour
    );
    if (minIndex >= 0) {
      annotations.push({
        type: "marker",
        start: [data[minIndex].date_time_medition, minConsumoHora.value],
        style: {
          stroke: "#52c41a",
          lineWidth: 2,
          fill: "#52c41a",
          r: 6,
        },
        text: {
          content: `Mín: ${minConsumoHora.value} m³/d (${minConsumoHora.hour} hrs)`,
          position: "bottom",
          style: {
            fill: "#52c41a",
            fontSize: 11,
            fontWeight: "bold",
            textAlign: "center",
          },
          offsetY: 8,
        },
      });
    }
  }

  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "total_today_diff",
    seriesField: "total_today_diff",
    smooth: true,
    color: "rgb(31, 52, 97)",
    meta: {
      flow: { alias: "Consumo (m³/d)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Consumo",
        value: `${datum.total_today_diff.toLocaleString("es-CL")} m³/d`,
        title: `${datum.date_time_medition.slice(11, 16)} hrs`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.total_today_diff)),
      max: Math.max(...data.map((d) => d.total_today_diff)) + 5,
      title: {
        text: "Consumo (m³/d)",
      },
    },
    annotations,
    onReady: (chart) => {
      chartRef.current = chart;
    },
  };

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="text"
          size="small"
          icon={showLabels ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={() => setShowLabels(!showLabels)}
          style={{ fontSize: 12 }}
        >
          {showLabels ? "Ocultar indicadores" : "Mostrar indicadores"}
        </Button>
      </div>
      <ChartWrapper chartRef={chartRef} title="Consumo_Dia">
        <Area {...config} />
      </ChartWrapper>
    </div>
  );
};

export const WaterTableBar = ({ data, nivelMax, nivelMin }) => {
  const chartRef = useRef(null);
  const [showLabels, setShowLabels] = useState(true);

  const chartData = [];
  data.forEach((item) => {
    chartData.push({
      date_time_medition: item.date_time_medition,
      value: parseFloat(item.water_table).toFixed(2),
      type: "Nivel Freático",
    });
    if (item.nivel !== undefined && item.nivel !== null) {
      chartData.push({
        date_time_medition: item.date_time_medition,
        value: parseFloat(item.nivel).toFixed(2),
        type: "Nivel",
      });
    }
  });

  const annotations = [];
  if (showLabels && nivelMax && nivelMax.value) {
    const maxIndex = chartData.findIndex(
      (d) => parseFloat(d.value) === nivelMax.value && d.date_time_medition.slice(11, 16) === nivelMax.hour
    );
    if (maxIndex >= 0) {
      annotations.push({
        type: "marker",
        start: [chartData[maxIndex].date_time_medition, chartData[maxIndex].value],
        style: {
          stroke: "#ff4d4f",
          lineWidth: 2,
          fill: "#ff4d4f",
          r: 6,
        },
        text: {
          content: `Máx: ${nivelMax.value} m (${nivelMax.hour} hrs)`,
          position: "top",
          style: {
            fill: "#ff4d4f",
            fontSize: 11,
            fontWeight: "bold",
            textAlign: "center",
          },
          offsetY: -8,
        },
      });
    }
  }
  if (showLabels && nivelMin && nivelMin.value && nivelMin.value !== 0) {
    const minIndex = chartData.findIndex(
      (d) => parseFloat(d.value) === nivelMin.value && d.date_time_medition.slice(11, 16) === nivelMin.hour
    );
    if (minIndex >= 0) {
      annotations.push({
        type: "marker",
        start: [chartData[minIndex].date_time_medition, chartData[minIndex].value],
        style: {
          stroke: "#52c41a",
          lineWidth: 2,
          fill: "#52c41a",
          r: 6,
        },
        text: {
          content: `Mín: ${nivelMin.value} m (${nivelMin.hour} hrs)`,
          position: "bottom",
          style: {
            fill: "#52c41a",
            fontSize: 11,
            fontWeight: "bold",
            textAlign: "center",
          },
          offsetY: 8,
        },
      });
    }
  }

  const config = {
    ...commonConfig,
    data: chartData,
    xField: "date_time_medition",
    yField: "value",
    seriesField: "type",
    smooth: true,
    meta: {
      value: { alias: "Metros" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.type,
        value: `${parseFloat(datum.value).toFixed(2)} m`,
        title: `${datum.date_time_medition.slice(11, 16)} hrs`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      label: {
        formatter: (text) => parseFloat(text).toFixed(2),
      },
      title: {
        text: "Nivel (m)",
      },
      inverse: true,
    },
    color: ["rgb(31, 52, 97)", "rgb(52, 168, 83)"],
    annotations,
    onReady: (chart) => {
      chartRef.current = chart;
    },
  };

  return (
    <div>
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="text"
          size="small"
          icon={showLabels ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={() => setShowLabels(!showLabels)}
          style={{ fontSize: 12 }}
        >
          {showLabels ? "Ocultar indicadores" : "Mostrar indicadores"}
        </Button>
      </div>
      <ChartWrapper chartRef={chartRef} title="Nivel_Freatico">
        <Line {...config} />
      </ChartWrapper>
    </div>
  );
};
