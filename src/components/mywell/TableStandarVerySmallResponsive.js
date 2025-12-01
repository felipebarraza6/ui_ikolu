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
  Divider,
} from "antd";

import {
  SecurityScanFilled,
  DeleteFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { FaTint } from "react-icons/fa";
import { AppContext } from "../../App";
import api from "../../api/sh/endpoints";
import {
  formatFlow,
  formatLevel,
  formatVolume,
} from "../../utils/numberFormatter";

const { Title, Text } = Typography;

/**
 * Componente de registro manual de mediciones
 * Optimizado para móvil y desktop
 */
const TableStandarVerySmallResponsive = ({ data }) => {
  const [form] = Form.useForm();
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
      historicalTotal: lastRecord ? parseInt(lastRecord.total) : 0,
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
          padding: "12px 16px",
          background: "#f0f5ff",
          borderRadius: 6,
          margin: "16px 0",
          border: "1px solid #d6e4ff",
        }}
      >
        <Text style={{ fontSize: 13, color: "#1F3461" }}>
          Fecha límite de carga:{" "}
          <Tag color="blue" style={{ marginLeft: 4 }}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: isMobile ? "12px" : "24px" }}>
      {/* Indicadores resumidos */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 8,
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: "center" }}>
              <ClockCircleOutlined
                style={{ fontSize: 20, color: "#1890ff", marginBottom: 4 }}
              />
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                Última Medición
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1F3461" }}>
                {indicators.lastUpdate}
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div style={{ textAlign: "center" }}>
              <FaTint
                style={{ fontSize: 20, color: "#1890ff", marginBottom: 4 }}
              />
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                Caudal
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1F3461" }}>
                {formatFlow(indicators.lastFlow)}
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div style={{ textAlign: "center" }}>
              <LineChartOutlined
                style={{ fontSize: 20, color: "#faad14", marginBottom: 4 }}
              />
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                Nivel Freático
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1F3461" }}>
                {formatLevel(indicators.lastLevel)}
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div style={{ textAlign: "center" }}>
              <DatabaseOutlined
                style={{ fontSize: 20, color: "#722ed1", marginBottom: 4 }}
              />
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                Totalizado Histórico
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1F3461" }}>
                {formatVolume(indicators.historicalTotal)}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Formulario y tabla */}
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{ padding: "20px" }}
      >
        <Title
          level={4}
          style={{
            color: "#1F3461",
            marginBottom: 20,
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Registro de Mediciones
        </Title>

        <Divider style={{ margin: "16px 0" }} />

        {/* Formulario */}
        <Form
          form={form}
          layout={isMobile ? "vertical" : "horizontal"}
          onFinish={createData}
          style={{ marginBottom: 20 }}
          colon={false}
          labelCol={
            isMobile ? undefined : { span: 10, style: { whiteSpace: "normal" } }
          }
          wrapperCol={isMobile ? undefined : { span: 14 }}
        >
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Fecha de captación"
                name="date_time_medition"
                rules={[{ required: true, message: "Ingresa la fecha" }]}
                style={{ marginBottom: isMobile ? 16 : 0 }}
                labelWrap
              >
                <DatePicker
                  placeholder="Selecciona fecha"
                  style={{ width: "100%" }}
                  size={isMobile ? "large" : "middle"}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <Form.Item
                label="Caudal"
                name="flow"
                rules={[{ required: true, message: "Ingresa el caudal" }]}
                style={{ marginBottom: isMobile ? 16 : 0 }}
                labelWrap
              >
                <Input
                  placeholder="0.0"
                  suffix="l/s"
                  style={{ width: "100%" }}
                  size={isMobile ? "large" : "middle"}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <Form.Item
                label="Nivel freático"
                name="water_table"
                rules={[{ required: true, message: "Ingresa el nivel" }]}
                style={{ marginBottom: isMobile ? 16 : 0 }}
                labelWrap
              >
                <Input
                  placeholder="0.0"
                  suffix="m"
                  style={{ width: "100%" }}
                  size={isMobile ? "large" : "middle"}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <Form.Item
                label="Totalizado"
                name="total"
                rules={[{ required: true, message: "Ingresa el total" }]}
                style={{ marginBottom: isMobile ? 16 : 0 }}
                labelWrap
              >
                <Input
                  placeholder="0"
                  suffix="m³"
                  style={{ width: "100%" }}
                  size={isMobile ? "large" : "middle"}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={3}>
              <Form.Item
                label={isMobile ? "Acciones" : " "}
                style={{ marginBottom: isMobile ? 16 : 0 }}
              >
                <Space
                  direction={isMobile ? "horizontal" : "vertical"}
                  style={{ width: "100%" }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    size={isMobile ? "large" : "middle"}
                    block={isMobile}
                    style={{ width: isMobile ? "100%" : "auto" }}
                  >
                    Guardar
                  </Button>
                  <Button
                    onClick={() => form.resetFields()}
                    size={isMobile ? "large" : "middle"}
                    block={isMobile}
                    style={{ width: isMobile ? "100%" : "auto" }}
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
                  title: "Caudal (l/s)",
                  dataIndex: "flow",
                  render: (flow) => formatFlow(parseFloat(flow)),
                  width: isMobile ? 90 : undefined,
                },
                {
                  title: "Nivel (m)",
                  dataIndex: "water_table",
                  render: (nivel) => formatLevel(parseFloat(nivel)),
                  width: isMobile ? 80 : undefined,
                },
                {
                  title: "Total (m³)",
                  dataIndex: "total",
                  render: (total) => formatVolume(parseInt(total)),
                  width: isMobile ? 100 : undefined,
                },
                {
                  title: "Estado",
                  render: (record) => (
                    <div style={{ textAlign: "center" }}>
                      {!record.is_error && !record.return_dga ? (
                        <Popconfirm
                          title="¿Eliminar registro?"
                          onConfirm={() => deleteData(record.id)}
                          okText="Sí"
                          cancelText="No"
                        >
                          <Button danger size="small" icon={<DeleteFilled />}>
                            {isMobile ? "" : "Eliminar"}
                          </Button>
                        </Popconfirm>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            alignItems: "center",
                          }}
                        >
                          <Tag icon={<CheckCircleOutlined />} color="success">
                            {isMobile ? "DGA" : "Enviado DGA"}
                          </Tag>
                          {record.n_voucher &&
                            record.n_voucher !== "..." &&
                            record.n_voucher !== "-" && (
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: "#52c41a",
                                  fontWeight: 500,
                                  wordBreak: "break-word",
                                  textAlign: "center",
                                }}
                              >
                                {record.n_voucher}
                              </Text>
                            )}
                        </div>
                      )}
                    </div>
                  ),
                  width: isMobile ? 100 : 150,
                },
              ]}
              dataSource={dataForm}
              pagination={{
                pageSize: isMobile ? 5 : 10,
                showSizeChanger: false,
                showTotal: (total) => `Total: ${total} registros`,
              }}
            />
          </Col>

          {/* Panel QR */}
          <Col xs={24} lg={6}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
              bodyStyle={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
                  style={{ marginBottom: 16, maxWidth: "200px" }}
                >
                  {state.selected_profile.dga.code_dga}
                </Button>
              </Tooltip>

              {state.selected_profile.dga.code_dga ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <QRCode
                    errorLevel="H"
                    color="#1F3461"
                    value={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.dga.code_dga}`}
                    size={isMobile ? 120 : 150}
                  />
                </div>
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
