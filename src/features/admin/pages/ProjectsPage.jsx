import React, { useState, useCallback, useMemo } from "react";
import { Flex, Typography, Button, Table, Input, Modal, Select, Space, Tooltip, Form } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ProjectOutlined,
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

const projectApi = {
  get: orchestrator.admin.projects,
  create: orchestrator.admin.createProject,
  update: orchestrator.admin.updateProject,
  delete: orchestrator.admin.deleteProject,
};

const clientApi = {
  get: orchestrator.admin.clientsAll,
};

const PAGE_SIZE = 10;

const ProjectsPage = () => {
  const token = useIkoluToken();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [clientFilter, setClientFilter] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });

  const { items: projects, count, loading, saving, refresh, createItem, updateItem, deleteItem } =
    useAdminCrud(projectApi, { autoLoad: true, initialParams: { page_size: PAGE_SIZE } });

  const { items: clients, loading: clientsLoading } = useAdminCrud(clientApi, { autoLoad: true });

  const clientMap = useMemo(() => {
    return clients.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});
  }, [clients]);

  const fetchPage = useCallback(
    (page, overrides = {}) => {
      const params = { page, page_size: PAGE_SIZE };
      const search = overrides.search !== undefined ? overrides.search : searchText;
      const client = overrides.client !== undefined ? overrides.client : clientFilter;
      if (search?.trim()) params.search = search.trim();
      if (client) params.client = client;
      refresh(params);
    },
    [refresh, searchText, clientFilter]
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
      fetchPage(1, { search: value });
    },
    [fetchPage]
  );

  const handleClientFilter = useCallback(
    (value) => {
      setClientFilter(value);
      setPagination({ current: 1, pageSize: PAGE_SIZE });
      fetchPage(1, { client: value });
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
      const payload = { ...values, client: values.client || null };
      if (editing) {
        await updateItem(editing.id, payload);
      } else {
        await createItem(payload);
      }
      handleClose();
      fetchPage(pagination.current);
    },
    [editing, createItem, updateItem, handleClose, fetchPage, pagination.current]
  );

  const handleDelete = useCallback(
    (record) => {
      confirm({
        title: `¿Eliminar proyecto "${record.name}"?`,
        content: "Esta acción no se puede deshacer.",
        okText: "Eliminar",
        okType: "danger",
        cancelText: "Cancelar",
        onOk: async () => {
          await deleteItem(record.id);
          fetchPage(pagination.current);
        },
      });
    },
    [deleteItem, fetchPage, pagination.current]
  );

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Cliente",
      dataIndex: "client",
      key: "client",
      render: (v) => clientMap[v]?.name || v || "—",
    },
    { title: "Código interno", dataIndex: "code_internal", key: "code_internal" },
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
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <ProjectOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Proyectos
          </Title>
        </Flex>
        <Flex gap={12} wrap>
          <Search
            placeholder="Buscar proyecto..."
            allowClear
            defaultValue={searchText}
            onSearch={handleSearch}
            style={{ width: 220 }}
          />
          <Select
            placeholder="Filtrar cliente"
            allowClear
            loading={clientsLoading}
            value={clientFilter}
            onChange={handleClientFilter}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="children"
          >
            {clients.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => fetchPage(pagination.current)} loading={loading}>
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ background: token.colorPrimary }}
          >
            Nuevo Proyecto
          </Button>
        </Flex>
      </Flex>

      <SmartCard>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={projects}
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
        title={editing ? "Editar Proyecto" : "Nuevo Proyecto"}
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        saving={saving}
        initialValues={editing || {}}
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: "Requerido" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="client" label="Cliente">
          <Select
            placeholder="Seleccione un cliente"
            allowClear
            loading={clientsLoading}
            showSearch
            optionFilterProp="children"
          >
            {clients.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="code_internal" label="Código interno">
          <Input />
        </Form.Item>
      </CrudDrawer>
    </div>
  );
};

export default ProjectsPage;
