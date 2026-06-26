import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Flex, Typography, Table, Tooltip, Tag, theme, Skeleton, Button, Select } from "antd";
import { FaEye, FaHandPaper, FaHeadset, FaExclamationTriangle, FaInfoCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FormOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined, WifiOutlined, DisconnectOutlined } from "@ant-design/icons";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale/es";
import { formatInteger } from "../../../../utils/numberFormatter";
import { SmartBadge } from "../../../../shared/ui";
import SkeletonTable from "../../../../shared/ui/SmartSkeleton/SkeletonTable";
import { useAuth } from "../../../../contexts/AuthContext";

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

const PAGE_SIZE = 10;
const DAYS_PER_PAGE = 7;

const telemetryOrderByOptions = [
  { value: "default", label: "Default" },
  { value: "warnings_count_desc", label: "Más warnings primero" },
  { value: "warnings_count_asc", label: "Menos warnings primero" },
];

const DayCardSkeleton = ({ token }) => (
  <div
    style={{
      flex: 1,
      minHeight: 100,
      borderRadius: token.borderRadiusLG,
      padding: token.paddingSM,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      border: `1px solid ${token.colorBorder}`,
      background: token.colorBgContainer,
    }}
  >
    <Skeleton.Button active size="small" style={{ width: 50, height: 10 }} />
    <Skeleton.Button active size="small" style={{ width: 28, height: 20 }} />
    <Skeleton.Button active size="small" style={{ width: 45, height: 10 }} />
  </div>
);

const TableSkeleton = ({ isSuperUser }) => (
  <SkeletonTable
    rows={10}
    size="small"
    columns={[
      { title: "#", key: "#", width: 40, align: "center" },
      { title: "Punto", key: "pointName", width: 180 },
      { title: "Consumo (m³)", key: "consumption", width: 120, align: "right" },
      { title: "Caudal prom. (L/s)", key: "avg_flow", width: 130, align: "right" },
      { title: "Nivel prom. (m)", key: "avg_level", width: 120, align: "right" },
      { title: "Mediciones", key: "measurements_count", width: 90, align: "center" },
      { title: "", key: "actions", width: isSuperUser ? 180 : 120, align: "center" },
    ]}
  />
);

const TableMemo = React.memo(({ data, columns, loading, pagination, onChange, token, isSuperUser }) => {
  const dataSource = useMemo(() =>
    data.map((p, idx) => ({ ...p, key: p.pointName || idx, rank: idx + 1 })),
    [data]
  );

  if (loading) {
    return <TableSkeleton isSuperUser={isSuperUser} />;
  }

  return (
    <Table
      dataSource={dataSource}
      size="small"
      pagination={pagination}
      showHeader={true}
      columns={columns}
      scroll={{ x: "max-content" }}
      locale={{ emptyText: "Sin datos" }}
      onChange={onChange}
    />
  );
});

const CCWeekConsumption = ({
  dailySummary,
  listData,
  listPage,
  setListPage,
  listOrderBy,
  setListOrderBy,
  selectedDate,
  onDateSelect,
  onViewMeasurements,
  onOpenStopTelemetry,
  onOpenSupport = () => {},
  onWarningPointClick = () => {},
  onViewPointConfig,
  onToggleTelemetry,
  togglingTelemetry = {},
  warningsRaw = {},
  loading = false,
  listLoading = false,
}) => {
  const { token } = theme.useToken();
  const { isSuperUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [dayPage, setDayPage] = useState(0);

  const sortedDays = useMemo(() => {
    if (dailySummary?.date_range?.length) {
      return dailySummary.date_range.map((date) => ({
        date,
        total_consumption: dailySummary.days?.[date]?.total_consumption || 0,
      }));
    }
    return [];
  }, [dailySummary]);

  const defaultDate = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1].date : null;
  const activeDate = selectedDate || defaultDate;

  const showMonthLabel = useMemo(() => {
    const months = new Set(sortedDays.map((d) => format(parseISO(d.date), "yyyy-MM")));
    return months.size > 1;
  }, [sortedDays]);

  const visibleDays = useMemo(() => {
    const start = dayPage * DAYS_PER_PAGE;
    return sortedDays.slice(start, start + DAYS_PER_PAGE);
  }, [sortedDays, dayPage]);

  const canGoPrev = dayPage > 0;
  const canGoNext = (dayPage + 1) * DAYS_PER_PAGE < sortedDays.length;

  // Key que cambia al cambiar página o data, forzando la animación
  const galleryKey = `${dayPage}-${dailySummary?.date_range?.join(",") || ""}`;

  const handleDateClick = useCallback((date) => {
    onDateSelect(date === selectedDate ? null : date);
    setCurrentPage(1);
  }, [selectedDate, onDateSelect]);

  const handleViewMeasurements = useCallback((record) => {
    onViewMeasurements(record.pointName, activeDate, record.variables || [], record.pointId);
  }, [onViewMeasurements, activeDate]);

  const handleOpenStopTelemetry = useCallback((record) => {
    onOpenStopTelemetry(record.pointName, record.pointId);
  }, [onOpenStopTelemetry]);

  const handleOpenSupport = useCallback((record) => {
    onOpenSupport({ name: record.pointName, id: record.pointId });
  }, [onOpenSupport]);

  const handleToggleTelemetry = useCallback((record) => {
    if (onToggleTelemetry) onToggleTelemetry(record);
  }, [onToggleTelemetry]);

  const handleTableChange = useCallback((pagination, filters, sorter) => {
    console.log("[Table sorter]", sorter);
    if (!sorter || (!sorter.field && !sorter.columnKey)) {
      setListOrderBy(null);
      return;
    }
    const field = sorter.columnKey || sorter.field;
    // Backend: "consumption" = mayor primero, "-consumption" = menor primero
    // Ant Design: "descend" = mayor arriba, "ascend" = menor arriba
    const direction = sorter.order === "ascend" ? "-" : "";
    if (["consumption", "avg_flow", "avg_level"].includes(field)) {
      console.log("[Table order_by]", `${direction}${field}`);
      setListOrderBy(`${direction}${field}`);
    }
  }, [setListOrderBy]);

  const tableData = useMemo(() => {
    if (!listData?.results) return [];
    return listData.results.map((p) => ({
      pointId: p.point_id,
      pointName: p.point_name,
      projectId: p.project_id,
      projectName: p.project_name,
      is_telemetry: p.is_telemetry,
      is_form: p.is_form,
      status: p.status,
      measurements_count: p.measurements_count,
      consumption: p.consumption,
      avg_flow: p.avg_flow,
      avg_level: p.avg_level,
      water_table: p.water_table,
      variables: (p.variables || []).map(v => String(v).toUpperCase()),
      warnings_count: p.warnings_count || 0,
      telemetryActive: p.telemetry_active != null ? p.telemetry_active : p.is_telemetry,
    }));
  }, [listData]);

  const activeVars = useMemo(() => {
    const allVars = tableData.flatMap(p => p.variables || []);
    return {
      hasConsumption: allVars.some(v => v === "TOTALIZADO"),
      hasFlow: allVars.some(v => v.includes("CAUDAL")),
      hasLevel: allVars.some(v => v === "NIVEL" || v === "NIVEL_FREATICO"),
    };
  }, [tableData]);

  const dayCardStyle = {
    flex: 1,
    minHeight: 100,
    padding: "10px 8px",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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
    borderColor: `${token.colorPrimary}80`,
    background: `${token.colorPrimary}10`,
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
          const warningCount = record.warnings_count || 0;
          return (
            <Flex align="center" justify="space-between" style={{ width: "100%" }}>
              <Flex align="center" gap={6}>
                <Text strong style={{ fontSize: token.fontSizeSM, color: token.colorText }}>{text}</Text>
                <FaInfoCircle
                  style={{ fontSize: 11, color: token.colorPrimary, cursor: "pointer", opacity: 0.7 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPointConfig(text, record.pointId);
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
        sorter: true,
        sortDirections: ["ascend", "descend"],
        showSorterTooltip: true,
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
        sorter: true,
        sortDirections: ["ascend", "descend"],
        showSorterTooltip: true,
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
        sorter: true,
        sortDirections: ["ascend", "descend"],
        showSorterTooltip: true,
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
      width: isSuperUser ? 180 : 120,
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
          {isSuperUser && (
            <Tooltip title={record.telemetryActive ? "Desactivar telemetría" : "Activar telemetría"}>
              <div
                role="button"
                tabIndex={0}
                style={{
                  ...btnBase(record.telemetryActive ? token.colorSuccess : token.colorError),
                  opacity: !!togglingTelemetry[record.pointId] ? 0.5 : 1,
                  cursor: !!togglingTelemetry[record.pointId] ? "not-allowed" : "pointer",
                  pointerEvents: !!togglingTelemetry[record.pointId] ? "none" : "auto",
                }}
                onClick={() => handleToggleTelemetry(record)}
              >
                {record.telemetryActive ? (
                  <WifiOutlined style={{ fontSize: 11 }} />
                ) : (
                  <DisconnectOutlined style={{ fontSize: 11 }} />
                )}
              </div>
            </Tooltip>
          )}
        </Flex>
      )
    });

    return cols;
  }, [token, handleViewMeasurements, handleOpenStopTelemetry, handleOpenSupport, handleToggleTelemetry, togglingTelemetry, isSuperUser, onWarningPointClick, onViewPointConfig, activeVars]);

  if (loading) {
    return (
      <div style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: token.paddingMD }}>
        <Flex vertical gap={12}>
          <Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
            Cargando días...
          </Text>
          <Flex gap={12} align="center" style={{ width: "100%" }}>
            <Button type="text" size="small" icon={<FaChevronLeft />} disabled />
            <Flex gap={12} wrap={false} style={{ flex: 1 }}>
              {Array.from({ length: 7 }).map((_, idx) => (
                <DayCardSkeleton key={idx} token={token} />
              ))}
            </Flex>
            <Button type="text" size="small" icon={<FaChevronRight />} disabled />
          </Flex>
        </Flex>
      </div>
    );
  }

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
        <Flex gap={12} align="center" style={{ width: "100%" }}>
          <Button
            type="text"
            size="small"
            icon={<FaChevronLeft />}
            disabled={loading || !canGoPrev}
            onClick={() => setDayPage((p) => Math.max(0, p - 1))}
          />
          <Flex
            key={galleryKey}
            gap={12}
            wrap={false}
            className="day-cards-slide"
            style={{ flex: 1 }}
          >
            {loading
              ? Array.from({ length: 7 }).map((_, idx) => <DayCardSkeleton key={idx} token={token} />)
              : visibleDays.map(({ date, total_consumption: total }) => {
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
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = token.colorBorder;
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
                      {showMonthLabel && (
                        <Text style={{
                          fontSize: token.fontSizeSM - 1,
                          color: isActive ? token.colorPrimary : token.colorTextTertiary,
                          lineHeight: 1,
                          marginTop: -2,
                        }}>
                          {format(parseISO(date), "MMM", { locale: es })}
                        </Text>
                      )}
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
          <Button
            type="text"
            size="small"
            icon={<FaChevronRight />}
            disabled={loading || !canGoNext}
            onClick={() => setDayPage((p) => p + 1)}
          />
        </Flex>

        {activeDate && (
          <div className="fade-in">
            <Flex justify="flex-end" style={{ marginBottom: 8 }}>
              <Select
                size="small"
                placeholder="Ordenar por"
                value={listOrderBy || "default"}
                onChange={(value) => {
                  setListOrderBy(value === "default" ? null : value);
                  setListPage(1);
                }}
                options={telemetryOrderByOptions}
                style={{ minWidth: 180 }}
              />
            </Flex>
            <TableMemo
              loading={listLoading}
              data={tableData}
              columns={columns}
              onChange={handleTableChange}
              token={token}
              isSuperUser={isSuperUser}
              pagination={{
                current: listPage,
                pageSize: PAGE_SIZE,
                total: listData?.count || 0,
                showSizeChanger: false,
                hideOnSinglePage: false,
                onChange: (page) => {
                  setListPage(page);
                  setCurrentPage(1);
                },
              }}
            />
          </div>
        )}
      </Flex>
    </div>
  );
};

export default React.memo(CCWeekConsumption);
