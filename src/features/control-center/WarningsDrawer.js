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

  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 16 }} />
          <Text strong style={{ fontSize: 16 }}>Warnings</Text>
          <Tag color="warning" style={{ margin: 0 }}>
            {warningsList.length} total
          </Tag>
        </Flex>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={{ xs: "100%", sm: "100%", md: 640 }}
      styles={{ body: { padding: 16 } }}
    >
      <Flex wrap="wrap" gap={8} style={{ marginBottom: 16 }}>
        {Object.entries(warningsRaw).map(([pointName, warnings]) => {
          const arr = Array.isArray(warnings) ? warnings : [];
          if (arr.length === 0) return null;
          const isActive = selectedWarningPoint === pointName;
          return (
            <Tag
              key={pointName}
              color={isActive ? "warning" : "default"}
              style={{ cursor: "pointer", fontSize: 12, padding: "4px 10px", margin: 0 }}
              onClick={() => setSelectedWarningPoint(pointName)}
            >
              {pointName} ({arr.length})
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
    </Drawer>
  );
};

export default React.memo(WarningsDrawer);
