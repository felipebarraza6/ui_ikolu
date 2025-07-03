import React from "react";
import { InputNumber, Row, Col, Typography, Form } from "antd";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const MonthlyConsumptionTable = ({ monthly, onChange }) => {
  const { t, i18n } = useTranslation();
  // Nombres de meses traducidos
  const months =
    i18n.language === "es"
      ? [
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
        ]
      : i18n.language === "en"
      ? [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]
      : [
          "一月",
          "二月",
          "三月",
          "四月",
          "五月",
          "六月",
          "七月",
          "八月",
          "九月",
          "十月",
          "十一月",
          "十二月",
        ];

  return (
    <div style={{ padding: 12 }}>
      <Form layout="vertical">
        <Row gutter={[16, 16]}>
          {months.map((month, idx) => (
            <Col xs={12} sm={8} md={6} lg={4} key={month}>
              <Form.Item
                label={
                  <span style={{ textTransform: "capitalize" }}>{month}</span>
                }
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  value={monthly[idx]}
                  onChange={(value) => onChange(idx, value || 0)}
                  min={0}
                  suffix="m³"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  }
                  parser={(value) => value.replace(/\$\s?|,*/g, "")}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </div>
  );
};

export default MonthlyConsumptionTable;
