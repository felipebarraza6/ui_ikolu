import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Flex,
  Typography,
  Tag,
  message,
  Steps,
  Card,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Empty,
  Radio,
} from 'antd';
import {
  PlusOutlined,
  FileAddOutlined,
  EnvironmentOutlined,
  TagOutlined,
  MailOutlined,
  MessageOutlined,
  FileTextOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  FlagOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  DesktopOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import sh from '../../../api/sh/endpoints';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PRIORITY_CONFIG = {
  low: { label: 'Baja', color: '#10B981', bg: '#ECFDF5', icon: <FlagOutlined /> },
  medium: { label: 'Media', color: '#F59E0B', bg: '#FFFBEB', icon: <FlagOutlined /> },
  high: { label: 'Alta', color: '#EF4444', bg: '#FEF2F2', icon: <ThunderboltOutlined /> },
  critical: { label: 'Crítica', color: '#7C2D12', bg: '#FFF7ED', icon: <ExclamationCircleOutlined /> },
};

const VARIABLES = ['NIVEL', 'CAUDAL', 'CAUDAL PROMEDIO', 'TOTALIZADO', 'TODOS'];
const ALERT_TYPES = ['SOPORTE', 'UMBRAL', 'DGA', 'SMA'];
const CATEGORIES = [
  { value: 'back', label: 'Software', icon: <DesktopOutlined />, color: '#3B82F6' },
  { value: 'hard', label: 'Hardware', icon: <ToolOutlined />, color: '#F59E0B' },
];
const SOURCES = [
  { value: 'internal', label: 'Ticket Interno', desc: 'Creado por staff de soporte' },
  { value: 'client', label: 'Ticket de Cliente', desc: 'Creado por cliente desde formulario' },
];

const MOCK_USERS = [
  { id: 1, username: 'soporte.ikolu', name: 'Soporte Ikolu', color: '#0F172A' },
  { id: 2, username: 'admin', name: 'Administrador', color: '#3B82F6' },
  { id: 3, username: 'tecnico1', name: 'Técnico Campo', color: '#8B5CF6' },
];

const TICKET_TEMPLATES = [
  { title: 'Caudal irregular detectado', message: 'El caudal muestra valores inconsistentes. Se requiere revisión del sensor.' },
  { title: 'Sensor desconectado', message: 'El sensor no ha enviado datos en las últimas horas. Verificar conectividad.' },
  { title: 'Error en envío DGA', message: 'El último envío a la DGA falló. Revisar configuración y conectividad.' },
  { title: 'Solicitud de reporte', message: 'Cliente solicita reporte de consumo del período indicado.' },
];

/**
 * TicketCreateDrawer — Formulario moderno de 2 pasos para crear tickets
 */
const TicketCreateDrawer = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingPoints, setFetchingPoints] = useState(false);
  const [points, setPoints] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setCurrentStep(0);
    form.resetFields();
    setEmails([]);
    setEmailInput('');
    setSelectedPoint(null);

    const loadPoints = async () => {
      setFetchingPoints(true);
      try {
        let allPoints = [];
        try {
          const res = await sh.admin.catchmentPoints();
          allPoints = res.results || res || [];
        } catch {
          try {
            const res = await sh.management.pointsStatus();
            allPoints = res.points || res.results || [];
          } catch {
            allPoints = [];
          }
        }
        setPoints(allPoints);
      } finally {
        setFetchingPoints(false);
      }
    };
    loadPoints();
  }, [visible, form]);

  const pointOptions = useMemo(() => {
    return points.map((p) => ({
      value: p.id,
      label: p.title || p.name || `Punto ${p.id}`,
      project: p.project_name || p.project || '—',
      client: p.client_name || p.client || '—',
      search: `${p.title || ''} ${p.project || ''} ${p.client || ''}`.toLowerCase(),
    }));
  }, [points]);

  const handlePointChange = (pointId) => {
    const point = points.find((p) => p.id === pointId);
    setSelectedPoint(point || null);
    form.setFieldsValue({ point_catchment: pointId });
  };

  const handleApplyTemplate = (tpl) => {
    form.setFieldsValue({ title: tpl.title, message: tpl.message });
    message.success('Template aplicado');
  };

  const handleAddEmail = () => {
    const val = emailInput.trim();
    if (!val) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      message.warning('Ingresa un correo válido');
      return;
    }
    if (emails.includes(val)) {
      message.warning('Este correo ya fue agregado');
      return;
    }
    setEmails([...emails, val]);
    setEmailInput('');
  };

  const handleRemoveEmail = (email) => setEmails(emails.filter((e) => e !== email));

  const handleNext = async () => {
    try {
      await form.validateFields(['title', 'message', 'point_catchment']);
      setCurrentStep(1);
    } catch {
      // validation error
    }
  };

  const handlePrev = () => setCurrentStep(0);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        title: values.title.trim(),
        message: values.message.trim(),
        point_catchment: values.point_catchment,
        type_notification: 'SUPPORT',
        type_variable: values.type_variable,
        type_alert: values.type_alert || 'SOPORTE',
        priority: values.priority || 'medium',
        assigned_to: values.assigned_to || null,
        is_periodic: false,
        is_active: true,
        is_read: false,
        is_response: false,
        is_finish: false,
        is_wait: false,
        status_dga: 'PENDING',
        status_sma: 'PENDING',
        emails: emails,
      };

      const res = await sh.notifications.create(payload);
      message.success(`Ticket #${res.id} creado exitosamente`);
      form.resetFields();
      setEmails([]);
      setCurrentStep(0);
      onSuccess && onSuccess(res);
      onClose();
    } catch (err) {
      if (err.errorFields) return;
      console.error('[TicketCreate] Error:', err);
      message.error('Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setEmails([]);
    setCurrentStep(0);
    setEmailInput('');
    setSelectedPoint(null);
    onClose();
  };

  const steps = [
    { title: 'Información', icon: <FileTextOutlined /> },
    { title: 'Configuración', icon: <TagOutlined /> },
  ];

  const renderStep0 = () => (
    <Flex vertical gap={16}>
      {/* Templates */}
      <div>
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, color: '#94A3B8' }}>
          Templates rápidos
        </Text>
        <Flex gap={8} wrap="wrap" style={{ marginTop: 8 }}>
          {TICKET_TEMPLATES.map((tpl, idx) => (
            <Button
              key={idx}
              size="small"
              type="dashed"
              onClick={() => handleApplyTemplate(tpl)}
              style={{ borderRadius: 6, fontSize: 12 }}
            >
              {tpl.title}
            </Button>
          ))}
        </Flex>
      </div>

      <Divider style={{ margin: '4px 0' }} />

      <Form.Item
        name="title"
        label={<Text strong style={{ fontSize: 13, color: '#0F172A' }}>Título del ticket</Text>}
        rules={[{ required: true, message: 'Ingresa un título' }]}
      >
        <Input placeholder="Ej: Caudal irregular detectado en Pozo A" style={{ borderRadius: 8, fontSize: 13 }} maxLength={120} showCount />
      </Form.Item>

      <Form.Item
        name="message"
        label={<Text strong style={{ fontSize: 13, color: '#0F172A' }}>Descripción</Text>}
        rules={[{ required: true, message: 'Ingresa una descripción' }]}
      >
        <TextArea rows={4} placeholder="Describe el problema o solicitud..." style={{ borderRadius: 8, fontSize: 13 }} maxLength={500} showCount />
      </Form.Item>

      <Form.Item
        name="point_catchment"
        label={<Text strong style={{ fontSize: 13, color: '#0F172A' }}>Punto de Captación</Text>}
        rules={[{ required: true, message: 'Selecciona un punto' }]}
      >
        <Select
          placeholder="Buscar punto..."
          loading={fetchingPoints}
          showSearch
          optionFilterProp="label"
          style={{ borderRadius: 8 }}
          onChange={handlePointChange}
          dropdownRender={(menu) => (
            <div>
              {menu}
              {points.length === 0 && !fetchingPoints && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin puntos disponibles" style={{ padding: 16 }} />
              )}
            </div>
          )}
        >
          {pointOptions.map((p) => (
            <Option key={p.value} value={p.value} label={p.label}>
              <Flex vertical gap={2}>
                <Text strong style={{ fontSize: 13 }}>{p.label}</Text>
                <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {p.client} · {p.project}
                </Text>
              </Flex>
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Previsualización del punto */}
      {selectedPoint && (
        <Card
          size="small"
          style={{ borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}
          bodyStyle={{ padding: 12 }}
        >
          <Flex align="center" gap={10}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#3B82F6',
            }}>
              <EnvironmentOutlined />
            </div>
            <div>
              <Text strong style={{ fontSize: 13, color: '#0F172A' }}>{selectedPoint.title || selectedPoint.name}</Text>
              <Text style={{ fontSize: 11, color: '#64748B', display: 'block' }}>
                {selectedPoint.client_name || selectedPoint.client || '—'} · {selectedPoint.project_name || selectedPoint.project || '—'}
              </Text>
            </div>
          </Flex>
        </Card>
      )}
    </Flex>
  );

  const renderStep1 = () => (
    <Flex vertical gap={16}>
      {/* Variable y Tipo */}
      <Flex gap={12}>
        <Form.Item
          name="type_variable"
          label={<Text strong style={{ fontSize: 13 }}>Variable</Text>}
          rules={[{ required: true }]}
          style={{ flex: 1 }}
          initialValue="TODOS"
        >
          <Select placeholder="Variable" style={{ borderRadius: 8 }}>
            {VARIABLES.map((v) => (
              <Option key={v} value={v}>{v}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="type_alert"
          label={<Text strong style={{ fontSize: 13 }}>Tipo Alerta</Text>}
          style={{ flex: 1 }}
          initialValue="SOPORTE"
        >
          <Select placeholder="Tipo" style={{ borderRadius: 8 }}>
            {ALERT_TYPES.map((t) => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
        </Form.Item>
      </Flex>

      {/* Prioridad */}
      <Form.Item
        name="priority"
        label={<Text strong style={{ fontSize: 13 }}>Prioridad</Text>}
        initialValue="medium"
      >
        <Radio.Group style={{ width: '100%' }}>
          <Flex gap={8}>
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
              <Radio.Button
                key={key}
                value={key}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  borderRadius: 8,
                  height: 'auto',
                  padding: '8px 4px',
                  borderColor: `${cfg.color}40`,
                }}
              >
                <Flex vertical align="center" gap={4}>
                  <span style={{ color: cfg.color }}>{cfg.icon}</span>
                  <Text strong style={{ fontSize: 12, color: cfg.color }}>{cfg.label}</Text>
                </Flex>
              </Radio.Button>
            ))}
          </Flex>
        </Radio.Group>
      </Form.Item>

      {/* Asignado a */}
      <Form.Item
        name="assigned_to"
        label={<Text strong style={{ fontSize: 13 }}>Asignar a</Text>}
      >
        <Select placeholder="Seleccionar usuario..." allowClear style={{ borderRadius: 8 }}>
          {MOCK_USERS.map((u) => (
            <Option key={u.id} value={u.id}>
              <Flex align="center" gap={8}>
                <Avatar size="small" style={{ background: u.color, fontSize: 11 }}>{u.name[0]}</Avatar>
                <Text style={{ fontSize: 13 }}>{u.name}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>@{u.username}</Text>
              </Flex>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Divider style={{ margin: '4px 0' }} />

      {/* Correos */}
      <div>
        <Text strong style={{ fontSize: 13, color: '#0F172A', display: 'block', marginBottom: 8 }}>
          <MailOutlined style={{ marginRight: 6 }} />
          Correos de notificación
        </Text>
        <Flex gap={8} style={{ marginBottom: 8 }}>
          <Input
            placeholder="correo@ejemplo.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onPressEnter={handleAddEmail}
            style={{ borderRadius: 8 }}
          />
          <Button icon={<PlusOutlined />} onClick={handleAddEmail} style={{ borderRadius: 8 }}>
            Agregar
          </Button>
        </Flex>
        <Flex gap={6} wrap="wrap">
          {emails.map((email) => (
            <Tag
              key={email}
              closable
              onClose={() => handleRemoveEmail(email)}
              style={{ fontSize: 12, color: '#3B82F6', background: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 6 }}
            >
              {email}
            </Tag>
          ))}
        </Flex>
        {emails.length === 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>Sin correos configurados. Puedes agregarlos más tarde.</Text>
        )}
      </div>

      <Card size="small" style={{ borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }} bodyStyle={{ padding: 12 }}>
        <Flex align="center" gap={8}>
          <InfoCircleOutlined style={{ color: '#3B82F6' }} />
          <Text style={{ fontSize: 12, color: '#64748B' }}>
            El ticket se creará con estado <Tag size="small" style={{ margin: 0, borderRadius: 4 }}>Nuevo</Tag> y SLA de 48 horas.
          </Text>
        </Flex>
      </Card>
    </Flex>
  );

  return (
    <Drawer
      title={
        <Flex align="center" gap={10}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileAddOutlined style={{ color: '#10B981', fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: '#0F172A' }}>Nuevo Ticket de Soporte</Title>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>Crea un ticket manualmente para seguimiento SLA</Text>
          </div>
        </Flex>
      }
      width={540}
      open={visible}
      onClose={handleClose}
      bodyStyle={{ padding: '20px 24px' }}
      footer={
        <Flex justify="space-between" align="center">
          {currentStep > 0 ? (
            <Button icon={<ArrowLeftOutlined />} onClick={handlePrev} style={{ borderRadius: 8 }}>
              Anterior
            </Button>
          ) : (
            <div />
          )}
          <Flex gap={10}>
            <Button onClick={handleClose} style={{ borderRadius: 8 }}>Cancelar</Button>
            {currentStep === 0 ? (
              <Button type="primary" icon={<ArrowRightOutlined />} onClick={handleNext} style={{ background: '#0F172A', borderRadius: 8 }}>
                Siguiente
              </Button>
            ) : (
              <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={loading} style={{ background: '#0F172A', borderRadius: 8 }}>
                Crear ticket
              </Button>
            )}
          </Flex>
        </Flex>
      }
    >
      <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />
      <Form form={form} layout="vertical" requiredMark="optional" autoComplete="off">
        {currentStep === 0 ? renderStep0() : renderStep1()}
      </Form>
    </Drawer>
  );
};

export default React.memo(TicketCreateDrawer);
