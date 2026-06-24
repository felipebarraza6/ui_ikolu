import React, { useState, useEffect } from "react";
import {
  Flex,
  Typography,
  Button,
  Table,
  Input,
  Tabs,
  Tag,
  Spin,
} from "antd";
import { ReloadOutlined, CloudOutlined } from "@ant-design/icons";
import { SmartCard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import orchestrator from "../../../api/orchestrator";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const PAGE_SIZE = 10;

const ProvidersPage = () => {
  const token = useIkoluToken();
  const [activeTab, setActiveTab] = useState("telemetry");
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE });

  const fetchData = async (tab, page = 1, search = "") => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search?.trim()) params.search = search.trim();
      const res =
        tab === "telemetry"
          ? await orchestrator.admin.telemetryProviders(params)
          : await orchestrator.admin.complianceProviders(params);
      const results = res?.results || res || [];
      setItems(results);
      setCount(res?.count ?? results.length);
    } catch (err) {
      console.error("[ProvidersPage] error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab, pagination.current, searchText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination({ current: 1, pageSize: PAGE_SIZE });
    setSearchText("");
    fetchData(key, 1, "");
  };

  const handleTableChange = (p) => {
    setPagination({ current: p.current, pageSize: p.pageSize });
    fetchData(activeTab, p.current, searchText);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ current: 1, pageSize: PAGE_SIZE });
    fetchData(activeTab, 1, value);
  };

  const telemetryColumns = [
    { title: "Nombre", dataIndex: "name", key: "name", render: (v) => <Text strong>{v}</Text> },
    { title: "Handler", dataIndex: "handler_name", key: "handler_name" },
    { title: "Protocolo", dataIndex: "protocol", key: "protocol" },
    { title: "Auth", dataIndex: "auth_type", key: "auth_type" },
    {
      title: "URL base",
      dataIndex: "base_url",
      key: "base_url",
      render: (v) => (
        <Text ellipsis style={{ maxWidth: 240 }} title={v}>
          {v || "—"}
        </Text>
      ),
    },
    {
      title: "Activo",
      dataIndex: "is_active",
      key: "is_active",
      render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag color="default">No</Tag>),
    },
  ];

  const complianceColumns = [
    { title: "Código", dataIndex: "code", key: "code", render: (v) => <Text strong>{v}</Text> },
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Protocolo", dataIndex: "protocol", key: "protocol" },
    { title: "Auth", dataIndex: "auth_type", key: "auth_type" },
    {
      title: "URL base",
      dataIndex: "base_url",
      key: "base_url",
      render: (v) => (
        <Text ellipsis style={{ maxWidth: 240 }} title={v}>
          {v || "—"}
        </Text>
      ),
    },
    {
      title: "Activo",
      dataIndex: "is_active",
      key: "is_active",
      render: (v) => (v ? <Tag color="green">Sí</Tag> : <Tag color="default">No</Tag>),
    },
  ];

  return (
    <div style={{ padding: token.paddingLG }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 24 }}>
        <Flex align="center" gap={12}>
          <CloudOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
            Proveedores
          </Title>
        </Flex>
        <Flex gap={12}>
          <Search
            placeholder="Buscar proveedor..."
            allowClear
            defaultValue={searchText}
            onSearch={handleSearch}
            style={{ width: 240 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchData(activeTab, pagination.current, searchText)}
            loading={loading}
          >
            Actualizar
          </Button>
        </Flex>
      </Flex>

      <SmartCard>
        <Spin spinning={loading}>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="Telemetría" key="telemetry">
              <Table
                rowKey="id"
                columns={telemetryColumns}
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
            </TabPane>
            <TabPane tab="Cumplimiento" key="compliance">
              <Table
                rowKey="id"
                columns={complianceColumns}
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
            </TabPane>
          </Tabs>
        </Spin>
      </SmartCard>
    </div>
  );
};

export default ProvidersPage;
