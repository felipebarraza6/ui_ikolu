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
import { DatabaseOutlined, CalendarOutlined } from "@ant-design/icons";
import TableData from "./days/TableData";
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

      // Si no hay fecha, NO HACER NADA. Los datos iniciales ya están cargados.
      if (!dateToUse) {
        // Opcional: si prefieres que se limpie en vez de mantener los de hoy,
        // descomenta las siguientes líneas.
        // setData([]);
        // setDataMonth([]);
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

  return (
    <QueueAnim delay={300} duration={900} type="alpha">
      <div key="smart-analysis" style={{ paddingTop: "0px" }}>
        <Card
          style={{ width: "100%" }}
          title={
            <Flex
              gap="small"
              justify="space-between"
              vertical={isMobile}
              style={{ marginTop: "8px", marginBottom: "8px" }}
            >
              <Select
                placeholder="Tipo"
                style={{ width: isMobile ? "100%" : "200px" }}
                defaultValue="1"
                onChange={handleDateTypeChange}
                disabled={!activate}
              >
                <Select.Option value="1">Diario</Select.Option>
                <Select.Option value="2">Mensual</Select.Option>
              </Select>

              <ConfigProvider locale={locale}>
                <DatePicker
                  key={dateType} // Clave para forzar reinicio del componente
                  placeholder="Seleccionar fecha"
                  value={monthMode ? monthDate : dayDate}
                  onChange={monthMode ? setMonthDate : setDayDate}
                  style={{ width: isMobile ? "100%" : "200px" }}
                  picker={dateType === "1" ? "date" : "month"}
                  disabled={!activate}
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                  format={dateType === "1" ? "DD/MM/YYYY" : "MM/YYYY"}
                />
              </ConfigProvider>
            </Flex>
          }
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <Spin size="large" tip="Cargando datos..." />
            </div>
          ) : hasData ? (
            monthMode ? (
              <ContainerMonth data={dataMonth} stats={stats} />
            ) : (
              <ContainerDays data={data} stats={stats} />
            )
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <CalendarOutlined
                style={{ fontSize: "48px", color: "#d9d9d9" }}
              />
              <Title level={4} style={{ color: "#bfbfbf", marginTop: "16px" }}>
                {dateIsSelected
                  ? "No se encontraron datos para la fecha seleccionada."
                  : "Mostrando datos de hoy. Selecciona otra fecha para un nuevo análisis."}
              </Title>
            </div>
          )}
        </Card>
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
