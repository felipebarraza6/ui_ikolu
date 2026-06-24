import React, { useState, useCallback } from "react";
import { Flex, Typography, Button, Table, Input, Modal, Space, Tooltip, Form, Switch, Tag } from "antd";
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import useAdminCrud from "../hooks/useAdminCrud";
import CrudDrawer from "../components/CrudDrawer";
import orchestrator from "../../../api/orchestrator";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Search } = Input;

const PAGE_SIZE = 10;

const userApi = {
  get: orchestrator.admin.users,
  create: async (data) => {
    const { is_superuser, is_staff, is_client_admin, is_active, ...signupData } = data;
    const created = await orchestrator.admin.signupUser(signupData);
    // signup no acepta roles; los aplicamos con PATCH inmediatamente después.
    await orchestrator.admin.updateUser(created.username, {
      is_superuser,
      is_staff,
      is_client_admin,
      is_active,
    });
    return created;
  },
  update: orchestrator.admin.updateUser,
  delete: orchestrator.admin.deleteUser,
};

const UsersPage = () => {
  const token = useIkoluToken();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });

  const { items, count, loading, saving, refresh, createItem, updateItem, deleteItem } =
    useAdminCrud(userApi, { autoLoad: true, initialParams: { page_size: PAGE_SIZE } });

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
        const { email, username, password, password_confirmation, ...updateData } = values;
        await updateItem(editing.username, updateData);
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
        title: `¿Eliminar usuario "${record.username}"?`,
        content: "Esta acción no se puede deshacer.",
        okText: "Eliminar",
        okType: "danger",
        cancelText: "Cancelar",
        onOk: async () => {
          await deleteItem(record.username);
          setPagination({ current: 1, pageSize: PAGE_SIZE });
          fetchPage(1);
        },
      });
    },
    [deleteItem, fetchPage]
  );

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (v) => <Text strong>{v}</Text>,
    },
    { title: "Usuario", dataIndex: "username", key: "username" },
    {
      title: "Nombre",
      key: "name",
      render: (_, r) => `${r.first_name || ""} ${r.last_name || ""}`.trim() || "—",
    },
    {
      title: "Roles",
      key: "roles",
      render: (_, r) => (
        <Space size={4} wrap>
          {r.is_superuser && <Tag color="gold">Superuser</Tag>}
          {r.is_staff && <Tag color="blue">Staff</Tag>}
          {r.is_client_admin && <Tag color="purple">Client Admin</Tag>}
          {r.is_active ? <Tag color="green">Activo</Tag> : <Tag color="default">Inactivo</Tag>}
        </Space>
      ),
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
          <UserOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Usuarios
          </Title>
        </Flex>
        <Flex gap={12}>
          <Search
            placeholder="Buscar usuario..."
            allowClear
            defaultValue={searchText}
            onSearch={handleSearch}
            style={{ width: 240 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchPage(pagination.current)} loading={loading}>
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ background: token.colorPrimary }}
          >
            Nuevo Usuario
          </Button>
        </Flex>
      </Flex>

      <SmartCard>
        <Table
          rowKey="username"
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
        title={editing ? "Editar Usuario" : "Nuevo Usuario"}
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        saving={saving}
        initialValues={
          editing || {
            is_active: true,
            is_staff: false,
            is_superuser: false,
            is_client_admin: false,
          }
        }
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Requerido" },
            { type: "email", message: "Email inválido" },
          ]}
        >
          <Input disabled={!!editing} />
        </Form.Item>
        <Form.Item
          name="username"
          label="Nombre de usuario"
          rules={[{ required: true, message: "Requerido" }]}
        >
          <Input disabled={!!editing} />
        </Form.Item>
        <Form.Item name="first_name" label="Nombre">
          <Input />
        </Form.Item>
        <Form.Item name="last_name" label="Apellido">
          <Input />
        </Form.Item>

        {!editing && (
          <>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: "Requerido" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="password_confirmation"
              label="Confirmar contraseña"
              rules={[
                { required: true, message: "Requerido" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Las contraseñas no coinciden"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </>
        )}

        <Form.Item name="is_superuser" valuePropName="checked" label="Superusuario">
          <Switch />
        </Form.Item>
        <Form.Item name="is_staff" valuePropName="checked" label="Staff">
          <Switch />
        </Form.Item>
        <Form.Item name="is_client_admin" valuePropName="checked" label="Client Admin">
          <Switch />
        </Form.Item>
        <Form.Item name="is_active" valuePropName="checked" label="Activo">
          <Switch />
        </Form.Item>
      </CrudDrawer>
    </div>
  );
};

export default UsersPage;
