import React, { useState } from "react";
import {
  Table,
  Col,
  Typography,
  Form,
  Row,
  Input,
  DatePicker,
  Statistic,
  InputNumber,
  Button,
} from "antd";

import {
  CloudUploadOutlined,
  CheckOutlined,
  DeleteFilled,
} from "@ant-design/icons";
const { Countdown } = Statistic;

const { Title } = Typography;

const TableStandarVerySmall = ({ data }) => {
  const [form] = Form.useForm();
  const [dataForm, setDataForm] = useState([]);

  const dateStep = () => {
    const currentDate = new Date();
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
    const timeLeft = endOfYear - currentDate;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const remainingDays = days % 30;
    const remainingWeeks = weeks % 4;
    const remainingMonths = months % 12;

    return (
      <>
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
          {remainingMonths} Meses, {remainingWeeks} semanas y {remainingDays}{" "}
          días
        </Title>
      </>
    );
  };

  console.log(dataForm);

  return (
    <Col xl={24} lg={24} xs={24}>
      <Row>
        <Col span={24}>
          <Title level={4} style={{ marginBottom: "20px" }}>
            Formulario para caudales muy pequeños
          </Title>
          <Form
            layout="inline"
            form={form}
            onFinish={(values) => {
              values = {
                ...values,
                flow: parseFloat(values.flow).toFixed(1),
                nivel: parseFloat(values.nivel).toFixed(1),
                total: parseInt(values.total),
                date_time_medition:
                  values.date_time_medition.format("YYYY-MM-DD"),
              };
              setDataForm([...dataForm, values]);
              form.resetFields();
            }}
          >
            <Form.Item name="date_time_medition">
              <DatePicker
                placeholder="Fecha de captación"
                style={{ width: "200px" }}
              />
            </Form.Item>

            <Form.Item label="Caudal" name="flow">
              <InputNumber
                style={{ width: "65px" }}
                placeholder="0.0"
                step={0.1}
                parser={(value) => parseFloat(value)}
                suffix="l/s"
              />
            </Form.Item>
            <Form.Item label="Nivel freático" name="nivel">
              <InputNumber
                style={{ width: "60px" }}
                placeholder="0.0"
                step={0.1}
                suffix="m"
                parser={(value) => parseFloat(value)}
              />
            </Form.Item>
            <Form.Item label="Totalizado" name="total">
              <Input style={{ width: "80px" }} placeholder="0" suffix={"m³"} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                htmlType="submit"
              >
                Cargar registro
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col>{dateStep()}</Col>
        <Col span={24} style={{ marginTop: "20px" }}>
          <Table
            bordered
            columns={[
              { title: "Fecha", dataIndex: "date_time_medition" },
              {
                title: "Caudal(l/s)",
                dataIndex: "flow",
              },
              {
                title: "Nivel freatico(m)",
                dataIndex: "nivel",
              },
              { title: "Totalizado(m³)", dataIndex: "total" },
              {
                render: () => (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      style={{ marginRight: "10px" }}
                      icon={<CheckOutlined />}
                    >
                      Validar
                    </Button>
                    <Button
                      danger
                      type="primary"
                      size="small"
                      icon={<DeleteFilled />}
                    >
                      Eliminar
                    </Button>
                  </>
                ),
              },
            ]}
            dataSource={dataForm}
          />
        </Col>
      </Row>
    </Col>
  );
};

export default TableStandarVerySmall;
