import React, { useState, useContext, useEffect } from "react";
import {
  Tabs,
  Card,
  Flex,
  DatePicker,
  Select,
  Tag,
  ConfigProvider,
  Spin,
  Typography,
} from "antd";
import { CalendarOutlined, ApartmentOutlined } from "@ant-design/icons";
import img_caudal from "../../assets/images/caudal.png";
import img_nivel from "../../assets/images/nivel.png";
import { AppContext } from "../../App";
import QueueAnim from "rc-queue-anim";
import sh from "../../api/sh/endpoints";
import ContainerDays from "./dga/days/Container";
import ContainerMonth from "./dga/month/Container";
import TableData from "./TableData";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useResponsive } from "../../hooks/useResponsive";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");
dayjs.tz.setDefault("America/Santiago");

const { TabPane } = Tabs;
const { Title } = Typography;

/**
 * 📊 DGA ANÁLISIS RESPONSIVO
 *
 * Estructura:
 * - Solo Fecha (sin botón Analizar)
 * - Carga automática al seleccionar fecha
 * - Tabs con gráficos abajo (estilo azul, headers blancos)
 * - Sin Card wrapper, sin gradientes
 */
const GraphisNavDga = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();

  const [activeKey, setActiveKey] = useState("1");
  const [dateType, setDateType] = useState("1");
  const [monthMode, setMonthMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [dataMonth, setDataMonth] = useState([]);
  const [dayDate, setDayDate] = useState(null);
  const [monthDate, setMonthDate] = useState(null);

  const activate = state.selected_profile.profile_ikolu.m2;

  const handleDateTypeChange = (value) => {
    setDateType(value);
    setMonthMode(value === "2");
    setDayDate(null);
    setMonthDate(null);
    setData([]);
    setDataMonth([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const dateToUse = monthMode ? monthDate : dayDate;
      if (!dateToUse) {
        setData([]);
        setDataMonth([]);
        return;
      }

      setLoading(true);
      const formattedDate = dateToUse.format("YYYY-MM-DD");
      try {
        if (monthMode) {
          const response = await sh.get_data_month_dga(
            state.selected_profile.id,
            formattedDate
          );
          setDataMonth(response || []);
        } else {
          const response = await sh.get_data_day(
            state.selected_profile.id,
            formattedDate
          );
          setData(response || []);
        }
      } catch (error) {
        console.error("Error fetching DGA data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activate) {
      fetchData();
    }
  }, [dayDate, monthDate, monthMode, state.selected_profile.id, activate]);

  const dateToUse = monthMode ? monthDate : dayDate;
  const dateLabel = dateToUse
    ? dayjs(dateToUse).format("DD/MM/YYYY")
    : "hoy " + dayjs().format("DD/MM/YYYY");

  const renderContent = () => {
    const currentData = monthMode ? dataMonth : data;
    const noData = !currentData || currentData.length === 0;

    if (!activate) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <CalendarOutlined
            style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
          />
          <div style={{ fontSize: 18, color: "#999", marginBottom: 8 }}>
            Módulo DGA Análisis no disponible
          </div>
          <p style={{ color: "#666" }}>
            Contacta a soporte para activar esta funcionalidad.
          </p>
        </div>
      );
    }

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

    return (
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        size="large"
        tabBarStyle={{ marginBottom: 24, borderBottom: "1px solid #f0f0f0" }}
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
            isToday={!dateToUse}
            periodType={monthMode ? "month" : "day"}
          />
        </TabPane>
      </Tabs>
    );
  };

  return (
    <QueueAnim delay={300} duration={900} type="right">
      <div key="graphisnav-dga">
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
                Estás viendo datos de {dateLabel}
              </Tag>
            </Flex>
            <div style={{ marginTop: "24px" }}>{renderContent()}</div>
          </Card>
        </ConfigProvider>
      </div>
    </QueueAnim>
  );
};

export default GraphisNavDga;
