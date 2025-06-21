import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Flex,
  Button,
  Checkbox,
  Table,
  Statistic,
  Select,
  DatePicker,
  Card,
  InputNumber,
  Row,
  Col,
  Typography,
} from "antd";
import { PlusOutlined, DashboardFilled } from "@ant-design/icons";
import moment from "moment";
import { useResponsive } from "../hooks/useResponsive";

const { Title } = Typography;

// --- Constantes ---
const B_CORP_LOGO_URL =
  "https://s3.amazonaws.com/blab-impact-js-production/app/images/es-es/BIA-Logo@2x-6d655d272b0461db5c9c7ce0959a1a71.png";

const OPTIONS = [
  {
    label: "Actualmente la empresa no monitorea ni registra el consumo de agua",
    value: 1,
    score: 0.0,
  },
  {
    label:
      "La empresa monitorea y registra el consumo de agua, pero no tiene metas de reducción establecidas",
    value: 2,
    score: 0.88,
  },
  {
    label:
      "La empresa monitorea y registra el consumo de agua y ha establecido metas de reducción específicas de acuerdo con su desempeño anterior (p. ej., una reducción del consumo de agua del 5% en comparación con el año tomado como referencia)",
    value: 3,
    score: 1.75,
  },
  {
    label:
      "La empresa monitorea y registra el consumo de agua y ha establecido metas específicas con bases científicas que son necesarias para alcanzar un uso sostenible de la cuenca hidrográfica local",
    value: 4,
    score: 2.63,
  },
  {
    label:
      "La empresa ha alcanzado las metas de reducción específicas durante el período evaluado",
    value: 5,
    score: 0.88,
  },
];

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const INITIAL_CONSUMPTION = MONTHS.reduce((acc, month, index) => {
  acc[month] = (index + 1) * 10; // Ejemplo de datos iniciales
  return acc;
}, {});

const FormMultiData = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const { isMobile } = useResponsive();
  const [monthlyConsumption, setMonthlyConsumption] =
    useState(INITIAL_CONSUMPTION);
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [noTracking, setNoTracking] = useState(false);

  const handleConsumptionChange = useCallback((month, value) => {
    setMonthlyConsumption((prev) => ({
      ...prev,
      [month]: value === null ? 0 : value,
    }));
  }, []);

  useEffect(() => {
    const newTotal = noTracking
      ? 0
      : Object.values(monthlyConsumption).reduce(
          (sum, value) => sum + (Number(value) || 0),
          0
        );
    setTotalConsumption(newTotal);

    if (noTracking) {
      const resetValues = MONTHS.reduce((acc, month) => {
        acc[month] = 0;
        return acc;
      }, {});
      setMonthlyConsumption(resetValues);
    }
  }, [monthlyConsumption, noTracking]);

  const handleCheckboxChange = useCallback((checkedValues) => {
    setSelectedOptions(checkedValues);
  }, []);

  const score = useMemo(() => {
    const totalScore = selectedOptions.reduce((acc, value) => {
      const option = OPTIONS.find((opt) => opt.value === value);
      return acc + (option ? option.score : 0);
    }, 0);
    return Math.min(totalScore, 3.5).toFixed(2);
  }, [selectedOptions]);

  return (
    <Flex vertical gap="large">
      <Card
        title="Resumen del Recurso Hídrico"
        extra={
          <Form layout="inline">
            <Form.Item label="Año" style={{ marginBottom: 0 }}>
              <DatePicker
                placeholder="Selecciona un año"
                style={{ width: isMobile ? "120px" : "150px" }}
                picker="year"
                defaultValue={moment().subtract(1, "year")}
                disabledDate={(current) =>
                  current && current > moment().endOf("year")
                }
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary">Filtrar</Button>
            </Form.Item>
          </Form>
        }
      >
        <Card
          title="¿De qué manera se monitorea y se administra el consumo de agua de su empresa?"
          headStyle={{ color: "white", fontSize: isMobile ? "16px" : "20px" }}
          style={{
            background:
              "linear-gradient(169deg, #10728c 0%, #1677ff 99%, #3c575d 100%)",
            marginBottom: "20px",
            color: "white",
            borderRadius: "16px",
          }}
        >
          <Form layout="vertical">
            <Form.Item>
              <div style={{ fontWeight: 300, marginBottom: "16px" }}>
                Seleccione una sola respuesta que indique si la empresa
                monitorea el uso del agua y si establece metas (respuestas 1 a
                4). Si la empresa establece metas, la respuesta 5 también puede
                ser relevante.
              </div>
              <Checkbox.Group
                onChange={handleCheckboxChange}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {OPTIONS.map((option) => (
                  <Checkbox
                    key={option.value}
                    value={option.value}
                    style={{ color: "white" }}
                  >
                    {option.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
            <Flex justify="space-between" align="center">
              <Button>Enviar</Button>
              <Title level={4} style={{ color: "white", margin: 0 }}>
                Puntaje total: {score}
              </Title>
            </Flex>
          </Form>
        </Card>
        <Card
          title="Consumo mensual (m³)"
          bordered={false}
          style={{ background: "#fafafa", borderRadius: "16px" }}
        >
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              {MONTHS.map((month) => (
                <Col xs={12} sm={8} md={6} lg={4} key={month}>
                  <Form.Item
                    label={
                      <span style={{ textTransform: "capitalize" }}>
                        {month}
                      </span>
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      value={monthlyConsumption[month]}
                      onChange={(value) =>
                        handleConsumptionChange(month, value)
                      }
                      min={0}
                      disabled={noTracking}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </Card>
        <Flex justify="center" style={{ marginTop: "24px" }}>
          <Card
            hoverable
            title={<div style={{ color: "white" }}>Consumo total de agua</div>}
            extra={
              <img
                src={B_CORP_LOGO_URL}
                style={{
                  marginTop: "10px",
                  filter: "brightness(0) invert(1)",
                }}
                width="100px"
                alt="B Corp Logo"
              />
            }
            style={{
              width: "100%",
              maxWidth: "600px",
              fontSize: "1rem",
              fontWeight: 400,
              color: "white",
              background:
                "linear-gradient(169deg, #10728c 0%, #1677ff 99%, #3c575d 100%)",
              borderRadius: "16px",
            }}
          >
            <Flex gap="large" vertical={isMobile} align="center">
              <Flex flex={1} justify="center">
                <Statistic
                  title={
                    <div style={{ color: "white", textAlign: "center" }}>
                      Consumo total de agua durante los últimos 12 meses
                    </div>
                  }
                  value={totalConsumption}
                  suffix="m³"
                  valueStyle={{
                    color: "white",
                    fontSize: isMobile ? "2.5rem" : "3rem",
                    textAlign: "center",
                  }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Flex>
              <Flex align="center" justify="center" style={{ width: "100%" }}>
                <Checkbox
                  checked={noTracking}
                  onChange={(e) => setNoTracking(e.target.checked)}
                  style={{ color: "white" }}
                >
                  No hacemos seguimiento de este valor
                </Checkbox>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Card>
    </Flex>
  );
};

export default FormMultiData;
