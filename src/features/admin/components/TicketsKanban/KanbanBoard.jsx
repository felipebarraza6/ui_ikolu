import React, { useMemo, useCallback, useState } from "react";
import { Row, Col, Spin, Select, Flex, Typography, Modal, Empty } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import KanbanColumn from "./KanbanColumn";
import { useResponsive } from "../../../../hooks/useResponsive";
import {
  getTicketColumn,
  KANBAN_COLUMNS,
  getColumnDropStatus,
  filterWorkOrderCategories,
} from "../../constants/tickets";

const { Text } = Typography;

/**
 * Tablero Kanban de tickets con 5 columnas y drag-and-drop nativo.
 *
 * En mobile muestra una sola columna seleccionable para evitar scroll horizontal.
 */
const KanbanBoard = ({ tickets, onTicketClick, onStatusChange, loading, workOrderCategories = [] }) => {
  const { isMobile } = useResponsive();
  const [activeColumn, setActiveColumn] = useState(KANBAN_COLUMNS[0]?.key);
  const [otDrop, setOtDrop] = useState(null);
  const [otDropCategory, setOtDropCategory] = useState(null);

  const woCategories = useMemo(
    () => filterWorkOrderCategories(workOrderCategories || []),
    [workOrderCategories]
  );

  const columnsTickets = useMemo(() => {
    const map = Object.fromEntries(KANBAN_COLUMNS.map((column) => [column.key, []]));
    for (const ticket of tickets) {
      const col = getTicketColumn(ticket.status);
      if (map[col]) map[col].push(ticket);
    }
    return map;
  }, [tickets]);

  const handleDropTicket = useCallback(
    (ticketId, dropStatus) => {
      if (dropStatus === "EN_ORDEN_TRABAJO") {
        const ticket = tickets.find((t) => String(t.id) === String(ticketId));
        setOtDropCategory(ticket?.work_order_category ?? undefined);
        setOtDrop({ ticketId, status: dropStatus });
        return;
      }
      const ticket = tickets.find((t) => String(t.id) === String(ticketId));
      const column = KANBAN_COLUMNS.find((c) => c.dropStatus === dropStatus);
      const status = column
        ? getColumnDropStatus(column.key, ticket?.status)
        : dropStatus;
      onStatusChange?.(ticketId, status);
    },
    [tickets, onStatusChange]
  );

  const handleConfirmOtDrop = async () => {
    if (!otDrop) return;
    if (!otDropCategory) {
      return;
    }
    await onStatusChange?.(otDrop.ticketId, otDrop.status, otDropCategory);
    setOtDrop(null);
    setOtDropCategory(null);
  };

  const columnOptions = useMemo(
    () =>
      KANBAN_COLUMNS.map((column) => ({
        value: column.key,
        label: `${column.label} (${columnsTickets[column.key]?.length || 0})`,
      })),
    [columnsTickets]
  );

  const renderOtModal = (
    <Modal
      title="Pasar ticket a En OT"
      open={!!otDrop}
      onOk={handleConfirmOtDrop}
      onCancel={() => {
        setOtDrop(null);
        setOtDropCategory(null);
      }}
      okText="Aplicar"
      okButtonProps={{ disabled: !otDropCategory }}
      cancelText="Cancelar"
    >
      <Flex vertical gap={8}>
        <Text type="secondary">
          Para mover el ticket a la columna En OT debes seleccionar la categoría de orden de trabajo.
        </Text>
        {woCategories.length === 0 ? (
          <Empty description="No hay categorías de tipo WORK_ORDER. Créalas en Categorías." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Select
            placeholder="Categoría de la OT"
            style={{ width: "100%" }}
            value={otDropCategory}
            onChange={setOtDropCategory}
            options={woCategories.map((c) => ({
              value: c.id,
              label: c.name || `Categoría ${c.id}`,
            }))}
            showSearch
            optionFilterProp="label"
            autoFocus
          />
        )}
      </Flex>
    </Modal>
  );

  if (isMobile) {
    const active = KANBAN_COLUMNS.find((c) => c.key === activeColumn) || KANBAN_COLUMNS[0];
    return (
      <Spin spinning={loading} tip="Cargando tickets...">
        <Flex vertical gap={12}>
          <Select
            value={activeColumn}
            onChange={setActiveColumn}
            options={columnOptions}
            style={{ width: "100%" }}
          />
          <KanbanColumn
            column={active}
            tickets={columnsTickets[active.key] || []}
            onTicketClick={onTicketClick}
            onDropTicket={handleDropTicket}
          />
        </Flex>
        {renderOtModal}
      </Spin>
    );
  }

  return (
    <div style={{ height: "100%", position: "relative" }}>
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.25)", borderRadius: 8,
        }}>
          <Spin indicator={<LoadingOutlined spin />} size="large">
            <Text style={{ color: "#fff" }}>Cargando tickets...</Text>
          </Spin>
        </div>
      )}
      <Row
        gutter={[16, 16]}
        style={{
          height: "100%",
          flexWrap: "nowrap",
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {KANBAN_COLUMNS.map((column) => (
          <Col
            key={column.key}
            flex="1 1 0"
            style={{ minWidth: 260, height: "100%" }}
          >
            <KanbanColumn
              column={column}
              tickets={columnsTickets[column.key] || []}
              onTicketClick={onTicketClick}
              onDropTicket={handleDropTicket}
            />
          </Col>
        ))}
      </Row>
      {renderOtModal}
    </div>
  );
};

export default KanbanBoard;
