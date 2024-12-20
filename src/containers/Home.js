import React, { useContext } from "react";
import { Row, Col, Card } from "antd";
import HeaderNav from "../components/home/HeaderNav";
import { useLocation, Routes, Route } from "react-router-dom";
import SiderRight from "../components/home/SiderLeft";
import SiderLeft from "../components/home/SiderRight";
import ListWells from "../components/home/ListWells";
import MyWell from "../components/mywell/MyWell";
import MyGraphics from "../components/graphics/MyGraphics";
import Reports from "../components/reports/Reports";
import DriveInternal from "../components/drive_internal/Drive";
import Indicators from "../components/Indicators/Indicators";
import QueueAnim from "rc-queue-anim";
import Dga from "../components/dga/Dga";

import DocRes from "../components/docres/DocRes";
import Alerts from "../components/alerts/Alerts";

import { AppContext } from "../App";
import {} from "react-router-dom";

const Home = () => {
  const { state } = useContext(AppContext);
  const location = useLocation();

  return (
    <Row>
      <Col span={24}>
        <HeaderNav />
      </Col>
      <Col span={24}>
        <Row align={"top"} justify={"center"}>
          {window.innerWidth > 900 && (
            <>
              <Col span={3} style={{ paddingTop: "10px" }}>
                <SiderRight />
              </Col>
            </>
          )}
          <Col
            span={
              window.innerWidth > 900
                ? location.pathname !== "/graficos"
                  ? 17
                  : 21
                : 24
            }
          >
            <QueueAnim delay={400} duration={1200} type="bottom">
              <div key="home">
                <Row justify="center">
                  <Col span={24}>
                    <Card
                      size={window.innerWidth > 900 ? "default" : "small"}
                      bordered
                      style={{
                        margin: window.innerWidth > 900 && "15px",
                        minHeight: "84vh",
                        boxShadow:
                          "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      }}
                    >
                      <Routes>
                        <Route exact path="/" element={<MyWell />} />

                        <Route
                          exact
                          path="/graficos"
                          element={<MyGraphics />}
                        />
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
                        <Route exact path="/alert" element={<Alerts />} />
                        <Route exact path="/doc" element={<DocRes />} />
                      </Routes>
                    </Card>
                  </Col>
                </Row>
              </div>
            </QueueAnim>
          </Col>
          {window.innerWidth > 900 && (
            <>
              {location.pathname !== "/graficos" && (
                <Col
                  span={window.innerWidth > 900 ? 4 : 24}
                  style={{ paddingTop: "10px" }}
                >
                  <SiderLeft />
                </Col>
              )}
            </>
          )}
        </Row>
      </Col>
    </Row>
  );
};

export default Home;
