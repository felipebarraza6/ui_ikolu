import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  Typography,
  DatePicker,
  Select,
  Flex,
  Spin,
  ConfigProvider,
  Tag,
} from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { AppContext } from "../../App";
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
dayjs.tz.setDefault("America/Santiago");

const { Title, Text } = Typography;

/**
 * 📊 SMART ANÁLISIS RESPONSIVO
 *
 * Estructura:
 * - Indicadores arriba (caudal máx/mín, nivel máx/mín, consumo, acumulado)
 * - Gráficos y análisis del punto de captación abajo
 * - Optimizado para móvil y desktop
 */
const ResponsiveSmartAnalysis = () => {
  const { isMobile } = useResponsive();
  const { state } = useContext(AppContext);

  const [dateType, setDateType] = useState("1");
  const [monthMode, setMonthMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState(state.selected_profile.modules.today || []);
  const [dataMonth, setDataMonth] = useState([]);
  const [dayDate, setDayDate] = useState(null);
  const [monthDate, setMonthDate] = useState(null);

  const activate = state.selected_profile.profile_ikolu.m4;

  const handleDateTypeChange = (value) => {
    setDateType(value);
    setMonthMode(value === "2");
    setDayDate(null);
    setMonthDate(null);
    setData(value === "1" ? state.selected_profile.modules.today || [] : []);
    setDataMonth([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const dateToUse = monthMode ? monthDate : dayDate;

      if (!dateToUse) {
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

  useEffect(() => {
    if (state.selected_profile) {
      setDateType("1");
      setMonthMode(false);
      setDayDate(null);
      setMonthDate(null);
      setData(state.selected_profile.modules.today || []);
      setDataMonth([]);
    }
  }, [state.selected_profile]);

  const hasData = monthMode ? dataMonth.length > 0 : data.length > 0;
  const dateIsSelected = monthMode ? !!monthDate : !!dayDate;

  return (
    <div
      style={{
        padding: isMobile ? "4px" : "20px",
        paddingTop: isMobile ? "0px" : "20px",
        background: "white",
        minHeight: "100vh",
      }}
    >
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
            value={dateType}
            onChange={handleDateTypeChange}
            disabled={!activate}
          >
            <Select.Option value="1">📅 Análisis Diario</Select.Option>
            <Select.Option value="2">📊 Análisis Mensual</Select.Option>
          </Select>
          <ConfigProvider locale={locale}>
            <DatePicker
              key={dateType}
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
            <Tag color="blue">
              <CalendarOutlined />
              {dayDate ? dayDate.format("DD/MM/YYYY") : dayjs()}
            </Tag>
          </ConfigProvider>
        </Flex>
      </Card>

      {/* Contenedor de gráficos */}
      {activate ? (
        loading ? (
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
            <ContainerMonth data={dataMonth} />
          ) : (
            <ContainerDays data={data} />
          )
        ) : (
          <Card style={{ textAlign: "center", padding: "40px" }}>
            <CalendarOutlined
              style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
            />
            <Title level={4} style={{ color: "#bfbfbf" }}>
              {dateIsSelected
                ? "No se encontraron datos para la fecha seleccionada."
                : "Mostrando datos de hoy. Por favor, selecciona otra fecha para un nuevo análisis."}
            </Title>
          </Card>
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
