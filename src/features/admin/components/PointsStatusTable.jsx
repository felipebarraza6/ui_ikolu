import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  Flex,
  Typography,
  Select,
  Switch,
  Button,
  Input,
  InputNumber,
  Tag,
  Tooltip,
  Spin,
  Empty,
  message,
  Space,
} from "antd";
import {
  WifiOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import orchestrator from "../../../api/orchestrator";
import sh from "../../../api/sh/endpoints";
import {
  inferPointStatus,
  statusColor,
  statusLabel,
} from "../utils/pointStatus";

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const PointsStatusTable = memo(({ data, loading, onChange, filters, onFiltersChange }) => {
  const token = useIkoluToken();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [toggling, setToggling] = useState({});
  const [freqLoading, setFreqLoading] = useState({});

  useEffect(() => {
    let cancelled = false;
    setClientsLoading(true);
    orchestrator.admin
      .clientsWithProjects()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : res?.results || [];
        setClients(list);
        setProjects(
          list.flatMap((c) =>
            (c.projects || []).map((p) => ({
              ...p,
              client: c.id,
              client_name: c.name || c.legal_name,
            }))
          )
        );
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[PointsStatusTable] clientsWithProjects error:", err);
      })
      .finally(() => setClientsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    if (!filters.client) return projects;
    return projects.filter((p) => String(p.client) === String(filters.client));
  }, [filters.client, projects]);

  const [searchText, setSearchText] = useState("");

  const filteredResults = useMemo(() => {
    const list = data?.results || [];
    const term = searchText.trim().toLowerCase();
    return list.filter((p) => {
      const matchesSearch = !term ||
        [
          p.name,
          p.title,
          p.code,
          p.point_id,
          p.client,
          p.project,
          p.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      // "Sin datos" no tiene filtro de backend, se aplica localmente.
      const matchesStatus =
        filters.status !== "no_data" || inferPointStatus(p) === "no_data";
      return matchesSearch && matchesStatus;
    });
  }, [data, searchText, filters.status]);

  const handleToggleTelemetry = useCallback(
    async (record) => {
      const pointId = record.id;
      const next = !record.telemetry_active;
      setToggling((prev) => ({ ...prev, [pointId]: true }));
      try {
        await sh.management.toggleTelemetry(pointId, next);
        message.success(`Telemetría ${next ? "activada" : "desactivada"} para ${record.title || pointId}`);
        onChange?.();
      } catch (err) {
        console.error("[PointsStatusTable] toggleTelemetry error:", err);
        message.error(err?.response?.data?.detail || "Error al cambiar telemetría");
      } finally {
        setToggling((prev) => ({ ...prev, [pointId]: false }));
      }
    },
    [onChange]
  );

  const handleFrequencyChange = useCallback(
    async (pointId, value) => {
      if (!value || value < 1) return;
      setFreqLoading((prev) => ({ ...prev, [pointId]: true }));
      try {
        await sh.management.updatePointFrequency(pointId, value);
        message.success("Frecuencia actualizada");
        onChange?.();
      } catch (err) {
        console.error("[PointsStatusTable] updatePointFrequency error:", err);
        message.error(err?.response?.data?.detail || "Error al actualizar frecuencia");
      } finally {
        setFreqLoading((prev) => ({ ...prev, [pointId]: false }));
      }
    },
    [onChange]
  );

  const columns = [
    {
      title: "Punto",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Flex vertical>
          <Text strong>{name || record.title || `Punto ${record.id}`}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.code || record.point_id || record.id}
          </Text>
        </Flex>
      ),
    },
    {
      title: "Cliente",
      dataIndex: "client",
      key: "client",
      render: (v) => v || "—",
    },
    {
      title: "Proyecto",
      dataIndex: "project",
      key: "project",
      render: (v) => v || "—",
    },
    {
      title: "Estado",
      key: "status",
      render: (_, record) => {
        const st = inferPointStatus(record);
        return (
          <Tag icon={st === "disconnected" || st === "disabled" ? <DisconnectOutlined /> : <WifiOutlined />} color={statusColor[st] || "default"}>
            {statusLabel[st] || st}
          </Tag>
        );
      },
    },
    {
      title: "Último dato",
      key: "last_record_at",
      render: (_, record) => record.last_interaction?.date_time || "—",
    },
    {
      title: "Frecuencia (min)",
      key: "frequency",
      render: (_, record) => {
        const pointId = record.id;
        return (
          <InputNumber
            min={1}
            max={1440}
            size="small"
            value={record.frecuency ? Number(record.frecuency) : 15}
            onChange={(value) => handleFrequencyChange(pointId, value)}
            disabled={freqLoading[pointId]}
            style={{ width: 80 }}
          />
        );
      },
    },
    {
      title: "Telemetría",
      key: "telemetry",
      render: (_, record) => {
        const pointId = record.id;
        return (
          <Switch
            checked={record.telemetry_active !== false}
            onChange={() => handleToggleTelemetry(record)}
            loading={toggling[pointId]}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
        );
      },
    },
  ];

  const pagination = useMemo(() => {
    const count = data?.count ?? data?.results?.length ?? 0;
    return {
      total: count,
      pageSize: 10,
      showSizeChanger: false,
      showTotal: (total) => `${total} puntos`,
    };
  }, [data]);

  return (
    <SmartCard
      title={
        <Flex align="center" justify="space-between" style={{ width: "100%" }}>
          <Flex align="center" gap={8}>
            <SettingOutlined style={{ color: token.colorPrimary }} />
            <Text strong>Estado de Puntos</Text>
          </Flex>
          <Space>
            <Search
              placeholder="Buscar nombre, código, cliente..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ minWidth: 220 }}
            />
            <Select
              placeholder="Cliente"
              allowClear
              loading={clientsLoading}
              value={filters.client}
              onChange={(v) => onFiltersChange({ ...filters, client: v, project: undefined })}
              style={{ minWidth: 160 }}
              showSearch
              optionFilterProp="children"
            >
              {clients.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name || c.legal_name || c.id}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Proyecto"
              allowClear
              value={filters.project}
              onChange={(v) => onFiltersChange({ ...filters, project: v })}
              style={{ minWidth: 160 }}
              showSearch
              optionFilterProp="children"
            >
              {filteredProjects.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name || p.id}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Estado"
              allowClear
              value={filters.status}
              onChange={(v) => onFiltersChange({ ...filters, status: v })}
              style={{ minWidth: 140 }}
            >
              <Option value="active">Activo</Option>
              <Option value="disconnected">Desconectado</Option>
              <Option value="no_data">Sin datos</Option>
            </Select>
            <Tooltip title="Refrescar">
              <Button icon={<ReloadOutlined />} loading={loading} onClick={() => onChange?.()} />
            </Tooltip>
          </Space>
        </Flex>
      }
    >
      {loading && !data?.results?.length ? (
        <Flex justify="center" align="center" style={{ minHeight: 220 }}>
          <Spin />
        </Flex>
      ) : (
        <Table
          rowKey={(r) => r.id || r.point_id}
          columns={columns}
          dataSource={filteredResults}
          pagination={pagination}
          size="small"
          locale={{ emptyText: <Empty description="No hay puntos" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          scroll={{ x: "max-content" }}
        />
      )}
    </SmartCard>
  );
});

PointsStatusTable.displayName = "PointsStatusTable";

export default PointsStatusTable;
