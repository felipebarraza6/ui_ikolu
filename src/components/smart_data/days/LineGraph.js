import React from "react";
import { Area, Line } from "@ant-design/plots";

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
      formatter: (text) => parseFloat(text).toLocaleString("es-CL"),
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
      },
      inverse: true, // Invertir el eje Y
    },
    color: "rgb(31, 52, 97)",
  };
  return <Area {...config} />;
};
