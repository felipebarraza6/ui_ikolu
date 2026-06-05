import React from "react";
import { Drawer, Flex, Typography, Table, Tag, theme } from "antd";
import { FaExclamationTriangle } from "react-icons/fa";
import { format, parseISO } from "date-fns";

const { Text } = Typography;
const { useToken } = theme;

const WarningsDrawer = ({
  open,
  onClose,
  warningsList,
  warningsRaw,
  selectedWarningPoint,
  setSelectedWarningPoint,
}) => {
  const { token } = useToken();

  const warnGradient = `linear-gradient(135deg, ${token.colorWarning} 0%, ${token.colorError} 100%)`;

  return (
    <Drawer
      title={
        <Flex align="center" gap={10}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: warnGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 14px ${token.colorWarning}50`,
          }}>
            <FaExclamationTriangle style={{ color: "#fff", fontSize: 16 }} />
          </div>
          <Flex vertical gap={0}>
            <Text strong style={{ fontSize: 16, color: token.colorText }}>Warnings</Text>
            <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>
              {warningsList.length} alertas activas
            </Text>
          </Flex>
        </Flex>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={{ xs: "100%", sm: "100%", md: 640 }}
      styles={{ body: { padding: 16 } }}
    >
      {warningsList.length === 0 ? (
        <Flex vertical align="center" justify="center" style={{ padding: 48, textAlign: "center" }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `${token.colorSuccess}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}>
            <FaExclamationTriangle style={{ color: token.colorSuccess, fontSize: 24, opacity: 0.6 }} />
          </div>
          <Text style={{ fontSize: 14, color: token.colorTextSecondary }}>Sin warnings activos</Text>
        </Flex>
      ) : (
        <>
          <Flex wrap="wrap" gap={8} style={{ marginBottom: 16 }}>
            {Object.entries(warningsRaw).map(([pointName, warnings]) => {
              const arr = Array.isArray(warnings) ? warnings : [];
              if (arr.length === 0) return null;
              const isActive = selectedWarningPoint === pointName;
              return (
                <Tag
                  key={pointName}
                  style={{
                    cursor: "pointer",
                    fontSize: 12,
                    padding: "4px 12px",
                    margin: 0,
                    borderRadius: token.borderRadius,
                    border: isActive ? `1.5px solid ${token.colorWarning}` : `1px solid ${token.colorBorder}`,
                    background: isActive ? `${token.colorWarning}18` : token.colorFillSecondary,
                    color: isActive ? token.colorWarning : token.colorText,
                    fontWeight: isActive ? 600 : 400,
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setSelectedWarningPoint(pointName)}
                >
                  {pointName}
                  <span style={{
                    marginLeft: 6,
                    background: isActive ? warnGradient : token.colorFillQuaternary,
                    color: isActive ? "#fff" : token.colorTextSecondary,
                    borderRadius: 10,
                    padding: "0 6px",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "inline-block",
                    lineHeight: "18px",
                    minWidth: 18,
                    textAlign: "center",
                  }}>
                    {arr.length}
                  </span>
                </Tag>
              );
            })}
          </Flex>
          {selectedWarningPoint && (
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
                      {time ? format(parseISO(time), "dd/MM HH:mm") : "—"}
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
          )}
        </>
      )}
    </Drawer>
  );
};

export default React.memo(WarningsDrawer);
