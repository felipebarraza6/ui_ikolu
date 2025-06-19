import React, { useContext, useState, useEffect } from "react";
import {
  Table,
  Flex,
  Tag,
  Modal,
  Button,
  Drawer,
  Form,
  Input,
  message,
} from "antd";
import {
  LoadingOutlined,
  FileFilled,
  FileTextFilled,
  MessageFilled,
  ClearOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";

const ActiveTickets = ({ data }) => {
  const { state } = useContext(AppContext);
  const selected = state.selected_profile;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
      const [form] = Form.useForm();

      const getData = async () => {
        const rq = await sh.notifications.responses
          .get(id, pageComments)
          .then((res) => {
            console.log("Comments: ", res);
            setComments(res.results);
            setCountComments(res.count);
          });
      };

      const createComment = async (values) => {
        values = {
          ...values,
          notification: id,
          user: state.user.id,
        };
        console.log(values);
        const rq = await sh.notifications.responses
          .create(values)
          .then((res) => {
            console.log("Comment created: ", res);
            getData();
            form.resetFields();
            message.success("Comentario creado correctamente");
          });
      };

      useEffect(() => {
        getData();
      }, [id]);

      return (
        <>
          <Drawer
            title="Comentarios"
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
            <Form layout="vertical" form={form} onFinish={createComment}>
              <Form.Item label="Ingresa tu comentario" name="response">
                <Input.TextArea />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<MessageFilled />}
                style={{
                  marginRight: "10px",
                  backgroundColor: "#FF6B35",
                  borderColor: "#FF6B35",
                }}
              >
                Enviar
              </Button>
              <Button
                onClick={() => form.resetFields()}
                icon={<ClearOutlined />}
                style={{
                  borderColor: "#1F3461",
                  color: "#1F3461",
                }}
              >
                Limpiar
              </Button>
            </Form>
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
            comentarios ({countComments})
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
      dataSource={data}
      size="small"
      scroll={isMobile ? { x: 700 } : undefined}
      pagination={false}
      columns={[
        {
          title: "Ticket",
          width: isMobile ? 120 : undefined,
          render: (text, record) => (
            <Flex gap="small">
              <div
                style={{
                  backgroundColor: "#FF6B35",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  textAlign: "center",
                  boxShadow: "0 2px 4px rgba(255, 107, 53, 0.3)",
                }}
              >
                {selected.title.slice(0, 3).toUpperCase()}SUP{record.id}
              </div>
            </Flex>
          ),
        },
        {
          title: "Información",
          dataIndex: "title",
          key: "title",
          width: isMobile ? 200 : undefined,
          render: (text, record) => (
            <Flex gap="small" vertical>
              <Button
                icon={<FileTextFilled />}
                size="small"
                onClick={() => {
                  Modal.info({
                    title: "Mensaje",
                    content: (
                      <div>
                        <p>{record.message}</p>
                      </div>
                    ),
                    onOk() {},
                  });
                }}
                style={{
                  backgroundColor: "#F0F2F5",
                  borderColor: "#D9D9D9",
                  color: "#1F3461",
                  borderRadius: "6px",
                }}
              >
                {isMobile ? "Ver" : "Mensaje adjunto"}
              </Button>
              <GetComments id={record.id} />
            </Flex>
          ),
        },
        {
          title: "Creado",
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
          title: "Status",
          dataIndex: "status",
          align: "center",
          key: "status",
          width: isMobile ? 150 : undefined,
          render: (text, record) => (
            <Flex justify="center">
              {record.is_read ? (
                <>
                  {record.is_wait ? (
                    <div
                      style={{
                        backgroundColor: "#722ED1",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "center",
                        boxShadow: "0 2px 4px rgba(114, 46, 209, 0.3)",
                      }}
                    >
                      {isMobile ? "Esperando" : "Esperando retroalimentación"}
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "#52C41A",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "500",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 2px 4px rgba(82, 196, 26, 0.3)",
                      }}
                    >
                      <FileFilled />
                      {isMobile ? "En desarrollo" : "Desarrollando solución"}
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    backgroundColor: "#1F3461",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "500",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: "0 2px 4px rgba(31, 52, 97, 0.3)",
                  }}
                >
                  <LoadingOutlined />
                  {isMobile ? "Revisión" : "En revisión"}
                </div>
              )}
            </Flex>
          ),
        },
      ]}
    />
  );
};

export default ActiveTickets;
