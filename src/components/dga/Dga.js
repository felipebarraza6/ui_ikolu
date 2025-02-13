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

  const processNivel = (nivel_response) => {
    return parseFloat(nivel_response).toFixed(1);
  };

  const processCaudal = (caudal) => {
    return parseFloat(caudal).toFixed(1);
  };

  const processAcum = (acum) => {
    return parseInt(acum);
  };

  const getDataSh = async () => {
    // Fiddctitious data
    const results = [
      {
        id: 1,
        nivel: 5.2,
        caudal: 10.5,
        acumulado: 100,
        fecha: "01-Ene",
        hora: "09:30",
        n_voucher: "ABC123",
      },
      {
        id: 2,
        nivel: 4.8,
        caudal: 9.7,
        acumulado: 150,
        fecha: "02-Ene",
        hora: "10:15",
        n_voucher: "DEF456",
      },
      {
        id: 3,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "03-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
      {
        id: 4,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "04-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
      {
        id: 5,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "05-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
      {
        id: 6,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "06-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
      {
        id: 6,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "07-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
      {
        id: 6,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "08-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
      {
        id: 6,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "09-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
      {
        id: 6,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "10-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
      {
        id: 6,
        nivel: 6.1,
        caudal: 11.2,
        acumulado: 200,
        fecha: "11-Ene",
        hora: "11:45",
        n_voucher: "GHI789",
      },
    ];

    setData(results);
  };

  useEffect(() => {
    getDataSh();
  }, []);

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
