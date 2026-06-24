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
  InputNumber,
  DatePicker,
  Tag,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  AlertOutlined,
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

const SEVERITY_OPTIONS = [
  { value: "INFO", label: "Info", color: "blue" },
  { value: "WARNING", label: "Advertencia", color: "orange" },
  { value: "ALERT", label: "Alerta", color: "red" },
  { value: "CRITICAL", label: "Crítico", color: "magenta" },
];

const TARGET_OPTIONS = [
  { value: "THRESHOLD_MAX", label: "Umbral máximo" },
  { value: "THRESHOLD_MIN", label: "Umbral mínimo" },
  { value: "NO_DATA", label: "Sin datos" },
  { value: "DISCONNECTION", label: "Desconexión" },
  { value: "RECONNECTION", label: "Reconexión" },
  { value: "PROCESSING_ERROR", label: "Error de procesamiento" },
  { value: "RATE_OF_CHANGE", label: "Tasa de cambio" },
  { value: "DEVIATION", label: "Desviación" },
  { value: "SCHEDULED_REPORT", label: "Reporte programado" },
];

const VARIABLE_OPTIONS = [
  "CAUDAL",
  "NIVEL",
  "TOTALIZADO",
  "CAUDAL_PROMEDIO",
  "PRESION",
  "TEMPERATURA",
];

const REPORT_SCHEDULE_OPTIONS = [
  { value: "DAILY", label: "Diario" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensual" },
];

const ruleApi = {
  get: orchestrator.alerts.rules.get,
  create: orchestrator.alerts.rules.create,
  update: orchestrator.alerts.rules.update,
  delete: orchestrator.alerts.rules.delete,
};

const AlertRulesPage = () => {
  const token = useIkoluToken();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });
  const [points, setPoints] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(false);

  const { items, count, loading, saving, refresh, createItem, updateItem, deleteItem } =
    useAdminCrud(ruleApi, { autoLoad: true, initialParams: { page_size: PAGE_SIZE } });

  useEffect(() => {
    setLoadingPoints(true);
    orchestrator.admin
      .pointsAll()
      .then((res) => setPoints(res?.results || res || []))
      .catch((err) => console.error("[AlertRulesPage] error points:", err))
      .finally(() => setLoadingPoints(false));
  }, []);

  const pointMap = Object.fromEntries(points.map((p) => [p.id, p]));

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
      const payload = { ...values };
      if (values.start_date) payload.start_date = values.start_date.format("YYYY-MM-DD");
      if (values.end_date) payload.end_date = values.end_date.format("YYYY-MM-DD");
      if (editing) {
        await updateItem(editing.id, payload);
      } else {
        await createItem(payload);
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
        title: `¿Eliminar regla "${record.name}"?`,
        content: "Se eliminarán también sus canales y disparos asociados.",
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
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Severidad",
      dataIndex: "severity",
      key: "severity",
      render: (v) => {
        const s = SEVERITY_OPTIONS.find((x) => x.value === v);
        return <Tag color={s?.color}>{s?.label || v}</Tag>;
      },
    },
    {
      title: "Tipo",
      dataIndex: "target_type",
      key: "target_type",
      render: (v) => TARGET_OPTIONS.find((x) => x.value === v)?.label || v,
    },
    {
      title: "Variable",
      dataIndex: "variable_type",
      key: "variable_type",
      render: (v) => v || "—",
    },
    {
      title: "Punto",
      key: "point",
      render: (_, r) => pointMap[r.point_catchment]?.title || r.point_catchment_title || "Global",
    },
    {
      title: "Activa",
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
          <AlertOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Reglas de Alerta
          </Title>
        </Flex>
        <Flex gap={12}>
          <Search
            placeholder="Buscar regla..."
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
            Nueva Regla
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
        title={editing ? "Editar Regla" : "Nueva Regla"}
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        saving={saving}
        initialValues={
          editing || {
            severity: "WARNING",
            target_type: "THRESHOLD_MAX",
            variable_type: "CAUDAL",
            is_active: true,
            check_frequency_minutes: 10,
            cooldown_minutes: 60,
            threshold_value: null,
            no_data_minutes: null,
            max_disconnection_days: null,
            rate_change_value: null,
            rate_change_window: null,
            report_schedule: undefined,
            report_hour: null,
            point_catchment: undefined,
            points: [],
            description: "",
          }
        }
      >
        <Form.Item name="name" label="Nombre" rules={[{ required: true, message: "Requerido" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="severity" label="Severidad">
          <Select>
            {SEVERITY_OPTIONS.map((s) => (
              <Option key={s.value} value={s.value}>
                {s.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="target_type" label="Tipo de alerta">
          <Select>
            {TARGET_OPTIONS.map((t) => (
              <Option key={t.value} value={t.value}>
                {t.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="variable_type" label="Tipo de variable">
          <Select allowClear>
            {VARIABLE_OPTIONS.map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="point_catchment" label="Punto de captación">
          <Select
            placeholder="Opcional"
            allowClear
            loading={loadingPoints}
            showSearch
            optionFilterProp="children"
          >
            {points.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="points" label="Puntos adicionales (M2M)">
          <Select
            mode="multiple"
            placeholder="Opcional"
            allowClear
            loading={loadingPoints}
            showSearch
            optionFilterProp="children"
          >
            {points.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="threshold_value" label="Umbral">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="no_data_minutes" label="Minutos sin datos">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item name="max_disconnection_days" label="Días máx. desconexión">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item name="rate_change_value" label="Valor tasa de cambio">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="rate_change_window" label="Ventana tasa de cambio (min)">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item name="check_frequency_minutes" label="Frecuencia de revisión (min)">
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>

        <Form.Item name="cooldown_minutes" label="Cooldown (min)">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item name="report_schedule" label="Periodicidad reporte">
          <Select allowClear placeholder="Solo reportes programados">
            {REPORT_SCHEDULE_OPTIONS.map((r) => (
              <Option key={r.value} value={r.value}>
                {r.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="report_hour" label="Hora reporte (0-23)">
          <InputNumber style={{ width: "100%" }} min={0} max={23} />
        </Form.Item>

        <Form.Item name="start_date" label="Fecha inicio vigencia">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="end_date" label="Fecha fin vigencia">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="is_active" valuePropName="checked" label="Activa">
          <Switch />
        </Form.Item>

        <Form.Item name="description" label="Descripción">
          <TextArea rows={3} />
        </Form.Item>
      </CrudDrawer>
    </div>
  );
};

export default AlertRulesPage;
