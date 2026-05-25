import React, { useCallback, useState, useEffect } from "react";
import "./ControlCenter.css";
import { useData } from "../../contexts/DataContext";
import { useControlCenter } from "../../hooks/useControlCenter";
import sh from "../../api/sh/endpoints";
import { Row, Col, Card, Flex, Typography, Spin, Table, Badge, Tag, theme, Drawer, Modal, Button, Input, Space, Progress } from "antd";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaWifi,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaChartBar,
  FaEye,
  FaCopy,
  FaPaperPlane,
  FaRobot,
  FaLightbulb,
  FaTrash,
  FaQuestionCircle,
  FaSun,
  FaMoon,
} from "react-icons/fa";

import KPICard from "./KPICard";
import { formatInteger } from "../../utils/numberFormatter";
import ModuleTour from "../common/ModuleTour";
import { centroControlTour } from "../../config/tours";
import { ikoluTokens, kpiGradients } from "../../theme";
import moment from "moment";

const { Text } = Typography;
const { useToken } = theme;

/* ── Columnas de la tabla ── */
const pointsColumns = (onViewVoucher, token) => [
  {
    title: "Punto",
    dataIndex: "title",
    key: "title",
    fixed: "left",
    width: 90,
    sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
    defaultSortOrder: "ascend",
    render: (text) => (
      <Text strong style={{ fontSize: 13, color: ikoluTokens.colorCorporateBlue }}>
        {text || "—"}
      </Text>
    ),
  },
  {
    title: "Código de Obra",
    dataIndex: "code",
    key: "code",
    responsive: ["md"],
    width: 220,
    render: (code, record) =>
      code ? (
        <Flex vertical gap={4}>
          {/* Arriba: código de obra */}
          {record.compliance_type?.includes("DGA") ? (
            <a
              href={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${encodeURIComponent(code)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: token.colorPrimary, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}
              onClick={(e) => e.stopPropagation()}
            >
              {code}
            </a>
          ) : (
            <Text strong style={{ fontSize: 12, color: token.colorText, whiteSpace: "nowrap" }}>
              {code}
            </Text>
          )}
          {/* Abajo: estándar + tipo (solo si es DGA) */}
          {record.compliance_type?.includes("DGA") && (
            <Flex gap={6} align="center" wrap="nowrap">
              <Tag style={{ fontSize: 11, margin: 0, padding: "2px 8px", lineHeight: "18px", background: token.colorPrimaryBg, border: "none", color: token.colorPrimary, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                {record.standard}
              </Tag>
              <Tag style={{ fontSize: 11, margin: 0, padding: "2px 8px", lineHeight: "18px", background: token.colorBgLayout, border: "none", color: token.colorTextSecondary, whiteSpace: "nowrap", flexShrink: 0 }}>
                {record.type_dga}
              </Tag>
            </Flex>
          )}
        </Flex>
      ) : (
        <span style={{ color: ikoluTokens.colorGreyTextLight }}>—</span>
      ),
  },
  {
    title: "Límites / Estado",
    key: "limits",
    width: 220,
    responsive: ["md"],
    render: (_, record) => (
      <Flex vertical gap={8}>
        {/* Caudal autorizado vs actual */}
        <Flex vertical gap={3}>
          <Flex justify="space-between" align="center">
            <Text strong style={{ fontSize: 11, color: token.colorText }}>Caudal</Text>
            {record.authorized_flow > 0 && record.flow_lps != null ? (
              <Text strong style={{ fontSize: 11, color: token.colorText }}>
                {Number(record.flow_lps).toFixed(1)} / {Number(record.authorized_flow).toFixed(1)} <span style={{ fontSize: 10, fontWeight: 400 }}>L/s</span>
              </Text>
            ) : (
              <Text strong style={{ fontSize: 11, color: token.colorError }}>?</Text>
            )}
          </Flex>
          {record.authorized_flow > 0 && record.flow_lps != null ? (
            <div style={{ position: "relative", height: 6, borderRadius: 3, background: token.colorBgLayout, overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${Math.min((record.flow_lps / record.authorized_flow) * 100, 100)}%`,
                  borderRadius: 3,
                  background: record.flow_lps > record.authorized_flow ? token.colorError : token.colorSuccess,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          ) : (
            <div style={{ height: 6, borderRadius: 3, background: token.colorBgLayout }} />
          )}
        </Flex>

        {/* Progreso anual */}
        <Flex vertical gap={3}>
          <Flex justify="space-between" align="center">
            <Text strong style={{ fontSize: 11, color: token.colorText }}>Anual</Text>
            {record.pct_consumed != null ? (
              <Text
                strong
                style={{
                  fontSize: 12,
                  color:
                    record.pct_consumed > 100
                      ? token.colorError
                      : record.pct_consumed > 80
                      ? token.colorWarning
                      : token.colorSuccess,
                }}
              >
                {Number(record.pct_consumed).toFixed(1)}%
              </Text>
            ) : (
              <Text strong style={{ fontSize: 11, color: token.colorError }}>?</Text>
            )}
          </Flex>
          {record.pct_consumed != null ? (
            <Progress
              percent={Math.min(Number(record.pct_consumed), 100)}
              size="small"
              showInfo={false}
              strokeColor={
                record.pct_consumed > 100
                  ? token.colorError
                  : record.pct_consumed > 80
                  ? token.colorWarning
                  : token.colorSuccess
              }
              trailColor={token.colorBgLayout}
            />
          ) : (
            <div style={{ height: 6, borderRadius: 3, background: token.colorBgLayout }} />
          )}
          {record.authorized_total > 0 && record.annual_consumption != null ? (
            <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
              {formatInteger(record.annual_consumption)} / {formatInteger(record.authorized_total)} m³
            </Text>
          ) : (
            <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>
              Sin datos de consumo anual
            </Text>
          )}
        </Flex>
      </Flex>
    ),
  },
  {
    title: "Último envío",
    dataIndex: "last_sent_at",
    key: "last_sent_at",
    width: 100,
    align: "center",
    render: (date) =>
      date ? (
        <Text style={{ fontSize: 12, color: token.colorText, whiteSpace: "nowrap" }}>
          {moment(date).format("DD/MM HH:mm")}
        </Text>
      ) : (
        <span style={{ color: ikoluTokens.colorGreyTextLight }}>—</span>
      ),
  },
  {
    title: "Caudal",
    dataIndex: "flow_lps",
    key: "flow_lps",
    width: 90,
    align: "right",
    render: (v) =>
      v != null ? (
        <Text strong style={{ fontSize: 13, color: v > 0 ? token.colorSuccess : token.colorTextSecondary }}>
          {Number(v).toFixed(2)}
          <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>L/s</span>
        </Text>
      ) : (
        "—"
      ),
  },
  {
    title: "Nivel",
    dataIndex: "water_table_m",
    key: "water_table_m",
    width: 85,
    align: "right",
    render: (v) =>
      v != null ? (
        <Text style={{ fontSize: 13, color: token.colorInfo }}>
          {Number(v).toFixed(2)}
          <span style={{ fontSize: 10, marginLeft: 2 }}>m</span>
        </Text>
      ) : (
        "—"
      ),
  },
  {
    title: "Totalizado",
    dataIndex: "total_m3",
    key: "total_m3",
    width: 110,
    align: "right",
    render: (v) =>
      v != null ? (
        <Text strong style={{ fontSize: 14, color: token.colorPrimary }}>
          {formatInteger(v)}
          <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>m³</span>
        </Text>
      ) : (
        "—"
      ),
  },
  {
    title: "",
    dataIndex: "voucher",
    key: "voucher",
    width: 50,
    align: "center",
    fixed: "right",
    render: (v, record) =>
      v ? (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `${token.colorPrimary}10`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `${token.colorPrimary}20`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = `${token.colorPrimary}10`)}
          onClick={(e) => {
            e.stopPropagation();
            onViewVoucher(record);
          }}
        >
          <FaEye style={{ fontSize: 12, color: token.colorPrimary }} />
        </div>
      ) : (
        <span style={{ color: ikoluTokens.colorGreyTextLight }}>—</span>
      ),
  },
];

/* ── Helper: normalizar número que puede venir como objeto {source, parsedValue} ── */
const extractRecordNum = (val) => {
  if (val == null) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return isNaN(n) ? null : n;
  }
  if (typeof val === "object") {
    if (val.parsedValue != null) {
      const n = Number(val.parsedValue);
      return isNaN(n) ? null : n;
    }
    if (val.source != null) {
      const n = Number(val.source);
      return isNaN(n) ? null : n;
    }
  }
  return null;
};

/* ── Helper: extraer mediciones de respuesta del endpoint ── */
const extractMeasurements = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.records)) return raw.records;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.measurements)) return raw.measurements;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.calendar)) return raw.calendar;
  return [];
};

/* ── Helper: clasificar mediciones por franja horaria ── */
const classifyByTimeOfDay = (measurements) => {
  const dawn = [];     // 00:00 - 05:00
  const morning = [];  // 06:00 - 12:00
  const afternoon = []; // 13:00 - 18:00
  const night = [];    // 19:00 - 23:00

  measurements.forEach((m) => {
    const timeStr = m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at;
    if (!timeStr) return;
    const hour = moment(timeStr).hour();
    if (hour >= 0 && hour <= 5) dawn.push(m);
    else if (hour >= 6 && hour <= 12) morning.push(m);
    else if (hour >= 13 && hour <= 18) afternoon.push(m);
    else night.push(m);
  });

  const sortByTime = (a, b) => {
    const ta = moment(a.date_time || a.date_time_medition || a.timestamp || a.time || a.created_at).valueOf();
    const tb = moment(b.date_time || b.date_time_medition || b.timestamp || b.time || b.created_at).valueOf();
    return ta - tb;
  };

  return {
    dawn: dawn.sort(sortByTime),
    morning: morning.sort(sortByTime),
    afternoon: afternoon.sort(sortByTime),
    night: night.sort(sortByTime),
  };
};

/* ── Componente: contenido del Drawer de mediciones ── */
const MeasurementsDrawerContent = ({ data, token }) => {
  const measurements = extractMeasurements(data);
  const groups = classifyByTimeOfDay(measurements);

  if (measurements.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ height: 200 }} vertical gap={8}>
        <Text type="secondary" style={{ fontSize: 14 }}>Sin mediciones para este día</Text>
      </Flex>
    );
  }

  const getPeriod = (hour) => {
    if (hour >= 0 && hour <= 5) return { label: "Madrugada", icon: FaMoon };
    if (hour >= 6 && hour <= 12) return { label: "Mañana", icon: FaSun };
    if (hour >= 13 && hour <= 18) return { label: "Tarde", icon: FaSun };
    return { label: "Noche", icon: FaMoon };
  };

  const TrendArrow = ({ current, previous }) => {
    if (previous == null || current == null) return null;
    const cur = extractRecordNum(current);
    const prev = extractRecordNum(previous);
    if (cur == null || prev == null || cur === prev) return null;
    const up = cur > prev;
    return (
      <span style={{ fontSize: 9, marginLeft: 4, color: up ? token.colorPrimary : token.colorSuccess }}>
        {up ? "▲" : "▼"}
      </span>
    );
  };

  const measurementColumns = [
    {
      title: "Período",
      key: "period",
      width: 85,
      align: "center",
      render: (_, m) => {
        const hour = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).hour();
        const p = getPeriod(hour);
        const Icon = p.icon;
        return (
          <Flex align="center" justify="center" gap={4}>
            <Icon style={{ fontSize: 9, color: token.colorPrimary, opacity: 0.5 }} />
            <Text style={{ fontSize: 10, color: token.colorPrimary }}>{p.label}</Text>
          </Flex>
        );
      },
    },
    {
      title: "Fecha logger",
      key: "logger_time",
      width: 120,
      align: "center",
      render: (_, m) => {
        const t = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("DD/MM HH:mm:ss");
        return <Text strong style={{ fontSize: 10, color: token.colorPrimary }}>{t}</Text>;
      },
    },
    {
      title: "Hora",
      key: "time",
      width: 50,
      align: "center",
      render: (_, m) => {
        const t = moment(m.date_time || m.date_time_medition || m.timestamp || m.time || m.created_at).format("HH:mm");
        return <Text style={{ fontSize: 11, color: token.colorText }}>{t}</Text>;
      },
    },
    {
      title: "Caudal (L/s)",
      key: "flow",
      width: 90,
      align: "right",
      render: (_, m) => {
        const flowVal = extractRecordNum(m.flow) ?? extractRecordNum(m.caudal);
        return flowVal != null ? (
          <Text style={{ fontSize: 11, color: token.colorText }}>
            {flowVal.toFixed(1)}
            <TrendArrow current={m.flow} previous={m._prev?.flow} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Nivel (m)",
      key: "nivel",
      width: 80,
      align: "right",
      render: (_, m) => {
        const levelVal = extractRecordNum(m.nivel) ?? extractRecordNum(m.level);
        return levelVal != null ? (
          <Text style={{ fontSize: 11, color: token.colorText }}>
            {levelVal.toFixed(2)}
            <TrendArrow current={m.nivel} previous={m._prev?.nivel} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Nivel freático (m)",
      key: "water_table",
      width: 115,
      align: "right",
      render: (_, m) => {
        const wtVal = extractRecordNum(m.water_table);
        return wtVal != null ? (
          <Text style={{ fontSize: 11, color: token.colorText }}>
            {wtVal.toFixed(2)}
            <TrendArrow current={m.water_table} previous={m._prev?.water_table} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Total (m³)",
      key: "total",
      width: 100,
      align: "right",
      render: (_, m) => {
        const totalVal = extractRecordNum(m.total);
        return totalVal != null ? (
          <Text style={{ fontSize: 11, color: token.colorText }}>
            {totalVal.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
            <TrendArrow current={m.total} previous={m._prev?.total} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Consumo (m³)",
      key: "consumo",
      width: 100,
      align: "right",
      render: (_, m) => {
        const diffVal = extractRecordNum(m.total_diff);
        return diffVal != null ? (
          <Text strong style={{ fontSize: 11, color: token.colorPrimary }}>
            {diffVal.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
            <TrendArrow current={m.total_diff} previous={m._prev?.total_diff} />
          </Text>
        ) : <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>—</Text>;
      },
    },
    {
      title: "Estado",
      key: "estado",
      width: 85,
      align: "center",
      render: (_, m) => {
        if (m.is_error) {
          return <Tag color="error" style={{ fontSize: 9, margin: 0, padding: "0 6px", lineHeight: "18px" }}>Error</Tag>;
        }
        return <Tag style={{ fontSize: 9, margin: 0, padding: "0 6px", lineHeight: "18px", background: `${token.colorSuccess}10`, border: `1px solid ${token.colorSuccess}30`, color: token.colorSuccess }}>Confirmado</Tag>;
      },
    },
  ];

  const allMeasurements = [...groups.dawn, ...groups.morning, ...groups.afternoon, ...groups.night];

  return (
    <Table
      dataSource={allMeasurements.map((m, i) => ({ ...m, key: i, _prev: allMeasurements[i - 1] || null }))}
      columns={measurementColumns}
      size="small"
      pagination={false}
      bordered
      showHeader={true}
      locale={{ emptyText: "Sin mediciones para este día" }}
      components={{
        header: {
          cell: (props) => (
            <th {...props} style={{ ...props.style, fontSize: 9, padding: "6px 8px", fontWeight: 600, color: token.colorTextSecondary, textTransform: "uppercase", letterSpacing: 0.5 }} />
          ),
        },
      }}
    />
  );
};

const ControlCenter = () => {
  const { dispatch } = useData();
  const { data, loading, error, refresh, isReady, chatQuota } = useControlCenter({
    autoRefresh: true,
    refreshInterval: 60000,
  });
  const { token } = useToken();
  const [selectedDate, setSelectedDate] = useState(null);
  const [warningsDrawerOpen, setWarningsDrawerOpen] = useState(false);
  const [selectedWarningPoint, setSelectedWarningPoint] = useState(null);
  const [warningsExpanded, setWarningsExpanded] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCopied, setVoucherCopied] = useState(false);

  // ── Drawer de Mediciones ──
  const [measurementsDrawerOpen, setMeasurementsDrawerOpen] = useState(false);
  const [selectedMeasurementPoint, setSelectedMeasurementPoint] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);
  const [measurementsLoading, setMeasurementsLoading] = useState(false);

  // ── Chat IA ──
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: "¡Hola! Soy tu asistente de telemetría. ¿En qué puedo ayudarte?", time: Date.now() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chatMeta, setChatMeta] = useState({ dailyLimit: null, usedToday: null, remainingToday: null });

  // Sincronizar cuota del chat desde dashboard_stats al cargar
  useEffect(() => {
    if (chatQuota && chatQuota.limit != null) {
      setChatMeta({
        dailyLimit: chatQuota.limit,
        usedToday: chatQuota.used,
        remainingToday: chatQuota.remaining,
      });
    }
  }, [chatQuota]);

  const sendChatMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text, time: Date.now() }]);
    setChatLoading(true);
    try {
      const res = await sh.chat(text);
      const reply = res?.response || res?.message || res?.answer || "No tengo una respuesta en este momento.";
      setChatMessages((prev) => [...prev, { role: "bot", text: reply, time: Date.now() }]);
      setChatMeta({
        dailyLimit: res?.daily_limit ?? null,
        usedToday: res?.used_today ?? null,
        remainingToday: res?.remaining_today ?? null,
      });
    } catch (err) {
      console.error("[Chat] Error:", err);
      setChatMessages((prev) => [...prev, { role: "bot", text: "Ups, hubo un error. Intenta de nuevo.", time: Date.now() }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading]);

  const handleViewVoucher = useCallback((record) => {
    setSelectedVoucher(record);
    setVoucherModalOpen(true);
  }, []);

  const handleViewMeasurements = useCallback(async (pointName, date) => {
    const point = data?.points?.find((p) => p.title === pointName);
    if (!point) return;
    setSelectedMeasurementPoint({ pointName, date, pointId: point.id });
    setMeasurementsDrawerOpen(true);
    setMeasurementsLoading(true);
    setMeasurementsData(null);
    try {
      const res = await sh.pointRecords(point.id, date, date, 100);
      setMeasurementsData(res);
    } catch (err) {
      console.error("[Measurements] Error:", err);
    } finally {
      setMeasurementsLoading(false);
    }
  }, [data?.points]);

  const handleSelectPoint = useCallback(
    (point) => {
      dispatch({
        type: "CHANGE_SELECTED_PROFILE",
        payload: { selected_profile: { ...point, key: point.id } },
      });
    },
    [dispatch]
  );

  const overview = data?.overview || {};
  const points = data?.points || [];
  const warningsList = data?.recent_warnings_list || [];
  const warningsRaw = data?.recent_warnings || {};

  if (loading && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }}>
        <Spin size="large" tip="Cargando Centro de Control..." />
      </Flex>
    );
  }

  if (error && !isReady) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "50vh" }} vertical gap={16}>
        <Text type="danger" strong style={{ fontSize: token.fontSizeLG }}>
          Error cargando el Centro de Control
        </Text>
        <Text type="secondary">{error.message}</Text>
        <button onClick={refresh} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Reintentar
        </button>
      </Flex>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* ════════════════════════════════════════
          KPIs
      ════════════════════════════════════════ */}
      <Row id="cc-kpi-cards" gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaMapMarkerAlt style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Total Puntos"
            value={overview.total_points || 0}
            gradient={kpiGradients.primary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaBroadcastTower style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Telemetría Activa"
            value={`${overview.points_with_telemetry || 0}`}
            suffix={`/${overview.total_points || 0}`}
            gradient={kpiGradients.secondary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaClipboardCheck style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Cumplimiento Normativo"
            value={overview.points_with_compliance || 0}
            gradient={kpiGradients.secondary}
          />
        </Col>
        <Col xs={12} sm={6} md={6}>
          <KPICard
            icon={<FaExclamationTriangle style={{ fontSize: 20, color: ikoluTokens.colorWhite }} />}
            label="Warnings"
            value={warningsList.length}
            gradient={kpiGradients.secondary}
          />
        </Col>
      </Row>

      {/* ════════════════════════════════════════
          Warnings por punto — Grid 3 cols, Drawer por punto
      ════════════════════════════════════════ */}
      {warningsList.length > 0 && (
        <Card
          size="small"
          style={{ borderRadius: token.borderRadiusLG, marginBottom: 24, background: token.colorBgContainer }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Header clickeable para expandir/colapsar */}
          <div
            onClick={() => setWarningsExpanded(!warningsExpanded)}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              borderBottom: warningsExpanded ? `1px solid ${token.colorBorderSecondary}` : "none",
            }}
          >
            <Flex justify="space-between" align="flex-start">
              <Flex vertical gap={2}>
                <Flex align="center" gap={8}>
                  <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 14 }} />
                  <Text strong style={{ fontSize: 14 }}>Warnings Detectados</Text>
                  <Tag color="warning" style={{ fontSize: 10, margin: 0 }}>{warningsList.length}</Tag>
                </Flex>
                <Text style={{ fontSize: 11, color: token.colorTextSecondary, paddingLeft: 22 }}>
                  Warnings detectados activamente por nuestro sistema
                </Text>
              </Flex>
              <div style={{
                fontSize: 10,
                color: token.colorTextSecondary,
                transform: warningsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                marginTop: 4,
              }}>
                ▼
              </div>
            </Flex>
          </div>

          {/* Grid de puntos con warnings — solo visible si expandido */}
          {warningsExpanded && (
            <div style={{ padding: 12 }}>
              <Row gutter={[12, 12]}>
                {Object.entries(warningsRaw).map(([pointName, warnings]) => {
                  const arr = Array.isArray(warnings) ? warnings : [];
                  if (arr.length === 0) return null;
                  return (
                    <Col key={pointName} xs={24} sm={12} md={8}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWarningPoint(pointName);
                          setWarningsDrawerOpen(true);
                        }}
                        style={{
                          borderRadius: token.borderRadius,
                          background: token.colorBgLayout,
                          border: `1px solid ${token.colorBorderSecondary}`,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          padding: "10px 12px",
                        }}
                      >
                        <Flex justify="space-between" align="center">
                          <Flex align="center" gap={8}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background: `${token.colorWarning}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 12 }} />
                            </div>
                            <div>
                              <Text strong style={{ fontSize: 13, display: "block" }}>{pointName}</Text>
                              <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
                                {arr.length} warning{arr.length > 1 ? "s" : ""}
                              </Text>
                            </div>
                          </Flex>
                          <FaEye style={{ fontSize: 12, color: token.colorTextSecondary }} />
                        </Flex>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Card>
      )}

      {/* ════════════════════════════════════════
          Fila del medio: Estado + Cumplimiento | Consumo Semanal
      ════════════════════════════════════════ */}
      {/* ════════════════════════════════════════
          Consumo Semanal
      ════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={24}>
            <div style={{ padding: "0 0 16px" }}>
              {(() => {
              const dayMap = {};
              Object.entries(data?.last_7 || {}).forEach(([pointName, pointWeek]) => {
                (pointWeek?.days || []).forEach((d) => {
                  if (!d.date) return;
                  if (!dayMap[d.date]) dayMap[d.date] = { points: [] };
                  dayMap[d.date].points.push({ pointName, ...d });
                });
              });

              const sortedDays = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).slice(-7);
              if (sortedDays.length === 0) return <Text type="secondary">Sin datos</Text>;

              const defaultDate = sortedDays[sortedDays.length - 1][0];
              const activeDate = selectedDate || defaultDate;
              const activePoints = activeDate && dayMap[activeDate] ? dayMap[activeDate].points : [];

              return (
                <Flex vertical gap={14}>
                  {/* Grid de cuadritos calendario */}
                  <Flex gap={8}>
                    {sortedDays.map(([date, { points }]) => {
                      const total = points.reduce((a, p) => a + (p.consumption || 0), 0);
                      const isActive = activeDate === date;
                      const isToday = moment(date).isSame(moment(), "day");
                      return (
                        <div
                          key={date}
                          onClick={() => setSelectedDate(isActive ? null : date)}
                          style={{
                            flex: 1,
                            minHeight: 90,
                            padding: "10px 8px",
                            borderRadius: token.borderRadius,
                            border: `1.5px solid ${isActive ? token.colorPrimary : isToday ? token.colorPrimary + "40" : token.colorBorder}`,
                            background: isActive ? token.colorPrimary : isToday ? `${token.colorPrimary}08` : token.colorBgContainer,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <Text style={{ fontSize: 10, color: isActive ? "#fff" : token.colorTextSecondary, textTransform: "capitalize", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                            {moment(date).format("dddd")}
                          </Text>
                          <Text strong style={{ fontSize: 22, color: isActive ? "#fff" : token.colorText, lineHeight: 1 }}>
                            {moment(date).format("DD")}
                          </Text>
                          <Text style={{ fontSize: 10, color: isActive ? "#fff" : token.colorTextSecondary }}>
                            {formatInteger(total)} m³
                          </Text>
                        </div>
                      );
                    })}
                  </Flex>

                  {/* Detalle del día activo */}
                  {activeDate && dayMap[activeDate] && (
                    <Table
                      dataSource={[...dayMap[activeDate].points]
                        .sort((a, b) => (b.consumption || 0) - (a.consumption || 0))
                        .map((p, idx) => ({ ...p, key: idx, rank: idx + 1 }))}
                      size="small"
                      bordered
                      pagination={false}
                      showHeader={true}
                      columns={[
                        {
                          title: "#",
                          dataIndex: "rank",
                          key: "rank",
                          width: 40,
                          align: "center",
                          render: (rank) => (
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${token.colorPrimary}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: token.colorPrimary, fontWeight: 700, margin: "0 auto" }}>
                              {rank}
                            </div>
                          ),
                        },
                        { title: "Punto", dataIndex: "pointName", key: "pointName", width: 70, render: (text) => <Text strong style={{ fontSize: 12 }}>{text}</Text> },
                        { title: "Consumo (m³)", dataIndex: "consumption", key: "consumption", width: 130, align: "right", render: (v) => <Text strong style={{ fontSize: 12, color: token.colorPrimary }}>{formatInteger(v || 0)}</Text> },
                        { title: "Caudal prom. (L/s)", dataIndex: "avg_flow", key: "avg_flow", width: 120, align: "right", render: (v) => <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{v != null ? Number(v).toFixed(1) : "—"}</Text> },
                        { title: "Nivel prom. (m)", dataIndex: "avg_level", key: "avg_level", width: 100, align: "right", render: (v) => <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{v != null ? Number(v).toFixed(2) : "—"}</Text> },
                        { title: "Med.", dataIndex: "measurements_count", key: "measurements_count", width: 70, align: "center", render: (v, record) => (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "2px 8px",
                              borderRadius: 10,
                              background: `${token.colorPrimary}10`,
                              border: `1px solid ${token.colorPrimary}25`,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMeasurements(record.pointName, activeDate);
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = `${token.colorPrimary}20`; e.currentTarget.style.borderColor = `${token.colorPrimary}40`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = `${token.colorPrimary}10`; e.currentTarget.style.borderColor = `${token.colorPrimary}25`; }}
                            title={`Ver ${v || 0} mediciones`}
                          >
                            <FaEye style={{ fontSize: 10, color: token.colorPrimary }} />
                            <Text strong style={{ fontSize: 11, color: token.colorPrimary, lineHeight: 1 }}>{v || 0}</Text>
                          </div>
                        ) },
                      ]}
                      onRow={(record) => ({
                        onClick: () => handleSelectPoint({ id: record.pointName, title: record.pointName }),
                        style: { cursor: "pointer" },
                      })}
                      locale={{ emptyText: "Sin datos" }}
                    />
                  )}
                </Flex>
              );
            })()}
            </div>
        </Col>
      </Row>

      {/* ════════════════════════════════════════
          Botón flotante del Chat IA
      ════════════════════════════════════════ */}
      {/* Chat flotante */}
      {chatDrawerOpen && (
        <Card
          size="small"
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 380,
            height: 520,
            borderRadius: token.borderRadiusLG,
            zIndex: 1000,
            boxShadow: `0 8px 32px rgba(0,0,0,0.25)`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fade-in-up 0.25s ease",
          }}
          bodyStyle={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <Flex align="center" gap={10} style={{ padding: "12px 16px", borderBottom: `1px solid ${token.colorBorderSecondary}`, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${token.colorPrimary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaRobot style={{ color: token.colorPrimary, fontSize: 14 }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 13, display: "block" }}>Experto en Telemetría</Text>
              <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>Smart Hydro — Consultas en tiempo real</Text>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <Button
                type="text"
                size="small"
                icon={<FaTrash style={{ fontSize: 11, color: token.colorTextSecondary }} />}
                onClick={() => setChatMessages([{ role: "bot", text: "¡Hola! Soy tu asistente de telemetría. ¿En qué puedo ayudarte?", time: Date.now() }])}
                style={{ padding: "0 4px" }}
                title="Limpiar chat"
              />
              <Button
                type="text"
                size="small"
                onClick={() => setChatDrawerOpen(false)}
                style={{ padding: "0 4px", color: token.colorTextSecondary, fontSize: 16 }}
              >
                ✕
              </Button>
            </div>
          </Flex>

          {/* Capacidades */}
          <div style={{ padding: "8px 12px", background: `${token.colorPrimary}08`, borderBottom: `1px solid ${token.colorBorderSecondary}`, flexShrink: 0 }}>
            <Text style={{ fontSize: 10, color: token.colorTextSecondary, lineHeight: 1.4, display: "block" }}>
              <FaLightbulb style={{ color: token.colorPrimary, fontSize: 10, marginRight: 4 }} /> <span style={{ color: token.colorPrimary, fontWeight: 600 }}>Objetivo:</span> Ayudarte a interpretar tus datos de telemetría, consumo, caudal y cumplimiento normativo en tiempo real.
            </Text>
          </div>

          {/* Mensajes */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {chatMessages.map((msg, i) => (
              <Flex
                key={i}
                justify={msg.role === "user" ? "flex-end" : "flex-start"}
                align="flex-start"
                gap={8}
                style={{ animation: "fade-in-up 0.3s ease" }}
              >
                {msg.role === "bot" && (
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${token.colorPrimary}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <FaRobot style={{ color: token.colorPrimary, fontSize: 10 }} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: msg.role === "user" ? token.colorPrimary : token.colorBgLayout,
                    color: msg.role === "user" ? "#fff" : token.colorText,
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                    boxShadow: `0 1px 4px ${token.colorBorder}`,
                  }}
                >
                  {msg.text}
                </div>
              </Flex>
            ))}
            {chatLoading && (
              <Flex align="center" gap={8} style={{ animation: "fade-in-up 0.3s ease" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${token.colorPrimary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaRobot style={{ color: token.colorPrimary, fontSize: 10 }} />
                </div>
                <div style={{ padding: "8px 12px", borderRadius: 12, background: token.colorBgLayout, border: `1px solid ${token.colorBorderSecondary}` }}>
                  <Flex gap={3} align="center" style={{ height: 16 }}>
                    <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: token.colorPrimary, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0s" }} />
                    <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: token.colorPrimary, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
                    <span className="chat-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: token.colorPrimary, animation: "chat-bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
                  </Flex>
                </div>
              </Flex>
            )}
          </div>

          {/* Sugerencias toggle */}
          {showSuggestions && (
            <div style={{ padding: "8px 12px", borderTop: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgLayout, flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(() => {
                  const base = ["¿Cómo va mi consumo?", "¿Qué punto consumió más hoy?"];
                  const pointQs = points.slice(0, 4).map((p) => `¿Cómo ha funcionado ${p.title || p.id}?`);
                  return [...base, ...pointQs];
                })().map((q) => (
                  <Tag
                    key={q}
                    color="primary"
                    style={{ fontSize: 10, margin: 0, cursor: "pointer", lineHeight: "20px" }}
                    onClick={() => { setChatInput(q); }}
                  >
                    {q}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "8px 12px", borderTop: `1px solid ${token.colorBorderSecondary}`, background: token.colorBgContainer, flexShrink: 0 }}>
            <Flex gap={8} align="flex-end">
              <Input.TextArea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                placeholder="Pregúntame sobre tus puntos..."
                maxLength={50}
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: `1.5px solid ${token.colorBorder}`,
                  background: token.colorBgElevated,
                  fontSize: 13,
                  padding: "8px 12px",
                }}
              />
              <Button
                type="default"
                shape="circle"
                icon={<FaQuestionCircle style={{ fontSize: 14, color: token.colorTextSecondary }} />}
                onClick={() => setShowSuggestions(!showSuggestions)}
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<FaPaperPlane style={{ fontSize: 12, color: "#fff" }} />}
                onClick={sendChatMessage}
                loading={chatLoading}
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Flex>
            <Flex justify="space-between" align="center" style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 11, color: chatMeta.remainingToday === 0 ? token.colorError : token.colorTextSecondary, fontWeight: 500 }}>
                {chatMeta.dailyLimit != null ? `Preguntas usadas: ${chatMeta.usedToday} de ${chatMeta.dailyLimit} disponibles` : ""}
              </Text>
              <Text strong style={{ fontSize: 11, color: chatInput.length >= 50 ? token.colorError : token.colorTextSecondary }}>
                {chatInput.length}/50
              </Text>
            </Flex>
          </div>
        </Card>
      )}

      {/* Botón flotante */}
      <div
        onClick={() => setChatDrawerOpen(!chatDrawerOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)",
          border: "2px solid #1F346150",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: `0 4px 16px rgba(31,52,97,0.35)`,
        }}
      >
        <FaRobot style={{ color: "#fff", fontSize: 22 }} />
      </div>

      {/* ════════════════════════════════════════
          Tabla de compliance
      ════════════════════════════════════════ */}
        <Card
          size="small"
          title={(
            <Flex align="center" gap={8} wrap="wrap">
              <FaClipboardCheck style={{ color: token.colorPrimary, fontSize: 16, flexShrink: 0 }} />
              <Text strong style={{ fontSize: 14, whiteSpace: "normal" }}>Cumplimiento normativo</Text>
            </Flex>
          )}
          headStyle={{ whiteSpace: "normal", height: "auto", minHeight: 40 }}
          style={{ borderRadius: token.borderRadiusLG, overflow: "hidden", marginTop: 32 }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={points}
            columns={pointsColumns(handleViewVoucher, token)}
            rowKey="id"
            size="small"
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            locale={{ emptyText: "No hay puntos disponibles" }}
            onRow={(record) => ({
              onClick: () => handleSelectPoint(record),
              style: {
                cursor: "pointer",
                background: "transparent",
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.background = token.colorBgTextHover || "#f5f5f5";
                e.currentTarget.style.transition = "background 0.15s ease";
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.background = "transparent";
              },
            })}
          />
        </Card>

      {/* ════════════════════════════════════════
          Drawer de Warnings por punto
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>{selectedWarningPoint}</Text>
            <Tag color="warning" style={{ margin: 0 }}>
              {(warningsRaw[selectedWarningPoint] || []).length} warnings
            </Tag>
          </Flex>
        }
        placement="right"
        onClose={() => {
          setWarningsDrawerOpen(false);
          setSelectedWarningPoint(null);
        }}
        open={warningsDrawerOpen}
        width={640}
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
          Warnings generados de forma nativa por nuestro servicio.
        </Text>
        <Table
          dataSource={(warningsRaw[selectedWarningPoint] || []).map((w, i) => ({ ...w, key: i }))}
          size="small"
          pagination={{ pageSize: 10, size: "small" }}
          locale={{ emptyText: "Sin warnings para este punto" }}
          columns={[
            {
              title: "Fecha",
              dataIndex: "time",
              key: "time",
              width: 110,
              render: (time) => (
                <Text style={{ fontSize: 11, color: token.colorTextSecondary, whiteSpace: "nowrap" }}>
                  {time ? moment(time).format("DD/MM HH:mm") : "—"}
                </Text>
              ),
            },
            {
              title: "Tipo",
              dataIndex: "type",
              key: "type",
              width: 80,
              render: (type) => <Tag style={{ fontSize: 10, margin: 0 }}>{type}</Tag>,
            },
            {
              title: "Severidad",
              dataIndex: "severity",
              key: "severity",
              width: 90,
              render: (sev) => {
                const color = sev === "ERROR" ? "red" : sev === "WARNING" ? "orange" : "blue";
                return <Tag color={color} style={{ fontSize: 10, margin: 0 }}>{sev}</Tag>;
              },
            },
            {
              title: "Mensaje",
              dataIndex: "message",
              key: "message",
              render: (msg) => (
                <Text style={{ fontSize: 12, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }}>
                  {msg}
                </Text>
              ),
            },
          ]}
        />
      </Drawer>

      {/* ════════════════════════════════════════
          Drawer de Mediciones por punto
      ════════════════════════════════════════ */}
      <Drawer
        title={
          <Flex align="center" gap={8} justify="space-between" style={{ width: "100%" }}>
            <Flex align="center" gap={8}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${token.colorPrimary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaBroadcastTower style={{ color: token.colorPrimary, fontSize: 16 }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 14, display: "block" }}>{selectedMeasurementPoint?.pointName}</Text>
                <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
                  {selectedMeasurementPoint?.date ? moment(selectedMeasurementPoint.date).format("dddd D [de] MMMM, YYYY") : ""}
                </Text>
              </div>
            </Flex>
            {measurementsData?.count != null && (
              <Tag style={{ fontSize: 11, margin: 0, background: `${token.colorPrimary}10`, border: `1px solid ${token.colorPrimary}25`, color: token.colorPrimary, fontWeight: 600 }}>
                {measurementsData.count} mediciones
              </Tag>
            )}
          </Flex>
        }
        open={measurementsDrawerOpen}
        onClose={() => {
          setMeasurementsDrawerOpen(false);
          setSelectedMeasurementPoint(null);
          setMeasurementsData(null);
        }}
        width={960}
        bodyStyle={{ padding: 16, overflow: "auto" }}
      >
        {measurementsLoading ? (
          <Flex justify="center" align="center" style={{ height: 200 }}>
            <Spin size="small" />
          </Flex>
        ) : (
          <MeasurementsDrawerContent data={measurementsData} token={token} />
        )}
      </Drawer>

      {/* ════════════════════════════════════════
          Modal de Voucher DGA
      ════════════════════════════════════════ */}
      <Modal
        title={
          <Flex align="center" gap={8}>
            <FaClipboardCheck style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Text strong style={{ fontSize: 16 }}>Voucher</Text>
          </Flex>
        }
        open={voucherModalOpen}
        onCancel={() => {
          setVoucherModalOpen(false);
          setSelectedVoucher(null);
        }}
        footer={null}
        width={420}
      >
        <Flex vertical gap={12} style={{ marginTop: 8 }}>
          <Text strong style={{ fontSize: 14 }}>
            {selectedVoucher?.title} — {selectedVoucher?.code || "Sin código DGA"}
          </Text>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={selectedVoucher?.voucher || ""}
              readOnly
              style={{ fontSize: 13, fontFamily: "monospace" }}
            />
            <Button
              type={voucherCopied ? "default" : "primary"}
              icon={<FaCopy style={{ fontSize: 14 }} />}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(selectedVoucher?.voucher || "");
                  setVoucherCopied(true);
                  setTimeout(() => setVoucherCopied(false), 2000);
                } catch (err) {
                  console.error("Error copiando voucher:", err);
                }
              }}
            />
          </Space.Compact>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Este voucher es generado por la entidad de cumplimiento normativo.
          </Text>
        </Flex>
      </Modal>

      <ModuleTour
        tourKey={centroControlTour.key}
        steps={centroControlTour.steps}
        requiresPoint={centroControlTour.requiresPoint}
        hasPoint={true}
        autoStart={true}
        delay={1000}
      />
    </div>
  );
};

export default React.memo(ControlCenter);
