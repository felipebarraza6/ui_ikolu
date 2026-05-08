import React, { useContext, useEffect, useState, useRef } from "react";
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
  Spin,
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
    {loading ? (
      <div
        style={{
          width: "60px",
          height: "14px",
          background:
            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "loading 1.5s infinite",
          borderRadius: "3px",
        }}
      />
    ) : (
      <Text strong style={{ fontSize: 12 }}>
        {value}
      </Text>
    )}
  </Flex>
);

// Fila minimal sin icono, con tooltip
const TechItem = ({ label, value, tooltip, loading = false }) => (
  <Tooltip title={tooltip}>
    <Flex
      justify="space-between"
      align="center"
      style={{ padding: "3px 2px", borderBottom: "1px solid #f0f0f0" }}
    >
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      {loading ? (
        <div
          style={{
            width: "50px",
            height: "12px",
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
            borderRadius: "3px",
          }}
        />
      ) : (
        <Text strong style={{ fontSize: 12 }}>
          {value}
        </Text>
      )}
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
            {loading ? (
              <Spin size="small" />
            ) : (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: "#52c41a",
                      lineHeight: 1,
                    }}
                  >
                    {validHoy !== null ? `${validHoy}` : "0"}{" "}
                    <span style={{ fontSize: 10, fontWeight: 600 }}>m³</span>
              </Text>
            )}
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
            {loading ? (
              <Spin size="small" />
            ) : (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: "#faad14",
                      lineHeight: 1,
                    }}
                  >
                    {validAyer !== null ? `${validAyer}` : "0"}{" "}
                    <span style={{ fontSize: 10, fontWeight: 600 }}>m³</span>
              </Text>
            )}
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
              <Spin size="small" />
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

  const typeColors = {
    CAUDAL_PROMEDIO: "blue",
    CAUDAL: "cyan",
    NIVEL: "geekblue",
    TOTALIZADO: "green",
  };

  if (!variables || variables.length === 0) return null;

  return (
    <div>
      <Flex align="center" gap="small" style={{ marginBottom: "10px" }}>
        <SettingOutlined style={{ color: "#1F3461", fontSize: 12 }} />
        <Text strong style={{ fontSize: 12, color: "#1F3461" }}>
          Variables Configuradas
        </Text>
      </Flex>
      <Row gutter={[8, 8]}>
        {variables.map((variable, index) => (
          <Col key={variable.id || index} xs={12} sm={12} md={12} lg={12}>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid #f0f0f0",
                height: "100%",
              }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: "#8c8c8c", fontWeight: 600 }}>
                  {variable.str_variable || `Var ${variable.id}`}
                </Text>
                <Tag
                  color={typeColors[variable.type_variable] || "default"}
                  style={{ fontSize: 9, margin: 0, padding: "0 6px", lineHeight: "16px" }}
                >
                  {typeLabels[variable.type_variable] || variable.type_variable}
                </Tag>
              </Flex>
              <Text strong style={{ fontSize: 12, color: "#1F3461", display: "block" }}>
                {variable.label || "Sin Etiqueta"}
              </Text>
              <Flex gap="small" wrap="wrap" style={{ marginTop: 4 }}>
                {variable.type_variable === "TOTALIZADO" && (
                  <>
                    {variable.pulses_factor && (
                      <Text style={{ fontSize: 10, color: "#595959" }}>
                        {numberForMiles.format(variable.pulses_factor)} Lt/p
                      </Text>
                    )}
                    <Text style={{ fontSize: 10, color: "#595959" }}>
                      Adición: {numberForMiles.format(variable.addition || 0)}
                    </Text>
                  </>
                )}
                {variable.type_variable === "NIVEL" && variable.calculate_nivel !== null && variable.calculate_nivel !== undefined && (
                  <Text style={{ fontSize: 10, color: "#595959" }}>
                    Base: {variable.calculate_nivel}
                  </Text>
                )}
                {variable.type_variable === "CAUDAL" && (
                  <Text style={{ fontSize: 10, color: "#595959" }}>
                    Convertir: {variable.convert_to_lt ? "Sí" : "No"}
                  </Text>
                )}
              </Flex>
            </div>
          </Col>
        ))}
      </Row>
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
      {/* Nombre + DGA en la misma fila */}
      <Row gutter={[8, 0]}>
        <Col span={dga.code_dga ? 12 : 24}>
          <Tooltip title="Identificación del punto de captación">
            <div>
              <TechInfoRow
                icon={<IdcardOutlined />}
                label="Nombre"
                value={title}
                loading={loading}
              />
            </div>
          </Tooltip>
        </Col>
        {dga.code_dga && (
          <Col span={12}>
            <Tooltip title="Código único de registro en DGA">
              <div>
                <TechInfoRow
                  icon={
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
                  }
                  label="DGA"
                  value={<Text copyable style={{ fontSize: 12 }}>{dga.code_dga}</Text>}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </Col>
        )}
      </Row>
      <TechInfoRow
        icon={<ArrowDownOutlined />}
        label="Profundidad"
        value={`${parseFloat(config_data.d1 || 0).toFixed(2)} m`}
        loading={loading}
      />

      <div style={{ marginTop: 10 }} />

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
  if (!profile) return null;

  return (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        height: "100%",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <TechnicalSheetContent profile={profile} loading={loading} />
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
  animationType = "none",
  footer,
}) => {
  const renderAnimation = () => {
    switch (animationType) {
      case "waves":
        return (
          <div className="card-waves-container">
            <div className="card-wave wave-1"></div>
            <div className="card-wave wave-2"></div>
            <div className="card-wave wave-3"></div>
          </div>
        );
      case "level":
        return (
          <div className="card-level-container">
            <div className="card-level-bar"></div>
          </div>
        );
      case "depth":
        return (
          <div className="card-depth-container">
            <div className="card-depth-indicator"></div>
          </div>
        );
      case "rising":
        return (
          <div className="card-rising-container">
            <div className="card-rising-wave"></div>
            <div className="card-rising-wave wave-2"></div>
          </div>
        );
      case "pulse":
        return (
          <div className="card-pulse-container">
            <div className="card-pulse-ring"></div>
            <div className="card-pulse-ring ring-2"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      hoverable
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
      {!loading && renderAnimation()}
      
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
                  {variation.toFixed(1)}%
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      
      {/* Value section */}
      {loading ? (
        <div style={{ padding: "4px 0" }}>
          <Skeleton active paragraph={false} title={{ width: "60%", style: { marginTop: 0 } }} />
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
  const [varCaudal, setVarCaudal] = useState(null);
  const [varNivel, setVarNivel] = useState(null);
  const [lastRegisters, setLastRegisters] = useState([]);
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

  // useEffect consolidado para manejar carga inicial y actualizaciones periódicas
  useEffect(() => {
    // Función para obtener datos de telemetría (sin actualizar perfil completo)
    const fetchTelemetryData = async () => {
      if (!state.selected_profile?.id) return;

      setLoading(true);

      try {
        const profileId = state.selected_profile.id;
        const telemetryData = await sh.get_data_sh(profileId);

        // Usar datos del módulo m1 que ya vienen actualizados en selected_profile
        const modules = state.selected_profile?.modules ?? {};
        const m1 = modules.m1; // Objeto listo con todos los datos para las tarjetas
        const frecuency = state.selected_profile?.frecuency ?? 0;
        const total_consumed_yesterday =
          state.selected_profile?.modules?.total_consumed_yesterday ?? 0;

        // Obtener el registro más reciente para asegurar que mostramos la fecha/hora correcta
        // Esto es importante porque m1 puede no estar siempre actualizado
        const latestRecord = getLatest(state.selected_profile) || m1;

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
          setAcumDia(
            state.selected_profile?.modules?.total_consumed_today || 0
          );
          // nivel = Nivel del agua
          setNivel(parseFloat(m1.nivel) || 0);
          // water_table = Nivel Freático
          setWaterTable(parseFloat(m1.water_table) || 0);
          setCaudal(m1.flow || 0);
          setAcumulado(m1.total || 0);
          // Calcular variaciones
          const today = state.selected_profile?.modules?.today || [];
          if (today.length >= 2) {
            const current = today[today.length - 1];
            const previous = today[today.length - 2];
            
            if (previous.flow > 0) {
              setVarCaudal(
                ((current.flow - previous.flow) / previous.flow) * 100
              );
            }
            if (parseFloat(previous.nivel) > 0) {
              const currentNivel = parseFloat(current.nivel) || 0;
              const previousNivel = parseFloat(previous.nivel) || 0;
              setVarNivel(
                ((currentNivel - previousNivel) / previousNivel) * 100
              );
            }
          }
        }

        if (telemetryData?.results) {
          setLastRegisters(modules.today || []);
        }

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
        setLastUpdateTime(null);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
        if (!error) {
          setLastUpdateTime(new Date());
          setError(null);
        }
      }
    };

    // Función para obtener datos del perfil completo (solo al cambiar de perfil)
    const fetchProfileData = async () => {
      if (!state.selected_profile?.id) return;

      dispatch({ type: "SET_LOADING", payload: { isLoading: true } });

      try {
        const profileId = state.selected_profile.id;
        const userProfileResponse = await sh.get_profile();
        const allProfiles = userProfileResponse?.user?.catchment_points ?? [];
        const selected_profile_data =
          allProfiles.find((p) => p.id === profileId) || allProfiles[0] || {};

        // Solo actualizar si hay cambios reales en los datos
        const hasChanges =
          JSON.stringify(selected_profile_data) !==
          JSON.stringify(state.selected_profile);

        if (hasChanges) {
          dispatch({
            type: "UPDATE",
            payload: {
              user: userProfileResponse.user,
              selected_profile: selected_profile_data,
            },
          });
        }

        // Cargar datos de telemetría
        await fetchTelemetryData();
      } catch (error) {
        console.error("Error fetching profile data in MyWell:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: { isLoading: false } });
      }
    };

    // Función para limpiar intervalos existentes
    const clearExistingInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Cargar datos completos al cambiar de perfil
    if (state.selected_profile?.id) {
      fetchProfileData();

      // Configurar intervalo de actualización periódica (solo telemetría, más espaciado)
      clearExistingInterval();
      intervalRef.current = setInterval(() => {
        if (state.selected_profile?.id) {
          fetchTelemetryData(); // Solo telemetría, no perfil completo
        }
      }, 5 * 60 * 1000); // 5 minutos en lugar de 1 minuto
    }

    // Limpiar intervalo al desmontar o cambiar de perfil
    return () => {
      clearExistingInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selected_profile?.id]); // Solo depende del ID del perfil para evitar loops infinitos

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

      const telemetryData = await sh.get_data_sh(profileId);
      const modules = state.selected_profile?.modules ?? {};
      const m1 = modules.m1; // Objeto listo con todos los datos para las tarjetas
      const frecuency = state.selected_profile?.frecuency ?? 0;
      const total_consumed_yesterday =
        state.selected_profile?.modules?.total_consumed_yesterday ?? 0;

      // Obtener el registro más reciente para asegurar que mostramos la fecha/hora correcta
      const latestRecord = getLatest(state.selected_profile) || m1;

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

      if (telemetryData?.results) {
        setLastRegisters(modules.today || []);
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
              animationType="pulse"
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
                animationType="waves"
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
                  <Skeleton active paragraph={false} title={{ width: "80%" }} />
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
                helpText="Volumen total acumulado de agua extraída desde el inicio del monitoreo en metros cúbicos"
                animationType="rising"
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
          md={8}
          lg={8}
          xl={8}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <QueueAnim
            delay={200}
            type="left"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div
              key="metrics"
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
                  animationType="pulse"
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
                    animationType="waves"
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
                      <Skeleton active paragraph={false} title={{ width: "80%" }} />
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
                    helpText="Volumen total acumulado de agua extraída desde el inicio del monitoreo en metros cúbicos"
                    animationType="rising"
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
          </QueueAnim>
        </Col>

        {/* Columna Central: Pozo y Stats separados */}
        <Col xs={24} sm={24} md={8} lg={8} xl={8} style={{ display: "flex" }}>
          <QueueAnim
            delay={400}
            type="bottom"
            style={{ width: "100%", height: "100%" }}
          >
            <div
              key="well-column"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                height: "100%",
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
                  padding: "8px 4px", 
                  position: "relative",
                }}
              >
                {/* Botón Mediciones arriba a la derecha */}
                <div
                  style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
                >
                  <MyLastRegisters />
                </div>

                {/* Countdown de sincronización arriba a la izquierda */}
                <div
                  style={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}
                >
                  {loading ? (
                    <Spin size="small" />
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
                    <Text style={{ fontSize: 10, color: "#bfbfbf" }}>N/A</Text>
                  )}
                </div>
                
                <div
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
          </QueueAnim>
        </Col>

        {/* Columna Derecha: Ficha Técnica + Variables Configuradas */}
        <Col xs={24} sm={24} md={8} lg={8} xl={8} style={{ display: "flex" }}>
          <QueueAnim
            type="right"
            delay={200}
            style={{ width: "100%", height: "100%" }}
          >
            <div
              key="right-column"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                height: "100%",
              }}
            >
              <TechnicalSheetWithTabs
                profile={state.selected_profile}
                loading={loading}
              />
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
            </div>
          </QueueAnim>
        </Col>
      </Row>
      <style>
        {`
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          @keyframes cardWave {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .card-water-container {
            position: absolute;
            bottom: -80px;
            left: -50%;
            width: 200%;
            height: 150px;
            pointer-events: none;
            z-index: 0;
            opacity: 0.1;
          }

          .card-water-wave {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, transparent 0%, #1890ff 100%);
            border-radius: 43%;
            animation: cardWave 10s infinite linear;
          }

          .wave-2 {
            border-radius: 40%;
            animation-duration: 13s;
            opacity: 0.5;
            background: linear-gradient(180deg, transparent 0%, #096dd9 100%);
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

          @keyframes pulse-green {
            0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(82, 196, 26, 0); }
            100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
          }

          /* Animaciones para MetricCard - Caudal (waves) - Animación completamente continua sin cortes */
          .card-waves-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60px;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
            opacity: 0.15;
          }

          .card-wave {
            position: absolute;
            bottom: 0;
            width: 400%;
            height: 100%;
            /* Patrón de onda que se repite infinitamente - inicio y fin idénticos para continuidad perfecta */
            background: repeating-linear-gradient(
              90deg,
              rgba(24, 144, 255, 0.05) 0%,
              rgba(24, 144, 255, 0.08) 6.25%,
              rgba(24, 144, 255, 0.15) 12.5%,
              rgba(24, 144, 255, 0.25) 18.75%,
              rgba(24, 144, 255, 0.35) 25%,
              rgba(24, 144, 255, 0.4) 31.25%,
              rgba(24, 144, 255, 0.35) 37.5%,
              rgba(24, 144, 255, 0.25) 43.75%,
              rgba(24, 144, 255, 0.15) 50%,
              rgba(24, 144, 255, 0.08) 56.25%,
              rgba(24, 144, 255, 0.05) 62.5%,
              rgba(24, 144, 255, 0.05) 100%
            );
            border-radius: 50% 50% 0 0;
          }

          /* Primera onda - movimiento continuo sin cortes */
          .card-wave.wave-1 {
            left: -300%;
            animation: waveFlowContinuous 5s linear infinite;
          }

          /* Segunda onda - delay de 1.67s (un tercio) para superposición perfecta */
          .card-wave.wave-2 {
            left: -300%;
            animation: waveFlowContinuous 5s linear infinite;
            animation-delay: 1.67s;
            opacity: 0.88;
          }

          /* Tercera onda - delay de 3.33s (dos tercios) para superposición perfecta */
          .card-wave.wave-3 {
            left: -300%;
            animation: waveFlowContinuous 5s linear infinite;
            animation-delay: 3.33s;
            opacity: 0.75;
          }

          /* Animación completamente continua - movimiento suave sin saltos */
          /* El patrón se repite infinitamente porque el gradiente es simétrico y se repite */
          @keyframes waveFlowContinuous {
            0% {
              transform: translateX(0) translateY(0);
            }
            25% {
              transform: translateX(25%) translateY(-1px);
            }
            50% {
              transform: translateX(50%) translateY(-2px);
            }
            75% {
              transform: translateX(75%) translateY(-1px);
            }
            100% {
              transform: translateX(100%) translateY(0);
            }
          }

          /* Animaciones para MetricCard - Nivel (level) */
          .card-level-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }

          .card-level-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60%;
            background: linear-gradient(180deg,
              transparent 0%,
              rgba(24, 144, 255, 0.2) 50%,
              rgba(24, 144, 255, 0.1) 100%);
            animation: levelFill 2s ease-in-out infinite;
            border-top: 2px solid rgba(24, 144, 255, 0.1);
          }

          @keyframes levelFill {
            0%, 100% {
              height: 60%;
              opacity: 0.6;
            }
            50% {
              height: 70%;
              opacity: 0.8;
            }
          }

          /* Animaciones para MetricCard - Nivel Freático (depth) */
          .card-depth-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }

          .card-depth-indicator {
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg,
              rgba(24, 144, 255, 0.8) 0%,
              rgba(24, 144, 255, 0.4) 50%,
              transparent 100%);
            animation: depthIndicator 2.5s ease-in-out infinite;
            box-shadow: 0 0 8px rgba(24, 144, 255, 0.5);
          }

          @keyframes depthIndicator {
            0% {
              transform: translateY(0);
              opacity: 0.6;
            }
            50% {
              transform: translateY(20px);
              opacity: 1;
            }
            100% {
              transform: translateY(0);
              opacity: 0.6;
            }
          }

          /* Animaciones para MetricCard - Totalizado (rising) */
          .card-rising-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
            opacity: 0.12;
          }

          .card-rising-wave {
            position: absolute;
            bottom: -50px;
            left: -50%;
            width: 200%;
            height: 100px;
            background: linear-gradient(180deg,
              transparent 0%,
              rgba(24, 144, 255, 0.4) 50%,
              transparent 100%);
            border-radius: 50%;
            animation: risingWave 4s ease-in-out infinite;
          }

          .card-rising-wave.wave-2 {
            animation-delay: 1s;
            opacity: 0.6;
            background: linear-gradient(180deg,
              transparent 0%,
              rgba(9, 109, 217, 0.3) 50%,
              transparent 100%);
          }

          @keyframes risingWave {
            0% {
              transform: translateY(10px) scaleY(1);
              opacity: 0;
            }
            20% {
              opacity: 0.8;
            }
            50% {
              transform: translateY(-25px) scaleY(1.2);
              opacity: 0.5;
            }
            80% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(-60px) scaleY(1);
              opacity: 0;
            }
          }

          /* Animaciones para MetricCard - Último Registro (pulse) */
          .card-pulse-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
          }

          .card-pulse-ring {
            position: absolute;
            top: 50%;
            left: 85%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            border: 2px solid rgba(24, 144, 255, 0.3);
            border-radius: 50%;
            animation: pulseRing 2s ease-out infinite;
          }

          .card-pulse-ring.ring-2 {
            animation-delay: 0.5s;
            border-color: rgba(24, 144, 255, 0.2);
          }

          @keyframes pulseRing {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MyWell;
