import React, { useContext, useState, useEffect } from "react";
import {
  Table,
  Flex,
  Tag,
  Form,
  Input,
  message,
  Button,
  Drawer,
  Switch,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  CheckCircleFilled,
  MessageFilled,
  ClearOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
const TableAlerts = ({ data, update, setUpdate }) => {
  const { state } = useContext(AppContext);
  const selected = state.selected_profile;
  const canManageAlerts = state.selected_profile?.profile_ikolu?.m6 || false;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const GetComments = ({ id }) => {
    const DrawerComments = ({ id }) => {
      const [visible, setVisible] = useState(false);
      const [comments, setComments] = useState([]);
      const [pageComments, setPageComments] = useState(1);
      const [countComments, setCountComments] = useState(0);

      const getData = async () => {
        const rq = await sh.notifications.responses
          .get(id, pageComments)
          .then((res) => {
            console.log("Comments: ", res);
            setComments(res.results);
            setCountComments(res.count);
          });
      };

      useEffect(() => {
        getData();
      }, [id]);

      return (
        <>
          <Drawer
            title="Historial de Incidencias"
            placement="right"
            onClose={() => setVisible(false)}
            open={visible}
          >
            <Table
              dataSource={comments}
              size="small"
              columns={[
                {
                  render: (x) => (
                    <Flex vertical>
                      <Flex
                        gap="small"
                        justify="space-between"
                        style={{
                          backgroundColor: "#1F3461",
                          color: "white",
                          paddingLeft: "10px",
                          borderRadius: "5px 5px 0px 0px",
                          paddingRight: "10px",
                        }}
                      >
                        <span>@{x.user.username}</span>
                        <span>
                          {x.created.slice(0, 10)} {x.created.slice(11, 19)}
                        </span>
                      </Flex>

                      <Flex
                        style={{
                          border: "1px solid #1F3461",
                          padding: "15px",
                          borderRadius: "0px 0px 5px 5px",
                        }}
                      >
                        <span>{x.response}</span>
                      </Flex>
                    </Flex>
                  ),
                },
              ]}
            />
          </Drawer>
          <Button
            type="primary"
            icon={<MessageFilled />}
            size="small"
            onClick={() => {
              setVisible(true);
            }}
            style={{
              backgroundColor: "#1F3461",
              borderColor: "#1F3461",
              borderRadius: "20px",
            }}
          >
            Historial ({countComments})
          </Button>
        </>
      );
    };

    return (
      <>
        <DrawerComments id={id} />
      </>
    );
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

  const typeAlertLabel = {
    MAX: "Mayor que",
    MIN: "Menor que",
    EQUALS: "Igual que",
  };

  const typeVariableLabel = {
    NIVEL: "Nivel (m)",
    CAUDAL: "Caudal (lt/s)",
    "CAUDAL PROMEDIO": "Caudal Medio",
    TOTALIZADO: "Totalizado",
  };

  return (
    <Table
      size="middle"
      bordered={false}
      scroll={isMobile ? { x: 950 } : { x: "max-content" }}
      pagination={false}
      style={{ whiteSpace: "nowrap" }}
      columns={[
        {
          title: "Nombre",
          key: "name",
          width: isMobile ? 160 : 200,
          render: (text, record) => {
            const date = new Date(record.created);
            return (
              <Flex vertical gap="6px" style={{ minWidth: 140 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {record.title.toUpperCase()}
                </p>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    lineHeight: 1.2,
                  }}
                >
                  {date.toLocaleDateString()} · {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Flex>
            );
          },
        },
        {
          title: "Notificar",
          align: "center",
          key: "notify",
          width: isMobile ? 200 : 240,
          render: (text, record) => (
            <Flex gap="8px" vertical align="center" style={{ minWidth: 160 }}>
              <p
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
                title={record.message}
              >
                {record.message}
              </p>
              <GetComments id={record.id} />
            </Flex>
          ),
        },
        {
          title: "Variable",
          key: "variable",
          width: isMobile ? 130 : 150,
          render: (text, record) => (
            <span style={{ fontSize: isMobile ? "12px" : "13px", whiteSpace: "nowrap" }}>
              {typeVariableLabel[record.type_variable] || record.type_variable}
            </span>
          ),
        },
        {
          title: "Condición",
          key: "condition",
          width: isMobile ? 110 : 120,
          align: "center",
          render: (text, record) => (
            <Tag
              color={
                record.type_alert === "MAX"
                  ? "red"
                  : record.type_alert === "MIN"
                  ? "blue"
                  : "green"
              }
              style={{ fontSize: isMobile ? "11px" : "12px", margin: 0 }}
            >
              {typeAlertLabel[record.type_alert] || record.type_alert}
            </Tag>
          ),
        },
        {
          title: "Valor",
          key: "value",
          width: isMobile ? 90 : 100,
          align: "center",
          render: (text, record) => (
            <span
              style={{
                fontSize: isMobile ? "12px" : "14px",
                fontWeight: 600,
                color: "#1F3461",
              }}
            >
              {record.value}
            </span>
          ),
        },
        {
          title: "Estado",
          key: "status",
          width: isMobile ? 100 : 110,
          align: "center",
          render: (text, record) => (
            <Tooltip
              title={!canManageAlerts ? "Módulo de alertas no activado" : ""}
            >
              <Switch
                size="small"
                checked={record.is_active}
                checkedChildren="ON"
                unCheckedChildren="OFF"
                disabled={!canManageAlerts}
                onChange={(checked) => handleToggleActive(record, checked)}
              />
            </Tooltip>
          ),
        },
        {
          title: "Acciones",
          key: "actions",
          width: isMobile ? 100 : 110,
          align: "center",
          render: (text, record) => (
            <Tooltip
              title={!canManageAlerts ? "Módulo de alertas no activado" : ""}
            >
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
                  type="primary"
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{ borderRadius: "6px" }}
                  disabled={!canManageAlerts}
                >
                  Eliminar
                </Button>
              </Popconfirm>
            </Tooltip>
          ),
        },
      ]}
      dataSource={data}
      title={() => (
        <Flex>
          <AlertOutlined style={{ color: "#1f3461", fontSize: "20px" }} />
          <h3 style={{ marginLeft: "10px" }}>Alertas</h3>
        </Flex>
      )}
    />
  );
};

export default TableAlerts;
