import React from "react";
import { Area, Line } from "@ant-design/plots";

const commonConfig = {
  xAxis: {
    label: {
      formatter: (text) => {
        var time = `${text.slice(11, 16)} hrs`;
        return time;
      },
      style: {
        fill: "#FFFFFF", // Color blanco para el texto
      },
    },
    title: {
      text: "Hora",
      style: {
        fontSize: 14,
        fontWeight: "bold",
        fill: "#FFFFFF", // Color blanco para el texto
      },
    },
  },
  yAxis: {
    label: {
      formatter: (text) => parseFloat(text).toLocaleString("es-CL"),
      style: {
        fill: "#FFFFFF", // Color blanco para el texto
      },
    },
    title: {
      style: {
        fontSize: 14,
        fontWeight: "bold",
        fill: "#FFFFFF", // Color blanco para el texto
      },
    },
  },
  legend: {
    position: "top-right",
    itemName: {
      style: {
        fill: "#FFFFFF", // Color blanco para el texto
      },
    },
  },
  point: {
    size: 4,
    shape: "circle",
    style: {
      fillOpacity: 1,
    },
  },
};

export const FlowArea = ({ data, limitFlow }) => {
  data.forEach((item) => {
    item.flow = parseFloat(item.flow);
  });
  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "flow",
    seriesField: "flow",
    smooth: true,
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
      max: 100,
      title: {
        text: "Caudal (lt/s)",
        style: {
          fill: "#FFFFFF", // Color blanco para el texto
        },
      },
    },
    annotations: [
      {
        type: "line",
        start: ["min", limitFlow],
        end: ["max", limitFlow],
        style: {
          stroke: "red",
          lineWidth: 2,
        },
        text: {
          content: `Caudal autorizado: ${limitFlow} lt/s`,
          position: "center",
          style: {
            fill: "#eb3c46",
            fontSize: 12,
            fontWeight: "bold",
          },
        },
      },
    ],
  };
  return <Area {...config} />;
};

export const TotalLine = ({ data, limitTotal }) => {
  data.forEach((item) => {
    item.total = parseInt(item.total);
    item.percentage_diff = ((item.total / limitTotal) * 100).toFixed(2);
  });
  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "total",
    seriesField: "total",
    smooth: true,
    meta: {
      flow: { alias: "Acumulado (m³)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Acumulado",
        value: `${datum.total.toLocaleString("es-CL")} m³ (${
          datum.percentage_diff
        }%)`,
        title: `${datum.date_time_medition.slice(11, 16)} hrs`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.total)),
      max: Math.max(...data.map((d) => d.total)),
      title: {
        text: "Acumulado (m³)",
        style: {
          fill: "#FFFFFF", // Color blanco para el texto
        },
      },
    },
  };
  return <Line {...config} />;
};

export const TotalHour = ({ data }) => {
  data.forEach((item) => {
    item.total_diff = parseInt(item.total_diff);
  });
  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "total_diff",
    seriesField: "total_diff",
    smooth: true,
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
      max: Math.max(...data.map((d) => d.total_diff)),
      title: {
        text: "Consumo (m³/h)",
        style: {
          fill: "#FFFFFF", // Color blanco para el texto
        },
      },
    },
  };
  return <Area {...config} />;
};

export const TotalDay = ({ data }) => {
  data.forEach((item) => {
    item.total_today_diff = parseInt(item.total_today_diff);
  });
  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "total_today_diff",
    seriesField: "total_today_diff",
    smooth: true,
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
      max: Math.max(...data.map((d) => d.total_today_diff)),
      title: {
        text: "Consumo (m³/d)",
        style: {
          fill: "#FFFFFF", // Color blanco para el texto
        },
      },
    },
  };
  return <Area {...config} />;
};

export const WaterTableBar = ({ data }) => {
  data.forEach((item) => {
    item.water_table = parseFloat(item.water_table);
  });
  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "water_table",
    seriesField: "water_table",
    meta: {
      flow: { alias: "Nivel freático (m)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Nivel freático",
        value: `${datum.water_table.toFixed(2)} m`,
        title: `${datum.date_time_medition.slice(11, 16)} hrs`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.water_table)),
      max: Math.max(...data.map((d) => d.water_table)),
      title: {
        text: "Nivel freático (m)",
        style: {
          fill: "#FFFFFF", // Color blanco para el texto
        },
      },
      inverse: true, // Invertir el eje Y
    },
    color: "rgb(0, 123, 255)", // Azul color agua
  };
  return <Area {...config} />;
};
