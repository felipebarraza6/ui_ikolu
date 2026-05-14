import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import {
  Row,
  Col,
  Typography,
  Statistic,
  Card,
  Flex,
  Table,
  Drawer,
  Button,
  Tooltip,
  Alert,
  Skeleton,
  Tag,
} from "antd";
import {
  ClockCircleOutlined,
  DatabaseOutlined,
  IdcardOutlined,
  ToolOutlined,
  AimOutlined,
  ExpandOutlined,
  CalculatorOutlined,
  ArrowDownOutlined,
  TableOutlined,
  CloseOutlined,
  RiseOutlined,
  CalendarOutlined,
  LoadingOutlined,
  DownloadOutlined,
  SettingOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WifiOutlined,
  InfoCircleOutlined,
  FallOutlined,
  DashboardOutlined,
  ColumnHeightOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import { useTours } from "../../contexts/TourContext";
import ModuleTour from "../common/ModuleTour";
import { getTelemetryTour } from "../../config/tours";
import QueueAnim from "rc-queue-anim";
import MyLastRegisters from "./MyLastRegisters";
import sh from "../../api/sh/endpoints";
import Well from "./Well";
import { formatInteger, formatFlow } from "../../utils/numberFormatter";
import { parseSafeDate, formatSafeDate } from "../../utils/dateFormatter";
import { useDataValidation } from "../geo_smart/hooks/useDataValidation";
import { useResponsive } from "../../hooks/useResponsive";
import moment from "moment";
import "moment/locale/es";
const { Countdown } = Statistic;
const { Text } = Typography;

moment.locale("es");

const numberForMiles = new Intl.NumberFormat("de-DE");

// --- Utilidades de validación ---
// Valida que un valor numérico sea válido y esté en un rango razonable
const validateNumericValue = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
};

// Calcula el porcentaje de cambio entre dos valores
const calculateChangePercent = (current, previous) => {
  if (!previous || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return change;
};

// --- Fila de información para la Ficha Técnica ---
const TechInfoRow = ({ icon, label, value, loading = false }) => (
  <Flex
    justify="space-between"
    align="center"
    style={{ padding: "4px 2px", borderBottom: "1px solid #f0f0f0" }}
  >
    <Flex align="center" gap="small">
      {icon}
      <Text type="secondary" style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Flex>
    <div style={{ minWidth: 50, height: 14, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      {loading ? (
        <Skeleton.Input active size="small" style={{ width: 50, height: 14 }} />
      ) : (
        <Text strong style={{ fontSize: 12, lineHeight: "16px" }}>
          {value}
        </Text>
      )}
    </div>
  </Flex>
);

// Fila minimal sin icono, con tooltip
const TechItem = ({ label, value, tooltip, loading = false }) => (
  <Tooltip title={tooltip}>
    <Flex
      justify="space-between"
      align="center"
      style={{ padding: "4px 2px", borderBottom: "1px solid #f0f0f0", minHeight: 26 }}
    >
      <Text type="secondary" style={{ fontSize: 11 }}>
        {label}
      </Text>
      <div style={{ minWidth: 45, height: 16, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        {loading ? (
          <Skeleton.Input active size="small" style={{ width: 45, height: 14 }} />
        ) : (
          <Text strong style={{ fontSize: 12, lineHeight: "16px" }}>
            {value}
          </Text>
        )}
      </div>
    </Flex>
  </Tooltip>
);

// Badge de estado activo/inactivo
const StatusBadge = ({ active }) => (
  <Flex align="center" gap={4}>
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: active ? "#52c41a" : "#ff4d4f",
        boxShadow: `0 0 4px ${active ? "#52c41a" : "#ff4d4f"}`,
      }}
    />
    <Text strong style={{ fontSize: 12, color: active ? "#52c41a" : "#ff4d4f" }}>
      {active ? "Activo" : "Inactivo"}
    </Text>
  </Flex>
);

const SectionTitle = ({ children, tooltip }) => (
  <Flex align="center" gap={4} style={{ marginTop: "4px", marginBottom: "2px", paddingLeft: "2px" }}>
    <Text
      style={{
        display: "block",
        color: "rgb(31, 52, 97)",
        fontWeight: 500,
        fontSize: 11,
      }}
      strong
    >
      <u>{children}</u>
    </Text>
    {tooltip && (
      <Tooltip title={tooltip}>
        <InfoCircleOutlined style={{ fontSize: 10, color: "#999" }} />
      </Tooltip>
    )}
  </Flex>
);

// --- Componente para Stats de Consumos y Timer en una fila ---
const ConsumptionStats = ({
  acumDia,
  acumAyer,
  loading,
  deadline,
  onRefresh,
  vars = [],
}) => {
  // Logic: Show volume if Totalizado is configured (Same as Card)
  const showVolume = vars.some((v) => v.type_variable?.includes("TOTALIZADO"));

  // Validar y formatear valores
  const validHoy = validateNumericValue(acumDia, 0);
  const validAyer = validateNumericValue(acumAyer, 0);
  const changePercent = calculateChangePercent(validHoy, validAyer);
  const isIncrease = changePercent !== null && changePercent > 0;
  const isDecrease = changePercent !== null && changePercent < 0;

  return (
    <div
      style={{
      width: "100%", 
      padding: "12px 16px", 
      background: "rgba(255, 255, 255, 0.4)", 
      backdropFilter: "blur(5px)", 
      borderRadius: "12px", 
      border: "1px solid rgba(255, 255, 255, 0.5)",
      marginTop: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      <Flex gap="middle" wrap="wrap" justify="space-between" align="center">
        {showVolume && (
          <>
        {/* Consumo Hoy */}
        <Tooltip title="Consumo acumulado del día de hoy">
          <Flex
            vertical
            align="center"
            gap={2}
            style={{ flex: 1, minWidth: "70px" }}
          >
            <Flex align="center" gap={4}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#8c8c8c",
                      textTransform: "uppercase",
                    }}
                  >
                Hoy
              </Text>
              {changePercent !== null && (
                <Flex align="center" gap={2}>
                  {isIncrease ? (
                        <ArrowUpOutlined
                          style={{ fontSize: 10, color: "#faad14" }}
                        />
                  ) : (
                        <ArrowDownOutlined
                          style={{ fontSize: 10, color: "#52c41a" }}
                        />
                  )}
                      <Text
                        style={{
                          fontSize: 10,
                          color: isIncrease ? "#faad14" : "#52c41a",
                          fontWeight: 800,
                        }}
                      >
                    {Math.abs(changePercent).toFixed(1)}%
                  </Text>
                </Flex>
              )}
            </Flex>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 900,
                lineHeight: 1,
                color: loading ? "#bfbfbf" : "#52c41a",
                transition: "color 0.25s ease",
              }}
            >
              {loading ? "—" : <>{validHoy !== null ? `${validHoy}` : "0"}{" "}<span style={{ fontSize: 10, fontWeight: 600 }}>m³</span></>}
            </Text>
          </Flex>
        </Tooltip>

            <div
              style={{
                width: "1px",
                height: "30px",
                background: "rgba(0,0,0,0.05)",
              }}
            ></div>

        {/* Consumo Ayer */}
        <Tooltip title="Consumo acumulado del día anterior">
          <Flex
            vertical
            align="center"
            gap={2}
            style={{ flex: 1, minWidth: "70px" }}
          >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#8c8c8c",
                    textTransform: "uppercase",
                  }}
                >
              Ayer
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 900,
                lineHeight: 1,
                color: loading ? "#bfbfbf" : "#faad14",
                transition: "color 0.25s ease",
              }}
            >
              {loading ? "—" : <>{validAyer !== null ? `${validAyer}` : "0"}{" "}<span style={{ fontSize: 10, fontWeight: 600 }}>m³</span></>}
            </Text>
          </Flex>
        </Tooltip>

            <div
              style={{
                width: "1px",
                height: "30px",
                background: "rgba(0,0,0,0.05)",
              }}
            ></div>
          </>
        )}

        {/* Timer */}
        <Tooltip
          title={
            deadline ? "Tiempo hasta la próxima medición" : "No configurado"
          }
        >
          <Flex
            vertical
            align="center"
            gap={2}
            style={{ flex: 1, minWidth: "90px" }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#8c8c8c",
                textTransform: "uppercase",
              }}
            >
              Refresco
            </Text>
            {loading ? (
              <Text style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, color: "#bfbfbf" }}>—</Text>
            ) : deadline ? (
              <Countdown
                value={deadline}
                format="mm:ss"
                valueStyle={{
                  color: "#1F3461",
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
                onFinish={onRefresh}
              />
            ) : (
              <Text style={{ fontSize: 14, color: "#bfbfbf", fontWeight: 700 }}>
                N/A
              </Text>
            )}
          </Flex>
        </Tooltip>
      </Flex>
    </div>
  );
};

// --- Componente compartido para mostrar Variables Configuradas ---
const ConfiguredVariables = ({ variables, loading = false }) => {
  const typeLabels = {
    CAUDAL_PROMEDIO: "Caudal Promedio",
    CAUDAL: "Caudal",
    NIVEL: "Nivel",
    TOTALIZADO: "Totalizado",
  };

  // Un solo tono para todos los tags — más armónico
  const tagStyle = {
    fontSize: 9,
    margin: 0,
    padding: "0 8px",
    lineHeight: "18px",
    borderRadius: 4,
    background: "#f0f5ff",
    color: "#1F3461",
    border: "1px solid #d6e4ff",
    fontWeight: 600,
  };

  const renderTypeIcon = (type) => {
    const style = { fontSize: 14, color: "#1F3461" };
    if (type?.includes("CAUDAL")) return <DashboardOutlined style={style} />;
    if (type?.includes("NIVEL")) return <ColumnHeightOutlined style={style} />;
    if (type?.includes("TOTALIZADO")) return <DatabaseOutlined style={style} />;
    return <SettingOutlined style={style} />;
  };

  if (!loading && (!variables || variables.length === 0)) return null;

  return (
    <div>
      <Flex align="center" gap="small" style={{ marginBottom: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #1F3461 0%, #1890ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SettingOutlined style={{ color: "white", fontSize: 14 }} />
        </div>
        <Text strong style={{ fontSize: 13, color: "#1F3461" }}>
          Variables Configuradas
        </Text>
      </Flex>

      {loading ? (
        <Flex vertical gap={8}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid #f0f0f0",
              }}
            >
              <Skeleton active paragraph={false} title={{ width: "80%" }} />
            </div>
          ))}
        </Flex>
      ) : (
        <Flex vertical gap={8}>
          {variables.map((variable, index) => (
            <div
              key={variable.id || index}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#ffffff",
                border: "1px solid #f0f0f0",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "#e6e6e6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#f0f0f0";
              }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                <Flex align="center" gap={8}>
                  {renderTypeIcon(variable.type_variable)}
                  <Text strong style={{ fontSize: 12, color: "#1F3461" }}>
                    {variable.label || "Sin Etiqueta"}
                  </Text>
                </Flex>
                <span style={tagStyle}>
                  {typeLabels[variable.type_variable] || variable.type_variable}
                </span>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text style={{ fontSize: 10, color: "#8c8c8c", fontWeight: 500 }}>
                  {variable.str_variable || `Var ${variable.id}`}
                </Text>
                <Flex gap="small" wrap="wrap">
                  {variable.type_variable === "TOTALIZADO" && (
                    <Text style={{ fontSize: 10, color: "#595959" }}>
                      {variable.pulses_factor ? `${numberForMiles.format(variable.pulses_factor)} Lt/p · ` : ""}
                      Adic: {numberForMiles.format(variable.addition || 0)}
                    </Text>
                  )}
                  {variable.type_variable === "NIVEL" && variable.calculate_nivel !== null && variable.calculate_nivel !== undefined && (
                    <Text style={{ fontSize: 10, color: "#595959" }}>
                      Base: {variable.calculate_nivel}
                    </Text>
                  )}
                  {variable.type_variable === "CAUDAL" && (
                    <Text style={{ fontSize: 10, color: "#595959" }}>
                      Conv: {variable.convert_to_lt ? "Sí" : "No"}
                    </Text>
                  )}
                </Flex>
              </Flex>
            </div>
          ))}
        </Flex>
      )}
    </div>
  );
};

// --- Componente para contenido de Ficha Técnica (sin Card wrapper) ---
const TechnicalSheetContent = ({ profile, loading = false }) => {
  const config_data = profile?.config_data ?? {};
  const dga = profile?.dga ?? {};
  const title = profile?.title ?? "N/A";

  if (!profile) return null;

  return (
    <div style={{ padding: "0 4px" }}>
      {/* Posicionamientos + Diámetros combinados */}
      <SectionTitle tooltip="Posicionamientos y diámetros del pozo">Posicionamientos / Diámetros</SectionTitle>
      <Row gutter={[8, 0]}>
        <Col span={12}>
          <TechItem
            label="Bomba"
            value={`${parseFloat(config_data.d2 || 0).toFixed(2)} m`}
            tooltip="Posicionamiento de bomba"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Nivel"
            value={`${parseFloat(config_data.d3 || 0).toFixed(2)} m`}
            tooltip="Posicionamiento de sensor de nivel"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Ducto"
            value={`${parseFloat(config_data.d4 || 0).toFixed(2)} pulg`}
            tooltip="Diámetro ducto de salida bomba"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Flujómetro"
            value={`${parseFloat(config_data.d5 || 0).toFixed(2)} pulg`}
            tooltip="Diámetro flujómetro"
            loading={loading}
          />
        </Col>
      </Row>

      <div style={{ marginTop: 10 }} />

      {/* Totalizador + Datalogger combinados */}
      <SectionTitle tooltip="Totalizador y estado del datalogger">Totalizador / Datalogger</SectionTitle>
      <Row gutter={[8, 0]}>
        <Col span={12}>
          <TechItem
            label="m³ Inic."
            value={`${numberForMiles.format(config_data.d6 || 0)}`}
            tooltip="Metros cúbicos iniciales del totalizador"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Estado"
            value={<StatusBadge active={config_data.is_telemetry} />}
            tooltip="Estado de telemetría del datalogger"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Frec."
            value={profile?.frecuency ? `${profile.frecuency} min` : "N/D"}
            tooltip="Frecuencia de medición"
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <TechItem
            label="Inicio"
            value={config_data.date_start_telemetry || "N/A"}
            tooltip="Fecha de inicio del monitoreo"
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  );
};

// --- Componente de Ficha Técnica (sin tabs) ---
const TechnicalSheetWithTabs = ({ profile, loading = false }) => {
  if (!profile && !loading) return null;

  return (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        height: "100%",
        border: "1px solid #f0f0f0",
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header moderno de la ficha */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #f0f0f0",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
          <Flex align="center" gap={10}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #1F3461 0%, #1890ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(24, 144, 255, 0.25)",
              }}
            >
              <IdcardOutlined style={{ color: "white", fontSize: 16 }} />
            </div>
            <Flex vertical gap={2}>
              <Text strong style={{ fontSize: 15, color: "#1F3461", lineHeight: 1.2 }}>
                {loading ? <Skeleton.Input active size="small" style={{ width: 120, height: 16 }} /> : (profile?.title || "Punto de captación")}
              </Text>
              <Flex align="center" gap={4}>
                <ArrowDownOutlined style={{ fontSize: 10, color: "#1F3461" }} />
                <Text style={{ fontSize: 11, color: "#1F3461", fontWeight: 600 }}>
                  {loading ? <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} /> : `${parseFloat(profile?.config_data?.d1 || 0).toFixed(2)} m de profundidad`}
                </Text>
              </Flex>
            </Flex>
          </Flex>

          {/* DGA al lado del nombre */}
          {profile?.dga?.code_dga && (
            <Tooltip title="Código único de registro en DGA">
              <Flex align="center" gap={6} style={{ background: "#f0f2f5", padding: "4px 10px", borderRadius: 6 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 2,
                    display: "flex",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ flex: 1, background: "#D52B1E" }} />
                  <div style={{ flex: 1, background: "#0039A6" }} />
                </div>
                <Text copyable style={{ fontSize: 12, color: "#1F3461", fontWeight: 700 }}>
                  {profile.dga.code_dga}
                </Text>
              </Flex>
            </Tooltip>
          )}
        </Flex>
      </div>

      <div style={{ padding: "12px 16px 16px" }}>
        <TechnicalSheetContent profile={profile} loading={loading} />
      </div>
    </Card>
  );
};

// --- Componente para Tarjetas de Métricas ---
const MetricCard = ({
  title,
  value,
  unit,
  icon,
  loading = false,
  extraInfo,
  helpText,
  syncStatus,
  variation,
  variationUnit,
  variationDecimals = 1,
  footer,
}) => {
  return (
    <Card
      hoverable
      className="metric-card-hover"
      style={{
        marginBottom: "6px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 50, 150, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        overflow: "hidden",
        position: "relative",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
      }}
      bodyStyle={{ padding: "10px 14px", zIndex: 1, position: "relative" }}
      aria-label={`Métrica ${title}: ${value} ${unit}`}
    >
      {/* Header with left-aligned icon */}
      <Flex align="center" gap="small" style={{ marginBottom: 8 }}>
        <div
          style={{
            position: "relative",
            zIndex: 2,
          background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)", 
          padding: 6, 
          borderRadius: 8, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, {
            style: { fontSize: 15, color: "#1890ff" },
          })}
        </div>
        <Flex
          vertical
          gap={2}
          style={{ flex: 1, position: "relative", zIndex: 2 }}
        >
          <Flex align="center" gap={4}>
            <Text
              strong
              style={{
                fontSize: 10,
                color: "#1F3461",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Text>
            {helpText && (
              <Tooltip title={helpText}>
                <InfoCircleOutlined
                  style={{ fontSize: 10, color: "#999", cursor: "help" }}
                />
              </Tooltip>
            )}
          </Flex>
          {variation !== undefined &&
            variation !== null &&
            Math.abs(variation) > 0.1 && (
            <Flex align="center" gap={3}>
                {variation > 0 ? (
                  <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} />
                ) : (
                <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />
                )}
              <Text 
                style={{ 
                  fontWeight: 700, 
                  fontSize: 9,
                  color: variation > 0 ? "#52c41a" : "#ff4d4f",
                }}
              >
                  {variation > 0 ? "+" : ""}
                  {variationUnit
                    ? `${Math.abs(variation).toFixed(variationDecimals)} ${variationUnit}`
                    : `${variation.toFixed(variationDecimals)}%`}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      
      {/* Value section */}
      {loading ? (
        <div style={{ padding: "4px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div className="ikolu-shimmer-circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="ikolu-shimmer" style={{ width: "45%", height: 10, marginBottom: 6 }} />
              <div className="ikolu-shimmer" style={{ width: "65%", height: 18 }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 2 }}>
          <Flex align="baseline" gap={4} style={{ marginBottom: 6 }} justify="space-between">
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#1F3461",
                lineHeight: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#597ef7" }}>
              {unit}
            </div>
          </Flex>

          {extraInfo && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#8c8c8c",
                marginTop: 8,
                fontStyle: "italic",
                opacity: 0.8,
              }}
            >
              {extraInfo}
            </div>
          )}
          {syncStatus && (
            <div style={{ marginTop: 8 }}>
              <Tooltip title={syncStatus.status}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    backgroundColor: `${syncStatus.color}15`,
                    border: `1px solid ${syncStatus.color}40`,
                    boxShadow: `0 2px 4px ${syncStatus.color}10`,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: syncStatus.color,
                      boxShadow: `0 0 5px ${syncStatus.color}`,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: syncStatus.color,
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    {syncStatus.status}
                  </Text>
                </div>
              </Tooltip>
            </div>
          )}
          {footer && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
              {footer}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const MyWell = () => {
  const { state, dispatch } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const vars = state.selected_profile?.config_data?.variables || [];
  const [loading, setLoading] = useState(true);
  const [nivel, setNivel] = useState(0);
  const [waterTable, setWaterTable] = useState(0);
  const [caudal, setCaudal] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [acumDia, setAcumDia] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);
  const [lastLogger, setLastLogger] = useState(null);
  const [acumAyer, setAcumAyer] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Variaciones calculadas directamente desde los datos (más robusto que useEffect)
  // Busca hacia atrás el primer registro anterior con dato válido para cada variable
  const { varCaudal, varNivel, varWaterTable, varAcumAbs } = useMemo(() => {
    const today = state.selected_profile?.modules?.today || [];
    if (today.length < 2) {
      return { varCaudal: null, varNivel: null, varWaterTable: null, varAcumAbs: null };
    }

    const current = today[0];

    // Buscar registros anteriores con datos válidos
    let prevFlow = null;
    let prevNivel = null;
    let prevWaterTable = null;
    let prevTotal = null;

    for (let i = 1; i < today.length; i++) {
      if (prevFlow === null && today[i].flow != null && !isNaN(parseFloat(today[i].flow))) {
        prevFlow = today[i];
      }
      if (prevNivel === null && today[i].nivel != null && !isNaN(parseFloat(today[i].nivel))) {
        prevNivel = today[i];
      }
      if (prevWaterTable === null && today[i].water_table != null && !isNaN(parseFloat(today[i].water_table))) {
        prevWaterTable = today[i];
      }
      if (prevTotal === null && today[i].total != null && !isNaN(parseFloat(today[i].total))) {
        prevTotal = today[i];
      }
      if (prevFlow && prevNivel && prevWaterTable && prevTotal) break;
    }

    // Caudal
    let vc = null;
    if (prevFlow && parseFloat(prevFlow.flow) > 0) {
      vc = ((parseFloat(current.flow) - parseFloat(prevFlow.flow)) / parseFloat(prevFlow.flow)) * 100;
    }

    // Nivel de Agua
    let vn = null;
    const currNivel = parseFloat(current.nivel);
    const pNivel = prevNivel ? parseFloat(prevNivel.nivel) : NaN;
    if (!isNaN(pNivel) && !isNaN(currNivel)) {
      if (pNivel !== 0) {
        vn = ((currNivel - pNivel) / Math.abs(pNivel)) * 100;
      } else if (currNivel !== 0) {
        vn = currNivel > 0 ? 100 : -100;
      } else {
        vn = 0;
      }
    }

    // Nivel Freático
    let vw = null;
    const currWT = parseFloat(current.water_table);
    const pWT = prevWaterTable ? parseFloat(prevWaterTable.water_table) : NaN;
    if (!isNaN(pWT) && !isNaN(currWT)) {
      if (pWT !== 0) {
        vw = ((currWT - pWT) / Math.abs(pWT)) * 100;
      } else if (currWT !== 0) {
        vw = currWT > 0 ? 100 : -100;
      } else {
        vw = 0;
      }
    }

    // Acumulado (variación absoluta)
    const currentTotal = parseFloat(current.total) || 0;
    const previousTotal = prevTotal ? parseFloat(prevTotal.total) : 0;
    const va = currentTotal - previousTotal;

    return { varCaudal: vc, varNivel: vn, varWaterTable: vw, varAcumAbs: va };
  }, [state.selected_profile?.modules?.today]);
  const [lastRegisters, setLastRegisters] = useState([]);
  const { startTour } = useTours();
  const intervalRef = useRef(null);
  const validators = useDataValidation();

  // Función auxiliar para obtener el registro más reciente
  const getLatest = (profile) => {
    if (!profile) return null;
    const m1 = profile.modules?.m1;
    const today = profile.modules?.today || [];
    const yesterday = profile.modules?.yesterday || [];
    
    const candidates = [];
    if (m1 && m1.date_time_medition) candidates.push(m1);
    if (today.length > 0) candidates.push(today[today.length - 1]);
    if (yesterday.length > 0) candidates.push(yesterday[yesterday.length - 1]);
    
    if (candidates.length === 0) return m1 || null;

    return candidates.sort((a, b) => {
      const dateA = parseSafeDate(a.date_time_medition);
      const dateB = parseSafeDate(b.date_time_medition);
      return dateB.valueOf() - dateA.valueOf();
    })[0];
  };

  // useEffect simplificado: solo carga telemetría, NO el perfil completo
  // (PointDetailGuard ya se encarga de cargar el perfil)
  useEffect(() => {
    const fetchTelemetryData = async () => {
      if (!state.selected_profile?.id) return;

      setLoading(true);

      try {
        const profileId = state.selected_profile.id;
        await sh.get_data_sh(profileId);

        const modules = state.selected_profile?.modules ?? {};
        const m1 = modules.m1;
        const frecuency = state.selected_profile?.frecuency ?? 0;
        const total_consumed_yesterday =
          state.selected_profile?.modules?.total_consumed_yesterday ?? 0;

        const latestRecord = getLatest(state.selected_profile) || m1;

        if (m1) {
          setLastCaption(
            latestRecord?.date_time_medition ?? m1.date_time_medition ?? null
          );
          setLastLogger(
            latestRecord?.date_time_last_logger ??
              m1.date_time_last_logger ??
              null
          );
          setAcumDia(
            state.selected_profile?.modules?.total_consumed_today || 0
          );
          setNivel(parseFloat(m1.nivel) || 0);
          setWaterTable(parseFloat(m1.water_table) || 0);
          setCaudal(m1.flow || 0);
          setAcumulado(m1.total || 0);
          const today = state.selected_profile?.modules?.today || [];
          // ⚠️ today viene ordenado del MÁS RECIENTE al MÁS ANTIGUO
          if (today.length >= 2) {
            const current = today[0];   // más reciente
            const previous = today[1];  // medición anterior
            
            // Las variaciones se calculan automáticamente vía useMemo arriba
          }
        }

        setLastRegisters(modules.today || []);
        setAcumAyer(total_consumed_yesterday);

        if (frecuency > 0) {
          const now = new Date();
          const minutesUntilNext = frecuency - (now.getMinutes() % frecuency);
          const nextDeadline = new Date(
            now.getTime() + minutesUntilNext * 60000
          );
          nextDeadline.setSeconds(0);
          nextDeadline.setMilliseconds(0);
          setDeadline(nextDeadline);
        }
      } catch (error) {
        console.error("Error fetching telemetry data in MyWell:", error);
        setError(
          "Error al cargar datos de telemetría. Por favor, intente nuevamente."
        );
      } finally {
        setLoading(false);
        setLastUpdateTime(new Date());
      }
    };

    const clearExistingInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (state.selected_profile?.id) {
      fetchTelemetryData();

      clearExistingInterval();
      intervalRef.current = setInterval(() => {
        if (state.selected_profile?.id) {
          fetchTelemetryData();
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      clearExistingInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selected_profile?.id]);

  const formatDate = (date) => {
    if (!date) return { date: "N/A", time: "" };
    // Usar parseSafeDate para manejar correctamente los timezones y formatos ISO
    const m = parseSafeDate(date);
    if (!m.isValid()) {
      // Fallback a new Date si parseSafeDate falla
    const d = new Date(date);
      if (isNaN(d.getTime())) return { date: "N/A", time: "" };
    const datePart = d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
      // Mostrar hora completa con minutos (HH:mm) en lugar de solo HH:00
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const timePart = `${hours}:${minutes} hrs`;
      return { date: datePart, time: timePart };
    }
    // Usar moment para formatear correctamente respetando el timezone original
    // Mostrar fecha completa y hora completa con minutos
    const datePart = m.format("DD/MM/YYYY");
    const timePart = `${m.format("HH:mm")} hrs`; // HH:mm en lugar de solo HH:00
    return { date: datePart, time: timePart };
  };

  // Calcula la diferencia en horas entre la medición y el logger
  // Retorna el estado de sincronización con las horas, minutos y segundos de diferencia
  const getSyncStatus = (meditionDate, loggerDate) => {
    if (!meditionDate || !loggerDate) return null;

    try {
      // Usar parseSafeDate para manejar correctamente los timezones
      const medition = parseSafeDate(meditionDate);
      const logger = parseSafeDate(loggerDate);

      if (!medition.isValid() || !logger.isValid()) return null;

      const diffMs = Math.abs(medition.valueOf() - logger.valueOf());
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (diffHours < 1) {
        // Cuando está sincronizado, mostrar también los segundos de diferencia
        const minutesText = diffMinutes > 0 ? `${diffMinutes}m` : "";
        const secondsText = diffSeconds > 0 ? ` ${diffSeconds}s` : "";
        const timeText = (minutesText + secondsText).trim() || "0s";
        return {
          color: "#52c41a",
          status: `Sincronizado: ${timeText}`,
          diffHours: 0,
          diffMinutes: diffMinutes,
          diffSeconds: diffSeconds,
        }; // Verde
      } else if (diffHours < 12) {
        // Mostrar horas, minutos y segundos de desincronización
        const hoursText = diffHours >= 1 ? `${Math.floor(diffHours)}h` : "";
        const minutesText = diffMinutes > 0 ? ` ${diffMinutes}m` : "";
        const secondsText = diffSeconds > 0 ? ` ${diffSeconds}s` : "";
        return {
          color: "#fa8c16",
          status:
            `Desincronización leve: ${hoursText}${minutesText}${secondsText}`.trim(),
          diffHours: Math.floor(diffHours),
          diffMinutes: diffMinutes,
          diffSeconds: diffSeconds,
        }; // Naranja
      } else {
        // Mostrar horas, minutos y segundos de desincronización
        const hoursText = diffHours >= 1 ? `${Math.floor(diffHours)}h` : "";
        const minutesText = diffMinutes > 0 ? ` ${diffMinutes}m` : "";
        const secondsText = diffSeconds > 0 ? ` ${diffSeconds}s` : "";
        return {
          color: "#ff4d4f",
          status:
            `Problemas de sincronización: ${hoursText}${minutesText}${secondsText}`.trim(),
          diffHours: Math.floor(diffHours),
          diffMinutes: diffMinutes,
          diffSeconds: diffSeconds,
        }; // Rojo
      }
    } catch (error) {
      return null;
    }
  };

  // Función para refrescar datos manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const profileId = state.selected_profile?.id;
      if (!profileId) return;

      // Obtener el perfil completo actualizado para sincronizar todo el estado global
      const updatedProfile = await sh.getPointDetail(profileId);
      if (updatedProfile) {
        dispatch({
          type: "SET_SELECTED_PROFILE_DETAIL",
          payload: { selected_profile: updatedProfile },
        });
      }

      // Usar los datos actualizados del perfil (o del estado global ya actualizado)
      const profile = updatedProfile || state.selected_profile;
      const modules = profile?.modules ?? {};
      const m1 = modules.m1;
      const frecuency = profile?.frecuency ?? 0;
      const total_consumed_yesterday = modules?.total_consumed_yesterday ?? 0;

      // Obtener el registro más reciente para asegurar que mostramos la fecha/hora correcta
      const latestRecord = getLatest(profile) || m1;

      // Para las tarjetas usar m1 para los valores, pero latestRecord para la fecha del último registro
      if (m1) {
        // Usar latestRecord para la fecha porque es el más reciente entre m1, today y yesterday
        setLastCaption(
          latestRecord?.date_time_medition ?? m1.date_time_medition ?? null
        );
        setLastLogger(
          latestRecord?.date_time_last_logger ??
            m1.date_time_last_logger ??
            null
        );
        setAcumDia(m1.total_today_diff || 0);
        // nivel = Nivel del agua
        setNivel(parseFloat(m1.nivel) || 0);
        // water_table = Nivel Freático
        setWaterTable(parseFloat(m1.water_table) || 0);
        setCaudal(m1.flow || 0);
        setAcumulado(m1.total || 0);
      }

      if (modules?.today) {
        setLastRegisters(modules.today);
      }

      setAcumAyer(total_consumed_yesterday);

      if (frecuency > 0) {
        const now = new Date();
        const minutesUntilNext = frecuency - (now.getMinutes() % frecuency);
        setDeadline(new Date(now.getTime() + minutesUntilNext * 60000));
      }

      setLastUpdateTime(new Date());
      setError(null);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Error al actualizar datos. Por favor, intente nuevamente.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Formatea el tiempo transcurrido desde la última actualización
  const formatLastUpdate = () => {
    if (!lastUpdateTime) return "Nunca";
    const now = new Date();
    const diffMs = now - lastUpdateTime;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Hace menos de un minuto";
    if (diffMins === 1) return "Hace 1 minuto";
    return `Hace ${diffMins} minutos`;
  };

  if (isMobile) {
    // --- VISTA MÓVIL ---
    return (
      <div>
        {/* Error si existe */}
        {error && (
          <Alert
            message={error}
            type="error"
            icon={<ExclamationCircleOutlined />}
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}
        <Row gutter={[8, 8]}>
          {/* 1. Último Registro - primero para saber que estamos leyendo */}
          <Col span={24}>
            <MetricCard
              title="Último Registro"
              value={lastCaption ? formatDate(lastCaption).date : "N/A"}
              unit={lastCaption ? formatDate(lastCaption).time : ""}
              icon={<ClockCircleOutlined style={{ color: "#1F3461" }} />}
              loading={loading}
              helpText="Fecha y hora de la última medición registrada. El Logger muestra el último registro que tenía el datalogger al momento de esa medición."
              extraInfo={
                lastLogger
                  ? `Logger: ${formatDate(lastLogger).date} ${
                      formatDate(lastLogger).time
                    }`
                  : null
              }
              syncStatus={getSyncStatus(lastCaption, lastLogger)}
            />
          </Col>

          {vars.some((v) => v.type_variable?.includes("CAUDAL")) && (
            <Col span={24}>
              <MetricCard
                title={
                  vars.find((v) => v.type_variable?.includes("CAUDAL"))
                    ?.label || "Caudal"
                }
                value={(parseFloat(caudal) || 0).toFixed(2)}
                unit="L/s"
                icon={<DashboardOutlined />}
                loading={loading}
                variation={varCaudal}
                helpText="Caudal instantáneo de agua medido en litros por segundo"
              />
            </Col>
          )}

          {/* Nivel de Agua + Nivel Freático combinados */}
          {(vars.some((v) => v.type_variable?.includes("NIVEL")) ||
            vars.some((v) =>
              v.type_variable?.includes("FEATICO") ||
              v.type_variable?.includes("FREÁTICO")
            )) && (
            <Col span={24}>
              <Card
                hoverable
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0, 50, 150, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  overflow: "hidden",
                  position: "relative",
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                }}
                bodyStyle={{ padding: "12px 16px", zIndex: 1, position: "relative" }}
              >
                {loading ? (
                  <Row gutter={[16, 16]} align="middle">
                    <Col span={12}>
                      <Flex vertical gap={6}>
                        <Flex align="center" gap="small">
                          <div className="ikolu-shimmer-circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
                          <div className="ikolu-shimmer" style={{ width: 80, height: 12 }} />
                        </Flex>
                        <div className="ikolu-shimmer" style={{ width: "70%", height: 22, marginLeft: 36 }} />
                      </Flex>
                    </Col>
                    <Col span={12}>
                      <Flex vertical gap={6}>
                        <Flex align="center" gap="small">
                          <div className="ikolu-shimmer-circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
                          <div className="ikolu-shimmer" style={{ width: 90, height: 12 }} />
                        </Flex>
                        <div className="ikolu-shimmer" style={{ width: "70%", height: 22, marginLeft: 36 }} />
                      </Flex>
                    </Col>
                  </Row>
                ) : (
                  <Row gutter={[16, 16]} align="middle">
                    {vars.some((v) => v.type_variable?.includes("NIVEL")) && (
                      <Col span={12}>
                        <Flex vertical gap={4}>
                          <Flex align="center" gap="small">
                            <div
                              style={{
                                background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
                                padding: 6,
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <ColumnHeightOutlined style={{ fontSize: 16, color: "#1890ff" }} />
                            </div>
                            <Text strong style={{ fontSize: 11, color: "#1F3461" }}>
                              Nivel de Agua
                            </Text>
                          </Flex>
                          <Flex align="baseline" gap={4} justify="space-between">
                            <Text strong style={{ fontSize: 18, color: "#1F3461" }}>
                              {(parseFloat(nivel) || 0).toFixed(2)}
                            </Text>
                            <Text style={{ fontSize: 11, color: "#597ef7", fontWeight: 700 }}>
                              m
                            </Text>
                          </Flex>
                          {varNivel !== null && (
                            <Flex align="center" gap={4} justify="flex-end">
                              {varNivel > 0 ? (
                                <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} />
                              ) : (
                                <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />
                              )}
                              <Text style={{ fontSize: 10, color: varNivel > 0 ? "#52c41a" : "#ff4d4f", fontWeight: 700 }}>
                                {varNivel > 0 ? "+" : ""}{varNivel.toFixed(1)}%
                              </Text>
                            </Flex>
                          )}
                        </Flex>
                      </Col>
                    )}
                    {(vars.some((v) =>
                      v.type_variable?.includes("FEATICO") ||
                      v.type_variable?.includes("FREÁTICO")
                    ) ||
                      vars.some((v) => v.type_variable?.includes("NIVEL"))) && (
                      <Col span={12}>
                        <Flex vertical gap={4}>
                          <Flex align="center" gap="small">
                            <div
                              style={{
                                background: "linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)",
                                padding: 6,
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <ArrowDownOutlined style={{ fontSize: 16, color: "#fa8c16" }} />
                            </div>
                            <Text strong style={{ fontSize: 11, color: "#1F3461" }}>
                              Nivel Freático
                            </Text>
                          </Flex>
                          <Flex align="baseline" gap={4} justify="space-between">
                            <Text strong style={{ fontSize: 18, color: "#1F3461" }}>
                              {(parseFloat(waterTable) || 0).toFixed(2)}
                            </Text>
                            <Text style={{ fontSize: 11, color: "#597ef7", fontWeight: 700 }}>
                              m
                            </Text>
                          </Flex>
                          {varWaterTable !== null && (
                            <Flex align="center" gap={4} justify="flex-end">
                              {varWaterTable > 0 ? (
                                <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} />
                              ) : (
                                <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />
                              )}
                              <Text style={{ fontSize: 10, color: varWaterTable > 0 ? "#52c41a" : "#ff4d4f", fontWeight: 700 }}>
                                {varWaterTable > 0 ? "+" : ""}{varWaterTable.toFixed(1)}%
                              </Text>
                            </Flex>
                          )}
                        </Flex>
                      </Col>
                    )}
                  </Row>
                )}
              </Card>
            </Col>
          )}

          {vars.some((v) => v.type_variable?.includes("TOTALIZADO")) && (
            <Col span={24}>
              <MetricCard
                title={
                  vars.find((v) => v.type_variable?.includes("TOTALIZADO"))
                    ?.label || "Acumulado Total"
                }
                value={new Intl.NumberFormat("de-DE").format(acumulado)}
                unit="m³"
                icon={<DatabaseOutlined />}
                loading={loading}
                variation={varAcumAbs}
                variationUnit="m³"
                variationDecimals={0}
                helpText="Volumen total acumulado de agua extraída desde el inicio del monitoreo en metros cúbicos"
                footer={
                  loading ? null : (
                    <Flex justify="space-between" align="center">
                      <Flex vertical gap={2}>
                        <Text style={{ fontSize: 9, color: "#8c8c8c", fontWeight: 700, textTransform: "uppercase" }}>
                          Hoy
                        </Text>
                        <Text strong style={{ fontSize: 13, color: "#52c41a", lineHeight: 1 }}>
                          {validateNumericValue(acumDia, 0) !== null ? validateNumericValue(acumDia, 0) : 0}{" "}
                          <span style={{ fontSize: 9, fontWeight: 600 }}>m³</span>
                        </Text>
                      </Flex>
                      <div style={{ width: "1px", height: "24px", background: "#f0f0f0" }} />
                      <Flex vertical gap={2} align="end">
                        <Text style={{ fontSize: 9, color: "#8c8c8c", fontWeight: 700, textTransform: "uppercase" }}>
                          Ayer
                        </Text>
                        <Text strong style={{ fontSize: 13, color: "#faad14", lineHeight: 1 }}>
                          {validateNumericValue(acumAyer, 0) !== null ? validateNumericValue(acumAyer, 0) : 0}{" "}
                          <span style={{ fontSize: 9, fontWeight: 600 }}>m³</span>
                        </Text>
                      </Flex>
                    </Flex>
                  )
                }
              />
            </Col>
          )}
        </Row>

        <Flex justify="center" style={{ margin: "8px 0 8px 0" }}>
          <div
            id="well-visualization"
            className="pozo-container"
            style={{ position: "relative", width: "100%", maxWidth: "380px" }}
          >
            {console.log("DEBUG VARS:", vars)}

            {/* Botón de descarga flotante */}
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="small"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 100,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              onClick={async () => {
                const html2canvas = (await import("html2canvas")).default;
                const element = document.getElementById("well-visualization");
                if (element) {
                  const button = element.querySelector("button");
                  if (button) button.style.display = "none";

                  const canvas = await html2canvas(element, {
                    backgroundColor: "#2c3e50",
                    scale: 2,
                    logging: false,
                  });

                  if (button) button.style.display = "block";

                  const link = document.createElement("a");
                  link.download = `pozo-${
                    state.selected_profile?.title || "visualizacion"
                  }-${new Date().toISOString().split("T")[0]}.png`;
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                }
              }}
            >
              Descargar
            </Button>

            <Well
              total={acumulado}
              nivel={nivel}
              caudal={caudal}
              profW={state.selected_profile?.config_data?.d1}
              waterTable={waterTable}
              loading={loading}
              showCaudal={vars.some((v) => v.type_variable?.includes("CAUDAL"))}
              showNivel={vars.some((v) => v.type_variable?.includes("NIVEL"))}
              showTotal={vars.some((v) =>
                v.type_variable?.includes("TOTALIZADO")
              )}
            />

          </div>
        </Flex>



        <Flex vertical={true} gap="small">
          {/* Ficha Técnica y Datalogger con Tabs - Vista Móvil */}
          <TechnicalSheetWithTabs
            profile={state.selected_profile}
            loading={loading}
          />

          {/* Variables Configuradas - Vista Móvil */}
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <ConfiguredVariables
              variables={vars}
              loading={loading}
            />
          </Card>

          {/* Consumos Combinados */}
          <Card
            title={
              <Flex align="center" gap="small">
                <RiseOutlined /> Registros
              </Flex>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ marginTop: "8px" }}>
              <MyLastRegisters />
            </div>
          </Card>
        </Flex>
      </div>
    );
  }

  const columns = [
    {
      title: "Hora",
      dataIndex: "date_time_medition",
      render: (time) => time.slice(11, 16) + " hrs",
      width: 90,
    },
    {
      title: "Caudal (Lt/s)",
      dataIndex: "flow",
      render: (flow) => (parseFloat(flow) || 0).toFixed(2),
      width: 100,
    },
    {
      title: "Nivel F. (m)",
      dataIndex: "water_table",
      render: (nivel) => (parseFloat(nivel) || 0).toFixed(2),
      width: 100,
    },
    {
      title: "m³/hora",
      dataIndex: "total_diff",
      render: (a) => numberForMiles.format(a || 0),
      width: 110,
    },
    {
      title: "m³/día",
      dataIndex: "total_today_diff",
      render: (a) => numberForMiles.format(a || 0),
      width: 110,
    },
    {
      title: "Totalizador (m³)",
      dataIndex: "total",
      render: (total) => numberForMiles.format(total || 0),
      width: 120,
    },
  ];

  // --- VISTA ESCRITORIO ---
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Error si existe */}
      {error && (
        <Alert
          message={error}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]} align="stretch" justify="center">
        {/* Columna Izquierda: Indicadores */}
        <Col
          xs={24}
          sm={24}
          md={6}
          lg={6}
          xl={6}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <div
            id="well-metrics"
            className="telemetry-col telemetry-col-left"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  gap: "8px",
                }}
              >
                {/* 1. Último Registro - arriba de todo para saber que estamos leyendo */}
                <MetricCard
                  title="Último Registro"
                  value={lastCaption ? formatDate(lastCaption).date : "N/A"}
                  unit={lastCaption ? formatDate(lastCaption).time : ""}
                  icon={<ClockCircleOutlined style={{ color: "#1F3461" }} />}
                  loading={loading}
                  helpText="Fecha y hora de la última medición registrada. El Logger muestra el último registro que tenía el datalogger al momento de esa medición."
                  extraInfo={
                    lastLogger
                      ? `Logger: ${formatDate(lastLogger).date} ${
                          formatDate(lastLogger).time
                        }`
                      : null
                  }
                  syncStatus={getSyncStatus(lastCaption, lastLogger)}
                  /* animation removed */
                />

                {vars.some((v) => v.type_variable?.includes("CAUDAL")) && (
                  <MetricCard
                    title={
                      vars.find((v) => v.type_variable?.includes("CAUDAL"))
                        ?.label || "Caudal"
                    }
                    value={(parseFloat(caudal) || 0).toFixed(2)}
                    unit="(Lt/s)"
                    variation={varCaudal}
                    icon={<DashboardOutlined />}
                    loading={loading}
                    helpText={
                      vars
                        .find((v) => v.type_variable?.includes("CAUDAL"))
                        ?.label?.toUpperCase()
                        .includes("MEDIO") ||
                      vars
                        .find((v) => v.type_variable?.includes("CAUDAL"))
                        ?.type_variable?.includes("PROMEDIO")
                        ? "Caudal medio calculado según normativa DGA: (Totalizado Actual - Totalizado Anterior) / (Segundos de la Frecuencia) * 1000. Expresado en Lt/s."
                        : "Caudal instantáneo de agua medido en litros por segundo"
                    }
                    /* animation removed */
                  />
                )}

                {/* Nivel de Agua + Nivel Freático combinados en una tarjeta */}
                {(vars.some((v) => v.type_variable?.includes("NIVEL")) ||
                  vars.some((v) =>
                    v.type_variable?.includes("FEATICO") ||
                    v.type_variable?.includes("FREÁTICO")
                  )) && (
                  <Card
                    hoverable
                    style={{
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0, 50, 150, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.6)",
                      overflow: "hidden",
                      position: "relative",
                      background: "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(10px)",
                    }}
                    bodyStyle={{ padding: "12px 16px", zIndex: 1, position: "relative" }}
                  >
                    {loading ? (
                      <Row gutter={[16, 16]} align="middle">
                        <Col span={12}>
                          <Flex vertical gap={6}>
                            <Flex align="center" gap="small">
                              <div className="ikolu-shimmer-circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
                              <div className="ikolu-shimmer" style={{ width: 80, height: 12 }} />
                            </Flex>
                            <div className="ikolu-shimmer" style={{ width: "70%", height: 22, marginLeft: 36 }} />
                          </Flex>
                        </Col>
                        <Col span={12}>
                          <Flex vertical gap={6}>
                            <Flex align="center" gap="small">
                              <div className="ikolu-shimmer-circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
                              <div className="ikolu-shimmer" style={{ width: 90, height: 12 }} />
                            </Flex>
                            <div className="ikolu-shimmer" style={{ width: "70%", height: 22, marginLeft: 36 }} />
                          </Flex>
                        </Col>
                      </Row>
                    ) : (
                      <Row gutter={[16, 16]} align="middle">
                        {vars.some((v) => v.type_variable?.includes("NIVEL")) && (
                          <Col span={12}>
                            <Flex vertical gap={4}>
                                  <Flex align="center" gap="small">
                                    <div
                                      style={{
                                        background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
                                        padding: 6,
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <ColumnHeightOutlined style={{ fontSize: 16, color: "#1890ff" }} />
                                    </div>
                                    <Text strong style={{ fontSize: 11, color: "#1F3461" }}>
                                      Nivel de Agua
                                    </Text>
                                  </Flex>
                              <Flex align="baseline" gap={4} justify="space-between">
                                <Text strong style={{ fontSize: 18, color: "#1F3461" }}>
                                  {(parseFloat(nivel) || 0).toFixed(2)}
                                </Text>
                                <Text style={{ fontSize: 11, color: "#597ef7", fontWeight: 700 }}>
                                  m
                                </Text>
                              </Flex>
                            </Flex>
                          </Col>
                        )}
                        {(vars.some((v) =>
                          v.type_variable?.includes("FEATICO") ||
                          v.type_variable?.includes("FREÁTICO")
                        ) ||
                          vars.some((v) => v.type_variable?.includes("NIVEL"))) && (
                          <Col span={12}>
                            <Flex vertical gap={4}>
                              <Flex align="center" gap="small">
                                <div
                                  style={{
                                    background: "linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)",
                                    padding: 6,
                                    borderRadius: 8,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <ArrowDownOutlined style={{ fontSize: 16, color: "#fa8c16" }} />
                                </div>
                                <Text strong style={{ fontSize: 11, color: "#1F3461" }}>
                                  Nivel Freático
                                </Text>
                              </Flex>
                              <Flex align="baseline" gap={4} justify="space-between">
                                <Text strong style={{ fontSize: 18, color: "#1F3461" }}>
                                  {(parseFloat(waterTable) || 0).toFixed(2)}
                                </Text>
                                <Text style={{ fontSize: 11, color: "#597ef7", fontWeight: 700 }}>
                                  m
                                </Text>
                              </Flex>
                            </Flex>
                          </Col>
                        )}
                      </Row>
                    )}
                  </Card>
                )}

                {vars.some((v) => v.type_variable?.includes("TOTALIZADO")) && (
                  <MetricCard
                    title={
                      vars.find((v) => v.type_variable?.includes("TOTALIZADO"))
                        ?.label || "Acumulado Total"
                    }
                    value={numberForMiles.format(acumulado || 0)}
                    unit="(m³)"
                    icon={<DatabaseOutlined />}
                    loading={loading}
                    variation={varAcumAbs}
                    variationUnit="m³"
                    variationDecimals={0}
                    helpText="Volumen total acumulado de agua extraída desde el inicio del monitoreo en metros cúbicos"
                    /* animation removed */
                    footer={
                      loading ? null : (
                        <Flex justify="space-between" align="center">
                          <Flex vertical gap={2}>
                            <Text style={{ fontSize: 9, color: "#8c8c8c", fontWeight: 700, textTransform: "uppercase" }}>
                              Hoy
                            </Text>
                            <Text strong style={{ fontSize: 13, color: "#52c41a", lineHeight: 1 }}>
                              {validateNumericValue(acumDia, 0) !== null ? validateNumericValue(acumDia, 0) : 0}{" "}
                              <span style={{ fontSize: 9, fontWeight: 600 }}>m³</span>
                            </Text>
                          </Flex>
                          <div style={{ width: "1px", height: "24px", background: "#f0f0f0" }} />
                          <Flex vertical gap={2} align="end">
                            <Text style={{ fontSize: 9, color: "#8c8c8c", fontWeight: 700, textTransform: "uppercase" }}>
                              Ayer
                            </Text>
                            <Text strong style={{ fontSize: 13, color: "#faad14", lineHeight: 1 }}>
                              {validateNumericValue(acumAyer, 0) !== null ? validateNumericValue(acumAyer, 0) : 0}{" "}
                              <span style={{ fontSize: 9, fontWeight: 600 }}>m³</span>
                            </Text>
                          </Flex>
                        </Flex>
                      )
                    }
                  />
                )}
              </div>
            </div>
        </Col>

        {/* Columna Central: Pozo y Stats separados */}
        <Col xs={24} sm={24} md={9} lg={9} xl={9} style={{ display: "flex" }}>
          <div
            className="telemetry-col telemetry-col-center"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
              {/* Tarjeta del Pozo */}
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  background: "#ffffff",
                  border: "1px solid #f0f0f0",
                  overflow: "hidden",
                }}
                bodyStyle={{ 
                  padding: "8px 12px", 
                  position: "relative",
                }}
              >
                {/* Botón Mediciones arriba a la derecha */}
                <div
                  id="well-measurements-btn"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    opacity: loading ? 0.5 : 1,
                    transition: "opacity 0.4s ease",
                    pointerEvents: loading ? "none" : "auto",
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        width: 100,
                        height: 24,
                        borderRadius: 12,
                        background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                        backgroundSize: "200% 100%",
                        animation: "ikoluShimmer 1.5s infinite",
                      }}
                    />
                  ) : (
                    <MyLastRegisters />
                  )}
                </div>

                {/* Countdown de sincronización arriba a la izquierda */}
                <div
                  id="well-sync-countdown"
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 10,
                    opacity: loading ? 0.5 : 1,
                    transition: "opacity 0.4s ease",
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        width: 80,
                        height: 20,
                        borderRadius: 10,
                        background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
                        backgroundSize: "200% 100%",
                        animation: "ikoluShimmer 1.5s infinite",
                      }}
                    />
                  ) : deadline ? (
                    <Tooltip title="Tiempo hasta la próxima medición">
                      <Flex align="center" gap={4}>
                        <WifiOutlined style={{ fontSize: 10, color: "#1F3461" }} />
                        <Countdown
                          value={deadline}
                          format="mm:ss"
                          valueStyle={{
                            color: "#1F3461",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                          onFinish={handleRefresh}
                        />
                      </Flex>
                    </Tooltip>
                  ) : (
                    <Text style={{ fontSize: 11, fontWeight: 700, color: "#bfbfbf" }}>N/A</Text>
                  )}
                </div>
                
                <div
                  id="well-visualization"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: 32,
                  }}
                >
                  <Well
                    total={acumulado}
                    nivel={nivel}
                    caudal={caudal}
                    profW={state.selected_profile?.config_data?.d1}
                    waterTable={waterTable}
                    loading={loading}
                    showCaudal={vars.some((v) =>
                      v.type_variable?.includes("CAUDAL")
                    )}
                    showNivel={vars.some((v) =>
                      v.type_variable?.includes("NIVEL")
                    )}
                    showTotal={vars.some((v) =>
                      v.type_variable?.includes("TOTALIZADO")
                    )}
                  />
                </div>
              </Card>
            </div>
        </Col>

        {/* Columna Derecha: Ficha Técnica + Variables Configuradas */}
        <Col xs={24} sm={24} md={9} lg={9} xl={9} style={{ display: "flex" }}>
          <div
            className="telemetry-col telemetry-col-right"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
              <div id="well-techsheet">
                <TechnicalSheetWithTabs
                  profile={state.selected_profile}
                  loading={loading}
                />
              </div>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
                bodyStyle={{ padding: "16px" }}
              >
                <div id="well-variables">
                  <ConfiguredVariables
                    variables={vars}
                    loading={loading}
                  />
                </div>
              </Card>
            </div>
        </Col>
      </Row>
      <style>
        {`
          @keyframes telemetryFadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .telemetry-col {
            opacity: 0;
            animation: telemetryFadeIn 0.5s ease-out forwards;
          }
          .telemetry-col-left { animation-delay: 0s; }
          .telemetry-col-center { animation-delay: 0.08s; }
          .telemetry-col-right { animation-delay: 0.16s; }

          .metric-card-hover {
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .metric-card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 50, 150, 0.12);
          }

          @keyframes ikoluShimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .ikolu-shimmer {
            background: linear-gradient(90deg, #f0f2f5 25%, #e6e8eb 50%, #f0f2f5 75%);
            background-size: 200% 100%;
            animation: ikoluShimmer 1.6s ease-in-out infinite;
            border-radius: 6px;
          }

          .ikolu-shimmer-circle {
            background: linear-gradient(90deg, #f0f2f5 25%, #e6e8eb 50%, #f0f2f5 75%);
            background-size: 200% 100%;
            animation: ikoluShimmer 1.6s ease-in-out infinite;
            border-radius: 50%;
          }

          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          /* Estilos para tabs más visibles */
          .ant-tabs-tab {
            font-weight: 500 !important;
            padding: 12px 20px !important;
          }
          .ant-tabs-tab-active {
            font-weight: 700 !important;
          }
          .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #1F3461 !important;
          }
          .ant-tabs-ink-bar {
            background: #1F3461 !important;
            height: 3px !important;
          }


        `}
      </style>

      {(() => {
        const vars = state.selected_profile?.config_data?.variables || [];
        const tour = getTelemetryTour(vars);
        return (
          <ModuleTour
            tourKey={tour.key}
            steps={tour.steps}
            requiresPoint={tour.requiresPoint}
            hasPoint={!!state.selected_profile?.id}
            autoStart={true}
            delay={1200}
          />
        );
      })()}
    </div>
  );
};

export default MyWell;
