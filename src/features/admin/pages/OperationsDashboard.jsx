import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flex,
  Button,
  Select,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  TagsOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  UserOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useResponsive } from "../../../hooks/useResponsive";
import { useTickets } from "../hooks/useTickets";
import { useTicketCatalogs } from "../hooks/useTicketCatalogs";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useAdminStore } from "../stores/adminStore";
import OperationsProjectsView from "../components/OperationsProjects/OperationsProjectsView";
import TicketDetailDrawer from "../components/TicketsKanban/TicketDetailDrawer";
import TicketCreateDrawer from "../components/TicketsKanban/TicketCreateDrawer";
import {
  PRIORITY_FILTER_OPTIONS,
  SOURCE_FILTER_OPTIONS,
  getTicketPriorityConfig,
} from "../constants/tickets";
import { TASK_VOCAB } from "../constants/entityVocab";

const { RangePicker } = DatePicker;

// Dashboard de Operaciones — vista de instalaciones nuevas como proyectos con fases.
const OperationsDashboard = () => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();
  const { isStaff, isSuperUser } = useAdminAuth();
  const { filters, setFilter, resetFilters } = useAdminStore();
  const vocab = TASK_VOCAB;

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const {
    tickets,
    loading: ticketsLoading,
    fetchTickets,
    changeStatus,
    assignTicket,
    updateTicket,
    deleteTicket,
    createTicket,
    getTicketById,
    getComments,
    getAttachments,
    createComment,
    deleteComment,
    updateComment,
    likeComment,
    getMentionableUsers,
    getTicketNotifications,
    markTicketNotificationsRead,
    uploadAttachment,
    uploadCommentAttachment,
    tasks,
    confirmScheduledDate,
    cancelScheduledDate,
  } = useTickets({ autoLoad: false });

  const {
    users,
    clientsWithProjects,
    points,
    categories,
    loading: catalogsLoading,
    fetchUsers,
    fetchClientsWithProjects,
    fetchPoints,
    fetchCategories,
  } = useTicketCatalogs({ autoLoad: false });

  const buildQueryParams = useCallback(() => {
    const params = { origin: "OPERACIONES" };
    if (filters.priority) params.priority = filters.priority;
    if (filters.assignedTo) params.assigned_to = filters.assignedTo;
    if (filters.source) params.source = filters.source;
    if (filters.category) params.category = filters.category;
    if (filters.project) params.project_id = filters.project;
    if (filters.point) params.point_id = filters.point;
    if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
      params.created_from = filters.dateRange[0].format("YYYY-MM-DD");
      params.created_to = filters.dateRange[1].format("YYYY-MM-DD");
    }
    return params;
  }, [filters]);

  const loading = ticketsLoading || catalogsLoading;

  useEffect(() => {
    Promise.all([
      fetchUsers(),
      fetchClientsWithProjects(),
      fetchPoints(),
      fetchCategories(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isStaff || isSuperUser) {
      fetchTickets(buildQueryParams());
    }
  }, [filters, buildQueryParams, isStaff, isSuperUser, fetchTickets]);

  const handleRefresh = useCallback(() => {
    if (isStaff || isSuperUser) {
      fetchTickets(buildQueryParams());
    }
    Promise.all([
      fetchUsers(),
      fetchClientsWithProjects(),
      fetchPoints(),
      fetchCategories(),
    ]);
  }, [fetchTickets, buildQueryParams, isStaff, isSuperUser, fetchUsers, fetchClientsWithProjects, fetchPoints, fetchCategories]);

  const handleTicketClick = useCallback((ticket) => {
    setSelectedTicketId(ticket.id);
    setDetailOpen(true);
  }, []);

  const handleCreate = useCallback(
    async (data) => {
      await createTicket(data, categories);
    },
    [createTicket, categories]
  );

  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id || u.username,
        label: u.full_name || u.username || u.email,
      })),
    [users]
  );

  const categoryOptions = useMemo(() => {
    if (categories.length === 0) return [];
    const parents = categories.filter((c) => c.parent == null);
    const children = categories.filter((c) => c.parent != null);
    const parentLabel = (p) => p.name || p.title || `Categoría ${p.id}`;

    const options = parents.map((parent) => ({
      value: parent.id,
      label: parentLabel(parent),
    }));

    const childOptions = children.map((child) => {
      const parent = parents.find((p) => p.id === child.parent);
      return {
        value: child.id,
        label: parent ? `${parentLabel(parent)} / ${child.name || child.title || `Subcategoría ${child.id}`}` : child.name || child.title || `Subcategoría ${child.id}`,
      };
    });

    return [...options, ...childOptions];
  }, [categories]);

  const projectOptions = useMemo(() => {
    const options = [];
    for (const client of clientsWithProjects) {
      for (const project of client.projects || []) {
        options.push({
          value: project.id,
          label: `${project.name || `Proyecto ${project.id}`} (${client.name || `Cliente ${client.id}`})`,
        });
      }
    }
    return options;
  }, [clientsWithProjects]);

  const selectedProject = filters.project;

  const pointOptions = useMemo(() => {
    if (!selectedProject) {
      return points.map((p) => ({
        value: p.id,
        label: p.name || p.title || `Punto ${p.id}`,
      }));
    }
    return points
      .filter((p) => p.project === selectedProject || p.project_id === selectedProject)
      .map((p) => ({
        value: p.id,
        label: p.name || p.title || `Punto ${p.id}`,
      }));
  }, [points, selectedProject]);

  const handleProjectChange = (value) => {
    setFilter("project", value || null);
    setFilter("point", null);
  };

  return (
    <div style={{ padding: "12px 24px 24px 24px" }}>
      <Flex
        gap={12}
        align="center"
        vertical={isMobile}
        wrap
        style={{ width: "100%", marginBottom: 24 }}
      >
          <RangePicker
            value={filters.dateRange || null}
            onChange={(dates) => setFilter("dateRange", dates)}
            style={{ minWidth: 220, width: isMobile ? "100%" : "auto", flexShrink: 0 }}
            suffixIcon={<CalendarOutlined style={{ color: token.voidTextMuted }} />}
          />
          <Select
            placeholder="Prioridad"
            allowClear
            prefix={
              filters.priority ? (
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: getTicketPriorityConfig(filters.priority).borderColor,
                    display: "inline-block",
                    border: `1px solid ${token.voidSurface}`,
                  }}
                />
              ) : (
                <ThunderboltOutlined style={{ color: token.voidTextMuted }} />
              )
            }
            style={{ minWidth: 130, width: isMobile ? "100%" : "auto", flexShrink: 0 }}
            value={filters.priority || undefined}
            onChange={(v) => setFilter("priority", v || null)}
            options={PRIORITY_FILTER_OPTIONS}
            optionRender={(option) => {
              const cfg = getTicketPriorityConfig(option.value);
              return (
                <Flex align="center" gap={8}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: cfg.borderColor,
                      display: "inline-block",
                      border: `1px solid ${token.voidSurface}`,
                    }}
                  />
                  {option.label}
                </Flex>
              );
            }}
            labelRender={(props) => props.label}
          />
          {isSuperUser && (
            <>
              <Select
                placeholder="Categoría"
                allowClear
                prefix={<TagsOutlined style={{ color: token.voidTextMuted }} />}
                style={{ minWidth: 140, width: isMobile ? "100%" : "auto", flexShrink: 0 }}
                value={filters.category || undefined}
                onChange={(v) => setFilter("category", v || null)}
                options={categoryOptions}
                showSearch
                optionFilterProp="label"
              />
            </>
          )}

          {isSuperUser && (
            <>
              <Select
                placeholder="Proyecto"
                allowClear
                showSearch
                optionFilterProp="label"
                prefix={<ProjectOutlined style={{ color: token.voidTextMuted }} />}
                style={{ minWidth: 150, width: isMobile ? "100%" : "auto", flexShrink: 0 }}
                value={filters.project || undefined}
                onChange={handleProjectChange}
                options={projectOptions}
              />
              <Select
                placeholder="Canal"
                allowClear
                prefix={<MessageOutlined style={{ color: token.voidTextMuted }} />}
                style={{ minWidth: 130, width: isMobile ? "100%" : "auto", flexShrink: 0 }}
                value={filters.source || undefined}
                onChange={(v) => setFilter("source", v || null)}
                options={SOURCE_FILTER_OPTIONS}
              />
              <Select
                placeholder={filters.project ? "Punto" : "Selecciona un proyecto"}
                allowClear
                showSearch
                optionFilterProp="label"
                prefix={<EnvironmentOutlined style={{ color: token.voidTextMuted }} />}
                style={{ minWidth: 140, width: isMobile ? "100%" : "auto", flexShrink: 0 }}
                value={filters.point || undefined}
                onChange={(v) => setFilter("point", v || null)}
                options={pointOptions}
                disabled={!filters.project}
              />
            </>
          )}
          {!isSuperUser && (
            <Select
              placeholder="Canal"
              allowClear
              prefix={<MessageOutlined style={{ color: token.voidTextMuted }} />}
              style={{ minWidth: 130, width: isMobile ? "100%" : "auto", flexShrink: 0 }}
              value={filters.source || undefined}
              onChange={(v) => setFilter("source", v || null)}
              options={SOURCE_FILTER_OPTIONS}
            />
          )}
          <Select
            placeholder="Asignado a"
            allowClear
            prefix={<UserOutlined style={{ color: token.voidTextMuted }} />}
            style={{ minWidth: 140, width: isMobile ? "100%" : "auto", flexShrink: 0 }}
            value={filters.assignedTo || undefined}
            onChange={(v) => setFilter("assignedTo", v || null)}
            options={userOptions}
            showSearch
            optionFilterProp="label"
          />

          <Flex
            gap={8}
            align="center"
            justify={isMobile ? "flex-end" : "flex-start"}
            style={{ marginLeft: "auto", flexShrink: 0 }}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              shape="circle"
              title="Actualizar"
            />
            {isStaff && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateOpen(true)}
                shape="circle"
                title="Nueva tarea"
                style={{
                  background: token.colorAccent,
                  borderColor: token.colorAccent,
                  color: "#fff",
                }}
              />
            )}
            <Button
              icon={<ClearOutlined />}
              onClick={handleResetFilters}
              shape="circle"
              title="Limpiar filtros"
            />
          </Flex>
        </Flex>

      <OperationsProjectsView
        projects={tickets}
        loading={loading}
        onOpenProject={handleTicketClick}
        vocab={vocab}
      />

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        users={users}
        categories={categories}
        onChangeStatus={changeStatus}
        onAssign={assignTicket}
        onUpdateTicket={updateTicket}
        onDelete={deleteTicket}
        onCreateComment={createComment}
        onDeleteComment={deleteComment}
        onUpdateComment={updateComment}
        onLikeComment={likeComment}
        getMentionableUsers={getMentionableUsers}
        getTicketNotifications={getTicketNotifications}
        markTicketNotificationsRead={markTicketNotificationsRead}
        onUploadAttachment={uploadAttachment}
        onUploadCommentAttachment={uploadCommentAttachment}
        onConfirmScheduledDate={confirmScheduledDate}
        onCancelScheduledDate={cancelScheduledDate}
        getTicketById={getTicketById}
        getComments={getComments}
        getAttachments={getAttachments}
        getTasks={tasks.get}
        onCreateTask={tasks.create}
        onUpdateTask={tasks.update}
        onDeleteTask={tasks.delete}
        onUploadTaskAttachment={tasks.uploadAttachment}
        vocab={vocab}
      />

      <TicketCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        clientsWithProjects={clientsWithProjects}
        loading={loading}
        categories={categories}
        vocab={vocab}
      />
    </div>
  );
};

export default OperationsDashboard;
