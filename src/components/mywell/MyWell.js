import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Flex,
  Table,
  Drawer,
  Button,
  Tooltip,
  Alert,
  Tag,
  Statistic,
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
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
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
import { ikoluTokens } from "../../theme";
import moment from "moment";
import "moment/locale/es";

import MetricCard from "./MyWellMetricCard";
import TechnicalSheetWithTabs from "./MyWellTechSheet";
import ConfiguredVariables from "./MyWellVariables";
import ConsumptionStats from "./MyWellStats";

const { Text } = Typography;
const { Countdown } = Statistic;
const numberForMiles = new Intl.NumberFormat("de-DE");

const validateNumericValue = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
};

moment.locale("es");
const MyWell = () => {
  const { user } = useAuth();
  const { selected_profile, dispatch } = useData();
  const { isMobile } = useResponsive();
  const vars = selected_profile?.config_data?.variables || [];
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
    const today = selected_profile?.modules?.today || [];
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
  }, [selected_profile?.modules?.today]);
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
      if (!selected_profile?.id) return;

      setLoading(true);

      try {
        const profileId = selected_profile.id;
        await sh.get_data_sh(profileId);

        const modules = selected_profile?.modules ?? {};
        const m1 = modules.m1;
        const frecuency = selected_profile?.frecuency ?? 0;
        const total_consumed_yesterday =
          selected_profile?.modules?.total_consumed_yesterday ?? 0;

        const latestRecord = getLatest(selected_profile) || m1;

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
            selected_profile?.modules?.total_consumed_today || 0
          );
          setNivel(parseFloat(m1.nivel) || 0);
          setWaterTable(parseFloat(m1.water_table) || 0);
          setCaudal(m1.flow || 0);
          setAcumulado(m1.total || 0);
          const today = selected_profile?.modules?.today || [];
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

    if (selected_profile?.id) {
      fetchTelemetryData();

      clearExistingInterval();
      intervalRef.current = setInterval(() => {
        if (selected_profile?.id) {
          fetchTelemetryData();
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      clearExistingInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected_profile?.id]);

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
          status: `Sinc: ${timeText}`,
          diffHours: 0,
          diffMinutes: diffMinutes,
          diffSeconds: diffSeconds,
        }; // Verde
      } else if (diffHours < 12) {
        // Mostrar horas, minutos y segundos de desincronización
        const hoursText = diffHours >= 1 ? `${Math.floor(diffHours)}h` : "";
        const minutesText = diffMinutes > 0 ? ` ${diffMinutes}m` : "";
        const secondsText = "";
        return {
          color: "#fa8c16",
          status:
            `Leve: ${hoursText}${minutesText}${secondsText}`.trim(),
          diffHours: Math.floor(diffHours),
          diffMinutes: diffMinutes,
          diffSeconds: diffSeconds,
        }; // Naranja
      } else {
        // Mostrar horas, minutos y segundos de desincronización
        const hoursText = diffHours >= 1 ? `${Math.floor(diffHours)}h` : "";
        const minutesText = diffMinutes > 0 ? ` ${diffMinutes}m` : "";
        const secondsText = "";
        return {
          color: "#ff4d4f",
          status:
            `Grave: ${hoursText}${minutesText}${secondsText}`.trim(),
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
      const profileId = selected_profile?.id;
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
      const profile = updatedProfile || selected_profile;
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
              icon={<ClockCircleOutlined style={{ color: ikoluTokens.colorCorporateBlue }} />}
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
                  borderRadius: ikoluTokens.radiusXL,
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
                                borderRadius: ikoluTokens.borderRadius,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <ColumnHeightOutlined style={{ fontSize: ikoluTokens.fontSizeXL, color: ikoluTokens.colorInfo }} />
                            </div>
                            <Text strong style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue }}>
                              Nivel de Agua
                            </Text>
                          </Flex>
                          <Flex align="baseline" gap={4} justify="space-between">
                            <Text strong style={{ fontSize: ikoluTokens.fontSize2XL, color: ikoluTokens.colorCorporateBlue }}>
                              {(parseFloat(nivel) || 0).toFixed(2)}
                            </Text>
                            <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: "#597ef7", fontWeight: 700 }}>
                              m
                            </Text>
                          </Flex>
                          {varNivel !== null && (
                            <Flex align="center" gap={4} justify="flex-end">
                              {varNivel > 0 ? (
                                <RiseOutlined style={{ color: ikoluTokens.colorSuccess, fontSize: 10 }} />
                              ) : (
                                <FallOutlined style={{ color: ikoluTokens.colorError, fontSize: 10 }} />
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
                                borderRadius: ikoluTokens.borderRadius,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <ArrowDownOutlined style={{ fontSize: ikoluTokens.fontSizeXL, color: "#fa8c16" }} />
                            </div>
                            <Text strong style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue }}>
                              Nivel Freático
                            </Text>
                          </Flex>
                          <Flex align="baseline" gap={4} justify="space-between">
                            <Text strong style={{ fontSize: ikoluTokens.fontSize2XL, color: ikoluTokens.colorCorporateBlue }}>
                              {(parseFloat(waterTable) || 0).toFixed(2)}
                            </Text>
                            <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: "#597ef7", fontWeight: 700 }}>
                              m
                            </Text>
                          </Flex>
                          {varWaterTable !== null && (
                            <Flex align="center" gap={4} justify="flex-end">
                              {varWaterTable > 0 ? (
                                <RiseOutlined style={{ color: ikoluTokens.colorSuccess, fontSize: 10 }} />
                              ) : (
                                <FallOutlined style={{ color: ikoluTokens.colorError, fontSize: 10 }} />
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
                        <Text style={{ fontSize: 9, color: ikoluTokens.colorGreyText, fontWeight: 700, textTransform: "uppercase" }}>
                          Hoy
                        </Text>
                        <Text strong style={{ fontSize: ikoluTokens.fontSizeMid, color: ikoluTokens.colorSuccess, lineHeight: 1 }}>
                          {validateNumericValue(acumDia, 0) !== null ? validateNumericValue(acumDia, 0) : 0}{" "}
                          <span style={{ fontSize: 9, fontWeight: 600 }}>m³</span>
                        </Text>
                      </Flex>
                      <div style={{ width: "1px", height: "24px", background: ikoluTokens.colorBorderLight }} />
                      <Flex vertical gap={2} align="end">
                        <Text style={{ fontSize: 9, color: ikoluTokens.colorGreyText, fontWeight: 700, textTransform: "uppercase" }}>
                          Ayer
                        </Text>
                        <Text strong style={{ fontSize: ikoluTokens.fontSizeMid, color: ikoluTokens.colorWarning, lineHeight: 1 }}>
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
                borderRadius: ikoluTokens.borderRadius,
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
                    selected_profile?.title || "visualizacion"
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
              profW={selected_profile?.config_data?.d1}
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
            profile={selected_profile}
            loading={loading}
          />

          {/* Variables Configuradas - Vista Móvil */}
          <Card
            style={{
              borderRadius: ikoluTokens.borderRadiusLG,
              boxShadow: ikoluTokens.shadowCard,
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
              borderRadius: ikoluTokens.borderRadiusLG,
              boxShadow: ikoluTokens.shadowCard,
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
                  icon={<ClockCircleOutlined style={{ color: ikoluTokens.colorCorporateBlue }} />}
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
                      borderRadius: ikoluTokens.radiusXL,
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
                                        borderRadius: ikoluTokens.borderRadius,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <ColumnHeightOutlined style={{ fontSize: ikoluTokens.fontSizeXL, color: ikoluTokens.colorInfo }} />
                                    </div>
                                    <Text strong style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue }}>
                                      Nivel de Agua
                                    </Text>
                                  </Flex>
                              {varNivel !== undefined && varNivel !== null && Math.abs(varNivel) > 0.1 && (
                                <Flex align="center" gap={3}>
                                  {varNivel > 0 ? (
                                    <RiseOutlined style={{ color: ikoluTokens.colorSuccess, fontSize: 10 }} />
                                  ) : (
                                    <FallOutlined style={{ color: ikoluTokens.colorError, fontSize: 10 }} />
                                  )}
                                  <Text style={{ fontSize: 9, color: varNivel > 0 ? "#52c41a" : "#ff4d4f", fontWeight: 700 }}>
                                    {varNivel > 0 ? "+" : ""}{varNivel.toFixed(1)}%
                                  </Text>
                                </Flex>
                              )}
                              <Flex align="baseline" gap={4} justify="space-between">
                                <Text strong style={{ fontSize: ikoluTokens.fontSize2XL, color: ikoluTokens.colorCorporateBlue }}>
                                  {(parseFloat(nivel) || 0).toFixed(2)}
                                </Text>
                                <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: "#597ef7", fontWeight: 700 }}>
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
                                    borderRadius: ikoluTokens.borderRadius,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <ArrowDownOutlined style={{ fontSize: ikoluTokens.fontSizeXL, color: "#fa8c16" }} />
                                </div>
                                <Text strong style={{ fontSize: ikoluTokens.fontSizeSmall, color: ikoluTokens.colorCorporateBlue }}>
                                  Nivel Freático
                                </Text>
                              </Flex>
                              {varWaterTable !== undefined && varWaterTable !== null && Math.abs(varWaterTable) > 0.1 && (
                                <Flex align="center" gap={3}>
                                  {varWaterTable > 0 ? (
                                    <RiseOutlined style={{ color: ikoluTokens.colorSuccess, fontSize: 10 }} />
                                  ) : (
                                    <FallOutlined style={{ color: ikoluTokens.colorError, fontSize: 10 }} />
                                  )}
                                  <Text style={{ fontSize: 9, color: varWaterTable > 0 ? "#52c41a" : "#ff4d4f", fontWeight: 700 }}>
                                    {varWaterTable > 0 ? "+" : ""}{varWaterTable.toFixed(1)}%
                                  </Text>
                                </Flex>
                              )}
                              <Flex align="baseline" gap={4} justify="space-between">
                                <Text strong style={{ fontSize: ikoluTokens.fontSize2XL, color: ikoluTokens.colorCorporateBlue }}>
                                  {(parseFloat(waterTable) || 0).toFixed(2)}
                                </Text>
                                <Text style={{ fontSize: ikoluTokens.fontSizeSmall, color: "#597ef7", fontWeight: 700 }}>
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
                            <Text style={{ fontSize: 9, color: ikoluTokens.colorGreyText, fontWeight: 700, textTransform: "uppercase" }}>
                              Hoy
                            </Text>
                            <Text strong style={{ fontSize: ikoluTokens.fontSizeMid, color: ikoluTokens.colorSuccess, lineHeight: 1 }}>
                              {validateNumericValue(acumDia, 0) !== null ? validateNumericValue(acumDia, 0) : 0}{" "}
                              <span style={{ fontSize: 9, fontWeight: 600 }}>m³</span>
                            </Text>
                          </Flex>
                          <div style={{ width: "1px", height: "24px", background: ikoluTokens.colorBorderLight }} />
                          <Flex vertical gap={2} align="end">
                            <Text style={{ fontSize: 9, color: ikoluTokens.colorGreyText, fontWeight: 700, textTransform: "uppercase" }}>
                              Ayer
                            </Text>
                            <Text strong style={{ fontSize: ikoluTokens.fontSizeMid, color: ikoluTokens.colorWarning, lineHeight: 1 }}>
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
                  borderRadius: ikoluTokens.borderRadiusLG,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  background: ikoluTokens.colorWhite,
                  border: `1px solid ${ikoluTokens.colorBorderLight}`,
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
                        borderRadius: ikoluTokens.borderRadiusLG,
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
                        <WifiOutlined style={{ fontSize: 10, color: ikoluTokens.colorCorporateBlue }} />
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
                    <Text style={{ fontSize: ikoluTokens.fontSizeSmall, fontWeight: 700, color: ikoluTokens.colorGreyTextLight }}>N/A</Text>
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
                    profW={selected_profile?.config_data?.d1}
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
                  profile={selected_profile}
                  loading={loading}
                />
              </div>
              <Card
                style={{
                  borderRadius: ikoluTokens.borderRadiusLG,
                  boxShadow: ikoluTokens.shadowCard,
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
        const vars = selected_profile?.config_data?.variables || [];
        const tour = getTelemetryTour(vars);
        return (
          <ModuleTour
            tourKey={tour.key}
            steps={tour.steps}
            requiresPoint={tour.requiresPoint}
            hasPoint={!!selected_profile?.id}
            autoStart={true}
            delay={1200}
          />
        );
      })()}
    </div>
  );
};

export default MyWell;
