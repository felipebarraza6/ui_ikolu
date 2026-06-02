import React, { useCallback, useMemo } from "react";
import { Flex, Typography, Table, Tooltip, Tag, theme } from "antd";
import { FaEye, FaHandPaper, FaHeadset, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { FormOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { ikoluTokens } from "../../theme";
import { formatInteger } from "../../utils/numberFormatter";

const typeDgaLabels = {
  "SUPERFICIAL": "Superficial",
  "SUBTERRANEO": "Subterráneo",
  "SUPERFICIAL_MAYOR": "Superficial Mayor",
  "SUBTERRANEO_MENOR": "Subterráneo Menor",
  "CAUDALES_MUY_PEQUENOS": "Caudales muy pequeños",
  "MEDIO": "Medio",
  "MAYOR": "Mayor",
  "MENOR": "Menor",
};

const { Text } = Typography;
const { useToken } = theme;

const TableMemo = React.memo(({ data, columns, loading }) => {
  const dataSource = useMemo(() =>
    data.map((p, idx) => ({ ...p, key: p.pointName || idx, rank: idx + 1 })),
    [data]
  );

  return (
    <Table
      loading={loading}
      dataSource={dataSource}
      size="small"
      bordered
      pagination={false}
      showHeader={true}
      columns={columns}
      locale={{ emptyText: "Sin datos" }}
    />
  );
});

const CCWeekConsumption = ({ last7, selectedDate, onDateSelect, onViewMeasurements, onOpenStopTelemetry, onOpenSupport = () => {}, onWarningPointClick = () => {}, onViewPointConfig, warningsRaw = {}, loading = false }) => {
  const { token } = useToken();

  const dayMap = useMemo(() => {
    const map = {};
    Object.entries(last7 || {}).forEach(([pointName, pointWeek]) => {
      (pointWeek?.days || []).forEach((d) => {
        if (!d.date) return;
        if (!map[d.date]) map[d.date] = { points: [] };
        map[d.date].points.push({ 
          pointName, 
          is_telemetry: pointWeek.is_telemetry,
          is_form: pointWeek.is_form,
          ...d 
        });
      });
    });
    return map;
  }, [last7]);

  const sortedDays = useMemo(() => {
    return Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).slice(-7);
  }, [dayMap]);

  const defaultDate = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1][0] : null;
  const activeDate = selectedDate || defaultDate;

  const handleDateClick = useCallback((date) => {
    onDateSelect(date === selectedDate ? null : date);
  }, [selectedDate, onDateSelect]);

  const handleViewMeasurements = useCallback((record) => {
    const pointVars = last7?.[record.pointName]?.variables || [];
    onViewMeasurements(record.pointName, activeDate, pointVars);
  }, [onViewMeasurements, activeDate, last7]);

  const handleOpenStopTelemetry = useCallback((record) => {
    onOpenStopTelemetry(record.pointName);
  }, [onOpenStopTelemetry]);

  const handleOpenSupport = useCallback((record) => {
    onOpenSupport(record.pointName);
  }, [onOpenSupport]);

  // Detectar variables activas en al menos un punto
  const activeVars = useMemo(() => {
    const allVars = Object.values(last7 || {}).flatMap(w => w.variables || []);
    return {
      hasConsumption: allVars.some(v => v === "TOTALIZADO"),
      hasFlow: allVars.some(v => v.includes("CAUDAL")),
      hasLevel: allVars.some(v => v === "NIVEL" || v === "NIVEL_FREATICO"),
    };
  }, [last7]);

  const columns = useMemo(() => {
    const cols = [
      {
        title: "#",
        dataIndex: "status",
        key: "status",
        width: 40,
        align: "center",
        sorter: (a, b) => {
          const order = { form: 0, telemetry_connected: 1, telemetry_disconnected: 2, none: 3 };
          const getType = (r) => {
            if (r.is_form) return "form";
            if (r.is_telemetry && (r.measurements_count || 0) > 0) return "telemetry_connected";
            if (r.is_telemetry) return "telemetry_disconnected";
            return "none";
          };
          return (order[getType(a)] || 3) - (order[getType(b)] || 3);
        },
        render: (_, record) => {
          const isForm = record.is_form === true;
          const isTelemetry = record.is_telemetry === true;
          const isConnected = (record.measurements_count || 0) > 0;
          
          if (isForm) {
            return (
              <Tooltip title="Formulario">
                <div style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: `${token.colorPrimary}20` }}>
                  <FormOutlined style={{ fontSize: 10, color: token.colorPrimary }} />
                </div>
              </Tooltip>
            );
          }
          
          if (isTelemetry) {
            return (
              <div style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: isConnected ? `${token.colorPrimary}20` : "#ff4d4f20", overflow: "hidden" }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    minWidth: 8,
                    minHeight: 8,
                    borderRadius: "50%",
                    background: isConnected ? token.colorPrimary : "#ff4d4f",
                    animation: isConnected ? "pulse-badge 2s ease-in-out infinite" : "none",
                    flexShrink: 0,
                  }}
                />
              </div>
            );
          }
          
          return (
            <div style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: "#d9d9d920" }}>
              <MinusCircleOutlined style={{ fontSize: 10, color: "#d9d9d9" }} />
            </div>
          );
        },
      },
      {
        title: "Punto",
        dataIndex: "pointName",
        key: "pointName",
        width: 140,
        sorter: (a, b) => (a.pointName || "").localeCompare(b.pointName || ""),
        render: (text, record) => {
          const allWarnings = record.warnings || [];
          const warningCount = allWarnings.length;
          return (
            <Flex align="center" justify="space-between" style={{ width: "100%" }}>
              <Flex align="center" gap={6}>
                <Text strong style={{ fontSize: 12 }}>{text}</Text>
                <FaInfoCircle
                  style={{ fontSize: 11, color: token.colorPrimary, cursor: "pointer", opacity: 0.7 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPointConfig(text);
                  }}
                />
              </Flex>
              {warningCount > 0 ? (
                <Tag
                  style={{
                    fontSize: 10,
                    margin: 0,
                    padding: "0 6px",
                    lineHeight: "18px",
                    cursor: "pointer",
                    fontWeight: 700,
                    background: ikoluTokens.colorWarning,
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onWarningPointClick(text);
                  }}
                >
                  <FaExclamationTriangle style={{ fontSize: 9 }} />
                  {warningCount}
                </Tag>
              ) : (
                <Text style={{ fontSize: 11, color: token.colorTextDisabled }}>-</Text>
              )}
            </Flex>
          );
        },
      },
    ];

    if (activeVars.hasConsumption) {
      cols.push({ title: "Consumo (m³)", dataIndex: "consumption", key: "consumption", width: 130, align: "right", sorter: (a, b) => (a.consumption || 0) - (b.consumption || 0), render: (v) => <Text strong style={{ fontSize: 12, color: token.colorTextHeading }}>{formatInteger(v || 0)}</Text> });
    }
    if (activeVars.hasFlow) {
      cols.push({ title: "Caudal prom. (L/s)", dataIndex: "avg_flow", key: "avg_flow", width: 120, align: "right", sorter: (a, b) => (a.avg_flow || 0) - (b.avg_flow || 0), render: (v) => <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{v != null ? Number(v).toFixed(1) : "—"}</Text> });
    }
    if (activeVars.hasLevel) {
      cols.push({ title: "Nivel prom. (m)", dataIndex: "avg_level", key: "avg_level", width: 100, align: "right", sorter: (a, b) => (a.avg_level || 0) - (b.avg_level || 0), render: (v) => <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{v != null ? Number(v).toFixed(2) : "—"}</Text> });
    }

    cols.push({ title: "", dataIndex: "measurements_count", key: "measurements_count", width: 120, align: "center", sorter: (a, b) => (a.measurements_count || 0) - (b.measurements_count || 0), render: (v, record) => (
      <Flex align="center" justify="center" gap={4} onClick={(e) => e.stopPropagation()}>
        <Tooltip title={`Ver ${v || 0} mediciones`}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 6px",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 0.2s",
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewMeasurements(record);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = token.colorPrimary; e.currentTarget.style.background = `${token.colorPrimary}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = token.colorBorderSecondary; e.currentTarget.style.background = "transparent"; }}
          >
            <FaEye style={{ fontSize: 10, color: token.colorTextSecondary }} />
            <Text style={{ fontSize: 10, color: token.colorTextSecondary, lineHeight: 1 }}>{v || 0}</Text>
          </div>
        </Tooltip>
        {(record.measurements_count || 0) > 0 && (
        <Tooltip title="Detener telemetría">
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              border: `1px solid ${token.colorPrimary}40`,
              background: `${token.colorPrimary}08`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenStopTelemetry(record);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${token.colorPrimary}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${token.colorPrimary}08`; }}
          >
            <FaHandPaper style={{ fontSize: 9, color: token.colorPrimary }} />
          </div>
        </Tooltip>
        )}
        <Tooltip title="Solicitar soporte">
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              border: `1px solid ${token.colorPrimary}40`,
              background: `${token.colorPrimary}08`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSupport(record);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${token.colorPrimary}15`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${token.colorPrimary}08`; }}
          >
            <FaHeadset style={{ fontSize: 9, color: token.colorPrimary }} />
          </div>
        </Tooltip>
      </Flex>
    ) });

    return cols;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, handleViewMeasurements, handleOpenStopTelemetry, handleOpenSupport, onWarningPointClick, activeVars]);

  if (sortedDays.length === 0) {
    return (
      <div style={{ padding: "0 0 16px" }}>
        <Text type="secondary">Sin datos</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 0 16px" }}>
      <Flex vertical gap={16}>
        <Flex gap={12}>
          {sortedDays.map(([date, { points }]) => {
            const total = points.reduce((a, p) => a + (p.consumption || 0), 0);
            const isActive = activeDate === date;
            const isToday = moment(date).isSame(moment(), "day");
            return (
              <div
                key={date}
                onClick={() => handleDateClick(date)}
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

        {activeDate && dayMap[activeDate] && (
          <TableMemo
            loading={loading}
            data={dayMap[activeDate].points}
            columns={columns}
          />
        )}
      </Flex>
    </div>
  );
};

export default React.memo(CCWeekConsumption);
