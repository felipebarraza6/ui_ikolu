import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Flex, Typography, Spin, Empty, Descriptions, Table, Button, message } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { SmartCard } from "../../../shared/ui";
import orchestrator from "../../../api/orchestrator";

const { Title, Text } = Typography;

const useProjectDetail = (projectId) => {
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const clientsRes = await orchestrator.admin.clientsWithProjects();
      const clients = Array.isArray(clientsRes) ? clientsRes : clientsRes?.results || [];
      let foundProject = null;
      let foundClient = null;
      for (const c of clients) {
        const p = (c.projects || []).find((proj) => String(proj.id) === String(projectId));
        if (p) {
          foundProject = p;
          foundClient = c;
          break;
        }
      }
      setProject(foundProject);
      setClient(foundClient);

      const pointsRes = await orchestrator.admin.pointsAll();
      const allPoints = Array.isArray(pointsRes) ? pointsRes : pointsRes?.results || [];
      setPoints(allPoints.filter((p) => String(p.project) === String(projectId)));
    } catch (err) {
      message.error(err.message || "Error al cargar proyecto");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { project, client, points, loading, refresh: load };
};

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const token = useIkoluToken();
  const { project, client, points, loading } = useProjectDetail(projectId);

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
      title: "Código",
      dataIndex: "point_code",
      key: "point_code",
      render: (v) => v || "—",
    },
    {
      title: "Frecuencia",
      dataIndex: "frecuency",
      key: "frecuency",
      render: (v) => v ? `${v} min` : "—",
    },
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh", background: token.voidBg }}>
        <Spin size="large" tip="Cargando proyecto..." />
      </Flex>
    );
  }

  if (!project) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh", background: token.voidBg }}>
        <Empty description="Proyecto no encontrado" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
              {project.name || `Proyecto ${project.id}`}
            </Title>
            <Text style={{ color: token.voidTextMuted }}>Detalle del proyecto</Text>
          </div>
        </Flex>

        <SmartCard variant="void" title="Información general">
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="ID">{project.id}</Descriptions.Item>
            <Descriptions.Item label="Nombre">{project.name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Código">{project.code || "—"}</Descriptions.Item>
            <Descriptions.Item label="Cliente">
              {client ? (
                <Link to={`/admin/clients/${client.id}`} style={{ color: token.colorPrimary }}>
                  {client.name || client.legal_name || `Cliente ${client.id}`}
                </Link>
              ) : (
                "—"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Puntos">{points.length}</Descriptions.Item>
          </Descriptions>
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

export default ProjectDetailPage;
