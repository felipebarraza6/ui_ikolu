import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Flex,
  Typography,
  Select,
  Input,
  Table,
  Tag,
  Button,
  Space,
  Empty,
} from "antd";
import {
  PaperClipOutlined,
  ReloadOutlined,
  SearchOutlined,
  CommentOutlined,
  ToolOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { useResponsive } from "../../../hooks/useResponsive";
import { resolveMediaUrl } from "../../../shared/utils/resolveMediaUrl";
import { useTickets } from "../hooks/useTickets";
import { useTicketCatalogs } from "../hooks/useTicketCatalogs";

const { Text, Title } = Typography;

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD MMM YYYY HH:mm") : value;
};

const fileIcon = (name = "") => {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (["png", "jpg", "jpeg"].includes(ext)) return { color: "#2A9D8F", label: "IMG" };
  if (["xlsx", "xls", "csv"].includes(ext)) return { color: "#2E86AB", label: "XLS" };
  if (["doc", "docx", "txt", "pdf"].includes(ext)) return { color: "#E76F51", label: "DOC" };
  return { color: "#6C757D", label: "FILE" };
};

/**
 * Drive de archivos — vista global de todos los adjuntos del sistema de tickets.
 * Cada archivo pertenece a un comentario (contexto comentario) o a una tarea (contexto tarea).
 */
const FilesDrivePage = () => {
  const token = useIkoluToken();
  const { isMobile } = useResponsive();

  const { getFiles } = useTickets({ autoLoad: false });
  const { clientsWithProjects, fetchClientsWithProjects } = useTicketCatalogs({ autoLoad: false });

  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [search, setSearch] = useState("");
  const [ticketId, setTicketId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [contexto, setContexto] = useState(null);

  useEffect(() => {
    fetchClientsWithProjects();
  }, [fetchClientsWithProjects]);

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const params = { page: p, page_size: pageSize };
        if (search?.trim()) params.search = search.trim();
        if (ticketId != null) params.ticket_id = ticketId;
        if (projectId != null) params.project_id = projectId;
        if (clientId != null) params.client_id = clientId;
        if (contexto) params.contexto = contexto;
        const res = await getFiles(params);
        const list = Array.isArray(res) ? res : res?.results || res?.files || [];
        setFiles(list);
        setCount(res?.count ?? list.length);
      } catch {
        setFiles([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    },
    [getFiles, pageSize, search, ticketId, projectId, clientId, contexto]
  );

  useEffect(() => {
    setPage(1);
  }, [search, ticketId, projectId, clientId, contexto]);

  useEffect(() => {
    load(page);
  }, [page, pageSize, load]);

  const clientOptions = useMemo(
    () =>
      (clientsWithProjects || []).map((c) => ({
        value: c.id,
        label: c.name || `Cliente ${c.id}`,
      })),
    [clientsWithProjects]
  );

  const projectOptions = useMemo(() => {
    const opts = [];
    for (const client of clientsWithProjects || []) {
      if (clientId != null && String(client.id) !== String(clientId)) continue;
      for (const project of client.projects || []) {
        opts.push({
          value: project.id,
          label: `${project.name || `Proyecto ${project.id}`} (${client.name || `Cliente ${client.id}`})`,
        });
      }
    }
    return opts;
  }, [clientsWithProjects, clientId]);

  const handleReset = useCallback(() => {
    setSearch("");
    setTicketId(null);
    setProjectId(null);
    setClientId(null);
    setContexto(null);
    setPage(1);
  }, []);

  const columns = [
    {
      title: "Archivo",
      dataIndex: "original_name",
      key: "original_name",
      width: 260,
      render: (name, record) => {
        const icon = fileIcon(name);
        return (
          <Flex align="center" gap={8}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 4,
                background: `${icon.color}1a`,
                color: icon.color,
                border: `1px solid ${icon.color}40`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {icon.label}
            </span>
            <a
              href={resolveMediaUrl(record.file_url)}
              target="_blank"
              rel="noreferrer"
              download={name}
              style={{ fontWeight: 500, color: token.voidTextHeading, overflow: "hidden", textOverflow: "ellipsis" }}
              title={name}
            >
              {name || `Archivo ${record.id}`}
            </a>
          </Flex>
        );
      },
    },
    {
      title: "Ticket",
      dataIndex: "ticket_title",
      key: "ticket",
      width: 220,
      ellipsis: true,
      render: (title, record) =>
        record.ticket_id ? (
          <Flex align="center" gap={6}>
            <Tag style={{ margin: 0 }}>#{record.ticket_id}</Tag>
            <Text style={{ color: token.voidText }} ellipsis>
              {title || `Ticket #${record.ticket_id}`}
            </Text>
          </Flex>
        ) : (
          "-"
        ),
    },
    {
      title: "Contexto",
      key: "contexto",
      width: 200,
      render: (_, record) => {
        if (record.comment_id) {
          return (
            <Flex align="center" gap={6} vertical style={{ alignItems: "flex-start" }}>
              <Flex align="center" gap={6}>
                <CommentOutlined style={{ color: token.voidTextMuted, fontSize: 11 }} />
                <Text style={{ fontSize: 12, color: token.voidTextMuted }}>Comentario</Text>
              </Flex>
              {record.comment_snippet && (
                <Text style={{ fontSize: 11, color: token.voidTextMuted }} ellipsis>
                  "{record.comment_snippet}"
                </Text>
              )}
            </Flex>
          );
        }
        if (record.task_id) {
          return (
            <Flex align="center" gap={6} vertical style={{ alignItems: "flex-start" }}>
              <Flex align="center" gap={6}>
                <ToolOutlined style={{ color: token.voidTextMuted, fontSize: 11 }} />
                <Text style={{ fontSize: 12, color: token.voidTextMuted }}>Tarea</Text>
              </Flex>
              {record.task_title && (
                <Text style={{ fontSize: 11, color: token.voidTextMuted }} ellipsis>
                  {record.task_title}
                </Text>
              )}
            </Flex>
          );
        }
        return (
          <Flex align="center" gap={6}>
            <PaperClipOutlined style={{ color: token.voidTextMuted, fontSize: 11 }} />
            <Text style={{ fontSize: 12, color: token.voidTextMuted }}>Ticket</Text>
          </Flex>
        );
      },
    },
    {
      title: "Proyecto / Cliente",
      key: "project",
      width: 180,
      ellipsis: true,
      render: (_, record) => (
        <Flex vertical>
          {record.project_name && (
            <Text style={{ color: token.voidText, fontSize: 12 }}>{record.project_name}</Text>
          )}
          {record.client_name && (
            <Text style={{ color: token.voidTextMuted, fontSize: 11 }}>{record.client_name}</Text>
          )}
          {!record.project_name && !record.client_name && "-"}
        </Flex>
      ),
    },
    {
      title: "Subido por",
      dataIndex: "uploaded_by_name",
      key: "uploaded_by",
      width: 140,
      ellipsis: true,
      render: (name, record) => name || (record.uploaded_by ? `Usuario ${record.uploaded_by}` : "-"),
    },
    {
      title: "Fecha",
      dataIndex: "created",
      key: "created",
      width: 150,
      render: (value) => (
        <Text style={{ color: token.voidTextMuted, fontSize: 12 }}>{formatDateTime(value)}</Text>
      ),
    },
  ];

  const filterStyles = {
    background: token.glassBg,
    borderRadius: token.voidRadius,
    border: `1px solid ${token.glassBorder}`,
    padding: 16,
    marginBottom: 16,
    backdropFilter: "blur(10px)",
  };

  const tableCardStyle = {
    background: token.glassBg,
    borderRadius: token.voidRadius,
    border: `1px solid ${token.glassBorder}`,
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  };

  return (
    <div style={{ padding: 24 }}>
      <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: token.voidTextHeading }}>
            Archivos
          </Title>
          <Text style={{ color: token.voidTextMuted, fontSize: 13 }}>
            Drive global de adjuntos de tickets, comentarios y tareas
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => load(page)} loading={loading}>
            Actualizar
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleReset}>
            Limpiar filtros
          </Button>
        </Space>
      </Flex>

      <Flex wrap gap={12} align="center" style={filterStyles}>
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: token.voidTextMuted }} />}
          placeholder="Buscar por nombre de archivo"
          style={{ minWidth: 220, width: isMobile ? "100%" : 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          allowClear
          placeholder="Ticket #"
          style={{ minWidth: 140, width: isMobile ? "100%" : 150 }}
          value={ticketId ?? ""}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setTicketId(v === "" ? null : Number(v));
          }}
        />
        <Select
          placeholder="Cliente"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ minWidth: 170, width: isMobile ? "100%" : 190 }}
          value={clientId ?? undefined}
          onChange={(v) => {
            setClientId(v ?? null);
            setProjectId(null);
          }}
          options={clientOptions}
        />
        <Select
          placeholder="Proyecto"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ minWidth: 170, width: isMobile ? "100%" : 220 }}
          value={projectId ?? undefined}
          onChange={(v) => setProjectId(v ?? null)}
          options={projectOptions}
          disabled={clientId != null && projectOptions.length === 0}
        />
        <Select
          placeholder="Contexto"
          allowClear
          style={{ minWidth: 150, width: isMobile ? "100%" : 170 }}
          value={contexto ?? undefined}
          onChange={(v) => setContexto(v ?? null)}
          options={[
            { value: "comentario", label: "Comentario" },
            { value: "tarea", label: "Tarea" },
          ]}
        />
      </Flex>

      <div style={tableCardStyle}>
        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={files}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total: count,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          locale={{
            emptyText: (
              <Empty description="No hay archivos para los filtros seleccionados" />
            ),
          }}
          scroll={{ x: 900 }}
          style={{ background: "transparent" }}
        />
      </div>
    </div>
  );
};

export default FilesDrivePage;
