import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  Typography,
  DatePicker,
  Select,
  Flex,
  Spin,
  Tag,
} from "antd";
import {
  CalendarOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import ModuleTour from "../common/ModuleTour";
import { analysisTour } from "../../config/tours";
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

const { Title } = Typography;

/**
 * 📊 SMART ANÁLISIS RESPONSIVO — Rediseñado
 *
 * Estructura coherente con DGA y Centro de Alertas:
 * - Selector de fecha en Card estilizada
 * - Gráficos y análisis abajo (stats incluidas en ContainerDays/Month)
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
        if (monthMode) {
          setDataMonth([]);
        } else {
          setData(state.selected_profile.modules.today || []);
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

  useEffect(() => {
    if (state.selected_profile?.id) {
      setDateType("1");
      setMonthMode(false);
      setDayDate(null);
      setMonthDate(null);
      setData(state.selected_profile.modules?.today || []);
      setDataMonth([]);
    }
  }, [state.selected_profile?.id]);

  const hasData = monthMode ? dataMonth.length > 0 : data.length > 0;
  const dateIsSelected = monthMode ? !!monthDate : !!dayDate;

  return (
    <div
      style={{
        maxWidth: "1600px",
        margin: isMobile ? "12px auto" : "0 auto",
        padding: isMobile ? "0 8px" : "0",
        minHeight: "90vh",
      }}
    >
      {/* Selector de análisis */}
      <Card
        id="analysis-selector"
        style={{
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "none",
          marginBottom: "24px",
        }}
        bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
      >
        <Flex
          gap={isMobile ? "small" : "middle"}
          vertical={isMobile}
          align="center"
          style={{ width: "100%", flexWrap: isMobile ? "nowrap" : "wrap" }}
        >
          <BarChartOutlined style={{ fontSize: 20, color: "#1F3461" }} />
          <Select
            placeholder="Tipo de análisis"
            style={{ width: isMobile ? "100%" : "220px" }}
            value={dateType}
            onChange={handleDateTypeChange}
            disabled={!activate}
          >
            <Select.Option value="1">
              <Flex align="center" gap="small">
                <CalendarOutlined /> Análisis Diario
              </Flex>
            </Select.Option>
            <Select.Option value="2">
              <Flex align="center" gap="small">
                <BarChartOutlined /> Análisis Mensual
              </Flex>
            </Select.Option>
          </Select>
            <DatePicker
              key={dateType}
              placeholder="Seleccionar fecha"
              value={monthMode ? monthDate : dayDate}
              onChange={(date) => {
                if (monthMode) {
                  setMonthDate(date);
                } else {
                  setDayDate(date);
                }
                if (!date) {
                  if (monthMode) {
                    setDataMonth([]);
                  } else {
                    setData(state.selected_profile.modules.today || []);
                  }
                }
              }}
              style={{ width: isMobile ? "100%" : "220px" }}
              picker={dateType === "1" ? "date" : "month"}
              disabled={!activate}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              format={dateType === "1" ? "DD/MM/YYYY" : "MM/YYYY"}
            />

            {!monthMode && !dayDate && (
              <Tag
                icon={<CalendarOutlined />}
                style={{
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 6,
                }}
              >
                Hoy {dayjs().format("DD/MM/YYYY")}
              </Tag>
            )}
        </Flex>
      </Card>

      {/* Contenedor de gráficos */}
      <div id="analysis-charts">
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
            <ContainerDays data={data} isToday={!dateIsSelected} />
          )
        ) : (
          <Card
            style={{
              textAlign: "center",
              padding: "40px",
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "none",
            }}
          >
            <CalendarOutlined
              style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
            />
            <Title level={4} style={{ color: "#bfbfbf" }}>
              {dateIsSelected
                ? "No se encontraron datos para la fecha seleccionada."
                : "Por favor, selecciona una fecha/mes"}
            </Title>
          </Card>
        )
      ) : (
        <Card
          style={{
            textAlign: "center",
            padding: "40px",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "none",
          }}
        >
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

      <ModuleTour
        tourKey={analysisTour.key}
        steps={analysisTour.steps}
        requiresPoint={analysisTour.requiresPoint}
        hasPoint={!!state.selected_profile?.id}
        autoStart={true}
        delay={1000}
      />
    </div>
  );
};

export default ResponsiveSmartAnalysis;
