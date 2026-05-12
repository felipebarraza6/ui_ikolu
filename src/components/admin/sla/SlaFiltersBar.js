import React from 'react';
import { Input, Select, DatePicker, Button, Flex, Tag, Typography, Badge, Tooltip } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined,
  ProjectOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckSquareOutlined,
  SafetyOutlined,
  DesktopOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Crítica', color: '#7C2D12' },
  { value: 'high', label: 'Alta', color: '#EF4444' },
  { value: 'medium', label: 'Media', color: '#F59E0B' },
  { value: 'low', label: 'Baja', color: '#10B981' },
];

const VARIABLE_OPTIONS = ['NIVEL', 'CAUDAL', 'CAUDAL PROMEDIO', 'TOTALIZADO', 'TODOS'];
const SLA_STATUS_OPTIONS = [
  { value: 'breached', label: 'Excedido', color: '#EF4444', icon: <ExclamationCircleOutlined /> },
  { value: 'urgent', label: 'Urgente', color: '#F59E0B', icon: <ThunderboltOutlined /> },
  { value: 'normal', label: 'Normal', color: '#3B82F6', icon: <SafetyOutlined /> },
];

const CATEGORY_OPTIONS = [
  { value: 'back', label: 'Software', icon: <DesktopOutlined />, color: '#3B82F6' },
  { value: 'hard', label: 'Hardware', icon: <ToolOutlined />, color: '#F59E0B' },
];

/**
 * SlaFiltersBar — Barra de filtros avanzada con chips y resumen
 */
const SlaFiltersBar = ({
  searchText, onSearchChange,
  filterProject, onProjectChange,
  filterClient, onClientChange,
  filterStatus, onStatusChange,
  filterVariable, onVariableChange,
  filterPriority, onPriorityChange,
  filterSlaStatus, onSlaStatusChange,
  filterAssignedTo, onAssignedToChange,
  filterCategory, onCategoryChange,
  dateRange, onDateRangeChange,
  projects, clients,
  assignees = [],
  loading, onRefresh,
  totalResults,
}) => {
  const activeFilters = [];
  if (searchText) activeFilters.push({ key: 'search', label: `Buscar: "${searchText}"`, onRemove: () => onSearchChange('') });
  if (filterProject) activeFilters.push({ key: 'project', label: `Proyecto: ${filterProject}`, onRemove: () => onProjectChange(null) });
  if (filterClient) activeFilters.push({ key: 'client', label: `Cliente: ${filterClient}`, onRemove: () => onClientChange(null) });
  if (filterStatus) activeFilters.push({ key: 'status', label: `Estado: ${filterStatus}`, onRemove: () => onStatusChange(null) });
  if (filterVariable) activeFilters.push({ key: 'variable', label: `Variable: ${filterVariable}`, onRemove: () => onVariableChange(null) });
  if (filterPriority) activeFilters.push({ key: 'priority', label: `Prioridad: ${filterPriority}`, onRemove: () => onPriorityChange(null) });
  if (filterSlaStatus) activeFilters.push({ key: 'sla', label: `SLA: ${filterSlaStatus}`, onRemove: () => onSlaStatusChange(null) });
  if (filterAssignedTo) activeFilters.push({ key: 'assigned', label: `Asignado: ${filterAssignedTo}`, onRemove: () => onAssignedToChange(null) });
  if (filterCategory) activeFilters.push({ key: 'category', label: filterCategory === 'back' ? 'Software' : 'Hardware', onRemove: () => onCategoryChange(null) });
  if (dateRange) activeFilters.push({ key: 'date', label: `Fecha`, onRemove: () => onDateRangeChange(null) });

  const clearAll = () => {
    onSearchChange('');
    onProjectChange(null);
    onClientChange(null);
    onStatusChange(null);
    onVariableChange(null);
    onPriorityChange(null);
    onSlaStatusChange(null);
    onAssignedToChange(null);
    onCategoryChange(null);
    onDateRangeChange(null);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: '14px 18px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <Flex vertical gap={12}>
        {/* Fila principal */}
        <Flex gap={10} wrap="wrap" align="center">
          <Input
            placeholder="Buscar tickets..."
            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 240, borderRadius: 8 }}
            allowClear
            size="middle"
          />

          <Select
            placeholder={<span style={{ color: '#94A3B8' }}><ProjectOutlined style={{ marginRight: 6 }} />Proyecto</span>}
            value={filterProject}
            onChange={onProjectChange}
            allowClear
            style={{ width: 150, borderRadius: 8 }}
            size="middle"
            suffixIcon={<FilterOutlined style={{ color: '#94A3B8' }} />}
          >
            {projects.map((p) => (
              <Option key={p} value={p}>{p}</Option>
            ))}
          </Select>

          <Select
            placeholder={<span style={{ color: '#94A3B8' }}><UserOutlined style={{ marginRight: 6 }} />Cliente</span>}
            value={filterClient}
            onChange={onClientChange}
            allowClear
            style={{ width: 150, borderRadius: 8 }}
            size="middle"
            suffixIcon={<FilterOutlined style={{ color: '#94A3B8' }} />}
          >
            {clients.map((c) => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>

          <Select
            placeholder={<span style={{ color: '#94A3B8' }}><FilterOutlined style={{ marginRight: 6 }} />Estado</span>}
            value={filterStatus}
            onChange={onStatusChange}
            allowClear
            style={{ width: 140, borderRadius: 8 }}
            size="middle"
          >
            <Option value="nuevo">Nuevo</Option>
            <Option value="revision">En Revisión</Option>
            <Option value="desarrollo">En Desarrollo</Option>
            <Option value="resuelto">Resuelto</Option>
          </Select>

          <Select
            placeholder={<span style={{ color: '#94A3B8' }}><FlagOutlined style={{ marginRight: 6 }} />Variable</span>}
            value={filterVariable}
            onChange={onVariableChange}
            allowClear
            style={{ width: 140, borderRadius: 8 }}
            size="middle"
          >
            {VARIABLE_OPTIONS.map((v) => (
              <Option key={v} value={v}>{v}</Option>
            ))}
          </Select>

          <Select
            placeholder={<span style={{ color: '#94A3B8' }}><ThunderboltOutlined style={{ marginRight: 6 }} />Prioridad</span>}
            value={filterPriority}
            onChange={onPriorityChange}
            allowClear
            style={{ width: 140, borderRadius: 8 }}
            size="middle"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <Option key={p.value} value={p.value}>
                <Flex align="center" gap={6}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  {p.label}
                </Flex>
              </Option>
            ))}
          </Select>

          <Select
            placeholder={<span style={{ color: '#94A3B8' }}><ExclamationCircleOutlined style={{ marginRight: 6 }} />SLA</span>}
            value={filterSlaStatus}
            onChange={onSlaStatusChange}
            allowClear
            style={{ width: 130, borderRadius: 8 }}
            size="middle"
          >
            {SLA_STATUS_OPTIONS.map((s) => (
              <Option key={s.value} value={s.value}>
                <Flex align="center" gap={6}>
                  <span style={{ color: s.color, fontSize: 12 }}>{s.icon}</span>
                  {s.label}
                </Flex>
              </Option>
            ))}
          </Select>

          <Select
            placeholder={<span style={{ color: '#94A3B8' }}><UserOutlined style={{ marginRight: 6 }} />Asignado</span>}
            value={filterAssignedTo}
            onChange={onAssignedToChange}
            allowClear
            style={{ width: 140, borderRadius: 8 }}
            size="middle"
          >
            {assignees.map((a) => (
              <Option key={a} value={a}>{a}</Option>
            ))}
          </Select>

          <Select
            placeholder={<span style={{ color: '#94A3B8' }}><DesktopOutlined style={{ marginRight: 6 }} />Tipo</span>}
            value={filterCategory}
            onChange={onCategoryChange}
            allowClear
            style={{ width: 140, borderRadius: 8 }}
            size="middle"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <Option key={c.value} value={c.value}>
                <Flex align="center" gap={6}>
                  <span style={{ color: c.color, fontSize: 12 }}>{c.icon}</span>
                  {c.label}
                </Flex>
              </Option>
            ))}
          </Select>

          <DatePicker.RangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            format="DD/MM/YYYY"
            placeholder={['Desde', 'Hasta']}
            style={{ width: 220, borderRadius: 8 }}
            allowClear
            size="middle"
            suffixIcon={<CalendarOutlined style={{ color: '#94A3B8' }} />}
          />

          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} size="middle" style={{ borderRadius: 8 }} />
        </Flex>

        {/* Chips de filtros activos */}
        {activeFilters.length > 0 && (
          <Flex gap={8} align="center" wrap="wrap">
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={clearAll}
              style={{ color: '#64748B', fontSize: 12 }}
            >
              Limpiar todo
            </Button>
            {activeFilters.map((f) => (
              <Tag
                key={f.key}
                closable
                onClose={f.onRemove}
                style={{
                  fontSize: 11,
                  background: '#F1F5F9',
                  color: '#475569',
                  borderColor: '#E2E8F0',
                  borderRadius: 6,
                  padding: '2px 8px',
                }}
              >
                {f.label}
              </Tag>
            ))}
          </Flex>
        )}

        {/* Fila de estado */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <div />
          <Text style={{ fontSize: 12, color: '#94A3B8' }}>
            {totalResults} ticket{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
          </Text>
        </Flex>
      </Flex>
    </div>
  );
};

export default React.memo(SlaFiltersBar);
