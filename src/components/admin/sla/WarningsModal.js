import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  List,
  Card,
  Typography,
  Tag,
  Flex,
  Button,
  Spin,
  Empty,
  Badge,
  Tooltip,
  message,
  Pagination,
  Popconfirm,
} from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import sh from '../../../api/sh/endpoints';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const PAGE_SIZE = 10;

const PRIORITY_CONFIG = {
  CAUDAL: { color: '#EF4444', bg: '#FEF2F2' },
  'CAUDAL PROMEDIO': { color: '#F97316', bg: '#FFF7ED' },
  NIVEL: { color: '#3B82F6', bg: '#EFF6FF' },
  TOTALIZADO: { color: '#8B5CF6', bg: '#F5F3FF' },
  TODOS: { color: '#64748B', bg: '#F1F5F9' },
};

/**
 * WarningsModal — Modal moderno para gestionar warnings
 */
const WarningsModal = ({ visible, onClose, onConvert }) => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState({});
  const [deleting, setDeleting] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchWarnings = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await sh.notifications.getAllByType('WARNING', targetPage);
      const alerts = (res?.results || [])
        .filter((t) => t.type_notification === 'WARNING')
        .map((t) => ({
          ...t,
          point_title: t.point_catchment_title || `Punto ${t.point_catchment}`,
        }));
      setWarnings(alerts);
      setTotal(res?.count || alerts.length);
      setPage(targetPage);
    } catch (err) {
      console.error('[Warnings] Error cargando warnings:', err);
      message.error('Error al cargar warnings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) fetchWarnings(1);
  }, [visible, fetchWarnings]);

  const handleConvert = async (alert) => {
    setConverting((prev) => ({ ...prev, [alert.id]: true }));
    try {
      const ok = await onConvert(alert.id);
      if (ok) {
        message.success(`Warning convertido a ticket #${alert.id}`);
        setWarnings((prev) => prev.filter((w) => w.id !== alert.id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        message.error('Error al convertir warning');
      }
    } catch {
      message.error('Error al convertir warning');
    } finally {
      setConverting((prev) => ({ ...prev, [alert.id]: false }));
    }
  };

  const handleDelete = async (alert) => {
    setDeleting((prev) => ({ ...prev, [alert.id]: true }));
    try {
      await sh.notifications.delete(alert.id);
      message.success(`Warning #${alert.id} eliminado`);
      setWarnings((prev) => prev.filter((w) => w.id !== alert.id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[Warnings] Error eliminando warning:', err);
      message.error('Error al eliminar warning');
    } finally {
      setDeleting((prev) => ({ ...prev, [alert.id]: false }));
    }
  };

  return (
    <Modal
      title={
        <Flex align="center" gap={10}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningOutlined style={{ color: '#F59E0B', fontSize: 18 }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0, color: '#0F172A' }}>Warnings Generados</Title>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>
              {total} warning{total !== 1 ? 's' : ''} en sistema
            </Text>
          </div>
          <Badge
            count={total}
            style={{
              backgroundColor: '#F59E0B',
              fontSize: 11,
              fontWeight: 600,
              marginLeft: 'auto',
            }}
          />
        </Flex>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={720}
      bodyStyle={{ maxHeight: '68vh', overflowY: 'auto', padding: '16px 20px' }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 14 }}>
        <Text type="secondary" style={{ fontSize: 12, color: '#64748B' }}>
          Selecciona un warning para convertirlo en ticket o eliminarlo
        </Text>
        <Button
          icon={<ReloadOutlined />}
          size="small"
          onClick={() => fetchWarnings(1)}
          loading={loading}
          style={{ borderRadius: 6 }}
        >
          Refrescar
        </Button>
      </Flex>

      {loading && warnings.length === 0 ? (
        <Flex justify="center" align="center" style={{ minHeight: 200 }}>
          <Spin tip="Cargando warnings..." />
        </Flex>
      ) : warnings.length === 0 && !loading ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No hay warnings generados"
          style={{ marginTop: 32 }}
        />
      ) : (
        <>
          <List
            dataSource={warnings}
            renderItem={(alert) => {
              const timeAgo = dayjs(alert.created).fromNow();
              const pCfg = PRIORITY_CONFIG[alert.type_variable] || PRIORITY_CONFIG.TODOS;

              return (
                <List.Item style={{ padding: '8px 0' }}>
                  <Card
                    size="small"
                    style={{
                      width: '100%',
                      borderRadius: 10,
                      borderLeft: `3px solid #F59E0B`,
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                    }}
                    bodyStyle={{ padding: 14 }}
                  >
                    <Flex vertical gap={10}>
                      {/* Header */}
                      <Flex justify="space-between" align="start">
                        <Flex align="center" gap={8} wrap="wrap">
                          <Text strong style={{ fontSize: 15, color: '#0F172A' }}>
                            #{alert.id}
                          </Text>
                          <Tag
                            size="small"
                            style={{
                              fontSize: 10,
                              margin: 0,
                              color: pCfg.color,
                              background: pCfg.bg,
                              borderColor: `${pCfg.color}30`,
                              borderRadius: 4,
                              fontWeight: 500,
                            }}
                          >
                            {alert.type_variable || 'Alerta'}
                          </Tag>
                          {alert.type_alert && (
                            <Tag
                              size="small"
                              style={{
                                fontSize: 10,
                                margin: 0,
                                borderRadius: 4,
                                color: '#64748B',
                                background: '#F1F5F9',
                                borderColor: '#E2E8F0',
                              }}
                            >
                              {alert.type_alert}
                            </Tag>
                          )}
                        </Flex>
                        <Flex gap={6} style={{ flexShrink: 0 }}>
                          <Popconfirm
                            title="¿Eliminar warning?"
                            description="Esta acción no se puede deshacer."
                            onConfirm={() => handleDelete(alert)}
                            okText="Eliminar"
                            okType="danger"
                            cancelText="Cancelar"
                          >
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              loading={deleting[alert.id]}
                              style={{ borderRadius: 6 }}
                            />
                          </Popconfirm>
                          <Button
                            type="primary"
                            size="small"
                            icon={<ArrowRightOutlined />}
                            loading={converting[alert.id]}
                            onClick={() => handleConvert(alert)}
                            style={{ background: '#0F172A', borderRadius: 6 }}
                          >
                            A ticket
                          </Button>
                        </Flex>
                      </Flex>

                      {/* Título */}
                      {alert.title && (
                        <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
                          {alert.title}
                        </Text>
                      )}

                      {/* Mensaje */}
                      {alert.message && (
                        <Card
                          size="small"
                          style={{
                            background: '#fff',
                            border: '1px solid #F1F5F9',
                            borderRadius: 8,
                          }}
                          bodyStyle={{ padding: '10px 12px' }}
                        >
                          <Flex align="start" gap={6}>
                            <FileTextOutlined style={{ color: '#94A3B8', marginTop: 3, fontSize: 12 }} />
                            <Text style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#334155' }}>
                              {alert.message}
                            </Text>
                          </Flex>
                        </Card>
                      )}

                      {/* Footer */}
                      <Flex justify="space-between" align="center">
                        <Flex gap={12} align="center" wrap="wrap">
                          <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>
                            <EnvironmentOutlined style={{ marginRight: 2 }} />
                            {alert.point_title || '—'}
                          </Text>
                          <Tooltip title={dayjs(alert.created).format('DD/MM/YYYY HH:mm')}>
                            <Text type="secondary" style={{ fontSize: 11, color: '#94A3B8' }}>
                              <ClockCircleOutlined style={{ marginRight: 2 }} />
                              {timeAgo}
                            </Text>
                          </Tooltip>
                        </Flex>
                        {alert.emails && alert.emails.length > 0 && (
                          <Tag
                            size="small"
                            style={{
                              fontSize: 10,
                              color: '#3B82F6',
                              background: '#EFF6FF',
                              borderColor: '#BFDBFE',
                              borderRadius: 4,
                            }}
                          >
                            <ExclamationCircleOutlined style={{ marginRight: 2 }} />
                            {alert.emails.length} correo(s)
                          </Tag>
                        )}
                      </Flex>
                    </Flex>
                  </Card>
                </List.Item>
              );
            }}
          />

          {total > PAGE_SIZE && (
            <Flex justify="center" style={{ marginTop: 16, marginBottom: 8 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={(p) => fetchWarnings(p)}
                showSizeChanger={false}
                size="small"
                showTotal={(t) => `${t} warnings en total`}
              />
            </Flex>
          )}
        </>
      )}
    </Modal>
  );
};

export default WarningsModal;
