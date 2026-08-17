import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Flex, Typography, Spin, Empty, Descriptions, Table, Button, message } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined, ProjectOutlined } from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { SmartCard } from "../../../shared/ui";
import orchestrator from "../../../api/orchestrator";

const { Title, Text } = Typography;

const useClientDetail = (clientId) => {
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const clientsRes = await orchestrator.admin.clientsWithProjects();
      const clients = Array.isArray(clientsRes) ? clientsRes : clientsRes?.results || [];
      const found = clients.find((c) => String(c.id) === String(clientId));
      const foundProjects = found?.projects || [];
      setClient(found || null);
      setProjects(foundProjects);

      const pointsRes = await orchestrator.admin.pointsAll();
      const allPoints = Array.isArray(pointsRes) ? pointsRes : pointsRes?.results || [];
      setPoints(allPoints.filter((p) =>
        String(p.client) === String(clientId) ||
        foundProjects.some((proj) => String(proj.id) === String(p.project))
      ));
    } catch (err) {
      message.error(err.message || "Error al cargar cliente");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  return { client, projects, points, loading, refresh: load };
};

const ClientDetailPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const token = useIkoluToken();
  const { client, projects, points, loading } = useClientDetail(clientId);

  const projectColumns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (v, record) => (
        <Link to={`/admin/projects/${record.id}`} style={{ textDecoration: "none" }}>
          <Text strong style={{ color: token.colorPrimary }}>{v || `Proyecto ${record.id}`}</Text>
        </Link>
      ),
    },
    {
      title: "Código",
      dataIndex: "code",
      key: "code",
      render: (v) => v || "—",
    },
  ];

  const pointColumns = [
    {
      title: "Nombre",
      dataIndex: "title",
      key: "title",
      render: (v, record) => (
        <Link to={`/admin/points/${record.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <Text strong style={{ color: token.colorPrimary }}>{v || `Punto ${record.id}`}</Text>
        </Link>
      ),
    },
    {
      title: "Proyecto",
      dataIndex: "project_name",
      key: "project_name",
      render: (v) => v || "—",
    },
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh", background: token.voidBg }}>
        <Spin size="large" tip="Cargando cliente..." />
      </Flex>
    );
  }

  if (!client) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh", background: token.voidBg }}>
        <Empty description="Cliente no encontrado" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Flex>
    );
  }

  return (
    <div style={{ padding: token.paddingLG, minHeight: "100vh", background: token.voidBg }}>
      <Flex vertical gap={24}>
        <Flex align="center" gap={16} wrap="wrap">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ background: token.voidSurface, borderColor: token.voidBorder, color: token.voidTextHeading }}
          />
          <div>
            <Title level={2} style={{ margin: 0, color: token.voidTextHeading }}>
              {client.name || client.legal_name || `Cliente ${client.id}`}
            </Title>
            <Text style={{ color: token.voidTextMuted }}>Detalle del cliente</Text>
          </div>
        </Flex>

        <SmartCard variant="void" title="Información general">
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="ID">{client.id}</Descriptions.Item>
            <Descriptions.Item label="Nombre">{client.name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Razón social">{client.legal_name || "—"}</Descriptions.Item>
            <Descriptions.Item label="RUT">{client.rut || "—"}</Descriptions.Item>
            <Descriptions.Item label="Email">{client.email || "—"}</Descriptions.Item>
            <Descriptions.Item label="Proyectos">{projects.length}</Descriptions.Item>
          </Descriptions>
        </SmartCard>

        <SmartCard variant="void" title={<><ProjectOutlined /> Proyectos</>}>
          <Table
            dataSource={projects.map((p) => ({ ...p, key: p.id }))}
            columns={projectColumns}
            size="small"
            pagination={false}
            locale={{ emptyText: <Empty description="Sin proyectos" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          />
        </SmartCard>

        <SmartCard variant="void" title={<><EnvironmentOutlined /> Puntos de captación</>}>
          <Table
            dataSource={points.map((p) => ({ ...p, key: p.id }))}
            columns={pointColumns}
            size="small"
            pagination={false}
            locale={{ emptyText: <Empty description="Sin puntos" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          />
        </SmartCard>
      </Flex>
    </div>
  );
};

export default ClientDetailPage;
