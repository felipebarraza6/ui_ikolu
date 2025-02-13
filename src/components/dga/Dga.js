import React, { useEffect, useContext, useState } from "react";
import {
  Row,
  Col,
  Table,
  Typography,
  Statistic,
  Card,
  Tag,
  Button,
} from "antd";
import { QrcodeOutlined, LinkOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Countdown } = Statistic;

const Dga = () => {
  const [data, setData] = useState([]);

  useEffect(() => {}, []);

  return (
    <div>
      <Row align="top" justify="space-between" style={{ padding: "20px" }}>
        <Col span={24}></Col>
        <Col span={12}>
          <Table
            style={{ borderRadius: "20px" }}
            bordered
            pagination={false}
            size="small"
            dataSource={data}
            columns={[
              {
                title: "Fecha",
                dataIndex: "fecha",
                width: "50%",
                fixed: "top",
              },
              { title: "Hora", dataIndex: "hora", width: "10%" },
              { title: "Caudal(L/s)", dataIndex: "caudal" },
              { title: "N.Freático(m)", dataIndex: "nivel" },
              { title: "Acumulado(m³)", dataIndex: "acumulado", width: "10%" },
              {
                title: "Comprobante ingreso DGA",
                render: (obj) => (
                  <div>
                    <span>ref: #{obj.id}</span>
                  </div>
                ),
              },
            ]}
          />
        </Col>
        <Col span={12}>
          <Row justify={"center"}>
            <Card
              hoverable
              title={"OB-123-123"}
              extra={<Tag color="blue">Mayor</Tag>}
            >
              <Countdown
                title="Tiempo restante para enviar a DGA"
                value={Date.now() + 1000 * 60 * 60}
              />
              <QrcodeOutlined style={{ fontSize: "250px" }} />
              <br />
              <center>
                <Button icon={<LinkOutlined />} type={"primary"}>
                  {" "}
                  DGA(OB-123-123)
                </Button>
              </center>
            </Card>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Dga;
