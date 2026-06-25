import React, { useState, useCallback, useMemo } from "react";
import {
  Flex,
  Typography,
  Button,
  Table,
  Input,
  Modal,
  Select,
  Space,
  Tooltip,
  Form,
  Switch,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
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

const pointApi = {
  get: orchestrator.admin.points,
  create: orchestrator.admin.createPoint,
  update: orchestrator.admin.updatePoint,
  delete: orchestrator.admin.deletePoint,
};

const clientApi = { get: orchestrator.admin.clientsAll };
const projectApi = { get: orchestrator.admin.projectsAll };
const userApi = { get: orchestrator.admin.users };

const PAGE_SIZE = 10;
const USERS_PAGE_SIZE = 1000;

const PointsPage = () => {
  const token = useIkoluToken();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [clientFilter, setClientFilter] = useState(null);
  const [projectFilter, setProjectFilter] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });

  const {
    items: points,
    count,
    loading,
    saving,
    refresh,
    createItem,
    updateItem,
    deleteItem,
  } = useAdminCrud(pointApi, { autoLoad: true, initialParams: { page_size: PAGE_SIZE } });

  const { items: clients, loading: clientsLoading } = useAdminCrud(clientApi, { autoLoad: true });
  const { items: projects, loading: projectsLoading } = useAdminCrud(projectApi, { autoLoad: true });
  const { items: users, loading: usersLoading } = useAdminCrud(userApi, {
    autoLoad: true,
    initialParams: { page_size: USERS_PAGE_SIZE },
  });

  const clientMap = useMemo(() => {
    return clients.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});
  }, [clients]);

  const projectMap = useMemo(() => {
    return projects.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!clientFilter) return projects;
    return projects.filter((p) => String(p.client) === String(clientFilter));
  }, [projects, clientFilter]);

  const fetchPage = useCallback(
    (page, overrides = {}) => {
      const params = { page, page_size: PAGE_SIZE };
      const search = overrides.search !== undefined ? overrides.search : searchText;
      const project = overrides.project !== undefined ? overrides.project : projectFilter;
      if (search?.trim()) params.search = search.trim();
      if (project) params.project = project;
      refresh(params);
    },
    [refresh, searchText, projectFilter]
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
      setProjectFilter(null);
      // El filtro de cliente solo restringe el select de proyectos; no se envía al backend.
    },
    []
  );

  const handleProjectFilter = useCallback(
    (value) => {
      setProjectFilter(value);
      setPagination({ current: 1, pageSize: PAGE_SIZE });
      fetchPage(1, { project: value });
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
      const payload = {
        title: values.title || null,
        point_code: values.point_code || null,
        lat: values.lat ? String(values.lat) : null,
        lon: values.lon ? String(values.lon) : null,
        is_active: values.is_active !== undefined ? values.is_active : true,
        project: values.project || null,
        owner_user: values.owner_user || null,
      };
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
        title: `¿Eliminar punto "${record.title || record.id}"?`,
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

  const getUserLabel = useCallback(
    (userId) => {
      const u = users.find((user) => String(user.id) === String(userId));
      if (!u) return userId;
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
      return fullName ? `${fullName} (${u.email})` : u.email || u.username || userId;
    },
    [users]
  );

  const columns = [
    {
      title: "Nombre",
      dataIndex: "title",
      key: "title",
      render: (v) => <Text strong>{v || `Punto sin nombre`}</Text>,
    },
    {
      title: "Proyecto",
      dataIndex: "project",
      key: "project",
      render: (v) => projectMap[v]?.name || v || "—",
    },
    {
      title: "Cliente",
      key: "client",
      render: (_, record) => clientMap[projectMap[record.project]?.client]?.name || "—",
    },
    {
      title: "Propietario",
      dataIndex: "owner_user",
      key: "owner_user",
      render: (v) => getUserLabel(v),
    },
    {
      title: "Frecuencia",
      dataIndex: "frecuency",
      key: "frecuency",
      render: (v) => (v ? `${v} min` : "—"),
    },
    {
      title: "Código",
      dataIndex: "point_code",
      key: "point_code",
      render: (v) => v || "—",
    },
    {
      title: "Estado",
      dataIndex: "is_active",
      key: "is_active",
      render: (v) => (v ? "Activo" : "Inactivo"),
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
          <EnvironmentOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Puntos de Captación
          </Title>
        </Flex>
        <Flex gap={12} wrap>
          <Search
            placeholder="Buscar punto..."
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
          <Select
            placeholder="Filtrar proyecto"
            allowClear
            loading={projectsLoading}
            value={projectFilter}
            onChange={handleProjectFilter}
            style={{ width: 200 }}
            showSearch
            optionFilterProp="children"
          >
            {filteredProjects.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
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
            Nuevo Punto
          </Button>
        </Flex>
      </Flex>

      <SmartCard>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={points}
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

      <PointDrawer
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        saving={saving}
        editing={editing}
        clients={clients}
        projects={projects}
        users={users}
        clientsLoading={clientsLoading}
        projectsLoading={projectsLoading}
        usersLoading={usersLoading}
      />
    </div>
  );
};

const PointDrawer = ({
  open,
  onClose,
  onSubmit,
  saving,
  editing,
  clients,
  projects,
  users,
  clientsLoading,
  projectsLoading,
  usersLoading,
}) => {
  const [form] = Form.useForm();
  const [selectedClient, setSelectedClient] = useState(null);

  React.useEffect(() => {
    if (open) {
      form.resetFields();
      if (editing) {
        const project = projects.find((p) => p.id === editing.project);
        setSelectedClient(project?.client || null);
        form.setFieldsValue({
          title: editing.title,
          point_code: editing.point_code,
          lat: editing.lat,
          lon: editing.lon,
          is_active: editing.is_active !== undefined ? editing.is_active : true,
          project: editing.project,
          owner_user: editing.owner_user,
        });
      } else {
        setSelectedClient(null);
        form.setFieldsValue({ is_active: true });
      }
    }
  }, [open, editing, projects, form]);

  const filteredProjects = useMemo(() => {
    if (!selectedClient) return projects;
    return projects.filter((p) => String(p.client) === String(selectedClient));
  }, [projects, selectedClient]);

  const handleClientChange = (value) => {
    setSelectedClient(value);
    form.setFieldsValue({ project: undefined });
  };

  return (
    <CrudDrawer
      title={editing ? "Editar Punto de Captación" : "Nuevo Punto de Captación"}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      initialValues={editing || {}}
      form={form}
    >
      <Form.Item name="title" label="Nombre" rules={[{ required: true, message: "Requerido" }]}>
        <Input />
      </Form.Item>

      <Form.Item name="point_code" label="Código">
        <Input />
      </Form.Item>

      <Form.Item label="Cliente" required={false}>
        <Select
          placeholder="Seleccione un cliente"
          allowClear
          loading={clientsLoading}
          value={selectedClient}
          onChange={handleClientChange}
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

      <Form.Item
        name="project"
        label="Proyecto"
        rules={[{ required: true, message: "Requerido" }]}
      >
        <Select
          placeholder="Seleccione un proyecto"
          allowClear
          loading={projectsLoading}
          disabled={!selectedClient}
          showSearch
          optionFilterProp="children"
        >
          {filteredProjects.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="owner_user"
        label="Propietario"
        rules={[{ required: true, message: "Requerido" }]}
      >
        <Select
          placeholder="Seleccione un usuario"
          allowClear
          loading={usersLoading}
          showSearch
          optionFilterProp="children"
        >
          {users.map((u) => (
            <Option key={u.id} value={u.id}>
              {`${u.first_name || ""} ${u.last_name || ""} (${u.email})`.trim() || u.username || u.id}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="lat" label="Latitud">
        <Input />
      </Form.Item>

      <Form.Item name="lon" label="Longitud">
        <Input />
      </Form.Item>

      <Form.Item name="is_active" valuePropName="checked" label="Activo">
        <Switch />
      </Form.Item>
    </CrudDrawer>
  );
};

export default PointsPage;
