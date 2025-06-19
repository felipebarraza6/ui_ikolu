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
} from "antd";
import {
  CheckCircleFilled,
  MessageFilled,
  ClearOutlined,
  CheckCircleOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
const TableAlerts = ({ data }) => {
  const { state } = useContext(AppContext);
  const selected = state.selected_profile;
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
            historial de incidencias ({countComments})
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

  return (
    <Table
      size="small"
      bordered
      scroll={isMobile ? { x: 700 } : undefined}
      columns={[
        {
          title: "Nombre",
          dataIndex: "id",
          key: "id",
          width: isMobile ? 150 : undefined,
          render: (text, record) => (
            <Flex gap="small" align="center">
              <p
                style={{
                  marginLeft: "10px",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                {record.title.toUpperCase()}
              </p>
            </Flex>
          ),
        },
        {
          title: "Notificar",
          align: "center",
          dataIndex: "message",
          key: "Mensaje",
          width: isMobile ? 250 : undefined,
          render: (text, record) => (
            <Flex gap="small" vertical>
              <p style={{ fontSize: isMobile ? "12px" : "14px" }}>
                {record.message}
              </p>
              <GetComments id={record.id} />
            </Flex>
          ),
        },
        {
          title: "Fecha",
          dataIndex: "created",
          key: "created",
          width: isMobile ? 120 : undefined,
          render: (text, record) => {
            const date = new Date(record.created);
            return (
              <div style={{ fontSize: "12px", color: "#666" }}>
                {date.toLocaleDateString()}
                <br />
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            );
          },
        },
        {
          title: "Activar/Desactivar",
          dataIndex: "status",
          align: "center",
          key: "status",
          width: isMobile ? 150 : undefined,
          render: (text, record) => <Switch disabled />,
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
