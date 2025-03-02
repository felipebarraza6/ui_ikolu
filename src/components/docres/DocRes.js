import React, { useContext, useState } from "react";
import {
  Tag,
  Table,
  Button,
  Input,
  Flex,
  Card,
  Popconfirm,
  Upload,
  Form,
  message,
} from "antd";
import {
  ClearOutlined,
  CloudSyncOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  FileAddOutlined,
  PaperClipOutlined,
  FileOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import logo from "../../assets/images/logo-blanco.png";
import sh from "../../api/sh/endpoints";
import { type } from "@testing-library/user-event/dist/type";

const DocRes = () => {
  const { state } = useContext(AppContext);

  const [form] = Form.useForm();
  const selected = state.selected_profile;
  const [files, setFiles] = useState(selected.modules.files);
  console.log(selected.profile_ikolu.m5);
  const activate = selected.profile_ikolu.m5;

  const onDelete = async (id) => {
    const rq = await sh.deleteFile(id).then((res) => {
      message.success("Archivo eliminado correctamente");
    });
    setFiles(files.filter((file) => file.id !== id));
    console.log(rq);
  };

  const onCreate = async (values) => {
    values = {
      ...values,
      point_catchment: selected.id,
      file: values.file.fileList[0],
    };

    const rq = await sh.uploadFile(values).then((response) => {
      message.success("Archivo subido correctamente");
      console.log(response);
      response = {
        ...response,
        type_file: {
          name: "General",
        },
      };
      setFiles([...files, response]);
      form.resetFields();
    });
  };

  return (
    <Flex
      justify={"start"}
      align="start"
      gap={"small"}
      style={{
        minHeight: "90vh",
        borderRadius: "8px",
        background:
          "radial-gradient(circle, rgba(31,36,45,1) 0%, rgba(53,73,110,1) 100%)",
      }}
    >
      <Flex
        gap="large"
        vertical
        align="center"
        justify="center"
        style={{ width: "100%", paddingLeft: "10px", paddingRight: "10px" }}
      >
        <Flex
          hoverable
          style={{
            borderRadius: "0px 0px 10px 10px",
            paddingBottom: "10px",
            paddingLeft: "10px",
            background:
              "linear-gradient(39deg, rgba(222,222,222,1) 0%, rgba(217,221,230,1) 77%)",
            paddingTop: "10px",

            transition: "transform 0.3s ease-in-out",
            hover: {
              transform: "scale(1.05)",
            },
          }}
        >
          <Flex vertical>
            <span
              style={{ color: "#4d628c", fontSize: "18px", fontWeight: "500" }}
            >
              Subir archivo
            </span>
            <Form
              form={form}
              onFinish={onCreate}
              layout="inline"
              style={{
                width: "100%",
                flex: 1,

                borderRadius: "8px",
                padding: "8px",
              }}
            >
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Nombre del archivo requerido" },
                ]}
              >
                <Input
                  addonBefore={<FileAddOutlined style={{ color: "#4d628c" }} />}
                  size="large"
                  placeholder="Nombre archivo"
                />
              </Form.Item>
              <Form.Item name="description">
                <Input.TextArea
                  placeholder="Descripción del archivo"
                  rows={2}
                  cols={25}
                />
              </Form.Item>
              <Form.Item
                name="file"
                rules={[{ required: true, message: "Archivo requerido" }]}
              >
                <Upload
                  name="file"
                  listType="text"
                  itemRender={(originNode, file, currFileList, actions) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "4px",
                        width: "117px",
                        marginTop: "8px",
                      }}
                    >
                      <span style={{ flex: 1, fontSize: "11px" }}>
                        {file.name.length > 15
                          ? `${file.name.slice(0, 15)}...`
                          : file.name}
                      </span>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => actions.remove(file)}
                        icon={
                          <DeleteOutlined
                            style={{ fontSize: "11px", color: "red" }}
                          />
                        }
                      />
                    </div>
                  )}
                  beforeUpload={() => false}
                  maxCount={1}
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false,
                  }}
                >
                  <Card
                    hoverable
                    size="small"
                    style={{
                      width: "100%",
                      background:
                        "linear-gradient(39deg, rgba(112,133,172,1) 0%, rgba(77,98,140,1) 77%)",
                    }}
                  >
                    <Button size="small" style={{ color: "white" }} type="link">
                      <Flex gap="small" align="center">
                        <PaperClipOutlined />
                        <span>Adjuntar</span>
                      </Flex>
                    </Button>
                  </Card>
                </Upload>
              </Form.Item>
              <Form.Item>
                <Flex vertical gap="small">
                  <Button
                    type="primary"
                    icon={<CloudSyncOutlined />}
                    htmlType="submit"
                    disabled={files.length >= 3}
                    size="small"
                  >
                    Aceptar
                  </Button>
                  <Button
                    type="default"
                    onClick={() => form.resetFields()}
                    size="small"
                    icon={<ClearOutlined />}
                  >
                    Limpiar
                  </Button>
                </Flex>
              </Form.Item>
            </Form>
          </Flex>
        </Flex>
        <Flex vertical gap="small" style={{ width: "70%" }}>
          <Card
            title={`Documentación ${selected.title} `}
            style={{
              width: "100%",
              background:
                "linear-gradient(39deg, rgba(31,36,45,0.06206232492997199) 0%, rgba(100,104,111,1) 100%)",
            }}
            headStyle={{ color: "white" }}
            extra={
              <span style={{ color: "white" }}>
                {files.length} Documentos cargados
              </span>
            }
          >
            <Flex gap={"small"} style={{ width: "100%" }}>
              <Flex style={{ width: "100%" }}>
                <Table
                  size="small"
                  pagination={false}
                  style={{ width: "100%" }}
                  dataSource={files.filter(
                    (file) => file.type_file.name === "General"
                  )}
                  columns={[
                    {
                      title: "#",
                      dataIndex: "title",
                      render: () => <FileOutlined />,
                    },
                    { title: "Nombre", dataIndex: "name" },
                    {
                      title: "Descripción",
                      dataIndex: "description",
                      render: (description) => {
                        if (description === "undefined") {
                          return "Sin descripción";
                        } else {
                          return description;
                        }
                      },
                    },
                    {
                      render: (obj) => (
                        <Flex gap="small">
                          <Button
                            type="primary"
                            shape="round"
                            icon={<CloudDownloadOutlined />}
                            onClick={() =>
                              window.open(
                                `https://api.smarthydro.app/${obj.file}`,
                                "_blank"
                              )
                            }
                            size="small"
                          >
                            Descargar
                          </Button>
                          <Popconfirm
                            title="¿Estás seguro?"
                            onConfirm={() => onDelete(obj.id)}
                          >
                            <Button
                              danger
                              type="primary"
                              size="small"
                              shape="round"
                              icon={<DeleteOutlined />}
                            >
                              Eliminar
                            </Button>
                          </Popconfirm>
                        </Flex>
                      ),
                    },
                  ]}
                />
              </Flex>
              <Flex vertical gap="small"></Flex>
            </Flex>
          </Card>

          <Card
            title={`Gestión Documental Smart Hydro `}
            style={{
              width: "100%",
              background:
                "linear-gradient(12deg, rgba(31,36,45,0.4) 0%, rgba(53,73,110,1) 100%)",
              marginBottom: "30px",
            }}
            headStyle={{ color: "white" }}
            extra={<img src={logo} style={{ width: "100px" }} />}
          >
            <Table
              size="small"
              pagination={false}
              dataSource={files.filter(
                (file) => file.type_file.name === "Internos"
              )}
              columns={[
                {
                  title: "#",
                  dataIndex: "title",
                  render: () => <FileOutlined />,
                },
                { title: "Nombre", dataIndex: "name" },

                {
                  title: "Descripción",
                  dataIndex: "description",
                  render: (description) => description || "Sin descripción",
                },
                {
                  dataIndex: "file",
                  render: () => <Button>Descargar</Button>,
                },
              ]}
            />
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DocRes;
