import React from "react";
import { Area, Line } from "@ant-design/plots";

const commonConfig = {
  xAxis: {
    label: {
      formatter: (text) => {
        var date = `${text.slice(8, 10)}/${text.slice(5, 7)}`;
        return date;
      },
      style: {
        fill: "#FFFFFF", // Color blanco para el texto
      },
    },
    title: {
      text: "Fecha",
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

export const FlowArea = ({ data }) => {
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
      flow: { alias: "Caudal promedio(lt)" },
      date_time_medition: { alias: "Fecha medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Caudal",
        value: `${datum.flow} lt`,
        title: `${datum.date_time_medition.slice(
          8,
          10
        )}/${datum.date_time_medition.slice(5, 7)}`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.flow)),
      max: Math.max(...data.map((d) => d.flow)),
      title: {
        text: "Caudal promedio(lt)",
        style: {
          fill: "#FFFFFF", // Color blanco para el texto
        },
      },
    },
  };
  return <Area {...config} />;
};

export const TotalLine = ({ data }) => {
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
      total: { alias: "Acumulado (m³)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Acumulado",
        value: `${datum.total.toLocaleString("es-CL")} m³`,
        title: `${datum.date_time_medition.slice(0, 10)}`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.total)) - 3,
      max: Math.max(...data.map((d) => d.total)) + 3,
      title: {
        text: "Acumulado (m³)",
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
      flow: { alias: "Consumo promedio (m³)" },
      date_time_medition: { alias: "Fecha medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Consumo",
        value: `${datum.total_diff.toLocaleString("es-CL")} m³`,
        title: `${datum.date_time_medition.slice(
          8,
          10
        )}/${datum.date_time_medition.slice(5, 7)}`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.total_diff)),
      max: Math.max(...data.map((d) => d.total_diff)),
      title: {
        text: "Consumo promedio(m³)",
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
    color: "rgb(31, 52, 97)",
    meta: {
      total_today_diff: { alias: "Consumo (m³/d)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Consumo",
        value: `${datum.total_today_diff.toLocaleString("es-CL")} m³/d`,
        title: `${datum.date_time_medition.slice(0, 10)}`,
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
      flow: { alias: "Nivel freático promedio (m)" },
      date_time_medition: { alias: "Fecha medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Nivel freático",
        value: `${datum.water_table.toFixed(2)} m`,
        title: `${datum.date_time_medition.slice(
          8,
          10
        )}/${datum.date_time_medition.slice(5, 7)}`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.water_table)),
      max: Math.max(...data.map((d) => d.water_table)),
      title: {
        text: "Nivel freático promedio (m)",
        style: {
          fill: "#FFFFFF", // Color blanco para el texto
        },
      },
    },
    color: "rgb(0, 123, 255)", // Azul color agua
  };
  return <Area {...config} />;
};

export const FlowLine = ({ data }) => {
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
    color: "rgb(31, 52, 97)",
    meta: {
      flow: { alias: "Caudal (L/s)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Caudal",
        value: `${datum.flow.toLocaleString("es-CL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} L/s`,
        title: `${datum.date_time_medition.slice(0, 10)}`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.flow)) - 5,
      max: Math.max(...data.map((d) => d.flow)) + 5,
      title: {
        text: "Caudal (L/s)",
      },
    },
  };
  return <Line {...config} />;
};

export const LevelLine = ({ data }) => {
  data.forEach((item) => {
    item.level = parseFloat(item.level);
  });
  const config = {
    ...commonConfig,
    data: data,
    xField: "date_time_medition",
    yField: "level",
    seriesField: "level",
    smooth: true,
    color: "rgb(31, 52, 97)",
    meta: {
      level: { alias: "Nivel freático (m)" },
      date_time_medition: { alias: "Fecha/hora medición" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Nivel freático",
        value: `${datum.level.toLocaleString("es-CL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} m`,
        title: `${datum.date_time_medition.slice(0, 10)}`,
      }),
    },
    yAxis: {
      ...commonConfig.yAxis,
      min: Math.min(...data.map((d) => d.level)) - 3,
      max: Math.max(...data.map((d) => d.level)) + 3,
      title: {
        text: "Nivel freático (m)",
      },
    },
  };
  return <Line {...config} />;
};
