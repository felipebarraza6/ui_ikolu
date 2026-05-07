import React, { useContext, useState, useEffect } from "react";
import {
  Table,
  Flex,
  Tag,
  message,
  Button,
  Switch,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import AlertDetailDrawer from "./AlertDetailDrawer";

const TableAlerts = ({ data, update, setUpdate, onEdit }) => {
  const { state } = useContext(AppContext);
  const canManageAlerts = state.selected_profile?.profile_ikolu?.m6 || false;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await sh.notifications.getById(id);
      setDetailData(res);
    } catch (err) {
      message.error("Error al cargar detalle de la alerta");
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (record) => {
    setDetailVisible(true);
    loadDetail(record.id);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setDetailData(null);
  };

  const handleDelete = async (id) => {
    try {
      await sh.notifications.delete(id);
      message.success("Alerta eliminada correctamente");
      if (setUpdate) setUpdate(!update);
    } catch (error) {
      message.error("Error al eliminar la alerta");
    }
  };

  const handleToggleActive = async (record, isActive) => {
    try {
      await sh.notifications.update(record.id, {
        title: record.title,
        type_variable: record.type_variable,
        type_alert: record.type_alert,
        value: record.value,
        message: record.message,
        emails: record.emails || [],
        point_catchment: record.point_catchment,
        type_notification: record.type_notification,
        is_active: isActive,
      });
      message.success(isActive ? "Alerta activada" : "Alerta desactivada");
      if (setUpdate) setUpdate(!update);
    } catch (error) {
      message.error("Error al cambiar el estado de la alerta");
    }
  };

  const typeAlertLabel = { MAX: ">", MIN: "<", EQUALS: "=" };
  const typeAlertColor = { MAX: "#FF4D4F", MIN: "#1890FF", EQUALS: "#52C41A" };

  const typeVariableLabel = {
    NIVEL: "Nivel",
    CAUDAL: "Caudal",
    "CAUDAL PROMEDIO": "Caudal Med.",
    TOTALIZADO: "Totalizado",
  };

  const getUnit = (typeVariable) => {
    switch (typeVariable) {
      case "NIVEL":
        return "m";
      case "CAUDAL":
        return "lt/s";
      case "CAUDAL PROMEDIO":
        return "lt";
      case "TOTALIZADO":
        return (
          <span>
            m<sup style={{ fontSize: 9 }}>3</sup>
          </span>
        );
      default:
        return "";
    }
  };

  const calcDuration = (start, end) => {
    if (!start && !end)
      return { text: "∞", color: "default", tooltip: "Sin límite de tiempo" };
    const s = start ? dayjs(start) : null;
    const e = end ? dayjs(end) : null;
    const today = dayjs();

    if (e && e.isBefore(today, "day")) {
      return {
        text: "Expirada",
        color: "red",
        tooltip: "La vigencia ya terminó",
      };
    }
    if (s && e) {
      const total = e.diff(s, "day") + 1;
      const remaining = e.diff(today, "day") + 1;
      return {
        text: total + " días",
        color: "blue",
        tooltip: remaining > 0 ? remaining + " días restantes" : "Último día",
      };
    }
    if (e) {
      const remaining = e.diff(today, "day") + 1;
      return {
        text: "Hasta " + e.format("DD/MM"),
        color: "blue",
        tooltip: remaining + " días restantes",
      };
    }
    if (s) {
      return {
        text: "Desde " + s.format("DD/MM"),
        color: "default",
        tooltip: "Sin fecha de término",
      };
    }
    return { text: "∞", color: "default", tooltip: "Sin límite" };
  };

  const calcVigencia = (start, end) => {
    if (!start && !end) return null;
    const s = start ? dayjs(start).format("DD/MM") : null;
    const e = end ? dayjs(end).format("DD/MM") : null;
    if (s && e) return s + " → " + e;
    if (s) return "Desde " + s;
    if (e) return "Hasta " + e;
    return null;
  };

  const columns = [
    {
      title: "Alerta",
      key: "alerta",
      width: isMobile ? 150 : 260,
      render: (_, record) => {
        const condColor = typeAlertColor[record.type_alert] || "#666";
        return (
          <Flex vertical gap="4px">
            <span
              style={{
                fontWeight: 700,
                fontSize: isMobile ? "12px" : "13px",
                lineHeight: 1.3,
                color: "#1F3461",
              }}
            >
              {record.title}
            </span>
            <Flex gap="6px" align="center" wrap="wrap">
              <Tag
                style={{
                  margin: 0,
                  fontSize: 11,
                  padding: "0 8px",
                  fontWeight: 500,
                  borderRadius: 4,
                  background: "#f5f5f5",
                  borderColor: "#e8e8e8",
                  color: "#555",
                }}
              >
                {typeVariableLabel[record.type_variable] ||
                  record.type_variable}
              </Tag>
              <Tag
                style={{
                  margin: 0,
                  fontSize: 11,
                  padding: "0 8px",
                  fontWeight: 700,
                  borderRadius: 4,
                  background: condColor + "10",
                  borderColor: condColor + "30",
                  color: condColor,
                }}
              >
                {typeAlertLabel[record.type_alert] || record.type_alert}{" "}
                {record.value} {getUnit(record.type_variable)}
              </Tag>
            </Flex>
          </Flex>
        );
      },
    },
    {
      title: "Notificar",
      key: "notify",
      width: isMobile ? 140 : 200,
      ellipsis: true,
      render: (_, record) => {
        const emails = record.emails || [];
        const first = emails[0] || "—";
        return (
          <Flex vertical gap="4px" align="flex-start">
            <Tooltip title={emails.join(", ")}>
              <Flex align="center" gap="4px">
                <MailOutlined style={{ fontSize: 11, color: "#aaa" }} />
                <span
                  style={{
                    fontSize: isMobile ? "11px" : "12px",
                    color: "#555",
                  }}
                >
                  {first}
                </span>
              </Flex>
            </Tooltip>
            {emails.length > 1 && (
              <span style={{ fontSize: 10, color: "#aaa" }}>
                +{emails.length - 1} más
              </span>
            )}
          </Flex>
        );
      },
    },
    {
      title: "Estado",
      key: "status",
      width: isMobile ? 90 : 100,
      align: "center",
      render: (_, record) => (
        <Tooltip
          title={!canManageAlerts ? "Módulo de alertas no activado" : ""}
        >
          <Switch
            size="small"
            checked={!!record.is_active}
            checkedChildren="ON"
            unCheckedChildren="OFF"
            disabled={!canManageAlerts}
            onChange={(checked) => handleToggleActive(record, checked)}
          />
        </Tooltip>
      ),
    },
    {
      title: "Duración",
      key: "duracion",
      width: isMobile ? 90 : 110,
      align: "center",
      render: (_, record) => {
        const dur = calcDuration(record.start_date, record.end_date);
        return (
          <Tooltip title={dur.tooltip}>
            <Tag
              color={dur.color}
              style={{ fontSize: "11px", fontWeight: 600, margin: 0 }}
            >
              {dur.text}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Vigencia",
      key: "vigencia",
      width: isMobile ? 100 : 120,
      align: "center",
      render: (_, record) => {
        const v = calcVigencia(record.start_date, record.end_date);
        if (!v)
          return (
            <span style={{ fontSize: "11px", color: "#aaa" }}>—</span>
          );
        return (
          <span
            style={{
              fontSize: isMobile ? "10px" : "11px",
              color: "#666",
            }}
          >
            {v}
          </span>
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: isMobile ? 110 : 130,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Flex gap="6px" justify="center">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            style={{
              color: "#1F3461",
              borderRadius: 6,
              background: "#f2f5fa",
            }}
            onClick={() => openDetail(record)}
          >
            {!isMobile && "Ver"}
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{
              color: "#1F3461",
              borderRadius: 6,
              background: "#f2f5fa",
            }}
            disabled={!canManageAlerts}
            onClick={() => onEdit && onEdit(record)}
          />
          <Popconfirm
            title="¿Eliminar alerta?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => handleDelete(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            disabled={!canManageAlerts}
          >
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              style={{ borderRadius: 6 }}
              disabled={!canManageAlerts}
            />
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <Table
        size="small"
        bordered={false}
        scroll={{ x: "max-content" }}
        pagination={false}
        style={{ whiteSpace: "normal" }}
        columns={columns}
        dataSource={data}
        rowKey="id"
        locale={{ emptyText: "No hay alertas configuradas" }}
      />

      <AlertDetailDrawer
        visible={detailVisible}
        onClose={closeDetail}
        data={detailData}
        loading={detailLoading}
        isMobile={isMobile}
      />
    </>
  );
};

export default TableAlerts;
