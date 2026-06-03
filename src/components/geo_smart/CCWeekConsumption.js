import React, { useCallback, useMemo } from "react";
import { Flex, Typography, Table, Tooltip, Tag, theme } from "antd";
import { FaEye, FaHandPaper, FaHeadset, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { FormOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { formatInteger } from "../../utils/numberFormatter";
import { SmartIconButton, SmartBadge } from "../../shared/ui";
import { smarthydro } from "../../theme/smarthydro.tokens";

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
      pagination={false}
      showHeader={true}
      columns={columns}
      locale={{ emptyText: "Sin datos" }}
      className="ocean-table"
      style={{
        background: "transparent",
        borderRadius: 16,
        overflow: "hidden",
      }}
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
                <div style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: `${smarthydro.colors.primary[500]}20` }}>
                  <FormOutlined style={{ fontSize: 10, color: smarthydro.colors.primary[500] }} />
                </div>
              </Tooltip>
            );
          }
          
          if (isTelemetry) {
            return (
              <div style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: isConnected ? `${smarthydro.colors.primary[500]}20` : `${smarthydro.colors.semantic.error}20`, overflow: "hidden" }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    minWidth: 8,
                    minHeight: 8,
                    borderRadius: "50%",
                    background: isConnected ? smarthydro.colors.primary[500] : smarthydro.colors.semantic.error,
                    animation: isConnected ? "pulse-badge 2s ease-in-out infinite" : "none",
                    flexShrink: 0,
                  }}
                />
              </div>
            );
          }
          
          return (
            <div style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: `${smarthydro.colors.neutral[400]}20` }}>
              <MinusCircleOutlined style={{ fontSize: 10, color: smarthydro.colors.neutral[400] }} />
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
                <Text strong style={{ fontSize: 12, fontFamily: smarthydro.typography.heading }}>{text}</Text>
                <FaInfoCircle
                  style={{ fontSize: 11, color: smarthydro.colors.primary[500], cursor: "pointer", opacity: 0.7 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPointConfig(text);
                  }}
                />
              </Flex>
              {warningCount > 0 ? (
                <SmartBadge
                  variant="warning"
                  size="sm"
                  showIcon={true}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onWarningPointClick(text);
                  }}
                >
                  {warningCount}
                </SmartBadge>
              ) : (
                <Text style={{ fontSize: 11, color: token.colorTextDisabled }}>-</Text>
              )}
            </Flex>
          );
        },
      },
    ];

    if (activeVars.hasConsumption) {
      cols.push({ title: "Consumo (m³)", dataIndex: "consumption", key: "consumption", width: 130, align: "right", sorter: (a, b) => (a.consumption || 0) - (b.consumption || 0), render: (v) => <Text strong style={{ fontSize: 12, color: token.colorTextHeading, fontFamily: smarthydro.typography.heading }}>{formatInteger(v || 0)}</Text> });
    }
    if (activeVars.hasFlow) {
      cols.push({ title: "Caudal prom. (L/s)", dataIndex: "avg_flow", key: "avg_flow", width: 120, align: "right", sorter: (a, b) => (a.avg_flow || 0) - (b.avg_flow || 0), render: (v) => <Text style={{ fontSize: 11, color: token.colorTextSecondary, fontFamily: smarthydro.typography.body }}>{v != null ? Number(v).toFixed(1) : "—"}</Text> });
    }
    if (activeVars.hasLevel) {
      cols.push({ title: "Nivel prom. (m)", dataIndex: "avg_level", key: "avg_level", width: 100, align: "right", sorter: (a, b) => (a.avg_level || 0) - (b.avg_level || 0), render: (v) => <Text style={{ fontSize: 11, color: token.colorTextSecondary, fontFamily: smarthydro.typography.body }}>{v != null ? Number(v).toFixed(2) : "—"}</Text> });
    }

    cols.push({ title: "", dataIndex: "measurements_count", key: "measurements_count", width: 120, align: "center", sorter: (a, b) => (a.measurements_count || 0) - (b.measurements_count || 0), render: (v, record) => (
      <Flex align="center" justify="center" gap={4} onClick={(e) => e.stopPropagation()}>
        <SmartIconButton
          variant="ghost"
          size="sm"
          icon={<FaEye style={{ fontSize: 10 }} />}
          tooltip={`Ver ${v || 0} mediciones`}
          onClick={() => handleViewMeasurements(record)}
        />
        {(record.measurements_count || 0) > 0 && (
          <SmartIconButton
            variant="primary"
            size="sm"
            icon={<FaHandPaper style={{ fontSize: 9 }} />}
            tooltip="Detener telemetría"
            onClick={() => handleOpenStopTelemetry(record)}
          />
        )}
        <SmartIconButton
          variant="primary"
          size="sm"
          icon={<FaHeadset style={{ fontSize: 9 }} />}
          tooltip="Solicitar soporte"
          onClick={() => handleOpenSupport(record)}
        />
      </Flex>
    ) });

    return cols;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, handleViewMeasurements, handleOpenStopTelemetry, handleOpenSupport, onWarningPointClick, activeVars]);

  if (sortedDays.length === 0) {
    return (
      <div style={{ padding: "0 0 16px" }}>
        <Text type="secondary" style={{ fontFamily: smarthydro.typography.body }}>Sin datos</Text>
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
                  borderRadius: 16,
                  border: `1.5px solid ${isActive ? "rgba(0, 180, 216, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
                  background: isActive 
                    ? "linear-gradient(135deg, rgba(0, 180, 216, 0.3) 0%, rgba(0, 119, 182, 0.2) 100%)" 
                    : "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  boxShadow: isActive ? "0 0 20px rgba(0, 180, 216, 0.3)" : "none",
                }}
              >
                <Text style={{ fontSize: 10, color: isActive ? "#90E0EF" : "rgba(255,255,255,0.6)", textTransform: "capitalize", letterSpacing: 0.5, whiteSpace: "nowrap", fontFamily: smarthydro.typography.body }}>
                  {moment(date).format("dddd")}
                </Text>
                <Text strong style={{ fontSize: 22, color: isActive ? "#fff" : "rgba(255,255,255,0.9)", lineHeight: 1, fontFamily: smarthydro.typography.heading }}>
                  {moment(date).format("DD")}
                </Text>
                <Text style={{ fontSize: 10, color: isActive ? "#90E0EF" : "rgba(255,255,255,0.5)", fontFamily: smarthydro.typography.body }}>
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
