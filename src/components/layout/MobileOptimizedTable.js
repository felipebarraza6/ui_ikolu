import React, { useState } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Drawer,
  Descriptions,
  Tag,
  Divider,
} from "antd";
import {
  EyeOutlined,
  MoreOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../../utils/numberFormatter";

const { Text, Title } = Typography;

const MobileOptimizedTable = ({
  dataSource,
  columns,
  title,
  loading = false,
  pagination = true,
  ...props
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showDetails = (record) => {
    setSelectedRecord(record);
    setDetailsVisible(true);
  };

  // Función para formatear valores según el tipo de columna
  const formatValue = (value, column) => {
    if (!value && value !== 0) return "N/A";

    const title = column.title?.toLowerCase() || "";
    const dataIndex = column.dataIndex?.toLowerCase() || "";

    // Identificar tipo de dato por nombre de columna
    if (title.includes("caudal") || dataIndex.includes("flow")) {
      return formatFlow(value);
    }
    if (
      title.includes("volumen") ||
      title.includes("total") ||
      title.includes("acumulado") ||
      dataIndex.includes("total")
    ) {
      return formatVolume(value);
    }
    if (
      title.includes("nivel") ||
      dataIndex.includes("level") ||
      dataIndex.includes("water_table")
    ) {
      return formatLevel(value);
    }
    if (title.includes("fecha") || dataIndex.includes("date")) {
      return new Date(value).toLocaleDateString("es-CL");
    }

    // Si tiene un render personalizado, usarlo
    if (column.render && typeof column.render === "function") {
      return column.render(value);
    }

    return value;
  };

  // Renderizado para móvil con cards
  const renderMobileCards = () => (
    <div style={{ padding: "0 16px" }}>
      {title && (
        <Title level={4} style={{ marginBottom: 16, textAlign: "center" }}>
          {title}
        </Title>
      )}

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {dataSource?.map((record, index) => (
          <Card
            key={record.key || index}
            size="small"
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
            }}
            bodyStyle={{ padding: 16 }}
            actions={[
              <Button
                key="view"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => showDetails(record)}
                style={{ color: "#1F3461" }}
              >
                Ver detalles
              </Button>,
            ]}
          >
            <Row gutter={[8, 8]}>
              {columns.slice(0, 3).map((column, colIndex) => (
                <Col span={24} key={colIndex}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong style={{ fontSize: 12, color: "#666" }}>
                        {column.title}:
                      </Text>
                    </Col>
                    <Col>
                      <Text style={{ fontSize: 14, fontWeight: 500 }}>
                        {formatValue(record[column.dataIndex], column)}
                      </Text>
                    </Col>
                  </Row>
                  {colIndex < 2 && <Divider style={{ margin: "8px 0" }} />}
                </Col>
              ))}
            </Row>
          </Card>
        ))}
      </Space>

      {/* Drawer con detalles completos */}
      <Drawer
        title="Detalles del Registro"
        placement="bottom"
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        height="70%"
        bodyStyle={{ padding: 0 }}
      >
        {selectedRecord && (
          <div style={{ padding: 16 }}>
            <Descriptions
              column={1}
              size="small"
              bordered
              items={columns.map((column) => ({
                key: column.dataIndex,
                label: column.title,
                children: (
                  <Text strong>
                    {formatValue(selectedRecord[column.dataIndex], column)}
                  </Text>
                ),
              }))}
            />
          </div>
        )}
      </Drawer>
    </div>
  );

  // Renderizado para desktop con tabla normal
  const renderDesktopTable = () => (
    <Table
      dataSource={dataSource}
      columns={columns}
      loading={loading}
      pagination={pagination}
      title={title ? () => <Title level={4}>{title}</Title> : undefined}
      scroll={{ x: true }}
      {...props}
    />
  );

  return isMobile ? renderMobileCards() : renderDesktopTable();
};

export default MobileOptimizedTable;
