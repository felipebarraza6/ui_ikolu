import React, { memo } from "react";
import { Table, Flex, Typography, Tag, Spin, Empty } from "antd";
import {
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

const { Text } = Typography;

const levelConfig = {
  info: { color: "blue", icon: <InfoCircleOutlined /> },
  debug: { color: "default", icon: <FileTextOutlined /> },
  warning: { color: "orange", icon: <WarningOutlined /> },
  warn: { color: "orange", icon: <WarningOutlined /> },
  error: { color: "red", icon: <ExclamationCircleOutlined /> },
  critical: { color: "red", icon: <ExclamationCircleOutlined /> },
  success: { color: "green", icon: <CheckCircleOutlined /> },
};

const getLevel = (raw = "info") => levelConfig[raw.toLowerCase()] || levelConfig.info;

const EventLogTable = memo(({ data, loading, page, onPageChange }) => {
  const token = useIkoluToken();
  const results = data?.results || data || [];
  const count = data?.count ?? results.length;

  const columns = [
    {
      title: "Nivel",
      dataIndex: "severity",
      key: "severity",
      width: 100,
      render: (v, record) => {
        const raw = v || record.level;
        const cfg = getLevel(raw);
        return (
          <Tag icon={cfg.icon} color={cfg.color}>
            {raw || "info"}
          </Tag>
        );
      },
    },
    {
      title: "Evento",
      dataIndex: "title",
      key: "title",
      render: (v, record) => (
        <Flex vertical>
          <Text strong>{v || record.message || record.event_type || "—"}</Text>
          {record.message && v && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.message}
            </Text>
          )}
        </Flex>
      ),
    },
    {
      title: "Punto de captación",
      dataIndex: "point_catchment_title",
      key: "point_catchment_title",
      width: 220,
      render: (v, record) => {
        const pointId = record.point_catchment ?? record.point_id ?? record.point;
        return (
          <Flex vertical>
            <Text strong>{v || `Punto ${pointId || "—"}`}</Text>
            {pointId && v && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                ID: {pointId}
              </Text>
            )}
          </Flex>
        );
      },
    },
    {
      title: "Tipo",
      dataIndex: "event_type",
      key: "event_type",
      width: 140,
      render: (v) => v || "—",
    },
    {
      title: "Fecha",
      dataIndex: "created",
      key: "created",
      width: 180,
      render: (v, record) => v || record.created_at || record.timestamp || "—",
    },
  ];

  return (
    <SmartCard
      title={
        <Flex align="center" gap={8}>
          <FileTextOutlined style={{ color: token.colorPrimary }} />
          <Text strong>Registro de Eventos del Sistema</Text>
        </Flex>
      }
    >
      {loading && !results.length ? (
        <Flex justify="center" align="center" style={{ minHeight: 180 }}>
          <Spin />
        </Flex>
      ) : (
        <Table
          rowKey={(r) => r.id || `${r.created || r.created_at}-${r.message}`}
          columns={columns}
          dataSource={results}
          size="small"
          onChange={(pagination) => onPageChange(pagination.current)}
          pagination={{
            current: page,
            total: count,
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} eventos`,
          }}
          locale={{ emptyText: <Empty description="No hay eventos" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          scroll={{ x: "max-content" }}
        />
      )}
    </SmartCard>
  );
});

EventLogTable.displayName = "EventLogTable";

export default EventLogTable;
