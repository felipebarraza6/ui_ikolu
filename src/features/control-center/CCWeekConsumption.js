import React, { useCallback, useMemo } from "react";
import { Flex, Typography, Table, Tooltip, Tag, theme } from "antd";
import { FaEye, FaHandPaper, FaHeadset, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { FormOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale/es";
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
      scroll={{ x: "max-content" }}
      locale={{ emptyText: "Sin datos" }}
      className="ocean-table ocean-table-transparent"
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
          
          if (isForm) {
            return (
              <Tooltip title="Formulario">
                <div className="ocean-status-icon ocean-status-icon-form">
                  <FormOutlined className="ocean-status-icon-form-icon" />
                </div>
              </Tooltip>
            );
          }
          
          if (isTelemetry) {
            return (
              <div className={`ocean-status-icon ${isConnected ? 'ocean-status-icon-telemetry' : 'ocean-status-icon-error'}`}>
                <div
                  className={`ocean-status-dot ${isConnected ? 'ocean-status-dot-active' : 'ocean-status-dot-error'}`}
                />
              </div>
            );
          }
          
          return (
            <div className="ocean-status-icon ocean-status-icon-none">
              <MinusCircleOutlined className="ocean-status-icon-none-icon" />
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
            <Flex align="center" justify="space-between" className="ocean-w-full">
              <Flex align="center" gap={6}>
                <Text strong className="ocean-text-md ocean-font-heading">{text}</Text>
                <FaInfoCircle
                  className="ocean-info-icon"
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
                <Text className="ocean-text-sm ocean-text-disabled">-</Text>
              )}
            </Flex>
          );
        },
      },
    ];

    if (activeVars.hasConsumption) {
      cols.push({ title: "Consumo (m³)", dataIndex: "consumption", key: "consumption", width: 130, align: "right", sorter: (a, b) => (a.consumption || 0) - (b.consumption || 0), render: (v) => <Text strong className="ocean-text-md ocean-text-primary ocean-font-heading">{formatInteger(v || 0)}</Text> });
    }
    if (activeVars.hasFlow) {
      cols.push({ title: "Caudal prom. (L/s)", dataIndex: "avg_flow", key: "avg_flow", width: 120, align: "right", sorter: (a, b) => (a.avg_flow || 0) - (b.avg_flow || 0), render: (v) => <Text className="ocean-text-sm ocean-text-secondary ocean-font-body">{v != null ? Number(v).toFixed(1) : "—"}</Text> });
    }
    if (activeVars.hasLevel) {
      cols.push({ title: "Nivel prom. (m)", dataIndex: "avg_level", key: "avg_level", width: 100, align: "right", responsive: ["md"], sorter: (a, b) => (a.avg_level || 0) - (b.avg_level || 0), render: (v) => <Text className="ocean-text-sm ocean-text-secondary ocean-font-body">{v != null ? Number(v).toFixed(2) : "—"}</Text> });
    }

    cols.push({ title: "", dataIndex: "measurements_count", key: "measurements_count", width: 120, align: "center", responsive: ["md"], sorter: (a, b) => (a.measurements_count || 0) - (b.measurements_count || 0), render: (v, record) => (
      <Flex align="center" justify="center" gap={4} onClick={(e) => e.stopPropagation()}>
        <SmartIconButton
          variant="ghost"
          size="sm"
          icon={<FaEye className="ocean-icon-sm" />}
          tooltip={`Ver ${v || 0} mediciones`}
          onClick={() => handleViewMeasurements(record)}
        />
        {(record.measurements_count || 0) > 0 && (
          <SmartIconButton
            variant="primary"
            size="sm"
            icon={<FaHandPaper className="ocean-icon-xs" />}
            tooltip="Detener telemetría"
            onClick={() => handleOpenStopTelemetry(record)}
          />
        )}
        <SmartIconButton
          variant="primary"
          size="sm"
          icon={<FaHeadset className="ocean-icon-xs" />}
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
      <div className="ocean-px-0 ocean-pb-md">
        <Text className="ocean-text-base ocean-text-muted">Sin datos</Text>
      </div>
    );
  }

  return (
    <div className="ocean-px-0 ocean-pb-md">
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
                className={`ocean-calendar-day ${isActive ? 'ocean-calendar-day-active' : 'ocean-calendar-day-inactive'}`}
              >
                <Text className={`ocean-text-xs ${isActive ? 'ocean-text-cyan-light' : 'ocean-text-secondary'} ocean-capitalize ocean-letter-spacing ocean-nowrap ocean-font-body`}>
                  {format(parseISO(date), "EEEE", { locale: es })}
                </Text>
                <Text strong className={`ocean-text-2xl ${isActive ? 'ocean-text-primary' : 'ocean-text-primary'} ocean-lh-1 ocean-font-heading`}>
                  {format(parseISO(date), "dd")}
                </Text>
                <Text className={`ocean-text-xs ${isActive ? 'ocean-text-cyan-light' : 'ocean-text-muted'} ocean-font-body`}>
                  {formatInteger(total)} m³
                </Text>
              </div>
            );
          })}
        </Flex>

        {activeDate && dayMap[activeDate] && (
          <div className="fade-in">
            <TableMemo
              loading={loading}
              data={dayMap[activeDate].points}
              columns={columns}
            />
          </div>
        )}
      </Flex>
    </div>
  );
};

export default React.memo(CCWeekConsumption);
