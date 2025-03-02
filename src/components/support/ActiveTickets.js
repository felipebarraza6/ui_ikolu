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
  console.log(state);

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
                          backgroundColor: "#1f3461",
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
                          border: "1px solid #1f3461",
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
                style={{ marginRight: "10px" }}
              >
                Enviar
              </Button>
              <Button
                onClick={() => form.resetFields()}
                icon={<ClearOutlined />}
              >
                Limpiar
              </Button>
            </Form>
          </Drawer>
          <Button
            type="primary"
            icon={<MessageFilled />}
            onClick={() => {
              setVisible(true);
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
      columns={[
        {
          title: "Ticket",
          render: (text, record) => (
            <Flex gap="small">
              <Tag color="blue-inverse">
                {selected.title.slice(0, 3).toUpperCase()}SUP
                {record.id}
              </Tag>
            </Flex>
          ),
        },
        {
          title: "Información",
          dataIndex: "title",
          key: "title",
          render: (text, record) => (
            <Flex gap="small" vertical>
              <Button
                icon={<FileTextFilled />}
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
              >
                Mensaje adjunto
              </Button>
              <GetComments id={record.id} />
            </Flex>
          ),
        },
        {
          title: "Creado",
          render: (text, record) => {
            const date = new Date(record.created);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          },
        },
        {
          title: "Status",
          dataIndex: "status",
          align: "end",
          key: "status",
          render: (text, record) => (
            <Flex>
              {record.is_read ? (
                <>
                  {record.is_wait ? (
                    <Tag color="geekblue-inverse">
                      Esperando retroalimentación
                    </Tag>
                  ) : (
                    <Tag icon={<FileFilled />} color="green-inverse">
                      Desarrollando solución
                    </Tag>
                  )}
                </>
              ) : (
                <Tag color="blue">
                  <LoadingOutlined style={{ marginRight: "10px" }} /> en
                  revisión
                </Tag>
              )}
            </Flex>
          ),
        },
      ]}
    />
  );
};

export default ActiveTickets;
