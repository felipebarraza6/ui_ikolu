import React from "react";
import { Row, Col, Table, Button, Input } from "antd";
import { CloudDownloadOutlined, UploadOutlined } from "@ant-design/icons";

const DocRes = () => {
  return (
    <Row justify={"space-around"}>
      <Col span={24}>
        <h1>Documentación y Respaldo</h1>
      </Col>
      <Col span={11}>
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            {
              key: "1",
              name: "DA DGA",
              title: "1",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "2",
              name: "Inscripción DA en CBR",
              title: "2",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "3",
              name: "Prueba de bombeo",
              title: "3",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "4",
              name: "Informe mantención pozo",
              title: "4",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
          ]}
          title={() => "Documentación Cliente"}
          columns={[
            { title: "#", dataIndex: "title" },
            { title: "Nombre", dataIndex: "name" },
            { title: "Archivo", dataIndex: "file" },
          ]}
        />
        <br />
        <Input placeholder="Nombre nuevo archivo" />
        <br />
        <br />
        <input type="file" />
        <Button
          type="primary"
          size="small"
          style={{ marginLeft: "10px" }}
          icon={<UploadOutlined />}
        >
          Subir archivo
        </Button>
      </Col>
      <Col span={11}>
        <Table
          size="small"
          bordered
          pagination={false}
          dataSource={[
            {
              key: "1",
              name: "Ficha levantamiento",
              title: "1",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "2",
              name: "Cotización",
              title: "2",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "3",
              name: "OC",
              title: "3",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "4",
              name: "Comprobantes de pago",
              title: "4",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "5",
              name: "Contrato",
              title: "5",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "6",
              name: "Ficha técnica equipos MEE",
              title: "6",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "7",
              name: "Informe técnico",
              title: "7",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
            {
              key: "8",
              name: "Garantías",
              title: "8",
              file: (
                <center>
                  <Button
                    type="link"
                    icon={<CloudDownloadOutlined />}
                    shape="circle"
                    type="primary"
                  />
                </center>
              ),
            },
          ]}
          title={() => "Documentación Smart Hydro"}
          columns={[
            { title: "#", dataIndex: "title" },
            { title: "Nombre", dataIndex: "name" },
            { title: "Archivo", dataIndex: "file" },
          ]}
        />
      </Col>
    </Row>
  );
};

export default DocRes;
