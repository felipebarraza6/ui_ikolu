import React, { useMemo, useCallback, useState, useRef } from "react";
import { Row, Col, Spin, Select, Flex, Typography, Modal, Empty, Button } from "antd";
import { LoadingOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import KanbanColumn from "./KanbanColumn";
import { DEFAULT_VOCAB } from "../../constants/entityVocab";
import { useResponsive } from "../../../../hooks/useResponsive";
import { useIkoluToken } from "../../../../hooks/useIkoluToken";
import {
  getTicketColumn,
  KANBAN_COLUMNS,
  getColumnDropStatus,
  groupWorkOrderCategoryOptions,
} from "../../constants/tickets";

const { Text } = Typography;

/**
 * Tablero Kanban de tickets con 5 columnas y drag-and-drop nativo.
 *
 * En mobile muestra una sola columna seleccionable para evitar scroll horizontal.
 */
const KanbanBoard = ({ tickets, onTicketClick, onStatusChange, loading, workOrderCategories = [], vocab = DEFAULT_VOCAB }) => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const [activeColumn, setActiveColumn] = useState(KANBAN_COLUMNS[0]?.key);
  const [otDrop, setOtDrop] = useState(null);
  const [otDropCategory, setOtDropCategory] = useState(null);
  const boardRef = useRef(null);

  const scrollBoard = useCallback((direction) => {
    if (boardRef.current) {
      boardRef.current.scrollBy({ left: direction * 320, behavior: "smooth" });
    }
  }, []);

  const woCategoryOptions = useMemo(
    () => groupWorkOrderCategoryOptions(workOrderCategories || []),
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

  const renderOtModal = (
    <Modal
      title={`Pasar ${vocab.entitySingular} a En OT`}
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
          Para mover el {vocab.entitySingular} a la columna En OT debes seleccionar la categoría de orden de trabajo.
        </Text>
        {woCategoryOptions.length === 0 ? (
          <Empty description="No hay categorías de tipo WORK_ORDER. Créalas en Categorías." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Select
            placeholder="Categoría de la OT"
            style={{ width: "100%" }}
            value={otDropCategory}
            onChange={setOtDropCategory}
            options={woCategoryOptions}
            showSearch
            optionFilterProp="label"
            autoFocus
          />
        )}
      </Flex>
    </Modal>
  );

  if (isMobile) {
    const activeIndex = KANBAN_COLUMNS.findIndex((c) => c.key === activeColumn);
    const active = KANBAN_COLUMNS[activeIndex] || KANBAN_COLUMNS[0];
    const goLeft = () => setActiveColumn(KANBAN_COLUMNS[Math.max(0, activeIndex - 1)]?.key);
    const goRight = () => setActiveColumn(KANBAN_COLUMNS[Math.min(KANBAN_COLUMNS.length - 1, activeIndex + 1)]?.key);
    return (
      <Spin spinning={loading} tip={`Cargando ${vocab.entityPlural}...`}>
        <Flex vertical gap={12}>
          <Flex align="center" justify="space-between" gap={8}>
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={goLeft}
              disabled={activeIndex <= 0}
              style={{ color: activeIndex > 0 ? "#fff" : token.voidTextMuted }}
            />
            <Text strong style={{ color: token.voidTextHeading, fontSize: 14 }}>
              {active.label} ({columnsTickets[active.key]?.length || 0})
            </Text>
            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={goRight}
              disabled={activeIndex >= KANBAN_COLUMNS.length - 1}
              style={{ color: activeIndex < KANBAN_COLUMNS.length - 1 ? "#fff" : token.voidTextMuted }}
            />
          </Flex>
          <KanbanColumn
            column={active}
            tickets={columnsTickets[active.key] || []}
            onTicketClick={onTicketClick}
            onDropTicket={handleDropTicket}
            vocab={vocab}
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
            <Text style={{ color: "#fff" }}>{`Cargando ${vocab.entityPlural}...`}</Text>
          </Spin>
        </div>
      )}
      <div
        ref={boardRef}
        style={{
          height: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 8,
        }}
      >
        <Row
          gutter={[16, 16]}
          style={{
            height: "100%",
            flexWrap: "nowrap",
            minWidth: "max-content",
          }}
        >
          {KANBAN_COLUMNS.map((column) => (
          <Col
            key={column.key}
            flex="0 0 300px"
            style={{ width: 300, height: "100%" }}
          >
              <KanbanColumn
                column={column}
                tickets={columnsTickets[column.key] || []}
                onTicketClick={onTicketClick}
                onDropTicket={handleDropTicket}
                vocab={vocab}
              />
            </Col>
          ))}
        </Row>
      </div>

      <Button
        type="text"
        icon={<LeftOutlined />}
        onClick={() => scrollBoard(-1)}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          height: 48,
          width: 28,
          background: "rgba(3, 12, 24, 0.7)",
          borderRadius: "0 8px 8px 0",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
        }}
      />
      <Button
        type="text"
        icon={<RightOutlined />}
        onClick={() => scrollBoard(1)}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          height: 48,
          width: 28,
          background: "rgba(3, 12, 24, 0.7)",
          borderRadius: "8px 0 0 8px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
        }}
      />
      {renderOtModal}
    </div>
  );
};

export default KanbanBoard;
