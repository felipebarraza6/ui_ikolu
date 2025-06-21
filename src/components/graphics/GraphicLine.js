import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
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
import { useResponsive } from "../../hooks/useResponsive";

const { Title } = Typography;

// --- Constantes y Helpers ---
const numberForMiles = new Intl.NumberFormat("de-DE");
const MONTH_NAMES = [
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
const MONTH_NAMES_MOBILE = [
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

const processNivel = (nivel_response, position_sensor_nivel = 10.0) => {
  const nivel = parseFloat(nivel_response);
  if (nivel > 0.0 && nivel < position_sensor_nivel) {
    return parseFloat(position_sensor_nivel - nivel);
  }
  return 0.0; // Valor por defecto si está fuera de rango
};

const processCaudal = (caudal) => {
  const flow = parseFloat(caudal);
  return flow > 0.5 ? flow : 0.0;
};

const processAcum = (acum) => {
  const acumulado = parseInt(acum, 10);
  return acumulado > 0 ? acumulado : 0;
};

const generateMockData = (date) => {
  return Array.from({ length: 24 }, (_, i) => ({
    date_time_medition: dayjs(date).hour(i).format("YYYY-MM-DD HH:mm"),
    flow: (Math.random() * 10).toFixed(2),
    total: (Math.random() * 1000).toFixed(0),
    nivel: (Math.random() * 10).toFixed(2),
    total_hora: (Math.random() * 100).toFixed(0),
  }));
};

const GraphicLine = ({ option, initialDate, endDate, id_profile }) => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();

  const [data, setData] = useState([]);

  useEffect(() => {
    const mockData = generateMockData(initialDate);
    setData(mockData);
  }, [initialDate]);

  const processedData = useMemo(() => {
    return data
      .map((element) => ({
        ...element,
        date_time_medition: dayjs(element.date_time_medition).format("HH:mm"),
        caudal: processCaudal(element.flow),
        acumulado: processAcum(element.total),
        nivel: processNivel(element.nivel),
        acumulado_hora: processAcum(element.total_hora),
      }))
      .reverse();
  }, [data]);

  const parsedDate = useMemo(() => dayjs(initialDate), [initialDate]);

  const chartConfigs = useMemo(() => {
    const monthName = MONTH_NAMES[parsedDate.month()];
    const monthNameShort = MONTH_NAMES_MOBILE[parsedDate.month()];
    const lastDayOfMonth = parsedDate.endOf("month").format("DD");

    const parsedTitle = (d) =>
      option === 1
        ? `${d} hrs.`
        : `${d} de ${isMobile ? monthNameShort : monthName}`;

    const parsedText =
      option === 1
        ? `Hora (00:00 - ${
            processedData[processedData.length - 1]?.date_time_medition ||
            "23:59"
          } / ${parsedDate.format("DD-MM-YY")})`
        : `Días (01-${lastDayOfMonth} de ${
            isMobile ? monthNameShort : monthName
          } del ${parsedDate.year()})`;

    const baseConfig = {
      data: processedData,
      xField: "date_time_medition",
      smooth: true,
      xAxis: {
        title: {
          text: parsedText,
          style: { fontSize: isMobile ? 13 : 16, fontWeight: "bold" },
        },
      },
    };

    return {
      configCaudal: {
        ...baseConfig,
        yField: "caudal",
        color: "#1677ff",
        lineStyle: { lineWidth: 2, lineDash: [2, 2] },
        tooltip: {
          title: parsedTitle,
          formatter: (d) => ({
            name: "Caudal",
            value: `${parseFloat(d.caudal).toFixed(1)} L/s`,
          }),
        },
      },
      configAcumulado: {
        ...baseConfig,
        yField: "acumulado",
        yAxis: {
          title: {
            text: "Acumulado (m³)",
            style: { fontSize: isMobile ? 15 : 20, fontWeight: "bold" },
          },
          min: Math.min(
            ...processedData.map((item) =>
              item.acumulado > 0 ? item.acumulado - 1 : 0
            )
          ),
        },
        tooltip: {
          title: parsedTitle,
          formatter: (d) => ({
            name: "Acumulado",
            value: `${numberForMiles.format(d.acumulado)} m³`,
          }),
        },
      },
    };
  }, [processedData, parsedDate, option, isMobile]);

  if (!processedData || processedData.length === 0) {
    return (
      <div style={styles.noDataContainer}>
        No hay datos para mostrar en este periodo.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <QueueAnim
        type={["right", "left"]}
        ease={["easeOutQuart", "easeInOutQuart"]}
      >
        <div key="stats" style={{ marginBottom: 24 }}>
          <Stats data={processedData} />
        </div>
        <div key="charts">
          <Tabs defaultActiveKey="1" type="card">
            <Tabs.TabPane
              tab={
                <>
                  <LineChartOutlined /> Caudal{" "}
                </>
              }
              key="1"
            >
              <Card>
                <Line {...chartConfigs.configCaudal} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <>
                  <BarChartOutlined /> Acumulado Diario
                </>
              }
              key="2"
            >
              <Card>
                <Column {...chartConfigs.configAcumulado} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <>
                  <AreaChartOutlined /> Acumulado Mensual
                </>
              }
              key="3"
            >
              <Card>
                <Area {...chartConfigs.configAcumulado} />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <>
                  <TableOutlined /> Tabla de Datos
                </>
              }
              key="4"
            >
              {/* Aquí iría la tabla si es necesaria */}
            </Tabs.TabPane>
          </Tabs>
        </div>
      </QueueAnim>
    </div>
  );
};

const styles = {
  noDataContainer: {
    width: "100%",
    minHeight: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
    borderRadius: 8,
    color: "#888",
    fontSize: 18,
    margin: "20px 0",
  },
  container: {
    width: "100%",
  },
};

export default React.memo(GraphicLine);
