import React, { useContext } from "react";
import { Row, Col, Card } from "antd";
import HeaderNav from "../components/home/HeaderNav";
import { useLocation, Routes, Route } from "react-router-dom";
import SiderRight from "../components/home/SiderLeft";
import SiderLeft from "../components/home/SiderRight";
import MyWell from "../components/mywell/MyWell";
import MyGraphics from "../components/graphics/MyGraphics";
import Reports from "../components/reports/Reports";
import DriveInternal from "../components/drive_internal/Drive";
import Indicators from "../components/Indicators/Indicators";
import QueueAnim from "rc-queue-anim";
import Dga from "../components/dga/Dga";
import Supp from "../components/home/Supp";

import DocRes from "../components/docres/DocRes";
import Alerts from "../components/alerts/Alerts";
import Sma from "../components/Sma";

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

      <Col span={4}>
        <SiderRight />
      </Col>
      <Col span={20}>
        <QueueAnim delay={400} duration={1200} type="bottom">
          <div key="home">
            <Row justify="center">
              <Col span={24}>
                <Card
                  size={window.innerWidth > 900 ? "default" : "small"}
                  bordered
                  style={{
                    margin: window.innerWidth > 900 && "10px",
                    minHeight: "84vh",
                    boxShadow:
                      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Sma />} />
                  </Routes>
                </Card>
              </Col>
            </Row>
          </div>
        </QueueAnim>
      </Col>
    </Row>
  );
};

export default Home;
