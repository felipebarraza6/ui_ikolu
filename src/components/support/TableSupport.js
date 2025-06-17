import React, { useContext, useState, useEffect } from "react";
import { Table, Flex, Tag, Form, Input, message, Button, Drawer } from "antd";
import {
  CheckCircleFilled,
  MessageFilled,
  ClearOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
const TableSupport = ({ data }) => {
  const { state } = useContext(AppContext);
  const selected = state.selected_profile;

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
      bordered
      columns={[
        {
          title: "Ticket",
          dataIndex: "id",
          key: "id",
          render: (text, record) => (
            <Flex gap="small" align="center">
              <CheckCircleFilled style={{ color: "green" }} />
              {selected.title.slice(0, 3).toUpperCase()}SUP
              {record.id}
              <h3 style={{ marginLeft: "10px" }}>{record.title}</h3>
            </Flex>
          ),
        },
        {
          title: "Requerimiento",
          dataIndex: "message",
          key: "Mensaje",
          render: (text, record) => (
            <Flex gap="small" vertical>
              <p>{record.message}</p>
              <GetComments id={record.id} />
            </Flex>
          ),
        },
        {
          title: "Creado",
          dataIndex: "created",
          key: "created",
          render: (text, record) => {
            const date = new Date(record.created);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          },
        },
        {
          title: "Finalizado",
          dataIndex: "status",
          key: "status",
          render: (text, record) => (
            <Tag color="green-inverse">{record.end_date}</Tag>
          ),
        },
      ]}
      dataSource={data}
      title={() => (
        <Flex>
          <CheckCircleOutlined style={{ color: "#1f3461", fontSize: "20px" }} />
          <h3 style={{ marginLeft: "10px" }}>Tickets cerrados</h3>
        </Flex>
      )}
    />
  );
};

export default TableSupport;
