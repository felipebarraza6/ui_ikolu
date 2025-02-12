import React from "react";
import { Row, Typography, Col, Table, Input, Button, Upload } from "antd";
const { Title } = Typography;

const DriveInternal = () => {
  return (
    <Row style={{ padding: "20px" }}>
      <Col span={24}>
        <Title level={3}>Documentación y Respaldo</Title>
      </Col>
      <Col span={12} style={{ paddingRight: "10px" }}>
        <Table
          bordered
          columns={[{ title: "#" }, { title: "Nombre" }, { title: "Archivo" }]}
          title={() => "Documentación Cliente"}
          footer={() => (
            <>
              <Input
                placeholder="Nombre archivo"
                style={{ marginBottom: "20px" }}
              />
              <input type="file" />
              <Button
                type="primary"
                size="small"
                style={{ marginLeft: "10px" }}
              >
                Subir
              </Button>
            </>
          )}
        ></Table>
      </Col>
      <Col span={12}>
        <Table
          bordered
          columns={[{ title: "#" }, { title: "Nombre" }, { title: "Archivo" }]}
          title={() => "Documentación Smart Hydro"}
        ></Table>
      </Col>
    </Row>
  );
};

export default DriveInternal;
