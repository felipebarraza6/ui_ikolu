import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Flex,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Spin,
  Divider,
  Empty,
  Tag,
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SafetyCertificateOutlined,
  BulbOutlined,
  DownOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const STORAGE_KEY = 'sla_chatbot_history';

const SUGGESTIONS = [
  { icon: <BarChartOutlined />, text: 'Resumen de métricas SLA', action: 'metrics_summary' },
  { icon: <FireOutlined />, text: 'Tickets urgentes o excedidos', action: 'urgent_tickets' },
  { icon: <FileTextOutlined />, text: 'Tickets sin asignar', action: 'unassigned' },
  { icon: <CheckCircleOutlined />, text: 'Tickets resueltos hoy', action: 'resolved_today' },
  { icon: <ClockCircleOutlined />, text: '¿Qué es el SLA?', action: 'explain_sla' },
  { icon: <ThunderboltOutlined />, text: 'Prioridades del día', action: 'daily_priorities' },
];

/**
 * SlaChatbot — Agente flotante para usuarios staff
 *
 * Features:
 * - Respuestas inteligentes basadas en datos reales del sistema
 * - Historial persistente en localStorage
 * - Sugerencias rápidas contextuales
 * - Simulación de "pensamiento" del agente
 * - Preparado para integrar IA (backend) en el futuro
 */
const SlaChatbot = ({ tickets, metrics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar historial
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Guardar historial
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  const addMessage = useCallback((role, content, meta = {}) => {
    setMessages((prev) => [...prev, {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      ...meta,
    }]);
  }, []);

  const generateResponse = useCallback((userText, actionType = null) => {
    const text = (actionType || userText).toLowerCase().trim();
    const now = dayjs();

    // --- ACCIONES PREDEFINIDAS ---

    if (actionType === 'metrics_summary' || text.includes('métrica') || text.includes('metric') || text.includes('resumen') || text.includes('dashboard')) {
      const m = metrics || {};
      return {
        type: 'rich',
        blocks: [
          { type: 'text', content: `📊 **Resumen del sistema**` },
          { type: 'stat', label: 'Total tickets', value: m.total || 0, color: '#3B82F6' },
          { type: 'stat', label: 'Activos', value: m.activos || 0, color: '#F59E0B' },
          { type: 'stat', label: 'Resueltos', value: m.resueltos || 0, color: '#10B981' },
          { type: 'stat', label: 'Tasa resolución', value: `${m.tasaResolucion || 0}%`, color: '#8B5CF6' },
          { type: 'stat', label: 'Por vencer SLA', value: m.porVencer || 0, color: '#EF4444' },
          { type: 'text', content: `Tiempo promedio de respuesta: **${m.tiempoPromedioRespuesta || 0}h**` },
        ],
      };
    }

    if (actionType === 'urgent_tickets' || text.includes('urgente') || text.includes('excedido') || text.includes('crítico') || text.includes('critico')) {
      if (!tickets || tickets.length === 0) {
        return { type: 'text', content: 'No hay tickets cargados actualmente.' };
      }
      const urgentes = tickets.filter(t => {
        const h = now.diff(dayjs(t.created), 'hour');
        return !t.is_read && h > 24;
      });
      const excedidos = urgentes.filter(t => now.diff(dayjs(t.created), 'hour') > 48);
      const soloUrgentes = urgentes.filter(t => {
        const h = now.diff(dayjs(t.created), 'hour');
        return h > 24 && h <= 48;
      });

      if (urgentes.length === 0) {
        return { type: 'text', content: '✅ No hay tickets urgentes ni excedidos. Todo está dentro del SLA.' };
      }

      return {
        type: 'rich',
        blocks: [
          { type: 'text', content: `🔥 **Tickets que requieren atención:**` },
          ...(excedidos.length > 0 ? [{ type: 'alert', level: 'danger', content: `${excedidos.length} ticket(s) excedieron SLA (>48h)` }] : []),
          ...(soloUrgentes.length > 0 ? [{ type: 'alert', level: 'warning', content: `${soloUrgentes.length} ticket(s) urgentes (>24h)` }] : []),
          ...urgentes.slice(0, 5).map(t => ({
            type: 'ticket_preview',
            id: t.id,
            title: t.title,
            status: t.is_finish ? 'resuelto' : !t.is_read ? 'nuevo' : t.is_wait ? 'revision' : 'desarrollo',
            hours: now.diff(dayjs(t.created), 'hour'),
          })),
          ...(urgentes.length > 5 ? [{ type: 'text', content: `...y ${urgentes.length - 5} más.` }] : []),
        ],
      };
    }

    if (actionType === 'unassigned' || text.includes('sin asignar') || text.includes('sin responsable') || text.includes('no asignado')) {
      if (!tickets) return { type: 'text', content: 'No hay datos de tickets.' };
      const sinAsignar = tickets.filter(t => !t.assigned_to && !t.is_finish);
      if (sinAsignar.length === 0) {
        return { type: 'text', content: '✅ Todos los tickets activos tienen un responsable asignado.' };
      }
      return {
        type: 'rich',
        blocks: [
          { type: 'text', content: `⚪ **Tickets sin asignar:** ${sinAsignar.length}` },
          ...sinAsignar.slice(0, 5).map(t => ({
            type: 'ticket_preview', id: t.id, title: t.title, status: 'nuevo', hours: now.diff(dayjs(t.created), 'hour'),
          })),
        ],
      };
    }

    if (actionType === 'resolved_today' || text.includes('resuelto hoy') || text.includes('cerrado hoy') || text.includes('terminado hoy')) {
      if (!tickets) return { type: 'text', content: 'No hay datos.' };
      const hoy = now.format('YYYY-MM-DD');
      const resueltosHoy = tickets.filter(t => t.is_finish && dayjs(t.modified || t.created).format('YYYY-MM-DD') === hoy);
      if (resueltosHoy.length === 0) {
        return { type: 'text', content: 'Aún no se han resuelto tickets hoy.' };
      }
      return {
        type: 'rich',
        blocks: [
          { type: 'text', content: `✅ **Tickets resueltos hoy:** ${resueltosHoy.length}` },
          ...resueltosHoy.map(t => ({
            type: 'ticket_preview', id: t.id, title: t.title, status: 'resuelto', hours: null,
          })),
        ],
      };
    }

    if (actionType === 'explain_sla' || text.includes('qué es sla') || text.includes('que es sla') || text.includes('sl')) {
      return {
        type: 'text',
        content: '**SLA (Service Level Agreement)** es el acuerdo de nivel de servicio. En este sistema, los tickets deben ser respondidos dentro de **48 horas**. Si un ticket está más de 48h sin respuesta, se marca como **excedido** (rojo). Entre 24h y 48h está **urgente** (amarillo).',
      };
    }

    if (actionType === 'daily_priorities' || text.includes('prioridad') || text.includes('prioridades') || text.includes('qué hago') || text.includes('que hago')) {
      if (!tickets) return { type: 'text', content: 'No hay datos cargados.' };
      const excedidos = tickets.filter(t => {
        const h = now.diff(dayjs(t.created), 'hour');
        return !t.is_read && h > 48;
      });
      const criticos = tickets.filter(t => t.priority === 'critical' && !t.is_finish);
      const sinAsignar = tickets.filter(t => !t.assigned_to && !t.is_finish);

      const lines = ['📋 **Prioridades del día:**'];
      if (excedidos.length > 0) lines.push(`1. 🔴 Atender ${excedidos.length} ticket(s) con SLA excedido`);
      if (criticos.length > 0) lines.push(`2. 🟤 Revisar ${criticos.length} ticket(s) de prioridad crítica`);
      if (sinAsignar.length > 0) lines.push(`3. ⚪ Asignar ${sinAsignar.length} ticket(s) sin responsable`);
      if (lines.length === 1) lines.push('✅ No hay urgencias. Puedes revisar tickets en revisión o desarrollo.');

      return { type: 'text', content: lines.join('\n') };
    }

    if (text.includes('hola') || text.includes('hi') || text.includes('hello')) {
      return { type: 'text', content: '¡Hola! Soy tu asistente de SLA. Puedo ayudarte con métricas, tickets urgentes, asignaciones y más. ¿Qué necesitas?' };
    }

    if (text.includes('gracias') || text.includes('thank')) {
      return { type: 'text', content: '¡De nada! Estoy aquí cuando me necesites. 🚀' };
    }

    if (text.includes('total') || text.includes('cuántos') || text.includes('cuantos')) {
      return { type: 'text', content: `Actualmente hay **${metrics?.total || 0} tickets** en el sistema. **${metrics?.activos || 0}** activos y **${metrics?.resueltos || 0}** resueltos.` };
    }

    if (text.includes('ticket') && (text.includes('busca') || text.includes('encuentra') || text.includes('buscar'))) {
      return { type: 'text', content: 'Puedes usar los filtros del Kanban o la barra de búsqueda para encontrar tickets por título, mensaje o punto de captación.' };
    }

    // Default
    return {
      type: 'text',
      content: 'No estoy seguro de entender. Prueba con:\n• "Resumen de métricas"\n• "Tickets urgentes"\n• "Sin asignar"\n• "Prioridades del día"\n• "¿Qué es el SLA?"',
    };
  }, [tickets, metrics]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    addMessage('user', text);
    setInput('');
    setLoading(true);

    // Simular "pensamiento" del agente
    setTimeout(() => {
      const response = generateResponse(text);
      addMessage('assistant', response.content || response, { blocks: response.blocks, type: response.type });
      setLoading(false);
      if (!isOpen) setHasUnread(true);
    }, 600 + Math.random() * 400);
  }, [input, addMessage, generateResponse, isOpen]);

  const handleSuggestion = useCallback((suggestion) => {
    addMessage('user', suggestion.text, { isSuggestion: true });
    setLoading(true);
    setTimeout(() => {
      const response = generateResponse(null, suggestion.action);
      addMessage('assistant', response.content || response, { blocks: response.blocks, type: response.type });
      setLoading(false);
      if (!isOpen) setHasUnread(true);
    }, 600);
  }, [addMessage, generateResponse, isOpen]);

  const renderMessageContent = (msg) => {
    if (msg.role === 'user') {
      return (
        <Text style={{ fontSize: 13, color: '#fff', whiteSpace: 'pre-wrap' }}>
          {msg.content}
        </Text>
      );
    }

    if (msg.meta?.type === 'rich' && msg.meta?.blocks) {
      return (
        <Flex vertical gap={8}>
          {msg.meta.blocks.map((block, idx) => {
            if (block.type === 'text') {
              return (
                <Text key={idx} style={{ fontSize: 13, color: '#0F172A', whiteSpace: 'pre-wrap' }}>
                  {block.content}
                </Text>
              );
            }
            if (block.type === 'stat') {
              return (
                <Flex key={idx} align="center" justify="space-between" style={{
                  padding: '6px 10px',
                  background: `${block.color}10`,
                  borderRadius: 8,
                  border: `1px solid ${block.color}20`,
                }}>
                  <Text style={{ fontSize: 12, color: '#64748B' }}>{block.label}</Text>
                  <Text strong style={{ fontSize: 14, color: block.color }}>{block.value}</Text>
                </Flex>
              );
            }
            if (block.type === 'alert') {
              const colorMap = {
                danger: { bg: '#FEF2F2', border: '#FECACA', text: '#EF4444' },
                warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
                info: { bg: '#F0F9FF', border: '#BFDBFE', text: '#3B82F6' },
              };
              const c = colorMap[block.level] || colorMap.info;
              return (
                <Flex key={idx} align="center" gap={6} style={{
                  padding: '6px 10px',
                  background: c.bg,
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                }}>
                  <FireOutlined style={{ color: c.text, fontSize: 12 }} />
                  <Text style={{ fontSize: 12, color: c.text, fontWeight: 500 }}>{block.content}</Text>
                </Flex>
              );
            }
            if (block.type === 'ticket_preview') {
              const statusColor = {
                nuevo: '#0EA5E9',
                revision: '#F59E0B',
                desarrollo: '#8B5CF6',
                resuelto: '#10B981',
              }[block.status] || '#64748B';
              return (
                <Card
                  key={idx}
                  size="small"
                  style={{
                    borderRadius: 8,
                    borderLeft: `3px solid ${statusColor}`,
                    background: '#FAFBFC',
                    cursor: 'pointer',
                  }}
                  bodyStyle={{ padding: '6px 10px' }}
                  hoverable
                >
                  <Flex justify="space-between" align="center">
                    <Text strong style={{ fontSize: 12, color: '#0F172A' }}>
                      #{block.id} — {block.title}
                    </Text>
                    {block.hours !== null && (
                      <Tag size="small" style={{
                        fontSize: 10, margin: 0,
                        color: block.hours > 48 ? '#EF4444' : block.hours > 24 ? '#D97706' : '#3B82F6',
                        background: block.hours > 48 ? '#FEF2F2' : block.hours > 24 ? '#FFFBEB' : '#F0F9FF',
                        borderColor: block.hours > 48 ? '#FECACA' : block.hours > 24 ? '#FDE68A' : '#BFDBFE',
                        borderRadius: 4,
                      }}>
                        {block.hours}h
                      </Tag>
                    )}
                  </Flex>
                </Card>
              );
            }
            return null;
          })}
        </Flex>
      );
    }

    return (
      <Text style={{ fontSize: 13, color: '#0F172A', whiteSpace: 'pre-wrap' }}>
        {msg.content}
      </Text>
    );
  };

  return (
    <>
      {/* Botón flotante */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}>
        <Tooltip title={isOpen ? 'Cerrar chat' : 'Asistente SLA'}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={isOpen ? <CloseOutlined /> : <RobotOutlined />}
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: 56,
              height: 56,
              background: isOpen ? '#EF4444' : '#0F172A',
              border: 'none',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              fontSize: 22,
            }}
          />
        </Tooltip>
        {hasUnread && !isOpen && (
          <Badge
            dot
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: '#EF4444',
              boxShadow: '0 0 0 2px #fff',
            }}
          />
        )}
      </div>

      {/* Ventana de chat */}
      {isOpen && (
        <Card
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 400,
            maxWidth: 'calc(100vw - 48px)',
            height: 560,
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            borderRadius: '16px 16px 0 0',
          }}>
            <Flex align="center" gap={10}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#60A5FA',
              }}>
                <SafetyCertificateOutlined />
              </div>
              <div>
                <Text strong style={{ color: '#fff', fontSize: 14, display: 'block' }}>
                  Agente SLA
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                  {metrics?.activos || 0} tickets activos · {metrics?.porVencer || 0} por vencer
                </Text>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Tag size="small" style={{
                  fontSize: 10, margin: 0,
                  color: '#10B981', background: 'rgba(16,185,129,0.15)',
                  borderColor: 'rgba(16,185,129,0.3)', borderRadius: 4,
                }}>
                  Online
                </Tag>
              </div>
            </Flex>
          </div>

          {/* Mensajes */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: '#F8FAFC',
          }}>
            {messages.length === 0 && (
              <Flex vertical align="center" style={{ marginTop: 40 }} gap={16}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: '#EFF6FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, color: '#3B82F6',
                }}>
                  <RobotOutlined />
                </div>
                <Text strong style={{ fontSize: 15, color: '#0F172A' }}>
                  ¿En qué puedo ayudarte?
                </Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', maxWidth: 260 }}>
                  Puedo darte métricas, tickets urgentes, prioridades del día y más.
                </Text>
              </Flex>
            )}

            {messages.map((msg) => (
              <Flex
                key={msg.id}
                justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                style={{ marginBottom: 12 }}
              >
                <Flex gap={8} align="start" style={{ maxWidth: '85%' }}>
                  {msg.role === 'assistant' && (
                    <Avatar size={28} style={{
                      background: '#0F172A',
                      flexShrink: 0,
                      fontSize: 13,
                    }}>
                      <RobotOutlined />
                    </Avatar>
                  )}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: msg.role === 'user' ? '#0F172A' : '#fff',
                    border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                    boxShadow: msg.role === 'user' ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                  }}>
                    {renderMessageContent(msg)}
                    <Text style={{
                      fontSize: 10,
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : '#94A3B8',
                      display: 'block',
                      marginTop: 4,
                    }}>
                      {dayjs(msg.timestamp).format('HH:mm')}
                    </Text>
                  </div>
                  {msg.role === 'user' && (
                    <Avatar size={28} style={{
                      background: '#3B82F6',
                      flexShrink: 0,
                      fontSize: 13,
                    }}>
                      <UserOutlined />
                    </Avatar>
                  )}
                </Flex>
              </Flex>
            ))}

            {loading && (
              <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
                <Avatar size={28} style={{ background: '#0F172A', fontSize: 13 }}>
                  <RobotOutlined />
                </Avatar>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '14px 14px 14px 2px',
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                }}>
                  <Flex align="center" gap={8}>
                    <Spin size="small" />
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>Pensando...</Text>
                  </Flex>
                </div>
              </Flex>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias */}
          {messages.length < 3 && (
            <div style={{ padding: '8px 16px', background: '#fff', borderTop: '1px solid #F1F5F9' }}>
              <Text style={{ fontSize: 11, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                <BulbOutlined style={{ marginRight: 4 }} />
                Sugerencias
              </Text>
              <Flex gap={6} wrap="wrap">
                {SUGGESTIONS.map((s, idx) => (
                  <Button
                    key={idx}
                    size="small"
                    type="dashed"
                    icon={s.icon}
                    onClick={() => handleSuggestion(s)}
                    style={{ fontSize: 11, borderRadius: 6, padding: '0 8px', height: 28 }}
                  >
                    {s.text}
                  </Button>
                ))}
              </Flex>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '10px 16px',
            background: '#fff',
            borderTop: '1px solid #E2E8F0',
            borderRadius: '0 0 16px 16px',
          }}>
            <Flex gap={8}>
              <TextArea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribe tu pregunta..."
                style={{
                  borderRadius: 10,
                  fontSize: 13,
                  resize: 'none',
                  minHeight: 36,
                  maxHeight: 80,
                }}
                autoSize={{ minRows: 1, maxRows: 3 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  background: '#0F172A',
                  borderRadius: 10,
                  height: 36,
                  width: 36,
                  padding: 0,
                  flexShrink: 0,
                }}
              />
            </Flex>
          </div>
        </Card>
      )}
    </>
  );
};

export default React.memo(SlaChatbot);
