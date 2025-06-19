import React, { useContext, useState, useEffect } from "react";
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
  Row,
  Col,
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
  const [isMobile, setIsMobile] = useState(false);

  const [form] = Form.useForm();
  const selected = state.selected_profile;
  const [files, setFiles] = useState(selected.modules.files);
  console.log(selected.profile_ikolu.m5);
  const activate = selected.profile_ikolu.m5;

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <div
      style={{
        minHeight: "90vh",
        padding: isMobile ? "10px" : "20px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Row gutter={[16, 16]} justify="center">
        {/* Formulario de subida */}
        <Col xs={24} sm={24} md={8} lg={8} xl={6}>
          <Card
            style={{
              borderRadius: "10px",
              background: "white",
              height: "fit-content",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
          >
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  color: "#4d628c",
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: "500",
                }}
              >
                Subir archivo
              </span>
            </div>
            <Form
              form={form}
              onFinish={onCreate}
              layout="vertical"
              style={{ width: "100%" }}
            >
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Nombre del archivo requerido" },
                ]}
              >
                <Input
                  addonBefore={<FileAddOutlined style={{ color: "#4d628c" }} />}
                  size={isMobile ? "middle" : "large"}
                  placeholder="Nombre archivo"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item name="description">
                <Input.TextArea
                  placeholder="Descripción del archivo"
                  rows={3}
                  style={{ width: "100%" }}
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
                        width: "100%",
                        marginTop: "8px",
                        padding: "8px",
                      }}
                    >
                      <span style={{ flex: 1, fontSize: "12px" }}>
                        {file.name.length > 20
                          ? `${file.name.slice(0, 20)}...`
                          : file.name}
                      </span>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => actions.remove(file)}
                        icon={
                          <DeleteOutlined
                            style={{ fontSize: "12px", color: "red" }}
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
                      backgroundColor: "#1F3461",
                      cursor: "pointer",
                      border: "none",
                    }}
                    bodyStyle={{ padding: "12px", textAlign: "center" }}
                  >
                    <Flex gap="small" align="center" justify="center">
                      <PaperClipOutlined style={{ color: "white" }} />
                      <span style={{ color: "white" }}>Adjuntar</span>
                    </Flex>
                  </Card>
                </Upload>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Row gutter={8}>
                  <Col span={12}>
                    <Button
                      type="primary"
                      icon={<CloudSyncOutlined />}
                      htmlType="submit"
                      disabled={files.length >= 3}
                      size={isMobile ? "middle" : "small"}
                      style={{
                        width: "100%",
                        backgroundColor: "#1F3461",
                        borderColor: "#1F3461",
                      }}
                    >
                      Aceptar
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      type="default"
                      onClick={() => form.resetFields()}
                      size={isMobile ? "middle" : "small"}
                      icon={<ClearOutlined />}
                      style={{ width: "100%" }}
                    >
                      Limpiar
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Documentos cargados */}
        <Col xs={24} sm={24} md={16} lg={16} xl={18}>
          <Row gutter={[16, 16]}>
            {/* Documentación del usuario */}
            <Col span={24}>
              <Card
                title={`Documentación ${selected.title}`}
                style={{
                  width: "100%",
                  backgroundColor: "#1F3461",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
                bodyStyle={{ backgroundColor: "white" }}
                extra={
                  <span style={{ color: "white" }}>
                    {files.length} Documentos cargados
                  </span>
                }
              >
                <Table
                  size="small"
                  pagination={false}
                  style={{ width: "100%" }}
                  scroll={isMobile ? { x: 600 } : undefined}
                  dataSource={files.filter(
                    (file) => file.type_file.name === "General"
                  )}
                  columns={[
                    {
                      title: "#",
                      dataIndex: "title",
                      width: 40,
                      render: () => <FileOutlined />,
                    },
                    {
                      title: "Nombre",
                      dataIndex: "name",
                      width: isMobile ? 120 : undefined,
                      ellipsis: true,
                    },
                    {
                      title: "Descripción",
                      dataIndex: "description",
                      width: isMobile ? 150 : undefined,
                      ellipsis: true,
                      render: (description) => {
                        if (description === "undefined" || !description) {
                          return "Sin descripción";
                        } else {
                          return description;
                        }
                      },
                    },
                    {
                      title: "Acciones",
                      width: isMobile ? 180 : undefined,
                      render: (obj) => (
                        <Flex gap="small" wrap>
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
                            style={{
                              backgroundColor: "#1F3461",
                              borderColor: "#1F3461",
                            }}
                          >
                            {isMobile ? "" : "Descargar"}
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
                              {isMobile ? "" : "Eliminar"}
                            </Button>
                          </Popconfirm>
                        </Flex>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Gestión Documental Smart Hydro */}
            <Col span={24}>
              <Card
                title="Gestión Documental Smart Hydro"
                style={{
                  width: "100%",
                  backgroundColor: "rgba(31, 52, 97, 0.7)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                headStyle={{
                  color: "white",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
                bodyStyle={{ backgroundColor: "white" }}
                extra={
                  <img
                    src={logo}
                    style={{ width: isMobile ? "80px" : "100px" }}
                    alt="Smart Hydro Logo"
                  />
                }
              >
                <Table
                  size="small"
                  pagination={false}
                  scroll={isMobile ? { x: 500 } : undefined}
                  dataSource={files.filter(
                    (file) => file.type_file.name === "Internos"
                  )}
                  columns={[
                    {
                      title: "#",
                      dataIndex: "title",
                      width: 40,
                      render: () => <FileOutlined />,
                    },
                    {
                      title: "Nombre",
                      dataIndex: "name",
                      width: isMobile ? 120 : undefined,
                      ellipsis: true,
                    },
                    {
                      title: "Descripción",
                      dataIndex: "description",
                      width: isMobile ? 150 : undefined,
                      ellipsis: true,
                      render: (description) => description || "Sin descripción",
                    },
                    {
                      title: "Acciones",
                      dataIndex: "file",
                      width: isMobile ? 100 : undefined,
                      render: () => (
                        <Button
                          size="small"
                          style={{
                            backgroundColor: "#1F3461",
                            borderColor: "#1F3461",
                            color: "white",
                          }}
                        >
                          Descargar
                        </Button>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default DocRes;
