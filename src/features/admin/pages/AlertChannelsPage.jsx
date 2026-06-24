import React, { useState, useCallback, useEffect } from "react";
import {
  Flex,
  Typography,
  Button,
  Table,
  Input,
  Modal,
  Space,
  Tooltip,
  Form,
  Select,
  Switch,
  Tag,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import useAdminCrud from "../hooks/useAdminCrud";
import CrudDrawer from "../components/CrudDrawer";
import orchestrator from "../../../api/orchestrator";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const PAGE_SIZE = 10;

const CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "Email" },
  { value: "GOOGLE_CHAT", label: "Google Chat" },
  { value: "WEBHOOK", label: "Webhook" },
  { value: "SMS", label: "SMS" },
];

const channelApi = {
  get: orchestrator.alerts.channels.get,
  create: orchestrator.alerts.channels.create,
  update: orchestrator.alerts.channels.update,
  delete: orchestrator.alerts.channels.delete,
};

const AlertChannelsPage = () => {
  const token = useIkoluToken();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);

  const { items, count, loading, saving, refresh, createItem, updateItem, deleteItem } =
    useAdminCrud(channelApi, { autoLoad: true, initialParams: { page_size: PAGE_SIZE } });

  useEffect(() => {
    setLoadingRules(true);
    orchestrator.alerts.rules
      .get({ page_size: 500 })
      .then((res) => setRules(res?.results || res || []))
      .catch((err) => console.error("[AlertChannelsPage] error rules:", err))
      .finally(() => setLoadingRules(false));
  }, []);

  const ruleMap = Object.fromEntries(rules.map((r) => [r.id, r]));

  const fetchPage = useCallback(
    (page, search = searchText) => {
      const params = { page, page_size: PAGE_SIZE };
      if (search?.trim()) params.search = search.trim();
      refresh(params);
    },
    [refresh, searchText]
  );

  const handleTableChange = useCallback(
    (p) => {
      setPagination({ current: p.current, pageSize: p.pageSize });
      fetchPage(p.current);
    },
    [fetchPage]
  );

  const handleSearch = useCallback(
    (value) => {
      setSearchText(value);
      setPagination({ current: 1, pageSize: PAGE_SIZE });
      fetchPage(1, value);
    },
    [fetchPage]
  );

  const handleOpenCreate = useCallback(() => {
    setEditing(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((record) => {
    setEditing(record);
    setDrawerOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
    setEditing(null);
  }, []);

  const handleSubmit = useCallback(
    async (values) => {
      if (editing) {
        await updateItem(editing.id, values);
      } else {
        await createItem(values);
      }
      handleClose();
      setPagination({ current: 1, pageSize: PAGE_SIZE });
      fetchPage(1);
    },
    [editing, createItem, updateItem, handleClose, fetchPage]
  );

  const handleDelete = useCallback(
    (record) => {
      confirm({
        title: `¿Eliminar canal "${record.channel_type}"?`,
        content: "Esta acción no se puede deshacer.",
        okText: "Eliminar",
        okType: "danger",
        cancelText: "Cancelar",
        onOk: async () => {
          await deleteItem(record.id);
          setPagination({ current: 1, pageSize: PAGE_SIZE });
          fetchPage(1);
        },
      });
    },
    [deleteItem, fetchPage]
  );

  const columns = [
    {
      title: "Regla",
      key: "rule",
      render: (_, r) => ruleMap[r.alert_rule]?.name || r.alert_rule_name || r.alert_rule || "—",
    },
    {
      title: "Canal",
      dataIndex: "channel_type",
      key: "channel_type",
      render: (v) => CHANNEL_OPTIONS.find((c) => c.value === v)?.label || v,
    },
    {
      title: "Destino",
      dataIndex: "destination",
      key: "destination",
      render: (v) => (
        <Text ellipsis style={{ maxWidth: 240 }} title={v}>
          {v}
        </Text>
      ),
    },
    {
      title: "Activo",
      dataIndex: "is_active",
      key: "is_active",
      render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag color="default">No</Tag>),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <NotificationOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Canales de Alerta
          </Title>
        </Flex>
        <Flex gap={12}>
          <Search
            placeholder="Buscar canal..."
            allowClear
            defaultValue={searchText}
            onSearch={handleSearch}
            style={{ width: 240 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchPage(pagination.current)}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ background: token.colorPrimary }}
          >
            Nuevo Canal
          </Button>
        </Flex>
      </Flex>

      <SmartCard>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={loading}
          size="small"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: count,
            showSizeChanger: false,
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
          }}
          scroll={{ x: "max-content" }}
        />
      </SmartCard>

      <CrudDrawer
        title={editing ? "Editar Canal" : "Nuevo Canal"}
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        saving={saving}
        initialValues={
          editing || {
            alert_rule: undefined,
            channel_type: "EMAIL",
            destination: "",
            is_active: true,
            template_override: "",
          }
        }
      >
        <Form.Item
          name="alert_rule"
          label="Regla de alerta"
          rules={[{ required: true, message: "Requerido" }]}
        >
          <Select
            placeholder="Selecciona una regla"
            loading={loadingRules}
            showSearch
            optionFilterProp="children"
          >
            {rules.map((r) => (
              <Option key={r.id} value={r.id}>
                {r.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="channel_type"
          label="Canal"
          rules={[{ required: true, message: "Requerido" }]}
        >
          <Select>
            {CHANNEL_OPTIONS.map((c) => (
              <Option key={c.value} value={c.value}>
                {c.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="destination"
          label="Destino"
          rules={[{ required: true, message: "Requerido" }]}
        >
          <Input placeholder="Email(s), URL o teléfono" />
        </Form.Item>

        <Form.Item name="is_active" valuePropName="checked" label="Activo">
          <Switch />
        </Form.Item>

        <Form.Item name="template_override" label="Plantilla Jinja2 (opcional)">
          <TextArea rows={4} placeholder="{% if trigger.is_acknowledged %}...{% endif %}" />
        </Form.Item>
      </CrudDrawer>
    </div>
  );
};

export default AlertChannelsPage;
