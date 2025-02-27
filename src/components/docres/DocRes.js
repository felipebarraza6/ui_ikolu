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
  UploadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  FileAddOutlined,
  FileOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import logo from "../../assets/images/logo-blanco.png";
import sh from "../../api/sh/endpoints";

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
    console.log(rq);
  };

  const onCreate = async (values) => {
    values = {
      ...values,
      point_catchment: selected.id,
      file: values.file.fileList[0],
    };
    console.log("Received values:", values);
    const rq = await sh.uploadFile(values).then((response) => {
      console.log(response);
      message.success("Archivo subido correctamente");
      form.resetFields();
    });

    console.log("Received values:", values);
  };

  return (
    <Flex
      justify={"space-around"}
      align="center"
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
        <Flex>
          <Form
            form={form}
            onFinish={onCreate}
            layout="inline"
            style={{
              width: "100%",
              flex: 1,
              alignItems: "center",
              background:
                "linear-gradient(39deg, rgba(31,36,45,0.06206232492997199) 0%, rgba(100,104,111,1) 100%)",
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
                addonBefore={<FileAddOutlined style={{ color: "white" }} />}
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
                      padding: "5px",
                      marginTop: "8px",
                    }}
                  >
                    <CloudUploadOutlined style={{ marginRight: "8px" }} />
                    <span style={{ flex: 1 }}>
                      {file.name.length > 20
                        ? `${file.name.slice(0, 20)}...`
                        : file.name}
                    </span>
                    <Button
                      type="link"
                      onClick={() => actions.remove(file)}
                      icon={<DeleteOutlined />}
                    />
                  </div>
                )}
                beforeUpload={() => false}
                maxCount={1}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                  showDownloadIcon: false,
                  onChange(info) {
                    if (info.file.status !== "uploading") {
                      console.log(info.file, info.fileList);
                    }
                  },
                  onPreview(file) {
                    window.open(file.url || file.thumbUrl);
                  },
                  onRemove(file) {
                    console.log("Removed file:", file);
                  },
                }}
              >
                <Card
                  hoverable
                  size="small"
                  style={{
                    width: "100%",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  <Button size="small" style={{ color: "#4d628c" }} type="link">
                    <Flex gap="small" align="center">
                      <CloudUploadOutlined />
                      <span>Adjuntar</span>
                    </Flex>
                  </Button>
                </Card>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                style={{
                  borderColor: "white",
                  marginBottom: "8px",
                  marginRight: "8px",
                }}
                icon={<UploadOutlined />}
                htmlType="submit"
                disabled={activate}
              >
                Subir Archivo
              </Button>
              <Button
                type="default"
                onClick={() => form.resetFields()}
                style={{
                  borderColor: "white",
                }}
                icon={<ClearOutlined />}
              >
                Limpiar
              </Button>
            </Form.Item>
          </Form>
        </Flex>
        <Flex vertical gap="small" style={{ width: "100%" }}>
          <Card
            title={`Documentación ${selected.title} `}
            style={{
              width: "100%",
              background:
                "linear-gradient(39deg, rgba(31,36,45,0.06206232492997199) 0%, rgba(100,104,111,1) 100%)",
              header: {
                color: "white",
              },
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
                    { title: "Descripción", dataIndex: "description" },
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
                "linear-gradient(39deg, rgba(31,36,45,0.06206232492997199) 0%, rgba(100,104,111,1) 100%)",
              header: {
                color: "white",
              },
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

                { title: "Descripción", dataIndex: "description" },
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
