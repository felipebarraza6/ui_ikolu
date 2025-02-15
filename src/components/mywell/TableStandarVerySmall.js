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
  Tag,
  Button,
} from "antd";

import {
  CloudUploadOutlined,
  SecurityScanFilled,
  DeleteFilled,
  ClearOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import { QRCodeCanvas } from "qrcode.react";
import api from "../../api/sh/endpoints";
import QueueAnim from "rc-queue-anim";

const { Title, Text } = Typography;

const TableStandarVerySmall = () => {
  const [form] = Form.useForm();
  const [count, setCount] = useState(0);
  const [dataForm, setDataForm] = useState([]);
  const { state } = useContext(AppContext);

  const dateStep = () => {
    const currentDate = new Date();
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const timeLeft = endOfYear - currentDate;
    const timeLeftMonth = endOfMonth - currentDate;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    const remainingDays = days % 30;
    const remainingWeeks = weeks % 4;
    const remainingMonths = months % 12;
    const remainingDaysMonth = days % 7;
    const remainingDaysWeek = days % weeks;

    return (
      <Row>
        <Col span={24}>
          <Title level={5} style={{ fontSize: "12px", marginTop: "4px" }}>
            Ingresar información en: <br />
          </Title>
          <Title
            level={5}
            style={{
              marginTop: "-10px",
              textIndent: "3px",
              fontSize: "12px",
              color: "grey",
            }}
          >
            {state.selected_profile.standard === "CAUDALES_MUY_PEQUENOS" && (
              <>
                {remainingMonths} Meses, {remainingWeeks} semanas y{" "}
                {remainingDays} días
              </>
            )}
            {state.selected_profile.standard === "MENOR" && (
              <>
                {remainingDaysWeek} semanas y {remainingDaysMonth} días
              </>
            )}
          </Title>
        </Col>
      </Row>
    );
  };

  const getData = async () => {
    const rq = await api.get_data_sh(state.selected_profile.id).then((res) => {
      setDataForm(res.results);
    });
  };

  const deleteData = async (id) => {
    const rq = await api.delete_data_sh(id).then((res) => {
      notification.success({
        message: "Eliminado",
        description: "Registro eliminado correctamente",
      });
      getData();
      setCount(count + 1);
    });
  };

  const createData = async (values) => {
    const rq = await api.create_data_sh(values).then((res) => {
      notification.success({
        message: "Guardado",
        description: "Registro guardado correctamente",
      });
      console.log(res);
      setCount(count + 1);
    });
  };

  const groupedByYear = dataForm.reduce((acc, record) => {
    const year = new Date(record.date_time_medition).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(record);
    return acc;
  }, {});

  const hasMoreThanTwoRecordsPerYear = Object.values(groupedByYear).some(
    (records) => records.length >= 2
  );

  console.log();

  useEffect(() => {
    getData();
  }, [count]);

  return (
    <Col xl={24} lg={24} xs={24}>
      <QueueAnim delay={300} type="top">
        <div key="registers">
          <Row>
            <Col span={24}>
              <Title level={4} style={{ marginBottom: "20px" }}>
                Formulario de mediciones
              </Title>
              <Form
                layout="inline"
                initialValues={{
                  nivel:
                    state.selected_profile.standard === "CAUDALES_MUY_PEQUENOS"
                      ? 0.0
                      : "",
                  flow: 0.0,
                }}
                form={form}
                onFinish={(values) => {
                  values = {
                    ...values,
                    profile_client: state.selected_profile.id,
                    flow: parseFloat(values.flow),
                    nivel: parseFloat(values.nivel),
                    total: parseInt(values.total),
                    date_time_medition: values.date_time_medition.format(
                      "YYYY-MM-DD HH:mm:ss"
                    ),
                  };
                  createData(values);

                  form.resetFields();
                }}
              >
                <Row>
                  <Col>
                    Fecha de captación
                    <Form.Item
                      name="date_time_medition"
                      rules={[{ required: true, message: "Ingresa la fecha" }]}
                    >
                      <DatePicker
                        placeholder="Selecciona una fecha"
                        style={{ width: "200px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    Caudal
                    <Form.Item
                      name="flow"
                      rules={[{ required: true, message: "Ingesa el caudal" }]}
                    >
                      <Input
                        style={{ width: "100px" }}
                        placeholder="0.0"
                        suffix={"l/s"}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    Nivel freático
                    <Form.Item
                      name="nivel"
                      rules={[{ required: true, message: "Ingesa el nivel" }]}
                    >
                      <Input
                        style={{ width: "100px" }}
                        placeholder="0.0"
                        suffix={"m"}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    Totalizado
                    <Form.Item
                      name="total"
                      rules={[{ required: true, message: "Ingesa el total" }]}
                    >
                      <Input
                        style={{ width: "150px" }}
                        placeholder="0"
                        suffix={"m³"}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item>
                      <Row
                        justify={"center"}
                        align={"middle"}
                        style={{ minHeight: "80px", minWidth: "220px" }}
                      >
                        <Col span={12}>
                          <Button
                            type="primary"
                            icon={<CloudUploadOutlined />}
                            htmlType="submit"
                          >
                            Guardar
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            icon={<ClearOutlined />}
                            onClick={() => form.resetFields()}
                          >
                            Limpiar
                          </Button>
                        </Col>
                      </Row>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col span={24}>{dateStep()}</Col>
            <Col span={18} style={{ marginTop: "10px", paddingRight: "10px" }}>
              <Table
                size="small"
                bordered
                columns={[
                  {
                    title: "Fecha",
                    dataIndex: "date_time_medition",
                    render: (date) => new Date(date).toLocaleDateString(1),
                  },
                  {
                    title: "Caudal(l/s)",
                    dataIndex: "flow",
                    render: (flow) => parseFloat(flow).toFixed(1),
                  },
                  {
                    title: "Nivel freatico(m)",
                    dataIndex: "nivel",
                    render: (nivel) => parseFloat(nivel).toFixed(1),
                  },
                  {
                    title: "Totalizado(m³)",
                    dataIndex: "total",
                    render: (total) => parseInt(total).toLocaleString("es-ES"),
                  },
                  {
                    render: (x) => (
                      <>
                        {!x.is_send_dga ? (
                          <Button
                            danger
                            type="primary"
                            size="small"
                            icon={<DeleteFilled />}
                            onClick={() => deleteData(x.id)}
                          >
                            Eliminar
                          </Button>
                        ) : (
                          <Tag
                            icon={<CheckCircleFilled />}
                            color={"green-inverse"}
                          >
                            REGISTRO ENVIADO A DGA
                          </Tag>
                        )}
                      </>
                    ),
                  },
                ]}
                dataSource={dataForm}
              />
            </Col>
            <Col span={6}>
              <Row justify={"center"}>
                <Col>
                  <Tooltip
                    style={{}}
                    color="#1F3461"
                    title={
                      <Text style={{ color: "white" }}>
                        Los siguientes datos son proporcionados por la DGA,
                        respecto a dudas o iconsistencias: ponte en contacto con{" "}
                        <b>soporte@smarthydro.cl</b>
                      </Text>
                    }
                  >
                    <Button
                      icon={<SecurityScanFilled />}
                      type="primary"
                      block
                      onClick={() => {
                        window.open(
                          `https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.code_dga_site}`,
                          "_blank"
                        );
                      }}
                    >
                      {state.selected_profile.code_dga_site}
                    </Button>
                  </Tooltip>
                  <center>
                    {state.selected_profile.code_dga_site ? (
                      <QRCodeCanvas
                        size={170}
                        style={{ marginTop: "10px" }}
                        value={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${state.selected_profile.code_dga_site}`}
                      />
                    ) : (
                      <b style={{ color: "red" }}>SIN CODIGO DE OBRA</b>
                    )}
                  </center>
                </Col>
                <Col></Col>
              </Row>
            </Col>
          </Row>
        </div>
      </QueueAnim>
    </Col>
  );
};

export default TableStandarVerySmall;
