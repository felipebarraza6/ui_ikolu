import React, { useState, useContext, useEffect } from "react";
import { DatePicker, Flex, ConfigProvider, Card, Spin, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import ContainerDays from "./dga/days/Container";
import ContainerMonth from "./dga/month/Container";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";

// Configurar dayjs para español
dayjs.locale("es");

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
  // 📱 Detectar móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Estados principales - fecha inicializada como null
  const [dateSelected, setDateSelected] = useState(null);

  // Estados de datos
  const { state } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const activate = state.selected_profile.profile_ikolu.m2;

  // Detectar cambios de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect para cargar datos automáticamente cuando cambia la fecha
  useEffect(() => {
    const fetchData = async () => {
      if (!dateSelected) {
        setData([]);
        return;
      }

      setLoading(true);
      try {
        const response = await sh.get_data_day(
          state.selected_profile.id,
          dateSelected.format("YYYY-MM-DD"),
          dateSelected.format("YYYY-MM-DD")
        );
        setData(response || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateSelected, state.selected_profile.id]);

  // Limpiar datos al cambiar de perfil
  useEffect(() => {
    if (state.selected_profile) {
      setDateSelected(null);
      setData([]);
    }
  }, [state.selected_profile]);

  const hasData = data && data.length > 0;
  const dateIsSelected = !!dateSelected;

  return (
    <div
      style={{
        padding: isMobile ? "4px" : "20px",
        paddingTop: isMobile ? "0px" : "20px",
        background: "white",
        minHeight: "100vh",
      }}
    >
      {/* Controles */}
      <Card size="small" style={{ background: "#f5f5f5" }}>
        <Flex
          gap={isMobile ? "small" : "middle"}
          vertical={isMobile}
          justify="space-between"
          align="center"
          style={{
            width: "100%",
            flexWrap: isMobile ? "nowrap" : "wrap",
          }}
        >
          <ConfigProvider locale={locale}>
            <DatePicker
              placeholder="Seleccionar fecha"
              style={{ width: isMobile ? "100%" : "200px" }}
              value={dateSelected}
              onChange={setDateSelected}
              disabled={!activate}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              format="DD/MM/YYYY"
            />
          </ConfigProvider>
        </Flex>
      </Card>

      {/* Contenedor de gráficos con tabs */}
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
          <ContainerDays data={data} />
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <CalendarOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
            <Title level={4} style={{ color: "#bfbfbf", marginTop: "16px" }}>
              {dateIsSelected
                ? "No se encontraron datos para la fecha seleccionada."
                : "Por favor, selecciona una fecha para visualizar los datos."}
            </Title>
          </div>
        )
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <CalendarOutlined
            style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
          />
          <div style={{ fontSize: 18, color: "#999", marginBottom: 8 }}>
            Módulo DGA Análisis no disponible
          </div>
          <p style={{ color: "#666" }}>
            Contacta a soporte para activar esta funcionalidad en tu punto de
            captación.
          </p>
        </div>
      )}
    </div>
  );
};

export default GraphisNavDga;
