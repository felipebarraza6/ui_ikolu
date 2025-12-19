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
} from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
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
const ConsumptionStats = ({ acumDia, acumAyer, loading, deadline }) => {
  // Validar y formatear valores
  const validHoy = validateNumericValue(acumDia, 0);
  const validAyer = validateNumericValue(acumAyer, 0);
  const changePercent = calculateChangePercent(validHoy, validAyer);
  const isIncrease = changePercent !== null && changePercent > 0;
  const isDecrease = changePercent !== null && changePercent < 0;

  return (
    <Flex
      gap="small"
      wrap="wrap"
      justify="space-around"
      align="center"
      style={{
        padding: "2px 0",
        marginTop: "0px",
        borderTop: "1px solid #f0f0f0",
        width: "100%",
      }}
    >
      {/* Consumo Hoy */}
      <Tooltip title="Consumo acumulado del día de hoy">
        <Flex
          vertical
          align="center"
          gap={1}
          style={{ minWidth: "70px", flex: 1 }}
        >
          <Flex align="center" gap={4}>
            <Text type="secondary" style={{ fontSize: 9, fontWeight: 500 }}>
              Hoy ({moment().format("DD MMM")})
            </Text>
            {changePercent !== null && (
              <Tooltip
                title={`${isIncrease ? "Aumento" : "Disminución"} de ${Math.abs(
                  changePercent
                ).toFixed(1)}% respecto a ayer`}
              >
                <Flex align="center" gap={2}>
                  {isIncrease ? (
                    <ArrowUpOutlined
                      style={{ fontSize: 10, color: "#F2994A" }}
                    />
                  ) : isDecrease ? (
                    <ArrowDownOutlined
                      style={{ fontSize: 10, color: "#27AE60" }}
                    />
                  ) : null}
                  <Text
                    style={{
                      fontSize: 8,
                      color: isIncrease ? "#F2994A" : "#27AE60",
                      fontWeight: 600,
                    }}
                  >
                    {Math.abs(changePercent).toFixed(1)}%
                  </Text>
                </Flex>
              </Tooltip>
            )}
          </Flex>
          {loading ? (
            <LoadingOutlined spin style={{ fontSize: 14, color: "#27AE60" }} />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#27AE60",
                lineHeight: 1.1,
              }}
            >
              {validHoy !== null ? `${validHoy} m³` : "N/A"}
            </Text>
          )}
        </Flex>
      </Tooltip>

      {/* Consumo Ayer */}
      <Tooltip title="Consumo acumulado del día anterior">
        <Flex
          vertical
          align="center"
          gap={1}
          style={{ minWidth: "70px", flex: 1 }}
        >
          <Text type="secondary" style={{ fontSize: 9, fontWeight: 500 }}>
            Ayer ({moment().subtract(1, "days").format("DD MMM")})
          </Text>
          {loading ? (
            <LoadingOutlined spin style={{ fontSize: 14, color: "#F2994A" }} />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#F2994A",
                lineHeight: 1.1,
              }}
            >
              {validAyer !== null ? `${validAyer} m³` : "N/A"}
            </Text>
          )}
        </Flex>
      </Tooltip>

      {/* Timer */}
      <Tooltip
        title={
          deadline
            ? "Tiempo restante hasta la próxima medición automática"
            : "Frecuencia de medición no configurada"
        }
      >
        <Flex
          vertical
          align="center"
          gap={1}
          style={{ minWidth: "90px", flex: 1 }}
        >
          <Text type="secondary" style={{ fontSize: 9, fontWeight: 500 }}>
            Próxima medición en:
          </Text>
          {loading ? (
            <LoadingOutlined spin style={{ fontSize: 14, color: "#1F3461" }} />
          ) : deadline ? (
            <Countdown
              value={deadline}
              format="HH:mm:ss"
              valueStyle={{ color: "#1F3461", fontSize: 14, fontWeight: 700 }}
            />
          ) : (
            <Text style={{ fontSize: 11, color: "#999" }}>N/A</Text>
          )}
        </Flex>
      </Tooltip>
    </Flex>
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
      <Flex wrap="wrap" gap="small">
        {variables.map((variable, index) => (
          <div
            key={variable.id || index}
            style={{
              padding: "6px",
              background: "#fafafa",
              borderRadius: "6px",
              border: "1px solid #e8e8e8",
              flex: "0 1 calc(33.333% - 8px)",
              minWidth: "100px",
              maxWidth: "calc(33.333% - 8px)",
            }}
          >
            <Flex vertical gap={4}>
              {/* Nombre y tipo en la misma línea */}
              <Flex justify="center" align="center" gap="small" vertical>
                <Text
                  strong
                  style={{
                    fontSize: 10,
                    color: "#1F3461",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {variable.str_variable ||
                    variable.label ||
                    `Variable ${variable.id}`}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "black",
                    fontWeight: 500,
                  }}
                >
                  {typeLabels[variable.type_variable] || variable.type_variable}
                </Text>
              </Flex>

              {/* Descripción técnica (sin servicio) */}
              <div>
                <Flex vertical gap={1}>
                  {/* Factor de pulsos: sólo para TOTALIZADO */}
                  {variable.type_variable === "TOTALIZADO" &&
                    variable.pulses_factor && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {numberForMiles.format(variable.pulses_factor)}{" "}
                        Lt/pulsos
                      </Text>
                    )}

                  {/* Constante aditiva: sólo para TOTALIZADO distinta de 0 */}
                  {variable.type_variable === "TOTALIZADO" &&
                    variable.addition !== undefined &&
                    variable.addition !== 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Aditivo: {variable.addition}
                      </Text>
                    )}

                  {/* Conversión a litros: sólo para TOTALIZADO */}
                  {variable.type_variable === "TOTALIZADO" &&
                    variable.convert_to_lt && (
                      <Text
                        style={{
                          fontSize: 8,
                          color: "#52c41a",
                          fontWeight: 500,
                        }}
                      >
                        A litros
                      </Text>
                    )}

                  {/* Base de cálculo (n_base): para NIVEL y CAUDAL instantáneo */}
                  {variable.calculate_nivel &&
                    (variable.type_variable === "NIVEL" ||
                      variable.type_variable === "CAUDAL") && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Base calculo: {variable.calculate_nivel}
                      </Text>
                    )}
                </Flex>
              </div>
            </Flex>
          </div>
        ))}
      </Flex>
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
}) => (
  <Card
    hoverable
    style={{
      marginBottom: "8px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
    aria-label={`Métrica ${title}: ${value} ${unit}`}
  >
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ marginBottom: 6 }}>
        <Flex align="center" gap="small" justify="center">
          {icon}
          <Text style={{ fontSize: 11 }}>{title}</Text>
          {helpText && (
            <Tooltip title={helpText}>
              <InfoCircleOutlined
                style={{ fontSize: 12, color: "#999", cursor: "help" }}
              />
            </Tooltip>
          )}
        </Flex>
      </div>
      {loading ? (
        <div>
          <div
            style={{
              width: "50px",
              height: "18px",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
              borderRadius: "3px",
              margin: "0 auto 2px auto",
            }}
          />
          <div
            style={{
              width: "40px",
              height: "11px",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
              borderRadius: "2px",
              margin: "0 auto",
            }}
          />
        </div>
      ) : (
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1F3461",
              marginBottom: 2,
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>{unit}</div>
          {extraInfo && (
            <Tooltip title="Último registro que tenía el datalogger al momento de la medición">
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#999",
                  marginTop: 4,
                  cursor: "help",
                }}
              >
                {extraInfo}
              </div>
            </Tooltip>
          )}
          {syncStatus && (
            <div style={{ marginTop: 4 }}>
              <Tooltip title={syncStatus.status}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: `${syncStatus.color}15`,
                    border: `1px solid ${syncStatus.color}40`,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: syncStatus.color,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: syncStatus.color,
                      fontWeight: 500,
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
    </div>
  </Card>
);

const MyWell = () => {
  const { state, dispatch } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [nivel, setNivel] = useState(0);
  const [caudal, setCaudal] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [acumDia, setAcumDia] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);
  const [lastLogger, setLastLogger] = useState(null);
  const [acumAyer, setAcumAyer] = useState(0);
  const [lastRegisters, setLastRegisters] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
          setNivel(lastData.water_table || 0);
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
        setNivel(lastData.water_table || 0);
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
          <Col span={24}>
            <MetricCard
              title="Caudal"
              value={(parseFloat(caudal) || 0).toFixed(2)}
              unit="L/s"
              icon={<img src={caudal_img} alt="caudal" style={{ width: 24 }} />}
              loading={loading}
              helpText="Caudal instantáneo de agua medido en litros por segundo"
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Nivel Freático"
              value={(parseFloat(nivel) || 0).toFixed(2)}
              unit="m"
              icon={<img src={nivel_img} alt="nivel" style={{ width: 24 }} />}
              loading={loading}
              helpText="Profundidad del nivel de agua freática medida desde la superficie en metros"
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Acumulado Total"
              value={new Intl.NumberFormat("de-DE").format(acumulado)}
              unit="m³"
              icon={
                <img
                  src={acumulado_img}
                  alt="acumulado"
                  style={{ width: 24 }}
                />
              }
              loading={loading}
              helpText="Volumen total acumulado de agua extraída desde el inicio del monitoreo en metros cúbicos"
            />
          </Col>
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
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: 14 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Actualizado {formatLastUpdate()}
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

      <Row gutter={[16, 16]}>
        {/* Columna Izquierda: Indicadores */}
        <Col xs={24} sm={24} md={6} lg={6} xl={6}>
          <QueueAnim delay={200} type="left">
            <div key="metrics">
              <div>
                <MetricCard
                  title="Caudal"
                  value={(parseFloat(caudal) || 0).toFixed(2)}
                  unit="(Lt/s)"
                  icon={
                    <img src={caudal_img} alt="caudal" style={{ width: 24 }} />
                  }
                  loading={loading}
                  helpText="Caudal instantáneo de agua medido en litros por segundo"
                />
                <MetricCard
                  title="Nivel Freático"
                  value={(parseFloat(nivel) || 0).toFixed(2)}
                  unit="(m)"
                  icon={
                    <img src={nivel_img} alt="nivel" style={{ width: 24 }} />
                  }
                  loading={loading}
                  helpText="Profundidad del nivel de agua freática medida desde la superficie en metros"
                />
                <MetricCard
                  title="Acumulado Total"
                  value={numberForMiles.format(acumulado || 0)}
                  unit="(m³)"
                  icon={
                    <img
                      src={acumulado_img}
                      alt="acumulado"
                      style={{ width: 24 }}
                    />
                  }
                  loading={loading}
                  helpText="Volumen total acumulado de agua extraída desde el inicio del monitoreo en metros cúbicos"
                />
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
              </div>
            </div>
          </QueueAnim>
        </Col>

        {/* Columna Central: Pozo y Mediciones */}
        <Col xs={24} sm={24} md={9} lg={9} xl={9}>
          <QueueAnim delay={400} type="bottom">
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "16px",
                position: "relative",
                maxHeight: "650px",
              }}
            >
              <Flex
                justify="flex-end"
                style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
              >
                <Button
                  type="primary"
                  size="small"
                  icon={loading ? <LoadingOutlined spin /> : <TableOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  disabled={loading}
                  loading={loading}
                  aria-label={`Ver ${lastRegisters.length} mediciones`}
                >
                  Mediciones ({loading ? "..." : lastRegisters.length})
                </Button>
              </Flex>
              <Flex
                vertical
                align="center"
                justify="flex-start"
                style={{ width: "100%" }}
              >
                {/* Pozo */}
                <Flex
                  justify="center"
                  align="center"
                  style={{
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "320px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "0 auto",
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
                </Flex>

                {/* Stats de Consumos y Timer en una fila */}
                <ConsumptionStats
                  acumDia={acumDia}
                  acumAyer={acumAyer}
                  loading={loading}
                  deadline={deadline}
                />
              </Flex>
            </Card>
          </QueueAnim>
        </Col>

        {/* Columna Derecha: Ficha Técnica */}
        <Col xs={24} sm={24} md={9} lg={9} xl={9}>
          <QueueAnim type="right" delay={200}>
            <div key="tabs">
              <TechnicalSheetWithTabs
                profile={state.selected_profile}
                loading={loading}
              />
            </div>
          </QueueAnim>
        </Col>
      </Row>
      <Drawer
        title={<Text style={{ color: "white" }}>Registros de Hoy</Text>}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
        closable={true}
        closeIcon={<CloseOutlined style={{ color: "white" }} />}
        headerStyle={{ backgroundColor: "#1F3461" }}
        bodyStyle={{ padding: "8px" }}
      >
        <Table
          dataSource={lastRegisters}
          columns={columns}
          bordered={true}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          rowKey="id"
        />
      </Drawer>

      {/* Estilos CSS para la animación del skeleton y tabs */}
      <style>
        {`
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
          .ant-tabs-tab:hover {
            color: #1F3461 !important;
          }
        `}
      </style>
    </div>
  );
};

export default MyWell;
