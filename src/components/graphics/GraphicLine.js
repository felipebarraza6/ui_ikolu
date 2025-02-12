import React, { useState, useEffect, useContext } from "react";
import Stats from "./Stats";
import { Tabs, Card, Table, Typography, Statistic, Row, Col } from "antd";
import { Line, Area, Column } from "@ant-design/plots";
import { AppContext } from "../../App";
import dayjs from "dayjs";
import {
  BarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  TableOutlined,
} from "@ant-design/icons";
import QueueAnim from "rc-queue-anim";

const { Title } = Typography;

const GraphicLine = ({ option, initialDate, endDate, id_profile }) => {
  const [data, setData] = useState([]);
  const { state } = useContext(AppContext);

  const numberForMiles = new Intl.NumberFormat("de-DE");

  const position_sensor_nivel = parseFloat(10);

  var parsedDate = dayjs(initialDate);

  const firstDayOfMonth = dayjs(
    `${parsedDate.year()}-${parsedDate.month() + 1}-01`
  );
  const lastDayOfMonth = firstDayOfMonth.endOf("month");

  const processNivel = (nivel_response) => {
    if (nivel_response > 0.0 && nivel_response < position_sensor_nivel) {
      return parseFloat(position_sensor_nivel - nivel_response);
    } else if (nivel_response > position_sensor_nivel || nivel_response < 0.0) {
      nivel_response = 50.0;
      return parseFloat(position_sensor_nivel - nivel_response);
    } else {
      nivel_response = 0.0;
      return parseFloat(position_sensor_nivel - nivel_response);
    }
  };

  const processCaudal = (caudal) => {
    const flow = parseFloat(caudal);
    if (flow > 0.5) {
      return flow;
    } else {
      return parseFloat(0.0);
    }
  };

  const processAcum = (acum) => {
    const acumulado = parseInt(acum);
    if (acumulado > 0) {
      return acumulado;
    } else {
      return 0;
    }
  };

  const generateMockData = () => {
    const mockData = [];
    for (let i = 0; i < 24; i++) {
      mockData.push({
        date_time_medition: dayjs(initialDate)
          .hour(i)
          .format("YYYY-MM-DD HH:mm"),
        flow: (Math.random() * 10).toFixed(2),
        total: (Math.random() * 1000).toFixed(0),
        nivel: (Math.random() * 10).toFixed(2),
        total_hora: (Math.random() * 100).toFixed(0),
      });
    }
    return mockData;
  };

  useEffect(() => {
    const mockData = generateMockData().map((element) => {
      var date_time = element.date_time_medition.slice(11, 16);
      element.date_time_medition = date_time;
      element.caudal = processCaudal(element.flow);
      element.acumulado = processAcum(element.total);
      element.nivel = processNivel(element.nivel);
      element.acumulado_hora = processAcum(element.total_hora);
      return element;
    });
    setData(mockData.reverse());
  }, [initialDate, option]);

  const monthNames = [
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
  ];

  const monthNamesMobile = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  const monthName = monthNames[parsedDate.month()];
  const monthNameShort = monthNamesMobile[parsedDate.month()];

  const parsedTitle = (d) => {
    if (option === 1) {
      return `${d} hrs.`;
    } else {
      if (window.innerWidth > 900) {
        return `${d} de ${monthName}`;
      } else {
        return `${d} de ${monthNameShort}`;
      }
    }
  };

  const parsedText = () => {
    if (option === 1) {
      if (window.innerWidth > 900) {
        return `Hora (00:00 - ${
          data.length > 0 && data[data.length - 1].date_time_medition
        } / ${parsedDate.date()} de ${monthName} del ${parsedDate.year()}) `;
      } else {
        return `Hora (00:00 - ${
          data.length > 0 && data[data.length - 1].date_time_medition
        } ${parsedDate.format("DD")}/${parsedDate.format(
          "MM"
        )}/${parsedDate.format("YY")}) `;
      }
    } else {
      if (window.innerWidth > 900) {
        return `Días (01 al ${lastDayOfMonth.format(
          "DD"
        )} de ${monthName} del ${parsedDate.year()})`;
      } else {
        return `Días (01 al ${lastDayOfMonth.format(
          "DD"
        )} de ${monthNameShort} del ${parsedDate.year()})`;
      }
    }
  };

  const configCaudal = {
    data: data,
    xField: "date_time_medition",
    tooltip: {
      title: parsedTitle,
      formatter: (datum) => {
        return {
          name: "Caudal",
          value: parseFloat(datum.caudal).toFixed(1) + " (L/s)",
        };
      },
    },
    yField: "caudal",

    smooth: true,
    color: "#1677ff",
    lineStyle: {
      lineWidth: 2,
      lineDash: [2, 2],
    },
  };

  const configAcumulado = {
    data: data,
    xField: "date_time_medition",
    tooltip: {
      title: parsedTitle,
      formatter: (datum) => {
        return {
          name: "Acumulado",
          value: numberForMiles.format(datum.acumulado) + " (m³)",
        };
      },
    },
    xAxis: {
      title: {
        text: parsedText(),
        style: {
          fontSize: window.innerWidth > 900 ? 16 : 13,
          fontWeight: "bold",
        },
      },
    },
    yField: "acumulado",
    yAxis: {
      title: {
        text: "Acumulado (m³)",
        style: {
          fontSize: window.innerWidth > 900 ? 20 : 15,
          fontWeight: "bold",
        },
      },
      reverse: true,
      min: Math.min(
        ...data.map((item) => {
          const acumulado = processAcum(item.acumulado);
          return acumulado > 0.0
            ? processAcum(acumulado - 1)
            : processAcum(acumulado);
        })
      ),
    },
  };

  return (
    <div>
      <Line {...configCaudal} />
      <Line {...configAcumulado} />
    </div>
  );
};

export default GraphicLine;
