import React, { useState, useCallback, useMemo } from "react";
import { Flex, Typography, Button, Table, Input, Modal, Space, Tooltip, Form } from "antd";
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import useAdminCrud from "../hooks/useAdminCrud";
import CrudDrawer from "../components/CrudDrawer";
import orchestrator from "../../../api/orchestrator";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Search } = Input;

const clientApi = {
  get: orchestrator.admin.clients,
  create: orchestrator.admin.createClient,
  update: orchestrator.admin.updateClient,
  delete: orchestrator.admin.deleteClient,
};

const PAGE_SIZE = 10;

const ClientsPage = () => {
  const token = useIkoluToken();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });

  const { items, count, loading, saving, refresh, createItem, updateItem, deleteItem } =
    useAdminCrud(clientApi, { autoLoad: true, initialParams: { page_size: PAGE_SIZE } });

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
      fetchPage(pagination.current);
    },
    [editing, createItem, updateItem, handleClose, fetchPage, pagination.current]
  );

  const handleDelete = useCallback(
    (record) => {
      confirm({
        title: `¿Eliminar cliente "${record.name}"?`,
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
    { title: "RUT", dataIndex: "rut", key: "rut" },
    { title: "Dirección", dataIndex: "address", key: "address", ellipsis: true },
    { title: "Teléfono", dataIndex: "phone", key: "phone" },
    { title: "Correo", dataIndex: "email", key: "email", ellipsis: true },
    {
      title: "Acciones",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
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
          <TeamOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Clientes
          </Title>
        </Flex>
        <Flex gap={12}>
          <Search
            placeholder="Buscar cliente..."
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
            Nuevo Cliente
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
        title={editing ? "Editar Cliente" : "Nuevo Cliente"}
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        saving={saving}
        initialValues={editing || {}}
      >
        <InputField name="name" label="Nombre" rules={[{ required: true, message: "Requerido" }]} />
        <InputField name="rut" label="RUT" />
        <InputField name="address" label="Dirección" />
        <InputField name="phone" label="Teléfono" />
        <InputField
          name="email"
          label="Correo"
          rules={[{ type: "email", message: "Correo inválido" }]}
        />
      </CrudDrawer>
    </div>
  );
};

const InputField = ({ name, label, rules }) => (
  <Form.Item name={name} label={label} rules={rules}>
    <Input />
  </Form.Item>
);

export default ClientsPage;
