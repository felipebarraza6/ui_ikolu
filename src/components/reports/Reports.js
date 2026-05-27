import React, { useContext, useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  DatePicker,
  notification,
  Tag,
  Form,
  Flex,
  Card,
  Statistic,
} from "antd";
import { AppContext } from "../../App";
import ModuleTour from "../common/ModuleTour";
import { downloadTour } from "../../config/tours";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";
import {
  TableOutlined,
  FileExcelFilled,
  ClearOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import sh from "../../api/sh/endpoints";
import QueueAnim from "rc-queue-anim";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../../utils/numberFormatter";
import { useResponsive } from "../../hooks/useResponsive";

// Configurar dayjs para español
dayjs.locale("es");

const { Title, Text } = Typography;

const KPI_CARD_STYLES = {
  registros: {
    borderColor: "#1F3461",
    iconColor: "#1F3461",
    bg: "#F2F5FA",
    icon: <DatabaseOutlined />,
  },
  rango: {
    borderColor: "#006FB3",
    iconColor: "#006FB3",
    bg: "#F0F7FF",
    icon: <CalendarOutlined />,
  },
  estado: {
    borderColor: "#52C41A",
    iconColor: "#52C41A",
    bg: "#F6FFF0",
    icon: <CheckCircleOutlined />,
  },
};

const Reports = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const status_module = state.selected_profile.profile_ikolu.m3;

  const [data, setData] = useState([]);
  const [loadingTab1, setLoadingTab1] = useState(false);
  const [initialDate, setInitialDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [form] = Form.useForm();

  const downloadDataToExcel = async () => {
    setLoadingExcel(true);
    try {
      await sh.get_data_sh_range_to_excel(
        state.selected_profile.id,
        initialDate,
        finishDate,
        state.selected_profile.title
      );
    } catch (error) {
      notification.error({
        message: "Error al descargar el archivo",
        description: "Hubo un problema al intentar descargar el reporte Excel.",
      });
      console.error("Error downloading excel:", error);
    } finally {
      setLoadingExcel(false);
    }
  };

  const getData = async () => {
    setLoadingTab1(true);
    try {
      const rq = await sh.get_data_sh_range(
        state.selected_profile.id,
        initialDate,
        finishDate,
        page
      );
      setData(rq.results);
      setTotal(rq.count);
    } catch (error) {
      notification.error({
        message: "Error al cargar datos",
        description:
          "Hubo un problema al intentar obtener los datos del reporte.",
      });
      console.error("Error fetching data:", error);
    } finally {
      setLoadingTab1(false);
    }
  };

  useEffect(() => {
    if (!initialDate || !finishDate) {
      setData([]);
      setTotal(0);
      return;
    }
    getData();
  }, [page, initialDate, finishDate, state.selected_profile.id]);

  const getTableColumns = () => {
    const variables = state.selected_profile.config_data?.variables || [];

    const columns = [
      {
        title: "Fecha",
        dataIndex: "date_time_medition",
        render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
      },
    ];

    variables.forEach((variable) => {
      switch (variable.type_variable) {
        case "CAUDAL":
        case "CAUDAL_PROMEDIO":
          columns.push({
            title: variable.label || "Caudal (L/s)",
            dataIndex: "flow",
            render: (v) => formatFlow(v),
          });
          break;
        case "NIVEL":
          columns.push({
            title: variable.label || "Nivel (m)",
            dataIndex: "nivel",
            render: (v) => formatLevel(v),
          });
          columns.push({
            title: "Nivel Freático (m)",
            dataIndex: "water_table",
            render: (v) => formatLevel(v),
          });
          break;
        case "NIVEL_FREATICO":
          columns.push({
            title: variable.label || "Nivel Freático (m)",
            dataIndex: "water_table",
            render: (v) => formatLevel(v),
          });
          break;
        case "TOTALIZADO":
          columns.push({
            title: variable.label || "Acumulado (m³)",
            dataIndex: "total",
            render: (a) => formatVolume(a),
          });
          columns.push({
            title: "Acumulado/hora (m³)",
            dataIndex: "total_diff",
            render: (a) => formatVolume(a),
          });
          columns.push({
            title: "Contador diario (m³)",
            dataIndex: "total_today_diff",
            render: (a) => formatVolume(a),
          });
          break;
        default:
          break;
      }
    });

    return columns;
  };

  const renderKPIs = () => {
    const dias =
      initialDate && finishDate
        ? dayjs(finishDate).diff(dayjs(initialDate), "day") + 1
        : 0;

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={12} md={8} lg={8}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.registros.borderColor}`,
              background: KPI_CARD_STYLES.registros.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <DatabaseOutlined
                style={{
                  fontSize: 24,
                  color: KPI_CARD_STYLES.registros.iconColor,
                }}
              />
              <Statistic
                title={
                  <span style={{ fontSize: 12, color: "#888" }}>
                    Total Registros
                  </span>
                }
                value={total}
                valueStyle={{
                  color: "#1F3461",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              />
            </Flex>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={8} lg={8}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.rango.borderColor}`,
              background: KPI_CARD_STYLES.rango.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <CalendarOutlined
                style={{
                  fontSize: 24,
                  color: KPI_CARD_STYLES.rango.iconColor,
                }}
              />
              <div>
                <div style={{ fontSize: 12, color: "#888" }}>Rango</div>
                <div
                  style={{
                    color: "#1F3461",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {dias > 0 ? `${dias} días` : "Sin selección"}
                </div>
                {initialDate && finishDate && (
                  <div style={{ fontSize: 11, color: "#aaa" }}>
                    {dayjs(initialDate).format("DD/MM/YY")} -{" "}
                    {dayjs(finishDate).format("DD/MM/YY")}
                  </div>
                )}
              </div>
            </Flex>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={8} lg={8}>
          <Card
            size="small"
            bordered
            style={{
              borderRadius: 12,
              borderLeft: `4px solid ${KPI_CARD_STYLES.estado.borderColor}`,
              background: KPI_CARD_STYLES.estado.bg,
              borderColor: "transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Flex align="center" gap="middle">
              <CheckCircleOutlined
                style={{
                  fontSize: 24,
                  color: KPI_CARD_STYLES.estado.iconColor,
                }}
              />
              <div>
                <div style={{ fontSize: 12, color: "#888" }}>Estado</div>
                <div
                  style={{
                    color: status_module ? "#52C41A" : "#FF6B35",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {status_module ? "Activo" : "Inactivo"}
                </div>
              </div>
            </Flex>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderContent = () => {
    if (!status_module) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: "50vh" }}>
          <Title level={4} style={{ color: "#999" }}>
            Este módulo no está activado.
          </Title>
        </Flex>
      );
    }

    if (!initialDate || !finishDate) {
      return (
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ minHeight: "50vh", textAlign: "center" }}
        >
          <CalendarOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <Title level={4} style={{ color: "#bfbfbf", marginTop: "16px" }}>
            Por favor, selecciona un rango de fechas para generar el reporte.
          </Title>
        </Flex>
      );
    }

    return (
      <Table
        size="small"
        scroll={{ x: 1200, y: 500 }}
        columns={getTableColumns()}
        dataSource={data}
        loading={loadingTab1}
        pagination={{
          pageSize: 100,
          current: page,
          total: total,
          onChange: (page) => setPage(page),
          showSizeChanger: false,
          disabled: !status_module,
        }}
      />
    );
  };

  const onFinish = (values) => {
    if (values.range) {
      setInitialDate(values.range[0]);
      setFinishDate(values.range[1]);
    }
  };

  const clearFilters = () => {
    form.resetFields();
    setInitialDate("");
    setFinishDate("");
    setData([]);
    setTotal(0);
  };

  return (
    <QueueAnim delay={300} duration={900} type="right">
      <div
        key="reports"
        style={{
          maxWidth: "1600px",
          margin: isMobile ? "12px auto" : "0 auto",
          padding: isMobile ? "0 8px" : "0",
          minHeight: "90vh",
        }}
      >
        {/* KPIs */}
        {renderKPIs()}

        {/* Filtros */}
        <Card
          id="download-filters"
          style={{
            borderRadius: "12px",
            background: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "none",
            marginBottom: "24px",
          }}
          bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
        >
          <Form
              form={form}
              onFinish={onFinish}
              style={{ marginBottom: "20px" }}
              layout="inline"
            >
              <Row gutter={[16, 16]} style={{ width: "100%" }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="range" style={{ marginBottom: 0 }}>
                    <DatePicker.RangePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      disabledDate={(current) => {
                        return (
                          current &&
                          (current < dayjs("2025-02-01") ||
                            current > dayjs().endOf("day"))
                        );
                      }}
                      onChange={(dates, dateStrings) => {
                        if (dates) {
                          setInitialDate(dateStrings[0]);
                          setFinishDate(dateStrings[1]);
                        } else {
                          clearFilters();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={16}>
                  <Flex gap="small" wrap="wrap">
                    <Button icon={<ClearOutlined />} onClick={clearFilters}>
                      Limpiar
                    </Button>
                    <Button
                      id="download-action"
                      icon={<FileExcelFilled />}
                      type="primary"
                      style={{ background: "#1f3461", color: "white" }}
                      onClick={downloadDataToExcel}
                      loading={loadingExcel}
                      disabled={!initialDate || !finishDate || !status_module}
                    >
                      Descargar reporte (.xlsx)
                    </Button>
                  </Flex>
                </Col>
              </Row>
            </Form>
        </Card>

        {/* Tabla */}
        <Card
          style={{
            borderRadius: "12px",
            background: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "none",
          }}
          bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
        >
          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: "20px" }}
          >
            <span
              style={{
                margin: 0,
                color: "#1F3461",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <TableOutlined style={{ marginRight: 8 }} />
              Registros de Telemetría
            </span>
            <Tag
              style={{
                fontWeight: 600,
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "6px",
                borderColor: "#1F3461",
                color: "#1F3461",
                background: "#f2f5fa",
              }}
            >
              {total} registros
            </Tag>
          </Flex>
          {renderContent()}
        </Card>
      </div>
    </QueueAnim>
  );
};

export default Reports;
