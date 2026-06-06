import React, { useCallback, useMemo } from "react";
import { Flex, Typography, Table, Tooltip, Tag, theme } from "antd";
import { FaEye, FaHandPaper, FaHeadset, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { FormOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale/es";
import { formatInteger } from "../../../../utils/numberFormatter";
import { SmartBadge } from "../../../../shared/ui";

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
      scroll={{ x: "max-content" }}
      locale={{ emptyText: "Sin datos" }}
    />
  );
});

const CCWeekConsumption = ({ last7, selectedDate, onDateSelect, onViewMeasurements, onOpenStopTelemetry, onOpenSupport = () => {}, onWarningPointClick = () => {}, onViewPointConfig, warningsRaw = {}, loading = false, search = "" }) => {
  const { token } = theme.useToken();

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

  const filteredDayMap = useMemo(() => {
    if (!search.trim()) return dayMap;
    const q = search.toLowerCase();
    const filtered = {};
    Object.entries(dayMap).forEach(([date, { points }]) => {
      const matching = points.filter((p) =>
        (p.pointName || "").toLowerCase().includes(q)
      );
      if (matching.length > 0) {
        filtered[date] = { points: matching };
      }
    });
    return filtered;
  }, [dayMap, search]);

  const sortedDays = useMemo(() => {
    return Object.entries(filteredDayMap).sort(([a], [b]) => a.localeCompare(b)).slice(-7);
  }, [filteredDayMap]);

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

  const dayCardStyle = {
    flex: 1,
    minHeight: 100,
    padding: "10px 8px",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    margin: '0 4px',
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    border: `1.5px solid ${token.colorBorder}`,
  };

  const dayCardActiveStyle = {
    ...dayCardStyle,
    borderColor: token.colorPrimary,
    background: `${token.colorPrimary}15`,
    boxShadow: `0 0 20px ${token.colorPrimary}30`,
  };

  const columns = useMemo(() => {
    const cols = [
      {
        title: "#",
        dataIndex: "status",
        key: "status",
        width: 40,
        align: "center",
        responsive: ["md"],
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
          
          const iconSize = 20;
          const iconStyle = {
            width: iconSize,
            height: iconSize,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          };
          
          if (isForm) {
            return (
              <Tooltip title="Formulario">
                <div style={{ ...iconStyle, background: `${token.colorInfo}20` }}>
                  <FormOutlined style={{ fontSize: 10, color: token.colorInfo }} />
                </div>
              </Tooltip>
            );
          }
          
          if (isTelemetry) {
            return (
              <div style={{ ...iconStyle, background: isConnected ? `${token.colorInfo}20` : `${token.colorError}20` }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isConnected ? token.colorInfo : token.colorError,
                  animation: isConnected ? "telemetry-led-blink 2s ease-in-out infinite" : "none",
                }} />
              </div>
            );
          }
          
          return (
            <div style={{ ...iconStyle, background: `${token.colorTextDisabled}20` }}>
              <MinusCircleOutlined style={{ fontSize: 10, color: token.colorTextDisabled }} />
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
                <Text strong style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{text}</Text>
                <FaInfoCircle
                  style={{ fontSize: 11, color: token.colorPrimary, cursor: "pointer", opacity: 0.7 }}
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
                <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextDisabled }}>-</Text>
              )}
            </Flex>
          );
        },
      },
    ];

    if (activeVars.hasConsumption) {
      cols.push({ 
        title: "Consumo (m³)", 
        dataIndex: "consumption", 
        key: "consumption", 
        width: 130, 
        align: "right", 
        sorter: (a, b) => (a.consumption || 0) - (b.consumption || 0), 
        render: (v) => (
          <Text strong style={{ fontSize: token.fontSizeSM, color: token.colorText }}>
            {formatInteger(v || 0)}
          </Text>
        )
      });
    }
    if (activeVars.hasFlow) {
      cols.push({ 
        title: "Caudal prom. (L/s)", 
        dataIndex: "avg_flow", 
        key: "avg_flow", 
        width: 120, 
        align: "right", 
        sorter: (a, b) => (a.avg_flow || 0) - (b.avg_flow || 0), 
        render: (v) => (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
            {v != null ? Number(v).toFixed(1) : "—"}
          </Text>
        )
      });
    }
    if (activeVars.hasLevel) {
      cols.push({ 
        title: "Nivel prom. (m)", 
        dataIndex: "avg_level", 
        key: "avg_level", 
        width: 100, 
        align: "right", 
        responsive: ["md"], 
        sorter: (a, b) => (a.avg_level || 0) - (b.avg_level || 0), 
        render: (v) => (
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
            {v != null ? Number(v).toFixed(2) : "—"}
          </Text>
        )
      });
    }

    const btnBase = (color) => ({
      width: 28,
      height: 28,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      border: `1.5px solid ${color}30`,
      background: `${color}12`,
      color,
      transition: "all 0.2s ease",
    });

    cols.push({ 
      title: "", 
      dataIndex: "measurements_count", 
      key: "measurements_count", 
      width: 120, 
      align: "center", 
      responsive: ["md"], 
      sorter: (a, b) => (a.measurements_count || 0) - (b.measurements_count || 0), 
      render: (v, record) => (
        <Flex align="center" justify="center" gap={6} onClick={(e) => e.stopPropagation()}>
          <Tooltip title={`Ver ${v || 0} mediciones`}>
            <div role="button" tabIndex={0} style={btnBase(token.colorPrimary)}
              onClick={() => handleViewMeasurements(record)}>
              <FaEye style={{ fontSize: 11 }} />
            </div>
          </Tooltip>
          {(record.measurements_count || 0) > 0 && (
            <Tooltip title="Detener telemetria">
              <div role="button" tabIndex={0} style={btnBase(token.colorError)}
                onClick={() => handleOpenStopTelemetry(record)}>
                <FaHandPaper style={{ fontSize: 10 }} />
              </div>
            </Tooltip>
          )}
          <Tooltip title="Solicitar soporte">
            <div role="button" tabIndex={0} style={btnBase(token.colorWarning)}
              onClick={() => handleOpenSupport(record)}>
              <FaHeadset style={{ fontSize: 10 }} />
            </div>
          </Tooltip>
        </Flex>
      ) 
    });

    return cols;
  }, [token, handleViewMeasurements, handleOpenStopTelemetry, handleOpenSupport, onWarningPointClick, onViewPointConfig, activeVars]);

  if (sortedDays.length === 0) {
    return (
      <div style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: token.paddingMD }}>
        <Text style={{ fontSize: token.fontSize, color: token.colorTextSecondary }}>Sin datos</Text>
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: token.paddingMD }}>
      <Flex vertical gap={16}>
        <Flex gap={12}>
          {sortedDays.map(([date, { points }]) => {
            const total = points.reduce((a, p) => a + (p.consumption || 0), 0);
            const isActive = activeDate === date;
            const isToday = isSameDay(parseISO(date), new Date());
            
            return (
              <div
                key={date}
                onClick={() => handleDateClick(date)}
                style={isActive ? dayCardActiveStyle : dayCardStyle}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = token.colorPrimary;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = token.colorBorder;
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <Text style={{ 
                  fontSize: token.fontSizeSM, 
                  color: isActive ? token.colorPrimary : token.colorTextSecondary,
                  textTransform: "capitalize",
                  letterSpacing: 0.5,
                  whiteSpace: "nowrap",
                }}>
                  {format(parseISO(date), "EEEE", { locale: es })}
                </Text>
                <Text strong style={{ 
                  fontSize: token.fontSizeLG * 1.25, 
                  color: token.colorText,
                  lineHeight: 1,
                }}>
                  {format(parseISO(date), "dd")}
                </Text>
                <Text style={{ 
                  fontSize: token.fontSizeSM, 
                  color: isActive ? token.colorPrimary : token.colorTextTertiary,
                }}>
                  {formatInteger(total)} m³
                </Text>
              </div>
            );
          })}
        </Flex>

        {activeDate && filteredDayMap[activeDate] && (
          <div className="fade-in">
            <TableMemo
              loading={loading}
              data={filteredDayMap[activeDate].points}
              columns={columns}
            />
          </div>
        )}
      </Flex>
    </div>
  );
};

export default React.memo(CCWeekConsumption);
