import React, { useState, useCallback, useMemo } from "react";
import {
  Flex,
  Typography,
  Card,
  Tabs,
  Tag,
  Space,
  Tooltip,
  Button,
  Empty,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CustomerServiceOutlined,
  BranchesOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useTicketCategories } from "../hooks/useTicketCategories";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { SmartButton, SmartBadge } from "../../../shared/ui";
import CrudDrawer from "../components/CrudDrawer";
import { useLocation } from "react-router-dom";
import { getEntityVocab } from "../constants/entityVocab";
import {
  CATEGORY_TYPE_OPTIONS,
  getTicketCategoryTypeConfig,
} from "../constants/tickets";

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * Agrupa categorías por category_type, manteniendo solo las raíces de cada tipo.
 */
const groupRootsByType = (categories = []) => {
  const groups = {};
  categories.forEach((category) => {
    const type = category.category_type;
    if (!groups[type]) groups[type] = [];
    const parentId = category.parent?.id ?? category.parent;
    if (parentId == null) {
      groups[type].push(category);
    }
  });
  return groups;
};

/**
 * Devuelve las subcategorías de un padre a partir de la lista plana.
 */
const getChildren = (parent, categories = []) => {
  const parentId = typeof parent === "object" ? parent?.id : parent;
  return categories
    .filter((c) => {
      const cParentId = c.parent?.id ?? c.parent;
      return cParentId === parentId;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Normaliza la lista de operadores de una categoría.
 * Prefiere operators_detail [{id, name}] y hace fallback a operators [id|obj].
 */
const getCategoryOperators = (category, userMap = {}) => {
  const detail = category.operators_detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((op) => ({
      id: op.id,
      name: op.name || userMap[op.id]?.full_name || userMap[op.id]?.username || `Usuario ${op.id}`,
    }));
  }
  const raw = category.operators || [];
  return raw.map((op) => {
    const id = typeof op === "object" ? op.id : op;
    const user = userMap[id];
    return {
      id,
      name:
        user?.full_name ||
        user?.username ||
        (typeof op === "object" ? op.name || op.full_name || op.username : null) ||
        `Usuario ${id}`,
    };
  });
};

/**
 * Tarjeta visual de una categoría (raíz o subcategoría).
 */
const CategoryNodeCard = ({
  category,
  depth,
  categories,
  userMap,
  isStaff,
  onEdit,
  onDelete,
}) => {
  const token = useIkoluToken();
  const typeConfig = getTicketCategoryTypeConfig(category.category_type);
  const operators = getCategoryOperators(category, userMap);
  const children = getChildren(category, categories);

  return (
    <div style={{ paddingLeft: depth * 28 }}>
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderLeft: `4px solid ${typeConfig.borderColor || token.voidTextHeading}`,
          background: token.voidSurface,
        }}
        bodyStyle={{ padding: 14 }}
      >
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
          <Flex vertical gap={8} style={{ flex: 1, minWidth: 220 }}>
            <Flex align="center" gap={10} wrap="wrap">
              {depth === 0 && <BranchesOutlined style={{ color: typeConfig.borderColor }} />}
              <Text strong style={{ fontSize: 15, color: token.voidTextHeading }}>
                {category.name}
              </Text>
              <SmartBadge variant={typeConfig.variant} size="sm">
                {typeConfig.label}
              </SmartBadge>
            </Flex>

            <Flex align="center" gap={8} wrap="wrap">
              <TeamOutlined style={{ color: token.voidTextMuted, fontSize: 12 }} />
              {operators.length === 0 ? (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Sin operadores
                </Text>
              ) : (
                <Space size={4} wrap>
                  {operators.slice(0, 4).map((op) => (
                    <Tag key={op.id} style={{ margin: 0 }}>
                      {op.name}
                    </Tag>
                  ))}
                  {operators.length > 4 && (
                    <Tooltip title={operators.slice(4).map((op) => op.name).join(", ")}>
                      <Tag style={{ margin: 0 }}>+{operators.length - 4}</Tag>
                    </Tooltip>
                  )}
                </Space>
              )}
            </Flex>
          </Flex>

          {isStaff && (
            <Flex gap={6}>
              <Tooltip title="Editar">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(category)}
                />
              </Tooltip>
              <Tooltip title="Eliminar">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(category)}
                />
              </Tooltip>
            </Flex>
          )}
        </Flex>
      </Card>

      {children.map((child) => (
        <CategoryNodeCard
          key={child.id}
          category={child}
          depth={depth + 1}
          categories={categories}
          userMap={userMap}
          isStaff={isStaff}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

/**
 * Página de categorías de tickets.
 *
 * Muestra un árbol visual agrupado por tipo de categoría. Usa operators_detail
 * cuando el backend lo entrega para mostrar nombres reales de operadores.
 */
const TicketCategoriesPage = () => {
  const token = useIkoluToken();
  const { isStaff } = useAdminAuth();
  const location = useLocation();
  const vocab = getEntityVocab(location.pathname);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [activeTypeTab, setActiveTypeTab] = useState("SOFTWARE");

  const {
    categories,
    users,
    loading,
    refresh,
    createCategory,
    updateCategory,
    deleteCategory,
    userOptions,
  } = useTicketCategories({ autoLoad: true });

  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const rootsByType = useMemo(() => groupRootsByType(categories), [categories]);

  const parentOptions = useMemo(() => {
    const editingId = editing?.id;
    return categories
      .filter((c) => {
        if (c.id === editingId) return false;
        const parentId = c.parent?.id ?? c.parent;
        if (parentId != null) return false;
        if (selectedType && c.category_type !== selectedType) return false;
        return true;
      })
      .map((c) => ({
        value: c.id,
        label: c.name,
      }));
  }, [categories, editing, selectedType]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleOpenCreate = useCallback(() => {
    setEditing(null);
    setSelectedType(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((record) => {
    setEditing(record);
    setSelectedType(record.category_type || null);
    setDrawerOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
    setEditing(null);
    setSelectedType(null);
  }, []);

  const handleSubmit = useCallback(
    async (values) => {
      setSaving(true);
      try {
        const payload = {
          name: values.name,
          category_type: values.category_type,
          parent: values.parent || null,
          operators: values.operators || [],
        };
        if (editing) {
          await updateCategory(editing.id, payload);
        } else {
          await createCategory(payload);
        }
        handleClose();
      } finally {
        setSaving(false);
      }
    },
    [editing, createCategory, updateCategory, handleClose]
  );

  const handleDelete = useCallback(
    (record) => {
      confirm({
        title: (
          <Text strong style={{ color: token.voidTextHeading }}>
            ¿Eliminar la categoría "{record.name}"?
          </Text>
        ),
        content: (
          <Text style={{ color: token.voidText }}>
            Las categorías asociadas a {vocab.entityPlural} no se verán afectadas, pero ya no podrá
            seleccionarse al crear {vocab.entityPlural}.
          </Text>
        ),
        okText: "Eliminar",
        okType: "danger",
        cancelText: "Cancelar",
        onOk: async () => {
          try {
            await deleteCategory(record.id);
          } catch (err) {
            // El hook ya muestra el mensaje de error.
          }
        },
      });
    },
    [deleteCategory, token.voidText, token.voidTextHeading, vocab]
  );

  const drawerInitialValues = useMemo(() => {
    if (!editing) {
      return { operators: [] };
    }
    return {
      name: editing.name,
      category_type: editing.category_type,
      parent: editing.parent?.id ?? editing.parent ?? undefined,
      operators: (editing.operators || []).map((op) => op.id ?? op),
    };
  }, [editing]);

  const tabItems = useMemo(() => {
    return CATEGORY_TYPE_OPTIONS.map((option) => {
      const roots = rootsByType[option.value] || [];
      const typeConfig = getTicketCategoryTypeConfig(option.value);
      return {
        key: option.value,
        label: (
          <Flex align="center" gap={8}>
            <span>{option.label}</span>
            <Tag color={typeConfig.borderColor || "default"}>{roots.length}</Tag>
          </Flex>
        ),
        children: (
          <div style={{ paddingTop: 12 }}>
            {roots.length === 0 ? (
              <Empty description={`No hay categorías de ${option.label}`} />
            ) : (
              roots
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((root) => (
                  <CategoryNodeCard
                    key={root.id}
                    category={root}
                    depth={0}
                    categories={categories}
                    userMap={userMap}
                    isStaff={isStaff}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                ))
            )}
          </div>
        ),
      };
    });
  }, [rootsByType, categories, userMap, isStaff, handleOpenEdit, handleDelete]);

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={16}
        style={{ marginBottom: 24 }}
      >
        <Flex align="center" gap={12}>
          <CustomerServiceOutlined style={{ fontSize: 24, color: token.voidTextHeading }} />
          <Title level={3} style={{ margin: 0, color: token.voidTextHeading }}>
            {`Categorías de ${vocab.entityPlural}`}
          </Title>
        </Flex>
        <Flex gap={12}>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Actualizar
          </Button>
          {isStaff && (
            <SmartButton variant="void" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Nueva Categoría
            </SmartButton>
          )}
        </Flex>
      </Flex>

      <Card
        style={{
          background: token.voidSurface,
          borderColor: token.voidBorder,
          minHeight: 420,
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Tabs
          activeKey={activeTypeTab}
          onChange={setActiveTypeTab}
          items={tabItems}
          type="card"
        />
      </Card>

      <CrudDrawer
        title={editing ? "Editar Categoría" : "Nueva Categoría"}
        open={drawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        saving={saving}
        initialValues={drawerInitialValues}
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: "Ingresa el nombre de la categoría" }]}
        >
          <Input placeholder="Ej: Falla de sensor" />
        </Form.Item>

        <Form.Item
          name="category_type"
          label="Tipo de categoría"
          rules={[{ required: true, message: "Selecciona el tipo" }]}
        >
          <Select
            placeholder="Selecciona un tipo"
            options={CATEGORY_TYPE_OPTIONS}
            onChange={(value) => setSelectedType(value || null)}
            allowClear
          />
        </Form.Item>

        <Form.Item name="parent" label="Categoría padre">
          <Select
            placeholder="Sin categoría padre"
            options={parentOptions}
            allowClear
            showSearch
            optionFilterProp="label"
            disabled={!selectedType}
            notFoundContent={
              selectedType
                ? "No hay categorías principales disponibles"
                : "Selecciona un tipo de categoría primero"
            }
          />
        </Form.Item>

        <Form.Item name="operators" label="Operadores">
          <Select
            mode="multiple"
            placeholder="Selecciona los operadores"
            options={userOptions}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </CrudDrawer>
    </div>
  );
};

export default TicketCategoriesPage;
