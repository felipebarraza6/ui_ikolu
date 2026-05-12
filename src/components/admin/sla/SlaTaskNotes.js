import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Checkbox,
  Tag,
  Flex,
  Typography,
  Empty,
  Select,
  Popconfirm,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  PushpinOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Text: SmallText } = Typography;
const { Option } = Select;

const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: '#10B981', bg: '#ECFDF5' },
  medium: { label: 'Media', color: '#F59E0B', bg: '#FFFBEB' },
  high: { label: 'Alta', color: '#EF4444', bg: '#FEF2F2' },
};

const STORAGE_KEY = (ticketId) => `sla_task_notes_${ticketId}`;

/**
 * SlaTaskNotes — Sistema de notas y tareas internas por ticket
 *
 * Features:
 * - Crear, editar, eliminar y marcar tareas
 * - Prioridades (baja/media/alta)
 * - Persistencia local (localStorage) preparada para backend
 * - Resumen visual de progreso
 */
const SlaTaskNotes = ({ ticketId, currentUser = 'Admin' }) => {
  const [notes, setNotes] = useState([]);
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  // Cargar notas del localStorage (fallback hasta que el backend entregue endpoint)
  useEffect(() => {
    if (!ticketId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(ticketId));
      if (raw) {
        const parsed = JSON.parse(raw);
        setNotes(Array.isArray(parsed) ? parsed : []);
      } else {
        setNotes([]);
      }
    } catch {
      setNotes([]);
    }
  }, [ticketId]);

  // Guardar en localStorage
  useEffect(() => {
    if (!ticketId) return;
    localStorage.setItem(STORAGE_KEY(ticketId), JSON.stringify(notes));
  }, [notes, ticketId]);

  const addNote = useCallback(() => {
    const text = newText.trim();
    if (!text) return;
    const note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      priority: newPriority,
      completed: false,
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
    };
    setNotes((prev) => [note, ...prev]);
    setNewText('');
    setNewPriority('medium');
  }, [newText, newPriority, currentUser]);

  const toggleComplete = useCallback((id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const startEdit = useCallback((note) => {
    setEditingId(note.id);
    setEditText(note.text);
    setEditPriority(note.priority);
  }, []);

  const saveEdit = useCallback(() => {
    const text = editText.trim();
    if (!text) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingId ? { ...n, text, priority: editPriority } : n
      )
    );
    setEditingId(null);
    setEditText('');
  }, [editingId, editText, editPriority]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  const completedCount = notes.filter((n) => n.completed).length;
  const pendingCount = notes.length - completedCount;
  const highPriorityPending = notes.filter((n) => n.priority === 'high' && !n.completed).length;

  const progressPercent = notes.length > 0 ? Math.round((completedCount / notes.length) * 100) : 0;

  return (
    <div>
      {/* Resumen */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 10,
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
        }}
        bodyStyle={{ padding: 12 }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <Flex gap={12} align="center">
            <Badge
              count={pendingCount}
              style={{ backgroundColor: '#3B82F6' }}
              showZero
            >
              <Text strong style={{ fontSize: 13 }}>Pendientes</Text>
            </Badge>
            <Badge
              count={completedCount}
              style={{ backgroundColor: '#10B981' }}
              showZero
            >
              <Text strong style={{ fontSize: 13 }}>Completadas</Text>
            </Badge>
            {highPriorityPending > 0 && (
              <Badge
                count={highPriorityPending}
                style={{ backgroundColor: '#EF4444' }}
              >
                <Text strong style={{ fontSize: 13, color: '#EF4444' }}>Alta prioridad</Text>
              </Badge>
            )}
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {progressPercent}% completado
          </Text>
        </Flex>
        {/* Progress bar */}
        <div style={{ marginTop: 8, height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressPercent === 100 ? '#10B981' : '#3B82F6',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </Card>

      {/* Agregar nota */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 10,
          border: '1px solid #E2E8F0',
        }}
        bodyStyle={{ padding: 12 }}
      >
        <Flex vertical gap={10}>
          <Input.TextArea
            rows={2}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Agregar una tarea o nota interna..."
            style={{ borderRadius: 8, fontSize: 13 }}
          />
          <Flex justify="space-between" align="center">
            <Select
              size="small"
              value={newPriority}
              onChange={setNewPriority}
              style={{ width: 120 }}
              dropdownMatchSelectWidth={false}
            >
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <Option key={key} value={key}>
                  <Flex align="center" gap={6}>
                    <FlagOutlined style={{ color: cfg.color, fontSize: 12 }} />
                    {cfg.label}
                  </Flex>
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={addNote}
              disabled={!newText.trim()}
              style={{ background: '#0F172A', borderRadius: 6 }}
            >
              Agregar
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Lista de notas */}
      {notes.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin tareas o notas registradas"
          style={{ marginTop: 16 }}
        />
      ) : (
        <List
          dataSource={notes}
          renderItem={(note) => {
            const pCfg = PRIORITY_CONFIG[note.priority] || PRIORITY_CONFIG.medium;
            const isEditing = editingId === note.id;

            return (
              <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <Card
                  size="small"
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: `1px solid ${note.completed ? '#E2E8F0' : pCfg.color}33`,
                    background: note.completed ? '#F8FAFC' : pCfg.bg,
                    opacity: note.completed ? 0.8 : 1,
                    transition: 'all 0.2s',
                  }}
                  bodyStyle={{ padding: 10 }}
                >
                  {isEditing ? (
                    <Flex vertical gap={8}>
                      <Input.TextArea
                        rows={2}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{ borderRadius: 6, fontSize: 13 }}
                      />
                      <Flex justify="space-between" align="center">
                        <Select
                          size="small"
                          value={editPriority}
                          onChange={setEditPriority}
                          style={{ width: 120 }}
                        >
                          {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                            <Option key={key} value={key}>
                              <Flex align="center" gap={6}>
                                <FlagOutlined style={{ color: cfg.color, fontSize: 12 }} />
                                {cfg.label}
                              </Flex>
                            </Option>
                          ))}
                        </Select>
                        <Flex gap={6}>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={cancelEdit}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={saveEdit}
                            style={{ background: '#0F172A' }}
                          >
                            Guardar
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>
                  ) : (
                    <Flex vertical gap={6}>
                      <Flex justify="space-between" align="start">
                        <Flex align="start" gap={8} style={{ flex: 1 }}>
                          <Checkbox
                            checked={note.completed}
                            onChange={() => toggleComplete(note.id)}
                            style={{ marginTop: 2 }}
                          />
                          <div style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 13,
                                textDecoration: note.completed ? 'line-through' : 'none',
                                color: note.completed ? '#94A3B8' : '#0F172A',
                                display: 'block',
                                lineHeight: 1.4,
                              }}
                            >
                              {note.text}
                            </Text>
                            <Flex gap={6} align="center" style={{ marginTop: 4 }}>
                              <Tag
                                size="small"
                                style={{
                                  fontSize: 10,
                                  margin: 0,
                                  color: pCfg.color,
                                  background: `${pCfg.color}15`,
                                  borderColor: `${pCfg.color}30`,
                                }}
                              >
                                <FlagOutlined style={{ marginRight: 2, fontSize: 10 }} />
                                {pCfg.label}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: 10 }}>
                                {dayjs(note.createdAt).format('DD/MM HH:mm')}
                              </Text>
                              {note.createdBy && (
                                <Text type="secondary" style={{ fontSize: 10 }}>
                                  · {note.createdBy}
                                </Text>
                              )}
                            </Flex>
                          </div>
                        </Flex>
                        <Flex gap={4} style={{ flexShrink: 0 }}>
                          <Tooltip title="Editar">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined style={{ fontSize: 12 }} />}
                              onClick={() => startEdit(note)}
                              style={{ color: '#64748B' }}
                            />
                          </Tooltip>
                          <Popconfirm
                            title="¿Eliminar nota?"
                            onConfirm={() => deleteNote(note.id)}
                            okText="Eliminar"
                            okType="danger"
                            cancelText="Cancelar"
                          >
                            <Tooltip title="Eliminar">
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                                style={{ color: '#EF4444' }}
                              />
                            </Tooltip>
                          </Popconfirm>
                        </Flex>
                      </Flex>
                    </Flex>
                  )}
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
};

export default React.memo(SlaTaskNotes);
