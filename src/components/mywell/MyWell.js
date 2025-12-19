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

const SectionTitle = ({ children }) => (
  <Text
    style={{
      display: "block",
      color: "rgb(31, 52, 97)",
      fontWeight: 500,
      marginTop: "6px",
      marginBottom: "2px",
      paddingLeft: "2px",
      fontSize: 12,
    }}
    strong
  >
    <u>{children}</u>
  </Text>
);

// --- Componente para Stats de Consumos y Timer en una fila ---
const ConsumptionStats = ({ acumDia, acumAyer, loading, deadline, onRefresh }) => {
  // Validar y formatear valores
  const validHoy = validateNumericValue(acumDia, 0);
  const validAyer = validateNumericValue(acumAyer, 0);
  const changePercent = calculateChangePercent(validHoy, validAyer);
  const isIncrease = changePercent !== null && changePercent > 0;
  const isDecrease = changePercent !== null && changePercent < 0;

  return (
    <div style={{ 
      width: "100%", 
      padding: "12px 16px", 
      background: "rgba(255, 255, 255, 0.4)", 
      backdropFilter: "blur(5px)", 
      borderRadius: "12px", 
      border: "1px solid rgba(255, 255, 255, 0.5)",
      marginTop: "16px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
    }}>
      <Flex
        gap="middle"
        wrap="wrap"
        justify="space-between"
        align="center"
      >
        {/* Consumo Hoy */}
        <Tooltip title="Consumo acumulado del día de hoy">
          <Flex
            vertical
            align="center"
            gap={2}
            style={{ flex: 1, minWidth: "70px" }}
          >
            <Flex align="center" gap={4}>
              <Text style={{ fontSize: 10, fontWeight: 700, color: "#8c8c8c", textTransform: "uppercase" }}>
                Hoy
              </Text>
              {changePercent !== null && (
                <Flex align="center" gap={2}>
                  {isIncrease ? (
                    <ArrowUpOutlined style={{ fontSize: 10, color: "#faad14" }} />
                  ) : (
                    <ArrowDownOutlined style={{ fontSize: 10, color: "#52c41a" }} />
                  )}
                  <Text style={{ fontSize: 10, color: isIncrease ? "#faad14" : "#52c41a", fontWeight: 800 }}>
                    {Math.abs(changePercent).toFixed(1)}%
                  </Text>
                </Flex>
              )}
            </Flex>
            {loading ? (
              <Spin size="small" />
            ) : (
              <Text style={{ fontSize: 18, fontWeight: 900, color: "#52c41a", lineHeight: 1 }}>
                {validHoy !== null ? `${validHoy}` : "0"} <span style={{ fontSize: 10, fontWeight: 600 }}>m³</span>
              </Text>
            )}
          </Flex>
        </Tooltip>

        <div style={{ width: "1px", height: "30px", background: "rgba(0,0,0,0.05)" }}></div>

        {/* Consumo Ayer */}
        <Tooltip title="Consumo acumulado del día anterior">
          <Flex
            vertical
            align="center"
            gap={2}
            style={{ flex: 1, minWidth: "70px" }}
          >
            <Text style={{ fontSize: 10, fontWeight: 700, color: "#8c8c8c", textTransform: "uppercase" }}>
              Ayer
            </Text>
            {loading ? (
              <Spin size="small" />
            ) : (
              <Text style={{ fontSize: 18, fontWeight: 900, color: "#faad14", lineHeight: 1 }}>
                {validAyer !== null ? `${validAyer}` : "0"} <span style={{ fontSize: 10, fontWeight: 600 }}>m³</span>
              </Text>
            )}
          </Flex>
        </Tooltip>

        <div style={{ width: "1px", height: "30px", background: "rgba(0,0,0,0.05)" }}></div>

        {/* Timer */}
        <Tooltip title={deadline ? "Tiempo hasta la próxima medición" : "No configurado"}>
          <Flex
            vertical
            align="center"
            gap={2}
            style={{ flex: 1, minWidth: "90px" }}
          >
            <Text style={{ fontSize: 10, fontWeight: 700, color: "#8c8c8c", textTransform: "uppercase" }}>
              Refresco
            </Text>
            {loading ? (
              <Spin size="small" />
            ) : deadline ? (
              <Countdown
                value={deadline}
                format="mm:ss"
                valueStyle={{ color: "#1F3461", fontSize: 18, fontWeight: 900, lineHeight: 1 }}
                onFinish={onRefresh}
              />
            ) : (
              <Text style={{ fontSize: 14, color: "#bfbfbf", fontWeight: 700 }}>N/A</Text>
            )}
          </Flex>
        </Tooltip>
      </Flex>
    </div>
  );
};

// --- Componente compartido para mostrar Variables Configuradas ---
const ConfiguredVariables = ({ variables, loading = false }) => {
  // Mapeo de tipos de variables a etiquetas legibles
  const typeLabels = {
    CAUDAL_PROMEDIO: "Caudal Promedio",
    CAUDAL: "Caudal",
    NIVEL: "Nivel",
    TOTALIZADO: "Totalizado",
  };

  if (!variables || variables.length === 0) return null;

  return (
    <div style={{ marginTop: "30px" }}>
      <Flex align="center" gap="small" style={{ marginBottom: "8px" }}>
        <SettingOutlined style={{ color: "#1F3461", fontSize: 12 }} />
        <Text strong style={{ fontSize: 11, color: "#1F3461" }}>
          Variables Configuradas
        </Text>
      </Flex>
      <Row gutter={[12, 12]} style={{ width: "100%" }}>
        {variables.map((variable, index) => (
          <Col key={variable.id || index} xs={12} sm={8} md={12} lg={12}>
            <div style={{
              padding: "12px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "#1890ff" }}></div>
              <Flex justify="space-between" align="center">
                <Text strong style={{ fontSize: 9, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1 }}>
                  {variable.str_variable || `Var ${variable.id}`}
                </Text>
                <Tag color="processing" style={{ fontSize: 8, margin: 0, borderRadius: 4, border: "none" }}>
                  {typeLabels[variable.type_variable] || variable.type_variable}
                </Tag>
              </Flex>
              <Text strong style={{ fontSize: 13, color: "#1F3461" }}>
                {variable.label || "Sin Etiqueta"}
              </Text>
              
              {variable.pulses_factor && (
                <Flex align="center" gap={4}>
                  <CalculatorOutlined style={{ fontSize: 10, color: "#1890ff" }} />
                  <Text style={{ fontSize: 10, color: "#595959" }}>
                    {numberForMiles.format(variable.pulses_factor)} Lt/p
                  </Text>
                </Flex>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// --- Componente para contenido de Ficha Técnica (sin Card wrapper) ---
// Este componente se usa dentro de la pestaña "Ficha Técnica"
const TechnicalSheetContent = ({ profile, loading = false }) => {
  const config_data = profile?.config_data ?? {};
  const dga = profile?.dga ?? {};
  const title = profile?.title ?? "N/A";
  const date_init = config_data?.date_start_telemetry ?? "N/A";

  if (!profile) return null;

  return (
    <div style={{ padding: "0 4px" }}>
      <TechInfoRow
        icon={<IdcardOutlined />}
        label="DGA"
        value={<Text copyable>{dga.code_dga || "N/A"}</Text>}
        loading={loading}
      />
      <TechInfoRow
        icon={<IdcardOutlined />}
        label="Nombre"
        value={title}
        loading={loading}
      />

      <TechInfoRow
        icon={<ArrowDownOutlined />}
        label="Profundidad"
        value={`${parseFloat(config_data.d1 || 0).toFixed(2)} m`}
        loading={loading}
      />
      <SectionTitle>Posicionamientos</SectionTitle>
      <TechInfoRow
        icon={<ToolOutlined />}
        label="Bomba"
        value={`${parseFloat(config_data.d2 || 0).toFixed(2)} m`}
        loading={loading}
      />
      <TechInfoRow
        icon={<AimOutlined />}
        label="Nivel"
        value={`${parseFloat(config_data.d3 || 0).toFixed(2)} m`}
        loading={loading}
      />
      <SectionTitle>Diámetros</SectionTitle>
      <TechInfoRow
        icon={<ExpandOutlined />}
        label="Ducto"
        value={`${parseFloat(config_data.d4 || 0).toFixed(2)} pulg`}
        loading={loading}
      />
      <TechInfoRow
        icon={<ExpandOutlined />}
        label="Flujómetro"
        value={`${parseFloat(config_data.d5 || 0).toFixed(2)} pulg`}
        loading={loading}
      />
      <SectionTitle>Totalizador</SectionTitle>
      <TechInfoRow
        icon={<CalculatorOutlined />}
        label="m³ Iniciales"
        value={`${numberForMiles.format(config_data.d6 || 0)}`}
        loading={loading}
      />

      {/* Información del Datalogger */}
      <SectionTitle>Datalogger</SectionTitle>
      <TechInfoRow
        icon={<DatabaseOutlined />}
        label="Estado"
        value={
          config_data.is_telemetry
            ? "Con telemetría activa"
            : "Sin telemetría configurada"
        }
        loading={loading}
      />
      <TechInfoRow
        icon={<ClockCircleOutlined />}
        label="Frecuencia de medición"
        value={
          profile?.frecuency
            ? `${profile.frecuency} min`
            : "Frecuencia no definida"
        }
        loading={loading}
      />
      <TechInfoRow
        icon={<CalendarOutlined />}
        label="Inicio monitoreo"
        value={config_data.date_start_telemetry || "N/A"}
        loading={loading}
      />

      {/* Variables Configuradas */}
      <ConfiguredVariables
        variables={
          Array.isArray(config_data.variables) ? config_data.variables : []
        }
        loading={loading}
      />
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
        minHeight: "650px", // Asegura que ocupe más espacio vertical para balancear con el pozo
      }}
      bodyStyle={{ padding: "16px", minHeight: "600px" }}
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
  animationType = "none", // "waves", "level", "depth", "rising", "pulse", "none"
}) => {
  const renderAnimation = () => {
    switch (animationType) {
      case "waves":
        return (
          <div className="card-waves-container">
            <div className="card-wave"></div>
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
        marginBottom: "8px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 50, 150, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        overflow: "hidden",
        position: "relative",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
      }}
      bodyStyle={{ padding: "16px", zIndex: 1, position: "relative" }}
      aria-label={`Métrica ${title}: ${value} ${unit}`}
    >
      {!loading && renderAnimation()}
      
      {/* Header with left-aligned icon */}
      <Flex align="center" gap="small" style={{ marginBottom: 12 }}>
        <div style={{ 
          background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)", 
          padding: 8, 
          borderRadius: 10, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
          flexShrink: 0
        }}>
          {React.cloneElement(icon, { style: { fontSize: 18, color: "#1890ff" } })}
        </div>
        <Flex vertical gap={2} style={{ flex: 1 }}>
          <Flex align="center" gap={4}>
            <Text strong style={{ fontSize: 11, color: "#1F3461", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</Text>
            {helpText && (
              <Tooltip title={helpText}>
                <InfoCircleOutlined
                  style={{ fontSize: 10, color: "#999", cursor: "help" }}
                />
              </Tooltip>
            )}
          </Flex>
          {variation !== undefined && variation !== null && Math.abs(variation) > 0.1 && (
            <Flex align="center" gap={3}>
              {variation > 0 ? 
                <RiseOutlined style={{ color: "#52c41a", fontSize: 10 }} /> : 
                <FallOutlined style={{ color: "#ff4d4f", fontSize: 10 }} />
              }
              <Text 
                style={{ 
                  fontWeight: 700, 
                  fontSize: 9,
                  color: variation > 0 ? "#52c41a" : "#ff4d4f",
                }}
              >
                {variation > 0 ? "+" : ""}{variation.toFixed(1)}%
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      
      {/* Value section */}
      {loading ? (
        <div style={{ padding: "12px 0", textAlign: "center" }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : (
        <div>
          <Flex align="baseline" gap={4} style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#1F3461",
                lineHeight: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#597ef7" }}>{unit}</div>
          </Flex>

          {extraInfo && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#8c8c8c",
                marginTop: 8,
                fontStyle: "italic",
                opacity: 0.8
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
                    boxShadow: `0 2px 4px ${syncStatus.color}10`
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: syncStatus.color,
                      boxShadow: `0 0 5px ${syncStatus.color}`
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: syncStatus.color,
                      fontWeight: 800,
                      textTransform: "uppercase"
                    }}
                  >
                    {syncStatus.status}
                  </Text>
                </div>
              </Tooltip>
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
        const frecuency = state.selected_profile?.frecuency ?? 0;
        const total_consumed_yesterday =
          state.selected_profile?.modules?.total_consumed_yesterday ?? 0;

        const lastData = getLatest(state.selected_profile);

        if (lastData) {
          setLastCaption(lastData.date_time_medition ?? null);
          setLastLogger(lastData.date_time_last_logger ?? null);
          setAcumDia(lastData.total_today_diff || 0);
          // nivel = Nivel del agua
          setNivel(parseFloat(lastData.nivel) || 0);
          // water_table = Nivel Freático
          setWaterTable(parseFloat(lastData.water_table) || 0);
          setCaudal(lastData.flow || 0);
          setAcumulado(lastData.total || 0);
          // Calcular variaciones
          const today = state.selected_profile?.modules?.today || [];
          if (today.length >= 2) {
            const current = today[today.length - 1];
            const previous = today[today.length - 2];
            
            if (previous.flow > 0) {
              setVarCaudal(((current.flow - previous.flow) / previous.flow) * 100);
            }
            if (parseFloat(previous.nivel) > 0) {
              const currentNivel = parseFloat(current.nivel) || 0;
              const previousNivel = parseFloat(previous.nivel) || 0;
              setVarNivel(((currentNivel - previousNivel) / previousNivel) * 100);
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
          const nextDeadline = new Date(now.getTime() + minutesUntilNext * 60000);
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
    const d = new Date(date);
    const datePart = d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timePart = `${String(d.getHours()).padStart(2, "0")}:00 hrs`;
    return { date: datePart, time: timePart };
  };

  // Calcula la diferencia en horas entre la medición y el logger
  const getSyncStatus = (meditionDate, loggerDate) => {
    if (!meditionDate || !loggerDate) return null;

    try {
      const medition = new Date(meditionDate);
      const logger = new Date(loggerDate);
      const diffMs = Math.abs(medition - logger);
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 1) {
        return { color: "#52c41a", status: "Sincronizado" }; // Verde
      } else if (diffHours < 12) {
        return { color: "#fa8c16", status: "Desincronización leve" }; // Naranja
      } else {
        return { color: "#ff4d4f", status: "Problemas de sincronización" }; // Rojo
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
      const frecuency = state.selected_profile?.frecuency ?? 0;
      const total_consumed_yesterday =
        state.selected_profile?.modules?.total_consumed_yesterday ?? 0;

      const lastData = getLatest(state.selected_profile);

      if (lastData) {
        setLastCaption(lastData.date_time_medition ?? null);
        setLastLogger(lastData.date_time_last_logger ?? null);
        setAcumDia(lastData.total_today_diff || 0);
        // nivel = Nivel del agua
        setNivel(parseFloat(lastData.nivel) || 0);
        // water_table = Nivel Freático
        setWaterTable(parseFloat(lastData.water_table) || 0);
        setCaudal(lastData.flow || 0);
        setAcumulado(lastData.total || 0);
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
        {/* Indicador de estado y botón de refrescar - Móvil */}
        <Flex vertical gap="small" style={{ marginBottom: 16 }}>
          {error && (
            <Alert
              message={error}
              type="error"
              icon={<ExclamationCircleOutlined />}
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}
          <Flex justify="space-between" align="center" wrap="wrap" gap="small">
            {lastUpdateTime && (
              <Tooltip
                title={`Última actualización: ${lastUpdateTime.toLocaleString()}`}
              >
                <Flex align="center" gap="small">
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", fontSize: 12 }}
                  />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatLastUpdate()}
                  </Text>
                </Flex>
              </Tooltip>
            )}
            <Button
              type="default"
              size="small"
              icon={<ReloadOutlined spin={isRefreshing} />}
              onClick={handleRefresh}
              loading={isRefreshing}
              disabled={loading || isRefreshing}
              aria-label="Actualizar datos de telemetría"
            >
              Actualizar
            </Button>
          </Flex>
        </Flex>
        <Row gutter={[8, 8]}>
          {(vars.some(v => v.type_variable?.includes("CAUDAL")) || vars.length === 0) && (
            <Col span={24}>
              <MetricCard
                title={vars.find(v => v.type_variable?.includes("CAUDAL"))?.label || "Caudal"}
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
          <Col span={24}>
            <MetricCard
              title="Nivel de Agua"
              value={(parseFloat(nivel) || 0).toFixed(2)}
              unit="m"
              icon={<ColumnHeightOutlined />}
              loading={loading}
              variation={varNivel}
              helpText="Altura de la columna de agua dentro del pozo medida por el sensor"
              animationType="level"
            />
          </Col>
          {(vars.some(v => v.type_variable?.includes("NIVEL")) || vars.length === 0) && (
            <Col span={24}>
              <MetricCard
                title="Nivel Freático"
                value={(parseFloat(waterTable) || 0).toFixed(2)}
                unit="m"
                icon={<ArrowDownOutlined />}
                loading={loading}
                helpText="Profundidad desde la superficie del suelo hasta el nivel freático (napa de agua)"
                animationType="depth"
              />
            </Col>
          )}
          {(vars.some(v => v.type_variable?.includes("TOTALIZADO")) || vars.length === 0) && (
            <Col span={24}>
              <MetricCard
                title={vars.find(v => v.type_variable?.includes("TOTALIZADO"))?.label || "Acumulado Total"}
                value={new Intl.NumberFormat("de-DE").format(acumulado)}
                unit="m³"
                icon={<DatabaseOutlined />}
                loading={loading}
                helpText="Volumen total acumulado de agua extraída desde el inicio del monitoreo en metros cúbicos"
                animationType="rising"
              />
            </Col>
          )}
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
        </Row>

        <Flex justify="center" style={{ margin: "16px 0" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "280px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Well
              total={acumulado}
              nivel={nivel}
              caudal={caudal}
              profW={state.selected_profile?.config_data?.d1}
              loading={loading}
            />
          </div>
        </Flex>

        {/* Stats de Consumos (sin cards) - Vista Móvil */}
        <ConsumptionStats
          acumDia={acumDia}
          acumAyer={acumAyer}
          loading={loading}
          deadline={deadline}
          onRefresh={handleRefresh}
        />

        <Flex vertical={true} gap="small">
          {/* Ficha Técnica y Datalogger con Tabs - Vista Móvil */}
          <TechnicalSheetWithTabs
            profile={state.selected_profile}
            loading={loading}
          />

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
      {/* Indicador de estado y botón de refrescar */}
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 16, padding: "0 8px" }}
        wrap="wrap"
        gap="small"
      >
        <Flex align="center" gap="small" wrap="wrap">
          {error ? (
            <Alert
              message={error}
              type="error"
              icon={<ExclamationCircleOutlined />}
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ flex: 1, minWidth: "200px" }}
            />
          ) : lastUpdateTime ? (
            <Tooltip
              title={`Última actualización: ${lastUpdateTime.toLocaleString()}`}
            >
              <Flex align="center" gap="small">
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#52c41a",
                  boxShadow: "0 0 8px #52c41a",
                  animation: "pulse-green 2s infinite"
                }} />
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                  LIVE: {formatLastUpdate()}
                </Text>
              </Flex>
            </Tooltip>
          ) : null}
          <Tooltip title="Estado de conexión">
            <Flex align="center" gap="small">
              <WifiOutlined style={{ color: "#52c41a", fontSize: 14 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {navigator.onLine ? "En línea" : "Sin conexión"}
              </Text>
            </Flex>
          </Tooltip>
        </Flex>
        <Button
          type="default"
          icon={<ReloadOutlined spin={isRefreshing} />}
          onClick={handleRefresh}
          loading={isRefreshing}
          disabled={loading || isRefreshing}
          aria-label="Actualizar datos de telemetría"
        >
          Actualizar
        </Button>
      </Flex>

      <Row gutter={[16, 16]} align="stretch" style={{ display: 'flex' }}>
        {/* Columna Izquierda: Indicadores */}
        <Col xs={24} sm={24} md={6} lg={6} xl={6} style={{ display: 'flex', flexDirection: 'column' }}>
          <QueueAnim delay={200} type="left" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div key="metrics" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
                {(vars.some(v => v.type_variable?.includes("CAUDAL")) || vars.length === 0) && (
                  <MetricCard
                    title={vars.find(v => v.type_variable?.includes("CAUDAL"))?.label || "Caudal"}
                    value={(parseFloat(caudal) || 0).toFixed(2)}
                    unit="(Lt/s)"
                    variation={varCaudal}
                    icon={<DashboardOutlined />}
                    loading={loading}
                    helpText="Caudal instantáneo de agua medido en litros por segundo"
                    animationType="waves"
                  />
                )}
                <MetricCard
                  title="Nivel de Agua"
                  value={(parseFloat(nivel) || 0).toFixed(2)}
                  unit="(m)"
                  variation={varNivel}
                  icon={<ColumnHeightOutlined />}
                  loading={loading}
                  helpText="Altura de la columna de agua dentro del pozo medida por el sensor"
                  animationType="level"
                />
                {(vars.some(v => v.type_variable?.includes("NIVEL")) || vars.length === 0) && (
                  <MetricCard
                    title="Profundidad Freática"
                    value={(parseFloat(waterTable) || 0).toFixed(2)}
                    unit="(m)"
                    icon={<ArrowDownOutlined />}
                    loading={loading}
                    helpText="Profundidad desde la superficie del suelo hasta el nivel freático (napa de agua)"
                    animationType="depth"
                  />
                )}
                {(vars.some(v => v.type_variable?.includes("TOTALIZADO")) || vars.length === 0) && (
                  <MetricCard
                    title={vars.find(v => v.type_variable?.includes("TOTALIZADO"))?.label || "Acumulado Total"}
                    value={numberForMiles.format(acumulado || 0)}
                    unit="(m³)"
                    icon={<DatabaseOutlined />}
                    loading={loading}
                    helpText="Volumen total acumulado de agua extraída desde el inicio del monitoreo en metros cúbicos"
                    animationType="rising"
                  />
                )}
                <div style={{ flex: 1 }}></div> {/* Spacer to push Last Register to bottom if needed */}
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
              </div>
            </div>
          </QueueAnim>
        </Col>

        {/* Columna Central: Pozo y Mediciones */}
        <Col xs={24} sm={24} md={9} lg={9} xl={9} style={{ display: 'flex' }}>
          <QueueAnim delay={400} type="bottom" style={{ width: '100%', height: '100%' }}>
            <Card
              key="well-card"
              style={{
                borderRadius: "16px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.4)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
              bodyStyle={{ 
                padding: "20px", 
                flex: 1, 
                display: "flex", 
                flexDirection: "column",
                position: "relative" 
              }}
            >
              <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
                <MyLastRegisters />
              </div>
              
              <Flex
                vertical
                align="center"
                justify="center"
                style={{ flex: 1, width: "100%" }}
              >
                {/* Pozo */}
                <div
                  style={{
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "20px 0",
                  }}
                >
                  <Well
                    total={acumulado}
                    nivel={nivel}
                    caudal={caudal}
                    profW={state.selected_profile?.config_data?.d1}
                    loading={loading}
                  />
                </div>

                {/* Stats de Consumos y Timer en una fila */}
                <ConsumptionStats
                  acumDia={acumDia}
                  acumAyer={acumAyer}
                  loading={loading}
                  deadline={deadline}
                  onRefresh={handleRefresh}
                />
              </Flex>
            </Card>
          </QueueAnim>
        </Col>

        {/* Columna Derecha: Ficha Técnica */}
        <Col xs={24} sm={24} md={9} lg={9} xl={9} style={{ display: 'flex' }}>
          <QueueAnim type="right" delay={200} style={{ width: '100%', height: '100%' }}>
            <div key="tabs" style={{ height: '100%' }}>
              <TechnicalSheetWithTabs
                profile={state.selected_profile}
                loading={loading}
              />
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
        `}
      </style>
    </div>
  );
};

export default MyWell;
