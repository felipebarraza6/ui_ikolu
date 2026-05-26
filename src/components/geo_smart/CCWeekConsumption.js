import React, { useCallback, useMemo } from "react";
import { Flex, Typography, Table, Tooltip, theme } from "antd";
import { FaEye, FaHandPaper } from "react-icons/fa";
import moment from "moment";
import { formatInteger } from "../../utils/numberFormatter";

const { Text } = Typography;
const { useToken } = theme;

const CCWeekConsumption = ({ last7, selectedDate, onDateSelect, onViewMeasurements, onOpenStopTelemetry, onSelectPoint }) => {
  const { token } = useToken();

  const dayMap = useMemo(() => {
    const map = {};
    Object.entries(last7 || {}).forEach(([pointName, pointWeek]) => {
      (pointWeek?.days || []).forEach((d) => {
        if (!d.date) return;
        if (!map[d.date]) map[d.date] = { points: [] };
        map[d.date].points.push({ pointName, ...d });
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
    onViewMeasurements(record.pointName, activeDate);
  }, [onViewMeasurements, activeDate]);

  const handleOpenStopTelemetry = useCallback((record) => {
    onOpenStopTelemetry(record.pointName);
  }, [onOpenStopTelemetry]);

  const handleSelectPoint = useCallback((record) => {
    onSelectPoint({ id: record.pointName, title: record.pointName });
  }, [onSelectPoint]);

  const columns = useMemo(() => [
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
    { title: "Med.", dataIndex: "measurements_count", key: "measurements_count", width: 90, align: "center", render: (v, record) => (
      <Flex align="center" justify="center" gap={6} onClick={(e) => e.stopPropagation()}>
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
        <Tooltip title="Solicitar detención de telemetría">
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
      </Flex>
    ) },
  ], [token, handleViewMeasurements, handleOpenStopTelemetry]);

  if (sortedDays.length === 0) {
    return (
      <div style={{ padding: "0 0 16px" }}>
        <Text type="secondary">Sin datos</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 0 16px" }}>
      <Flex vertical gap={14}>
        <Flex gap={8}>
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
          <Table
            dataSource={[...dayMap[activeDate].points]
              .sort((a, b) => (b.consumption || 0) - (a.consumption || 0))
              .map((p, idx) => ({ ...p, key: idx, rank: idx + 1 }))}
            size="small"
            bordered
            pagination={false}
            showHeader={true}
            columns={columns}
            onRow={(record) => ({
              onClick: () => handleSelectPoint(record),
              style: { cursor: "pointer" },
            })}
            locale={{ emptyText: "Sin datos" }}
          />
        )}
      </Flex>
    </div>
  );
};

export default React.memo(CCWeekConsumption);
