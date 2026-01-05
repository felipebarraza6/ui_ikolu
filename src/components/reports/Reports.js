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
  Tabs, // Added Tabs for the 'main' branch logic, but will be removed if 'ikolu_sma' is chosen
  Tooltip, // Added missing Tooltip import
  ConfigProvider,
  Flex,
} from "antd";
import { AppContext } from "../../App";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";
import {
  TableOutlined,
  FileExcelFilled,
  ClearOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import sh from "../../api/sh/endpoints";
import QueueAnim from "rc-queue-anim";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../../utils/numberFormatter";

// Configurar dayjs para español
dayjs.locale("es");

const { Title } = Typography;

const Reports = () => {
  const { state } = useContext(AppContext);
  const status_module = state.selected_profile.profile_ikolu.m3;
  // console.log(status_module); // Removed console.log
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]); // This state is not used in the ikolu_sma branch
  const [loadingTab1, setLoadingTab1] = useState(false);
  const [initialDate, setInitialDate] = useState("");
  const [finishDate, setFinishDate] = useState("");

  const [loadingExcel, setLoadingExcel] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // Removido: const numberForMiles = new Intl.NumberFormat("de-DE");
  // Ahora usamos las funciones globales de formateo

  const [form] = Form.useForm();

  // The following functions (processLevel, processFlow, processAccumulated)
  // are part of a merge conflict and are commented out to prioritize
  // the 'ikolu_sma' branch's data fetching logic.
  // If these processing steps are needed, they should be carefully
  // re-integrated and tested.

  // const processLevel = (level_response) => {
  //   if (level_response > 0.0 && level_response < position_sensor_nivel) {
  //     return parseFloat(position_sensor_nivel - level_response).toFixed(1);
  //   } else if (level_response > position_sensor_nivel || level_response < 0.0) {
  //     level_response = 50.0;
  //     return parseFloat(position_sensor_nivel - level_response).toFixed(1);
  //   } else {
  //     level_response = 0.0;
  //     return parseFloat(position_sensor_nivel - level_response).toFixed(1);
  //   }
  // };

  // const processFlow = (flow) => {
  //   const flowValue = parseFloat(flow).toFixed(1);
  //   if (flowValue > 0.5) {
  //     return flowValue;
  //   } else if (flowValue < 0.0) {
  //     return 0.0;
  //   } else {
  //     return parseFloat(0.0).toFixed(1);
  //   }
  // };

  // const processAccumulated = (accumulated, last_total) => {
  //   console.log(last_total);
  //   const accumulatedValue = parseInt(accumulated);
  //   if (accumulatedValue > 0) {
  //     return accumulatedValue;
  //   } else {
  //     return last_total;
  //   }
  // };

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
      // Get the data for the requested page
      const rq = await sh.get_data_sh_range(
        state.selected_profile.id,
        initialDate,
        finishDate,
        page
      );
      console.log("🔍 Datos del backend (primer registro):", rq.results[0]);
      console.log("🔍 Claves disponibles:", rq.results[0] ? Object.keys(rq.results[0]) : []);
      setData(rq.results);
      setTotal(rq.count);

      // The following data processing logic was present in the 'main' branch
      // but is excluded here to resolve the merge conflict and adhere to 'ikolu_sma'.
      // If this processing is required, it should be re-implemented and tested.
      // const updatedResults = rq.results.map((item, index) => {
      //   const nextTotal = rq.results[index + 1] ? rq.results[index + 1].total : 0;
      //   const previusTotal = rq.results[index - 1]
      //     ? rq.results[index - 1].total
      //     : 0;
      //   var currentTotal = item.total;
      //   if (currentTotal < 0) {
      //     currentTotal = previusTotal;
      //   } else {
      //     currentTotal = item.total;
      //   }

      //   var total_hora = currentTotal - nextTotal;

      //   if (total_hora > item.total) {
      //     total_hora = 0;
      //   }

      //   return {
      //     ...item,
      //     date_time_medition_hour: item.date_time_medition.slice(11, 16),
      //     level: processLevel(item.level),
      //     flow: processFlow(item.flow),
      //     total: processAccumulated(item.total, previusTotal),
      //     total_hora: index === rq.results.length - 1 ? 0 : total_hora,
      //     date_time_medition: item.date_time_medition.slice(0, 10),
      //   };
      // });

      // const sumTotal = updatedResults.reduce((acc, item) => {
      //   const currentDate = item.date_time_medition.slice(0, 10);
      //   const existingItem = acc.find((el) => el.date === currentDate);

      //   if (existingItem) {
      //     existingItem.total_hora += item.total_hora;
      //   } else {
      //     acc.push({
      //       ...item,
      //       total_hora: item.total_hora,
      //       date: currentDate,
      //     });
      //   }

      //   return acc;
      // }, []);
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
    // No hacer nada si las fechas no están seleccionadas
    if (!initialDate || !finishDate) {
      setData([]); // Limpiar datos si no hay rango
      setTotal(0);
      return;
    }
    getData();
  }, [page, initialDate, finishDate, state.selected_profile.id]);

  // Función para generar columnas dinámicamente basadas en las variables configuradas
  const getTableColumns = () => {
    const variables = state.selected_profile.config_data?.variables || [];

    console.log("📊 Variables configuradas:", variables);

    // Columna de fecha siempre presente
    const columns = [
      {
        title: "Fecha",
        dataIndex: "date_time_medition",
        render: (date) => {
          return dayjs(date).format("YYYY-MM-DD HH:mm");
        },
      },
    ];

    // Agregar columnas basadas en las variables configuradas
    variables.forEach((variable) => {
      console.log(`  📌 Procesando variable: ${variable.label} (${variable.type_variable})`);

      switch (variable.type_variable) {
        case "CAUDAL":
          columns.push({
            title: variable.label || "Caudal (L/s)",
            dataIndex: "flow",
          });
          break;
        case "CAUDAL_PROMEDIO":
          columns.push({
            title: variable.label || "Caudal Promedio (L/s)",
            dataIndex: "flow",
          });
          break;
        case "NIVEL":
          // Si viene NIVEL, mostrar ambas columnas usando el mismo dato
          columns.push({
            title: variable.label || "Nivel (m)",
            dataIndex: "nivel",
          });
          columns.push({
            title: "Nivel Freático (m)",
            dataIndex: "water_table",
          });
          break;
        case "NIVEL_FREATICO":
          columns.push({
            title: variable.label || "Nivel Freático (m)",
            dataIndex: "water_table",
          });
          break;
        case "TOTALIZADO":
          // Si existe TOTALIZADO, agregamos columnas de acumulado
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
          console.log(`  ⚠️ Tipo de variable no reconocido: ${variable.type_variable}`);
          break;
      }
    });

    console.log("📊 Columnas generadas:", columns.map(c => c.title));
    return columns;
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
      <div key="reports">
        <Title level={2}>Descarga de Datos</Title>
        <ConfigProvider locale={locale}>
          <Form
            form={form}
            onFinish={onFinish}
            style={{ marginBottom: "20px" }}
            layout="inline"
          >
            <Row gutter={[16, 16]} style={{ width: "100%" }}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="range">
                  <DatePicker.RangePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      return (
                        current &&
                        (current < dayjs().startOf("year") ||
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
        </ConfigProvider>
        {renderContent()}
      </div>
    </QueueAnim>
  );
};

export default Reports;
