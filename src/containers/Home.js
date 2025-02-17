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
import TableStandarVerySmall from "../components/mywell/TableStandarVerySmall";
import wallpaper from "../assets/images/walldga.png";

import { AppContext } from "../App";

const Home = () => {
  const { state } = useContext(AppContext);
  console.log(state);
  return (
    <div
      style={{
        display: "flex",
        background: `url(${wallpaper})`,
        backgroundSize: "cover",
      }}
    >
      <div style={{ width: "150px" }}>
        <Affix>
          <SiderRight />
        </Affix>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <HeaderNav />
        <QueueAnim delay={400} duration={1200} type="bottom">
          <div key="home" style={{ backgroundColor: "white" }}>
            <Routes>
              <Route
                path="/"
                element={
                  state.selected_profile.dga.standard ===
                  "CAUDALES_MUY_PEQUENOS" ? (
                    <TableStandarVerySmall data={state.selected_profile} />
                  ) : (
                    <MyWell />
                  )
                }
              />
              <Route path="/dga" element={<Dga />} />
              <Route path="/charts" element={<MyGraphics />} />
              <Route path="/reports" element={<DriveInternal />} />
            </Routes>
          </div>
        </QueueAnim>
      </div>
      <div style={{ width: "250px", minHeight: "100vh" }}>
        <SiderLeft />
      </div>
    </div>
  );
};

export default Home;
