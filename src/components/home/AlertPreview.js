import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  Badge,
  Dropdown,
  Button,
  List,
  Tag,
  Empty,
  Flex,
  Spin,
} from "antd";
import {
  BellOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import { useNavigate } from "react-router-dom";
import sh from "../../api/sh/endpoints";
import dayjs from "dayjs";

const AlertPreview = () => {
  const { state } = useContext(AppContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!state.selected_profile?.id) {
      setAlerts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await sh.notifications.actives(
        state.selected_profile.id,
        1,
        "ALERT"
      );
      const results = res.results || [];
      // Combinar alertas con sus respuestas si vienen embebidas o cargarlas aparte
      // Por ahora mostramos las alertas directamente
      setAlerts(results.slice(0, 5));
    } catch (e) {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [state.selected_profile?.id]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Recargar cuando se abre el dropdown
  useEffect(() => {
    if (open) fetchAlerts();
  }, [open]);

  const getIcon = (type) => {
    const t = (type || "").toUpperCase();
    if (t === "CRITICAL" || t === "ERROR")
      return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
    if (t === "WARNING")
      return <WarningOutlined style={{ color: "#faad14" }} />;
    return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
  };

  const getColor = (type) => {
    const t = (type || "").toUpperCase();
    if (t === "CRITICAL" || t === "ERROR") return "red";
    if (t === "WARNING") return "orange";
    return "blue";
  };

  const dropdownContent = (
    <div
      style={{
        width: 360,
        maxHeight: 440,
        overflow: "auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1F3461" }}>
          Últimas alertas
        </span>
        <Button type="link" size="small" onClick={() => { setOpen(false); navigate("/alerts"); }}>
          Ver todas
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" style={{ padding: 32 }}>
          <Spin size="small" />
        </Flex>
      ) : alerts.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin alertas recientes"
          style={{ padding: "28px 0" }}
        />
      ) : (
        <List
          size="small"
          dataSource={alerts}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f6ffed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => {
                setOpen(false);
                navigate("/alerts");
              }}
            >
              <List.Item.Meta
                avatar={getIcon(item.type_notification || item.severity)}
                title={
                  <Flex gap="small" align="center" wrap="wrap">
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#262626" }}>
                      {item.title || item.description || "Alerta"}
                    </span>
                    <Tag color={getColor(item.type_notification || item.severity)} style={{ fontSize: 10, lineHeight: "16px", height: 18 }}>
                      {item.type_notification || "ALERT"}
                    </Tag>
                  </Flex>
                }
                description={
                  <Flex vertical gap={2}>
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {state.selected_profile?.title || "Punto"} ·{" "}
                      {item.created_at
                        ? dayjs(item.created_at).format("DD/MM HH:mm")
                        : ""}
                    </span>
                    {item.response_count > 0 && (
                      <Flex align="center" gap={4}>
                        <MessageOutlined style={{ fontSize: 10, color: "#52c41a" }} />
                        <span style={{ fontSize: 11, color: "#52c41a", fontWeight: 600 }}>
                          {item.response_count} respuesta{item.response_count > 1 ? "s" : ""}
                        </span>
                      </Flex>
                    )}
                  </Flex>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomRight"
      arrow={{ pointAtCenter: true }}
    >
      <Badge
        count={alerts.length}
        size="small"
        offset={[-2, 2]}
        style={{ background: "#FF6B35", fontWeight: 700 }}
      >
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20, color: "#1F3461" }} />}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default AlertPreview;
