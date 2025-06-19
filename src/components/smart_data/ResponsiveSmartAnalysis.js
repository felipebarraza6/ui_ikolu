import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Statistic,
  Flex,
} from "antd";
import {
  BarChartOutlined,
  DashboardOutlined,
  DropboxOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import moment from "moment";
import sh from "../../api/sh/endpoints";
import ContainerDays from "./days/Container";
import ContainerMonth from "./month/Container";
import {
  formatInteger,
  formatFlow,
  formatLevel,
} from "../../utils/numberFormatter";

const { Title } = Typography;

/**
 * 📊 SMART ANÁLISIS RESPONSIVO
 *
 * Estructura:
 * - Indicadores arriba (caudal máx/mín, nivel máx/mín, consumo, acumulado)
 * - Gráficos y análisis del punto de captación abajo
 * - Optimizado para móvil y desktop
 */
const ResponsiveSmartAnalysis = () => {
  // 📱 Detectar móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Estados principales
  const [dateType, setDateType] = useState("1");
  const [monthMode, setMonthMode] = useState(false);
  const [dateSelected, setDateSelected] = useState(
    moment().format("YYYY-MM-DD")
  );

  // Estados de datos
  const { state } = useContext(AppContext);
  const [data, setData] = useState(state.selected_profile.modules.today);
  const [dataMonth, setDataMonth] = useState([]);

  // Estados de estadísticas
  const [acumulado, setAcumulado] = useState({
    first: { hour: "00:00", value: 0 },
    last: { hour: "00:00", value: 0 },
  });
  const [caudalMax, setCaudalMax] = useState({ hour: "00:00", value: 0 });
  const [caudalMin, setCaudalMin] = useState({ hour: "00:00", value: 0 });
  const [nivelMax, setNivelMax] = useState({ hour: "00:00", value: 0 });

  const activate = state.selected_profile.profile_ikolu.m4;

  // Detectar cambios de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Obtener datos
  const getData = async () => {
    if (!monthMode) {
      const response = await sh
        .get_data_day(state.selected_profile.id, dateSelected, dateSelected)
        .then((response) => {
          setData(response || []);
        });
    } else {
      const response = await sh
        .get_data_month(state.selected_profile.id, dateSelected, dateSelected)
        .then((response) => {
          setDataMonth(response || []);
        });
    }
  };

  // Manejar cambio de tipo de fecha
  const handleDateTypeChange = (value) => {
    setDateType(value);
    setMonthMode(value === "2");
  };

  // Calcular estadísticas
  useEffect(() => {
    if (data.length > 0) {
      // Caudal máximo y mínimo
      let caudalMaxObj = data.reduce((prev, current) =>
        prev.flow > current.flow ? prev : current
      );
      let caudalMinObj = data.reduce((prev, current) => {
        if (current.flow === 0) return prev;
        return prev.flow < current.flow && prev.flow !== 0 ? prev : current;
      });

      setCaudalMax({
        hour: caudalMaxObj.date_time_medition.slice(11, 16),
        value: caudalMaxObj.flow,
      });
      setCaudalMin({
        hour: caudalMinObj.date_time_medition.slice(11, 16),
        value: caudalMinObj.flow,
      });

      // Nivel máximo y mínimo
      let nivelMaxObj = data.reduce((prev, current) =>
        prev.water_table > current.water_table ? prev : current
      );

      setNivelMax({
        hour: nivelMaxObj.date_time_medition.slice(11, 16),
        value: nivelMaxObj.water_table,
      });

      // Acumulado
      setAcumulado({
        first: {
          hour: data[0].date_time_medition.slice(11, 16),
          value: parseInt(data[0].total),
        },
        last: {
          hour: data[data.length - 1].date_time_medition.slice(11, 16),
          value: parseInt(data[data.length - 1].total),
        },
      });
    }
  }, [data, monthMode]);

  return (
    <div
      style={{
        padding: isMobile ? "4px" : "20px",
        paddingTop: isMobile ? "0px" : "20px",
        background: "white",
        minHeight: "100vh",
      }}
    >
      {/* 📊 INDICADORES ARRIBA */}

      {/* 📈 SECCIÓN DE GRÁFICOS Y ANÁLISIS (ABAJO) */}
      <Card
        style={{
          background: "white",
          border: "1px solid #f0f0f0",
          marginTop: isMobile ? "5px" : "0px",
        }}
        size="small"
        hoverable
      >
        <Flex
          gap={isMobile ? "small" : "middle"}
          vertical={isMobile}
          style={{
            width: "100%",
            flexWrap: isMobile ? "nowrap" : "wrap",
          }}
        >
          <Select
            placeholder="Tipo de análisis"
            style={{ width: isMobile ? "100%" : "200px" }}
            defaultValue="1"
            onChange={handleDateTypeChange}
            disabled={!activate}
          >
            <Select.Option value="1">📅 Análisis Diario</Select.Option>
            <Select.Option value="2">📊 Análisis Mensual</Select.Option>
          </Select>

          <DatePicker
            placeholder="Seleccionar fecha"
            style={{ width: isMobile ? "100%" : "200px" }}
            defaultValue={moment()}
            onChange={(date) => {
              if (date) {
                setDateSelected(date.format("YYYY-MM-DD"));
              }
            }}
            picker={monthMode ? "month" : "date"}
            disabled={!activate}
          />

          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={getData}
            disabled={!activate}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            Analizar
          </Button>
        </Flex>
      </Card>

      {/* Contenedor de gráficos */}
      {activate ? (
        monthMode ? (
          <ContainerMonth data={dataMonth} dateSelected={dateSelected} />
        ) : (
          <ContainerDays data={data} />
        )
      ) : (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <CalendarOutlined
            style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
          />
          <Title level={4} style={{ color: "#999" }}>
            Módulo Smart Análisis no disponible
          </Title>
          <p style={{ color: "#666" }}>
            Contacta a soporte para activar esta funcionalidad en tu punto de
            captación.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ResponsiveSmartAnalysis;
