import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
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
  Tag,
  Card,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BuildOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import CrudDrawer from "../components/CrudDrawer";
import orchestrator from "../../../api/orchestrator";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const PAGE_SIZE = 10;

const VARIABLE_TYPE_OPTIONS = [
  "CAUDAL",
  "NIVEL",
  "TOTALIZADO",
  "CAUDAL_PROMEDIO",
  "PRESION",
  "TEMPERATURA",
  "HUMEDAD",
  "CUSTOM",
];

const SERVICE_OPTIONS = [
  { value: "NOVUS", label: "Novus" },
  { value: "NETTRA", label: "Nettra" },
  { value: "TWIN", label: "Twin" },
];

const SchemesAndVariablesPage = () => {
  const token = useIkoluToken();

  // Esquemas
  const [schemes, setSchemes] = useState([]);
  const [schemesCount, setSchemesCount] = useState(0);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [schemeSearch, setSchemeSearch] = useState("");
  const [schemePagination, setSchemePagination] = useState({ current: 1, pageSize: PAGE_SIZE });
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeDrawerOpen, setSchemeDrawerOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [schemeSaving, setSchemeSaving] = useState(false);

  // Variables
  const [variables, setVariables] = useState([]);
  const [variablesCount, setVariablesCount] = useState(0);
  const [variablesLoading, setVariablesLoading] = useState(false);
  const [variableSearch, setVariableSearch] = useState("");
  const [variablePagination, setVariablePagination] = useState({ current: 1, pageSize: PAGE_SIZE });
  const [variableDrawerOpen, setVariableDrawerOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);
  const [variableSaving, setVariableSaving] = useState(false);

  // Referencias
  const [points, setPoints] = useState([]);
  const [providers, setProviders] = useState([]);
  const [refsLoading, setRefsLoading] = useState(false);

  useEffect(() => {
    setRefsLoading(true);
    Promise.all([
      orchestrator.admin.pointsAll().catch(() => []),
      orchestrator.admin.telemetryProviders({ page_size: 500 }).catch(() => []),
    ])
      .then(([p, pr]) => {
        setPoints(p?.results || p || []);
        setProviders(pr?.results || pr || []);
      })
      .finally(() => setRefsLoading(false));
  }, []);

  const pointMap = Object.fromEntries(points.map((p) => [p.id, p]));
  const providerMap = Object.fromEntries(providers.map((p) => [p.id, p]));

  const fetchSchemes = useCallback(async (page = 1, search = schemeSearch) => {
    setSchemesLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search?.trim()) params.search = search.trim();
      const res = await orchestrator.admin.schemes(params);
      const results = res?.results || res || [];
      setSchemes(results);
      setSchemesCount(res?.count ?? results.length);
      if (!selectedScheme && results.length > 0) {
        setSelectedScheme(results[0]);
      }
    } catch (err) {
      console.error("[SchemesAndVariables] error schemes:", err);
    } finally {
      setSchemesLoading(false);
    }
  }, [schemeSearch, selectedScheme]);

  const fetchVariables = useCallback(async (schemeId, page = 1, search = variableSearch) => {
    if (!schemeId) return;
    setVariablesLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE, scheme_catchment: schemeId };
      if (search?.trim()) params.search = search.trim();
      const res = await orchestrator.admin.variables(params);
      const results = res?.results || res || [];
      setVariables(results);
      setVariablesCount(res?.count ?? results.length);
    } catch (err) {
      console.error("[SchemesAndVariables] error variables:", err);
    } finally {
      setVariablesLoading(false);
    }
  }, [variableSearch]);

  useEffect(() => {
    fetchSchemes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedScheme) {
      setVariablePagination({ current: 1, pageSize: PAGE_SIZE });
      fetchVariables(selectedScheme.id, 1);
    } else {
      setVariables([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScheme?.id]);

  const handleSchemeSearch = (value) => {
    setSchemeSearch(value);
    setSchemePagination({ current: 1, pageSize: PAGE_SIZE });
    fetchSchemes(1, value);
  };

  const handleSchemeTableChange = (p) => {
    setSchemePagination({ current: p.current, pageSize: p.pageSize });
    fetchSchemes(p.current, schemeSearch);
  };

  const handleVariableSearch = (value) => {
    setVariableSearch(value);
    setVariablePagination({ current: 1, pageSize: PAGE_SIZE });
    fetchVariables(selectedScheme?.id, 1, value);
  };

  const handleVariableTableChange = (p) => {
    setVariablePagination({ current: p.current, pageSize: p.pageSize });
    fetchVariables(selectedScheme?.id, p.current, variableSearch);
  };

  const openSchemeCreate = () => {
    setEditingScheme(null);
    setSchemeDrawerOpen(true);
  };

  const openSchemeEdit = (record, e) => {
    e.stopPropagation();
    setEditingScheme(record);
    setSchemeDrawerOpen(true);
  };

  const closeSchemeDrawer = () => {
    setSchemeDrawerOpen(false);
    setEditingScheme(null);
  };

  const submitScheme = async (values) => {
    setSchemeSaving(true);
    try {
      if (editingScheme) {
        await orchestrator.admin.updateScheme(editingScheme.id, values);
      } else {
        await orchestrator.admin.createScheme(values);
      }
      closeSchemeDrawer();
      setSchemePagination({ current: 1, pageSize: PAGE_SIZE });
      await fetchSchemes(1);
    } catch (err) {
      console.error(err);
    } finally {
      setSchemeSaving(false);
    }
  };

  const deleteScheme = (record, e) => {
    e.stopPropagation();
    confirm({
      title: `¿Eliminar esquema "${record.name}"?`,
      content: "Se eliminarán también sus variables asociadas.",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        await orchestrator.admin.deleteScheme(record.id);
        if (selectedScheme?.id === record.id) setSelectedScheme(null);
        fetchSchemes(schemePagination.current);
      },
    });
  };

  const openVariableCreate = () => {
    setEditingVariable(null);
    setVariableDrawerOpen(true);
  };

  const openVariableEdit = (record) => {
    setEditingVariable(record);
    setVariableDrawerOpen(true);
  };

  const closeVariableDrawer = () => {
    setVariableDrawerOpen(false);
    setEditingVariable(null);
  };

  const submitVariable = async (values) => {
    setVariableSaving(true);
    try {
      const payload = {
        ...values,
        scheme_catchment: selectedScheme.id,
        pulses_factor: values.pulses_factor ?? null,
        calculate_nivel: values.calculate_nivel ?? null,
        min_value: values.min_value ?? null,
        max_value: values.max_value ?? null,
        provider: values.provider ?? null,
      };
      if (editingVariable) {
        await orchestrator.admin.updateVariable(editingVariable.id, payload);
      } else {
        await orchestrator.admin.createVariable(payload);
      }
      closeVariableDrawer();
      setVariablePagination({ current: 1, pageSize: PAGE_SIZE });
      await fetchVariables(selectedScheme.id, 1);
    } catch (err) {
      console.error(err);
    } finally {
      setVariableSaving(false);
    }
  };

  const deleteVariable = (record) => {
    confirm({
      title: `¿Eliminar variable "${record.label || record.str_variable}"?`,
      content: "Esta acción no se puede deshacer.",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        await orchestrator.admin.deleteVariable(record.id);
        fetchVariables(selectedScheme.id, variablePagination.current);
      },
    });
  };

  const schemeColumns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (v, r) => (
        <Text strong={selectedScheme?.id === r.id} style={{ color: selectedScheme?.id === r.id ? token.colorPrimary : undefined }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} onClick={(e) => openSchemeEdit(record, e)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => deleteScheme(record, e)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const variableColumns = [
    { title: "Etiqueta", dataIndex: "label", key: "label", render: (v) => <Text strong>{v}</Text> },
    { title: "Variable", dataIndex: "str_variable", key: "str_variable" },
    { title: "Tipo", dataIndex: "type_variable", key: "type_variable", render: (v) => <Tag>{v || "—"}</Tag> },
    {
      title: "Proveedor",
      key: "provider",
      render: (_, r) => providerMap[r.provider]?.name || r.provider || "—",
    },
    { title: "Token", dataIndex: "token_service", key: "token_service", render: (v) => v || "—" },
    {
      title: "Acciones",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button type="text" icon={<EditOutlined />} onClick={() => openVariableEdit(record)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteVariable(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const selectedPointsTitles = (selectedScheme?.points_catchment || [])
    .map((id) => pointMap[id]?.title)
    .filter(Boolean);

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <BuildOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Esquemas y Variables
          </Title>
        </Flex>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Flex justify="space-between" align="center">
                <Text strong>Esquemas</Text>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openSchemeCreate}>
                  Nuevo
                </Button>
              </Flex>
            }
            style={{ background: token.colorBgElevated, border: `1px solid ${token.colorBorder}` }}
          >
            <Search
              placeholder="Buscar esquema..."
              allowClear
              onSearch={handleSchemeSearch}
              style={{ marginBottom: 12 }}
            />
            <Table
              rowKey="id"
              columns={schemeColumns}
              dataSource={schemes}
              loading={schemesLoading}
              size="small"
              pagination={{
                current: schemePagination.current,
                pageSize: schemePagination.pageSize,
                total: schemesCount,
                showSizeChanger: false,
                onChange: (page, pageSize) => handleSchemeTableChange({ current: page, pageSize }),
              }}
              onRow={(record) => ({
                onClick: () => setSelectedScheme(record),
                style: { cursor: "pointer" },
              })}
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <Flex justify="space-between" align="center">
                <Flex align="center" gap={8}>
                  <ApartmentOutlined />
                  <Text strong>Variables</Text>
                  {selectedScheme && (
                    <Tag color="blue">{selectedScheme.name}</Tag>
                  )}
                </Flex>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={openVariableCreate}
                  disabled={!selectedScheme}
                >
                  Nueva Variable
                </Button>
              </Flex>
            }
            style={{ background: token.colorBgElevated, border: `1px solid ${token.colorBorder}`, minHeight: "100%" }}
          >
            {!selectedScheme ? (
              <Empty description="Selecciona un esquema para ver sus variables" />
            ) : (
              <>
                <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
                  {selectedScheme.description || "Sin descripción"}
                  {selectedPointsTitles.length > 0 && (
                    <>
                      {" · Puntos: "}
                      {selectedPointsTitles.slice(0, 3).join(", ")}
                      {selectedPointsTitles.length > 3 && ` +${selectedPointsTitles.length - 3}`}
                    </>
                  )}
                </Text>
                <Search
                  placeholder="Buscar variable..."
                  allowClear
                  onSearch={handleVariableSearch}
                  style={{ marginBottom: 12, maxWidth: 300 }}
                />
                <Table
                  rowKey="id"
                  columns={variableColumns}
                  dataSource={variables}
                  loading={variablesLoading}
                  size="small"
                  pagination={{
                    current: variablePagination.current,
                    pageSize: variablePagination.pageSize,
                    total: variablesCount,
                    showSizeChanger: false,
                    onChange: (page, pageSize) => handleVariableTableChange({ current: page, pageSize }),
                  }}
                  scroll={{ x: "max-content" }}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Drawer Esquema */}
      <CrudDrawer
        title={editingScheme ? "Editar Esquema" : "Nuevo Esquema"}
        open={schemeDrawerOpen}
        onClose={closeSchemeDrawer}
        onSubmit={submitScheme}
        saving={schemeSaving}
        initialValues={editingScheme || { name: "", description: "", points_catchment: [] }}
      >
        <Form.Item name="name" label="Nombre" rules={[{ required: true, message: "Requerido" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Descripción">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="points_catchment" label="Puntos asociados">
          <Select
            mode="multiple"
            placeholder="Selecciona puntos"
            loading={refsLoading}
            showSearch
            optionFilterProp="children"
            allowClear
          >
            {points.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.title}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </CrudDrawer>

      {/* Drawer Variable */}
      <CrudDrawer
        title={editingVariable ? "Editar Variable" : "Nueva Variable"}
        open={variableDrawerOpen}
        onClose={closeVariableDrawer}
        onSubmit={submitVariable}
        saving={variableSaving}
        initialValues={
          editingVariable || {
            str_variable: "",
            label: "",
            type_variable: "CAUDAL",
            service: undefined,
            provider: undefined,
            token_service: "",
            pulses_factor: 1000,
            convert_to_lt: false,
            calculate_nivel: null,
            store_average_flow: true,
            min_value: null,
            max_value: null,
            display_key: "",
          }
        }
      >
        <Form.Item name="str_variable" label="Variable (str)" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="label" label="Etiqueta" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="type_variable" label="Tipo">
          <Select allowClear>
            {VARIABLE_TYPE_OPTIONS.map((v) => (
              <Option key={v} value={v}>{v}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="service" label="Servicio legacy">
          <Select allowClear>
            {SERVICE_OPTIONS.map((s) => (
              <Option key={s.value} value={s.value}>{s.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="provider" label="Proveedor CRUD">
          <Select allowClear loading={refsLoading} showSearch optionFilterProp="children">
            {providers.map((p) => (
              <Option key={p.id} value={p.id}>{p.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="token_service" label="Token / Llave servicio">
          <Input />
        </Form.Item>
        <Form.Item name="display_key" label="Clave de visualización">
          <Input placeholder="Ej: caudal, nivel, total" />
        </Form.Item>
        <Form.Item name="pulses_factor" label="Factor de pulsos">
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>
        <Form.Item name="calculate_nivel" label="Base cálculo nivel">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="min_value" label="Valor mínimo">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="max_value" label="Valor máximo">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="convert_to_lt" valuePropName="checked" label="Convertir a litros">
          <Switch />
        </Form.Item>
        <Form.Item name="store_average_flow" valuePropName="checked" label="Guardar caudal promedio en BD">
          <Switch />
        </Form.Item>
      </CrudDrawer>
    </div>
  );
};

export default SchemesAndVariablesPage;
