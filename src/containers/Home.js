import React, { useContext } from "react";
import { Row, Col, Card } from "antd";

import HeaderNav from "../components/home/HeaderNav";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SiderRight from "../components/home/SiderLeft";
import SiderLeft from "../components/home/SiderRight";
import ListWells from "../components/home/ListWells";
import MyWell from "../components/mywell/MyWell";
import MyGraphics from "../components/graphics/MyGraphics";
import Reports from "../components/reports/Reports";
import DriveInternal from "../components/drive_internal/Drive";
import Indicators from "../components/Indicators/Indicators";
import Dga from "../components/dga/Dga";
import { AppContext } from "../App";

const Home = () => {
  const { state } = useContext(AppContext);
  return (
    <Row>
      <BrowserRouter>
        <Col span={24}>
          <HeaderNav />
        </Col>
        <Col span={24}>
          <Row align={"top"} justify={"center"}>
            {window.innerWidth > 900 && (
              <Col span={3} style={{ paddingTop: "10px" }}>
                <SiderRight />
              </Col>
            )}
            <Col span={window.innerWidth > 900 ? 17 : 24}>
              <Row justify="center">
                <Col span={24}>
                  <ListWells />
                </Col>
                <Col span={24}>
                  <Card
                    bordered
                    style={{
                      margin: "15px",
                      minHeight: "84vh",
                      boxShadow:
                        "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    }}
                  >
                    <Routes>
                      <Route exact path="/" element={<MyWell />} />

                      <Route exact path="/graficos" element={<MyGraphics />} />
                      <Route
                        exact
                        path="/indicadores"
                        element={<Indicators />}
                      />
                      <Route exact path="/reportes" element={<Reports />} />
                      <Route exact path="/dga" element={<Dga />} />

                      <Route
                        exact
                        path="/docrespaldo"
                        element={<DriveInternal />}
                      />
                    </Routes>
                  </Card>
                </Col>
              </Row>
            </Col>
            {window.innerWidth > 900 && (
              <Col
                span={window.innerWidth > 900 ? 4 : 24}
                style={{ paddingTop: "10px" }}
              >
                <SiderLeft />
              </Col>
            )}
          </Row>
        </Col>
      </BrowserRouter>
    </Row>
  );
};

export default Home;
