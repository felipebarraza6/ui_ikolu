import React, { useState, useContext, useEffect } from "react";
import {
  Tabs,
  Card,
  Flex,
  Statistic,
  DatePicker,
  Select,
  Tag,
  ConfigProvider,
  Spin,
  Typography,
} from "antd";
import {
  FlowArea,
  TotalLine,
  TotalHour,
  TotalDay,
  WaterTableBar,
} from "./days/LineGraph";
import {
  DatabaseOutlined,
  CalendarOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import img_caudal from "../../assets/images/caudal.png";
import img_nivel from "../../assets/images/nivel.png";
import img_total from "../../assets/images/acumulado.png";
import { AppContext } from "../../App";
import QueueAnim from "rc-queue-anim";
import sh from "../../api/sh/endpoints";
import ContainerDays from "./days/Container";
import ContainerMonth from "./month/Container";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useResponsive } from "../../hooks/useResponsive";
import TableData from "./TableData";

// Configurar dayjs correctamente
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

// Forzar timezone de Chile
dayjs.tz.setDefault("America/Santiago");

const { TabPane } = Tabs;
const { Title } = Typography;

const GraphisNav = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();

  const [activeKey, setActiveKey] = useState("1");
  const [dateType, setDateType] = useState("1");
  const [monthMode, setMonthMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados de datos y fechas inicializados en vacío
  const [data, setData] = useState(state.selected_profile.modules.m4);
  const [dataMonth, setDataMonth] = useState([]);
  const [dayDate, setDayDate] = useState(null);
  const [monthDate, setMonthDate] = useState(null);

  const activate = state.selected_profile.profile_ikolu.m4;

  const dateToUse = monthMode ? monthDate : dayDate;
  const dateLabel = dateToUse
    ? dayjs(dateToUse).format("DD/MM/YYYY")
    : "los datos de hoy " + dayjs().format("DD/MM/YYYY");

  const [stats, setStats] = useState({
    maxConsumoHora: { hour: "00:00", value: 0 },
    minConsumoHora: { hour: "00:00", value: 0 },
    acumulado: {
      first: { hour: "00:00", value: 0 },
      last: { hour: "00:00", value: 0 },
    },
    caudalMax: { hour: "00:00", value: 0 },
    caudalMin: { hour: "00:00", value: 0 },
    nivelMax: { hour: "00:00", value: 0 },
    nivelMin: { hour: "00:00", value: 0 },
  });

  // useEffect inicial para cargar datos de hoy por defecto
  useEffect(() => {
    if (!monthMode && !dayDate && activate) {
      // Cargar datos de hoy por defecto en modo diario
      setData(state.selected_profile.modules.m4);
    }
  }, [activate, monthMode, dayDate, state.selected_profile.modules.m4]);

  const handleDateTypeChange = (value) => {
    setDateType(value);
    setMonthMode(value === "2");
    // Limpiar fechas para forzar una nueva selección y evitar errores de estado
    setDayDate(null);
    setMonthDate(null);
  };

  // useEffect para buscar datos automáticamente cuando cambia la fecha
  useEffect(() => {
    const fetchData = async () => {
      const dateToUse = monthMode ? monthDate : dayDate;

      // Si no hay fecha seleccionada, mantener datos por defecto
      if (!dateToUse) {
        if (monthMode) {
          // Para modo mensual, limpiar datos si no hay fecha
          setDataMonth([]);
        } else {
          // Para modo diario, mantener datos de hoy por defecto
          setData(state.selected_profile.modules.m4);
        }
        return;
      }

      setLoading(true);
      const formattedDate = dateToUse.format("YYYY-MM-DD");
      try {
        if (monthMode) {
          const response = await sh.get_data_month(
            state.selected_profile.id,
            formattedDate,
            formattedDate
          );
          setDataMonth(response || []);
        } else {
          const response = await sh.get_data_day(
            state.selected_profile.id,
            formattedDate,
            formattedDate
          );
          setData(response || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dayDate, monthDate, monthMode, state.selected_profile.id]);

  // useEffect para calcular estadísticas cuando los datos cambian
  useEffect(() => {
    if (data && data.length > 0) {
      const formatTime = (dateString) => dayjs(dateString).format("HH:mm");

      let caudalMax = data.reduce((prev, current) =>
        prev.flow > current.flow ? prev : current
      );

      let caudalMin = data.reduce((prev, current) => {
        if (current.flow === 0) return prev;
        return prev.flow < current.flow && prev.flow !== 0 ? prev : current;
      });

      let nivelMax = data.reduce((prev, current) =>
        prev.water_table > current.water_table ? prev : current
      );

      let nivelMin = data.reduce((prev, current) => {
        if (current.water_table === 0) return prev;
        return prev.water_table < current.water_table && prev.water_table !== 0
          ? prev
          : current;
      });

      let maxConsumo = data.reduce((prev, current) =>
        prev.total_diff > current.total_diff ? prev : current
      );

      let minConsumo = data.reduce((prev, current) => {
        if (current.total_diff === 0) return prev;
        return prev.total_diff < current.total_diff && prev.total_diff !== 0
          ? prev
          : current;
      });

      setStats({
        caudalMax: {
          hour: formatTime(caudalMax.date_time_medition),
          value: caudalMax.flow,
        },
        caudalMin: {
          hour: formatTime(caudalMin.date_time_medition),
          value: caudalMin.flow,
        },
        nivelMax: {
          hour: formatTime(nivelMax.date_time_medition),
          value: nivelMax.water_table,
        },
        nivelMin: {
          hour: formatTime(nivelMin.date_time_medition),
          value: nivelMin.water_table,
        },
        maxConsumoHora: {
          hour: formatTime(maxConsumo.date_time_medition),
          value: maxConsumo.total_diff,
        },
        minConsumoHora: {
          hour: formatTime(minConsumo.date_time_medition),
          value: minConsumo.total_diff,
        },
        acumulado: {
          first: {
            hour: formatTime(data[0].date_time_medition),
            value: parseInt(data[0].total).toLocaleString("es-CL"),
          },
          last: {
            hour: formatTime(data[data.length - 1].date_time_medition),
            value: parseInt(data[data.length - 1].total).toLocaleString(
              "es-CL"
            ),
          },
        },
      });
    }
  }, [data]);

  const hasData = monthMode ? dataMonth.length > 0 : data.length > 0;
  const dateIsSelected = monthMode ? !!monthDate : !!dayDate;

  // Componente que renderiza el contenido (gráficos o resumen)
  const renderContent = () => {
    const currentData = monthMode ? dataMonth : data;
    const noData = !currentData || currentData.length === 0;

    if (loading) {
      return (
        <Flex justify="center" align="center" style={{ height: "40vh" }}>
          <Spin size="large" />
        </Flex>
      );
    }

    if (noData) {
      return (
        <Flex
          justify="center"
          align="center"
          style={{ height: "40vh", textAlign: "center" }}
        >
          <Title level={4} style={{ color: "#bfbfbf" }}>
            {dayDate || monthDate
              ? "No se encontraron datos para la fecha seleccionada."
              : "Por favor, selecciona una fecha para visualizar los datos."}
          </Title>
        </Flex>
      );
    }

    // Usar el nuevo componente `TableData` unificado para la pestaña de resumen
    // y los `Container` para los gráficos.
    return (
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        size="large"
        tabBarStyle={{
          marginBottom: 24,
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <TabPane
          tab={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: "8px",
                background: activeKey === "1" ? "#1f3461" : "transparent",
                color: activeKey === "1" ? "white" : "inherit",
              }}
            >
              <img
                src={img_caudal}
                alt="caudal"
                style={{
                  width: 22,
                  marginRight: 8,
                  filter:
                    activeKey === "1" ? "brightness(0) invert(1)" : "none",
                }}
              />
              Caudal
            </span>
          }
          key="1"
        >
          {monthMode ? (
            <ContainerMonth data={currentData} type="caudal" />
          ) : (
            <ContainerDays data={currentData} type="caudal" />
          )}
        </TabPane>
        <TabPane
          tab={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: "8px",
                background: activeKey === "2" ? "#1f3461" : "transparent",
                color: activeKey === "2" ? "white" : "inherit",
              }}
            >
              <img
                src={img_nivel}
                alt="nivel"
                style={{
                  width: 22,
                  marginRight: 8,
                  filter:
                    activeKey === "2" ? "brightness(0) invert(1)" : "none",
                }}
              />
              Nivel Freático
            </span>
          }
          key="2"
        >
          {monthMode ? (
            <ContainerMonth data={currentData} type="nivel" />
          ) : (
            <ContainerDays data={currentData} type="nivel" />
          )}
        </TabPane>
        <TabPane
          tab={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: "8px",
                background: activeKey === "3" ? "#1f3461" : "transparent",
                color: activeKey === "3" ? "white" : "inherit",
              }}
            >
              <ApartmentOutlined style={{ fontSize: 22, marginRight: 8 }} />
              Resumen
            </span>
          }
          key="3"
        >
          <TableData
            data={currentData}
            isToday={!dayDate && !monthMode}
            periodType={monthMode ? "month" : "day"}
          />
        </TabPane>
      </Tabs>
    );
  };

  return (
    <QueueAnim delay={300} duration={900} type="right">
      <div key="graphisnav">
        <ConfigProvider locale={locale}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap="middle"
            >
              <Flex gap="middle" align="center">
                <Select
                  defaultValue="1"
                  style={{ width: 180 }}
                  onChange={handleDateTypeChange}
                  options={[
                    { value: "1", label: "Análisis Diario" },
                    { value: "2", label: "Análisis Mensual" },
                  ]}
                />
                {monthMode ? (
                  <DatePicker
                    picker="month"
                    onChange={(date) => setMonthDate(date)}
                    value={monthDate}
                    placeholder="Seleccionar mes"
                  />
                ) : (
                  <DatePicker
                    onChange={(date) => setDayDate(date)}
                    value={dayDate}
                    placeholder="Seleccionar fecha"
                  />
                )}
              </Flex>
              <Tag
                icon={<CalendarOutlined />}
                color="blue"
                style={{ fontSize: "14px", padding: "6px 12px" }}
              >
                Estás viendo {dateLabel}
              </Tag>
            </Flex>
            <div style={{ marginTop: "24px" }}>{renderContent()}</div>
          </Card>
        </ConfigProvider>
      </div>
    </QueueAnim>
  );
};

const styles = {
  cardStat: {
    width: "100%",
    background:
      "linear-gradient(90deg, rgba(89,128,55,0.40940126050420167) 0%, rgba(30,48,85,0.7763480392156863)",
    header: {
      color: "white",
      fontWeight: "700",
      background: "rgba(30,48,85)",
      textAlign: "center",
      borderRadius: "5px 5px 0px 0px",
      borderColor: "transparent",
    },
  },

  card: {
    marginTop: "-16px",
    borderRadius: "0px 0px 10px 10px",
    width: "100%",
    background:
      "radial-gradient(circle, rgba(30,48,85,1) 0%, rgba(43,46,51,1) 100%)",
  },
  cardData: {
    marginTop: "-16px",
    borderRadius: "0px",
    width: "100%",
  },
};

export default GraphisNav;
