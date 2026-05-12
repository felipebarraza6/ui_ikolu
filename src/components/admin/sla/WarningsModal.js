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

/**
 * WarningsModal — Modal que lista notificaciones WARNING con paginacion
 *
 * Caracteristicas:
 * - Paginacion completa
 * - Muestra titulo y mensaje/cuerpo de cada warning
 * - Boton para convertir WARNING a SUPPORT (ticket nuevo)
 * - Boton para eliminar warning
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
    if (visible) {
      fetchWarnings(1);
    }
  }, [visible, fetchWarnings]);

  const handlePageChange = (newPage) => {
    fetchWarnings(newPage);
  };

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

  const priorityColors = {
    CAUDAL: 'red',
    'CAUDAL PROMEDIO': 'orange',
    NIVEL: 'blue',
    TOTALIZADO: 'purple',
    TODOS: 'default',
  };

  return (
    <Modal
      title={
        <Flex align="center" gap={8}>
          <WarningOutlined style={{ color: '#FAAD14', fontSize: 18 }} />
          <Title level={5} style={{ margin: 0 }}>Warnings Generados</Title>
          <Badge
            count={total}
            style={{ backgroundColor: '#FAAD14' }}
          />
        </Flex>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      bodyStyle={{ maxHeight: '65vh', overflowY: 'auto', paddingTop: 8 }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Selecciona un warning para convertirlo en ticket nuevo o eliminarlo
        </Text>
        <Button
          icon={<ReloadOutlined />}
          size="small"
          onClick={() => fetchWarnings(1)}
          loading={loading}
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
              const priority = priorityColors[alert.type_variable] || 'default';

              return (
                <List.Item style={{ padding: '8px 0' }}>
                  <Card
                    size="small"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      borderLeft: `3px solid #FAAD14`,
                      background: '#fffbe6',
                    }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <Flex vertical gap={8}>
                      {/* Header: ID + Tag + Botones */}
                      <Flex justify="space-between" align="start">
                        <Flex align="center" gap={8} wrap="wrap">
                          <Text strong style={{ fontSize: 14 }}>
                            #{alert.id}
                          </Text>
                          <Tag size="small" color={priority} style={{ fontSize: 10, margin: 0 }}>
                            {alert.type_variable || 'Alerta'}
                          </Tag>
                          {alert.type_alert && (
                            <Tag size="small" style={{ fontSize: 10, margin: 0 }}>
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
                            />
                          </Popconfirm>
                          <Button
                            type="primary"
                            size="small"
                            icon={<ArrowRightOutlined />}
                            loading={converting[alert.id]}
                            onClick={() => handleConvert(alert)}
                            style={{ background: '#1F3461' }}
                          >
                            A nuevo
                          </Button>
                        </Flex>
                      </Flex>

                      {/* Titulo */}
                      {alert.title && (
                        <Text strong style={{ fontSize: 13 }}>
                          {alert.title}
                        </Text>
                      )}

                      {/* Mensaje / cuerpo */}
                      {alert.message && (
                        <Card
                          size="small"
                          style={{
                            background: '#fff',
                            border: '1px solid #f0f0f0',
                            borderRadius: 6,
                          }}
                          bodyStyle={{ padding: '8px 12px' }}
                        >
                          <Flex align="start" gap={6}>
                            <FileTextOutlined style={{ color: '#8c8c8c', marginTop: 3, fontSize: 12 }} />
                            <Text style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                              {alert.message}
                            </Text>
                          </Flex>
                        </Card>
                      )}

                      {/* Footer: Punto + Tiempo + Emails */}
                      <Flex justify="space-between" align="center">
                        <Flex gap={12} align="center" wrap="wrap">
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            <EnvironmentOutlined style={{ marginRight: 2 }} />
                            {alert.point_title || '—'}
                          </Text>
                          <Tooltip title={dayjs(alert.created).format('DD/MM/YYYY HH:mm')}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              <ClockCircleOutlined style={{ marginRight: 2 }} />
                              {timeAgo}
                            </Text>
                          </Tooltip>
                        </Flex>
                        {alert.emails && alert.emails.length > 0 && (
                          <Tag size="small" color="blue" style={{ fontSize: 10 }}>
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

          {/* Paginacion */}
          {total > PAGE_SIZE && (
            <Flex justify="center" style={{ marginTop: 16, marginBottom: 8 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
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
