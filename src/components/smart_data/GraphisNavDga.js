import React, { useState, useContext, useEffect } from "react";
import { DatePicker, Button, Flex, ConfigProvider, Card } from "antd";
import { BarChartOutlined, CalendarOutlined } from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import ContainerDays from "./dga/days/Container";
import ContainerMonth from "./dga/month/Container";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";

// Configurar dayjs para español
dayjs.locale("es");

/**
 * 📊 DGA ANÁLISIS RESPONSIVO
 *
 * Estructura:
 * - Solo Fecha y Botón Analizar
 * - Tabs con gráficos abajo (estilo azul, headers blancos)
 * - Sin Card wrapper, sin gradientes
 */
const GraphisNavDga = () => {
  // 📱 Detectar móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Estados principales - solo diario por defecto
  const [dateSelected, setDateSelected] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  // Estados de datos
  const { state } = useContext(AppContext);
  const [data, setData] = useState(state.selected_profile.modules.m2);

  const activate = state.selected_profile.profile_ikolu.m2;

  // Detectar cambios de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Obtener datos - solo diario
  const getData = async () => {
    const response = await sh
      .get_data_day(state.selected_profile.id, dateSelected, dateSelected)
      .then((response) => {
        setData(response || []);
      });
  };

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
              placeholder="Fecha"
              style={{ width: isMobile ? "100%" : "200px" }}
              value={dateSelected ? dayjs(dateSelected) : null}
              onChange={(date) => {
                if (date) {
                  setDateSelected(date.format("YYYY-MM-DD"));
                }
              }}
              disabled={!activate}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              format="DD/MM/YYYY"
            />
          </ConfigProvider>

          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={getData}
            disabled={!activate}
            style={{
              width: isMobile ? "100%" : "auto",
              background: "#1F3461",
              borderColor: "#1F3461",
            }}
          >
            Analizar
          </Button>
        </Flex>
      </Card>

      {/* Contenedor de gráficos con tabs */}
      {activate ? (
        <ContainerDays data={data} />
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
