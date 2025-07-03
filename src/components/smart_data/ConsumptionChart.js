import React from "react";
import { Line } from "@ant-design/plots";
import { useTranslation } from "react-i18next";
import { Alert } from "antd";

const ConsumptionChart = ({ monthly, year }) => {
  const { t, i18n } = useTranslation();
  const months =
    i18n.language === "es"
      ? [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ]
      : i18n.language === "en"
      ? [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]
      : [
          "一月",
          "二月",
          "三月",
          "四月",
          "五月",
          "六月",
          "七月",
          "八月",
          "九月",
          "十月",
          "十一月",
          "十二月",
        ];

  const data = months.map((month, idx) => ({
    month,
    value: monthly[idx] || 0,
  }));

  const hasData = data.some((d) => d.value > 0);

  const config = {
    data,
    xField: "month",
    yField: "value",
    smooth: true,
    height: 220,
    color: "#1677ff",
    point: { size: 4, shape: "circle" },
    xAxis: {
      label: { style: { fontSize: 12 } },
      title: null,
    },
    yAxis: {
      label: { style: { fontSize: 12 } },
      title: { text: t("waterModule.monthly") },
    },
    tooltip: {
      formatter: (datum) => ({
        name: t("waterModule.monthly"),
        value: datum.value,
      }),
    },
    animation: true,
    legend: false,
  };

  return (
    <div style={{ margin: "12px 0 24px 0" }}>
      {hasData ? (
        <Line {...config} />
      ) : (
        <Alert
          type="info"
          showIcon
          message={t("waterModule.noData", "No hay datos para graficar.")}
        />
      )}
    </div>
  );
};

export default ConsumptionChart;
