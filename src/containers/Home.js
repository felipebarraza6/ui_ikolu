import React, { useContext } from "react";
import { Row, Col, Card, Flex, Affix } from "antd";
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
  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "180px" }}>
        <Affix>
          <SiderRight />
        </Affix>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <HeaderNav />
        <QueueAnim delay={400} duration={1200} type="bottom">
          <div key="home" style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<MyWell />} />
              <Route path="/dga" element={<Dga />} />
              <Route path="/charts" element={<MyGraphics />} />
              <Route path="/reports" element={<DriveInternal />} />
            </Routes>
          </div>
        </QueueAnim>
      </div>
    </div>
  );
};

export default Home;
