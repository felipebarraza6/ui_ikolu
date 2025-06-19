import React, { useState, useContext, useEffect } from "react";
import {
  Table,
  Col,
  Typography,
  Form,
  Row,
  Input,
  DatePicker,
  notification,
  Tooltip,
  Popconfirm,
  Tag,
  Button,
  QRCode,
  Card,
  Space,
} from "antd";

import {
  CloudUploadOutlined,
  SecurityScanFilled,
  DeleteFilled,
  ClearOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DropboxOutlined,
  LineChartOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import api from "../../api/sh/endpoints";
import logo from "../../assets/images/favicon.ico";
import {
  formatFlow,
  formatLevel,
  formatVolume,
} from "../../utils/numberFormatter";

const { Title, Text } = Typography;

/**
 * 📱 COMPONENTE TELEMETRÍA RESPONSIVO
 *
 * Estructura:
 * - Indicadores arriba (flex responsivo)
 * - Formulario y datos del punto de captación abajo
 * - Optimizado para móvil y desktop
 */
const TableStandarVerySmallResponsive = ({ data }) => {
  const [form] = Form.useForm();
  const [count, setCount] = useState(0);
  const [dataForm, setDataForm] = useState([]);
  const { state } = useContext(AppContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getData = async () => {
    try {
      const response = await api.get_data_sh(state.selected_profile.id);
      setDataForm(response.results || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const deleteData = async (id) => {
    try {
      await api.delete_data_sh(id);
      notification.success({
        message: "Eliminado",
        description: "Registro eliminado correctamente",
      });
      getData();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo eliminar el registro",
      });
    }
  };

  const createData = async (values) => {
    try {
      const payload = {
        ...values,
        catchment_point: state.selected_profile.id,
        flow: parseFloat(values.flow),
        water_table: parseFloat(values.water_table),
        total: parseInt(values.total),
        date_time_medition: values.date_time_medition.format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      };
      await api.create_data_sh(payload);
      notification.success({
        message: "Guardado",
        description: "Registro guardado correctamente",
      });
      form.resetFields();
      getData();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "No se pudo guardar el registro",
      });
    }
  };

  // Calcular indicadores
  const getIndicators = () => {
    const lastRecord = dataForm[0];
    return {
      lastUpdate: lastRecord
        ? new Date(lastRecord.date_time_medition).toLocaleDateString()
        : "Sin datos",
      lastFlow: lastRecord ? parseFloat(lastRecord.flow) : 0,
      lastLevel: lastRecord ? parseFloat(lastRecord.water_table) : 0,
      lastTotal: lastRecord ? parseInt(lastRecord.total) : 0,
      totalRecords: dataForm.length,
    };
  };

  const indicators = getIndicators();

  const dateStep = () => {
    const currentDate = new Date();
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    return (
      <div
        style={{
          textAlign: "center",
          padding: "12px",
          background: "#f0f2f5",
          borderRadius: 8,
          margin: "16px 0",
        }}
      >
        <Text style={{ fontSize: 12, color: "#666" }}>
          Debes cargar datos antes del:{" "}
          <Tag color="blue">
            {state.selected_profile.dga.standard === "CAUDALES_MUY_PEQUENOS" &&
              endOfYear.toLocaleDateString()}
            {state.selected_profile.dga.standard === "MENOR" &&
              endOfMonth.toLocaleDateString()}
          </Tag>
        </Text>
      </div>
    );
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div style={{ padding: isMobile ? "8px" : "20px" }}>
      {/* 📊 INDICADORES ARRIBA */}
      <Card style={{ marginBottom: 20 }}>
        <Title
          level={5}
          style={{ textAlign: "center", color: "#1f3461", marginBottom: 20 }}
        >
          📊 Estado Actual del Punto de Captación
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", background: "#f8f9fa" }}
            >
              <ClockCircleOutlined
                style={{ fontSize: 24, color: "#1890ff", marginBottom: 8 }}
              />
              <div style={{ fontSize: 12, color: "#666" }}>Última Medición</div>
              <div
                style={{ fontSize: 14, fontWeight: "bold", color: "#1f3461" }}
              >
                {indicators.lastUpdate}
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", background: "#f8f9fa" }}
            >
              <DropboxOutlined
                style={{ fontSize: 24, color: "#52c41a", marginBottom: 8 }}
              />
              <div style={{ fontSize: 12, color: "#666" }}>Caudal</div>
              <div
                style={{ fontSize: 14, fontWeight: "bold", color: "#1f3461" }}
              >
                {formatFlow(indicators.lastFlow)}
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", background: "#f8f9fa" }}
            >
              <LineChartOutlined
                style={{ fontSize: 24, color: "#faad14", marginBottom: 8 }}
              />
              <div style={{ fontSize: 12, color: "#666" }}>Nivel Freático</div>
              <div
                style={{ fontSize: 14, fontWeight: "bold", color: "#1f3461" }}
              >
                {formatLevel(indicators.lastLevel)}
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              size="small"
              style={{ textAlign: "center", background: "#f8f9fa" }}
            >
              <DatabaseOutlined
                style={{ fontSize: 24, color: "#722ed1", marginBottom: 8 }}
              />
              <div style={{ fontSize: 12, color: "#666" }}>Total Registros</div>
              <div
                style={{ fontSize: 14, fontWeight: "bold", color: "#1f3461" }}
              >
                {indicators.totalRecords}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 🏗️ SECCIÓN DEL PUNTO DE CAPTACIÓN Y DATOS (ABAJO) */}
      <Card>
        <Title level={5} style={{ color: "#1f3461", marginBottom: 20 }}>
          🏗️ Registro de Mediciones
        </Title>

        {/* Formulario */}
        <Form
          form={form}
          layout={isMobile ? "vertical" : "inline"}
          onFinish={createData}
          style={{ marginBottom: 20 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Fecha de captación"
                name="date_time_medition"
                rules={[{ required: true, message: "Ingresa la fecha" }]}
              >
                <DatePicker
                  placeholder="Selecciona fecha"
                  style={{ width: "100%" }}
                  size={isMobile ? "large" : "middle"}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item
                label="Caudal"
                name="flow"
                rules={[{ required: true, message: "Ingresa el caudal" }]}
              >
                <Input
                  placeholder="0.0"
                  suffix="l/s"
                  style={{ width: "100%" }}
                  size={isMobile ? "large" : "middle"}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item
                label="Nivel freático"
                name="water_table"
                rules={[{ required: true, message: "Ingresa el nivel" }]}
              >
                <Input
                  placeholder="0.0"
                  suffix="m"
                  style={{ width: "100%" }}
                  size={isMobile ? "large" : "middle"}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item
                label="Totalizado"
                name="total"
                rules={[{ required: true, message: "Ingresa el total" }]}
              >
                <Input
                  placeholder="0"
                  suffix="m³"
                  style={{ width: "100%" }}
                  size={isMobile ? "large" : "middle"}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={6}>
              <Form.Item label={isMobile ? "Acciones" : " "}>
                <Space>
                  <Button
                    type="primary"
                    icon={<CloudUploadOutlined />}
                    htmlType="submit"
                    size={isMobile ? "large" : "middle"}
                  >
                    Guardar
                  </Button>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={() => form.resetFields()}
                    size={isMobile ? "large" : "middle"}
                  >
                    Limpiar
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Fecha límite */}
        {dateStep()}

        {/* Tabla y QR */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={18}>
            <Table
              size="small"
              bordered
              scroll={{ x: isMobile ? 600 : undefined }}
              columns={[
                {
                  title: "Fecha",
                  dataIndex: "date_time_medition",
                  render: (date) => new Date(date).toLocaleDateString(),
                  width: isMobile ? 100 : undefined,
                },
                {
                  title: "Caudal(l/s)",
                  dataIndex: "flow",
                  render: (flow) => formatFlow(parseFloat(flow)),
                  width: isMobile ? 90 : undefined,
                },
                {
                  title: "Nivel(m)",
                  dataIndex: "water_table",
                  render: (nivel) => formatLevel(parseFloat(nivel)),
                  width: isMobile ? 80 : undefined,
                },
                {
                  title: "Total(m³)",
                  dataIndex: "total",
                  render: (total) => formatVolume(parseInt(total)),
                  width: isMobile ? 100 : undefined,
                },
                {
                  title: "Acción",
                  render: (record) => (
                    <div style={{ textAlign: "center" }}>
                      {!record.is_error && !record.return_dga ? (
                        <Popconfirm
                          title="¿Eliminar registro?"
                          onConfirm={() => deleteData(record.id)}
                          okText="Sí"
                          cancelText="No"
                        >
                          <Button
                            danger
                            type="primary"
                            size="small"
                            icon={<DeleteFilled />}
                          >
                            {isMobile ? "" : "Eliminar"}
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Tag icon={<CheckCircleFilled />} color="green">
                          {isMobile ? "DGA" : "ENVIADO DGA"}
                        </Tag>
                      )}
                    </div>
                  ),
                  width: isMobile ? 80 : undefined,
                },
              ]}
              dataSource={dataForm}
              pagination={{
                pageSize: isMobile ? 5 : 10,
                showSizeChanger: !isMobile,
              }}
            />
          </Col>

          {/* Panel QR */}
          <Col xs={24} lg={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Tooltip
                color="#1F3461"
                title="Datos proporcionados por DGA. Consultas: soporte@smarthydro.cl"
              >
                <Button
                  icon={<SecurityScanFilled />}
                  type="primary"
                  block
                  onClick={() => {
                    window.open(
                      `https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.dga.code_dga}`,
                      "_blank"
                    );
                  }}
                  style={{ marginBottom: 16 }}
                >
                  {state.selected_profile.dga.code_dga}
                </Button>
              </Tooltip>

              {state.selected_profile.dga.code_dga ? (
                <QRCode
                  errorLevel="H"
                  color="#1F3461"
                  value={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.dga.code_dga}`}
                  size={isMobile ? 120 : 150}
                />
              ) : (
                <Text type="danger" strong>
                  SIN CÓDIGO DE OBRA
                </Text>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TableStandarVerySmallResponsive;
