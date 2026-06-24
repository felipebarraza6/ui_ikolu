import React, { useState, useEffect } from "react";
import {
  Flex,
  Typography,
  Button,
  Table,
  Input,
  Space,
  Tag,
  Modal,
  Spin,
  message,
} from "antd";
import { ReloadOutlined, CheckCircleOutlined, FireOutlined } from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import orchestrator from "../../../api/orchestrator";

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const PAGE_SIZE = 10;

const AlertTriggersPage = () => {
  const token = useIkoluToken();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ackLoading, setAckLoading] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });
  const [rules, setRules] = useState([]);
  const [points, setPoints] = useState([]);

  const fetchData = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search?.trim()) params.search = search.trim();
      const res = await orchestrator.alerts.triggers.get(params);
      setItems(res?.results || res || []);
      setCount(res?.count || 0);
    } catch (err) {
      console.error("[AlertTriggersPage] error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, "");
    Promise.all([
      orchestrator.alerts.rules.get({ page_size: 500 }).catch(() => ({ results: [] })),
      orchestrator.admin.pointsAll().catch(() => ({ results: [] })),
    ]).then(([rulesRes, pointsRes]) => {
      setRules(rulesRes?.results || rulesRes || []);
      setPoints(pointsRes?.results || pointsRes || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ruleMap = Object.fromEntries(rules.map((r) => [r.id, r]));
  const pointMap = Object.fromEntries(points.map((p) => [p.id, p]));

  const handleTableChange = (p) => {
    setPagination({ current: p.current, pageSize: p.pageSize });
    fetchData(p.current, searchText);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ current: 1, pageSize: PAGE_SIZE });
    fetchData(1, value);
  };

  const handleAcknowledge = (record) => {
    confirm({
      title: "¿Marcar disparo como reconocido?",
      content: "El disparo quedará registrado como atendido.",
      onOk: async () => {
        setAckLoading(record.id);
        try {
          await orchestrator.alerts.triggers.acknowledge(record.id);
          message.success("Disparo reconocido");
          fetchData(pagination.current, searchText);
        } catch (err) {
          message.error("Error al reconocer el disparo");
        } finally {
          setAckLoading(null);
        }
      },
    });
  };

  const columns = [
    {
      title: "Regla",
      key: "rule",
      render: (_, r) => ruleMap[r.alert_rule]?.name || r.alert_rule_name || r.alert_rule || "—",
    },
    {
      title: "Punto",
      key: "point",
      render: (_, r) => pointMap[r.point_catchment]?.title || r.point_catchment_title || "—",
    },
    {
      title: "Valor",
      dataIndex: "value_at_trigger",
      key: "value_at_trigger",
      render: (v) => (v !== null && v !== undefined ? v : "—"),
    },
    {
      title: "Umbral roto",
      dataIndex: "threshold_breached",
      key: "threshold_breached",
      render: (v) => (v !== null && v !== undefined ? v : "—"),
    },
    {
      title: "Disparado",
      dataIndex: "triggered_at",
      key: "triggered_at",
      render: (v) => (v ? new Date(v).toLocaleString("es-CL") : "—"),
    },
    {
      title: "Notificación",
      dataIndex: "notification_sent",
      key: "notification_sent",
      render: (v) => (v ? <Tag color="green">Enviada</Tag> : <Tag color="default">Pendiente</Tag>),
    },
    {
      title: "Estado",
      dataIndex: "is_acknowledged",
      key: "is_acknowledged",
      render: (v) =>
        v ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Reconocido
          </Tag>
        ) : (
          <Tag color="warning" icon={<FireOutlined />}>
            Activo
          </Tag>
        ),
    },
    {
      title: "Acciones",
      key: "actions",
      align: "center",
      render: (_, record) =>
        !record.is_acknowledged && (
          <Button
            size="small"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={ackLoading === record.id}
            onClick={() => handleAcknowledge(record)}
          >
            Reconocer
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <FireOutlined style={{ fontSize: 24, color: token.colorError }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Disparos de Alerta
          </Title>
        </Flex>
        <Space>
          <Search
            placeholder="Buscar disparo..."
            allowClear
            defaultValue={searchText}
            onSearch={handleSearch}
            style={{ width: 240 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchData(pagination.current, searchText)}
            loading={loading}
          >
            Actualizar
          </Button>
        </Space>
      </Flex>

      <SmartCard>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={items}
            loading={loading}
            size="small"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: count,
              showSizeChanger: false,
              onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            }}
            scroll={{ x: "max-content" }}
          />
        </Spin>
      </SmartCard>
    </div>
  );
};

export default AlertTriggersPage;
