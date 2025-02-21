import React, { useContext } from "react";
import { Affix, Flex } from "antd";
import HeaderNav from "../components/home/HeaderNav";
import { Routes, Route } from "react-router-dom";
import SiderRight from "../components/home/SiderLeft";
import SiderLeft from "../components/home/SiderRight";
import MyWell from "../components/mywell/MyWell";
import MyGraphics from "../components/graphics/MyGraphics";
import DriveInternal from "../components/drive_internal/Drive";
import QueueAnim from "rc-queue-anim";
import Dga from "../components/dga/Dga";
import Sma from "../components/Sma";
import PrototypeUmi from "../components/prototype_umi/PrototypeUmi";
import DataTable from "../components/prototype_umi/DataTable";
import Reports from "../components/reports/Reports";
import Well from "../components/mywell/Well";

import TableStandarVerySmall from "../components/mywell/TableStandarVerySmall";
import wallpaper from "../assets/images/walldga.png";

import { AppContext } from "../App";

const Home = () => {
  const { state } = useContext(AppContext);

  return (
    <Flex
      justify="space-between"
      gap={"small"}
      style={{
        background: `url(${wallpaper}) no-repeat center center`,
        minHeight: "100vh",
        height: "100%",
        backgroundSize: "cover",
      }}
    >
      <Flex style={{ width: "13%", paddingLeft: "5px" }}>
        <Affix>
          <SiderRight />
        </Affix>
      </Flex>
      <Flex
        vertical
        style={{
          width:
            state.selected_profile.dga.type_dga === "SUBTERRANEO"
              ? "80%"
              : "90%",
        }}
      >
        <QueueAnim delay={400} duration={1200} type="bottom">
          <HeaderNav />
          <div
            key="home"
            style={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: "10px",
              minHeight: "90vh",
            }}
          >
            <Routes>
              {state.selected_profile.dga.type_dga === "SUBTERRANEO" && (
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
              )}
              {state.selected_profile.dga.type_dga === "SUPERFICIAL" &&
                (state.user.username === "arrocerospti" ? (
                  <Route path="/" element={<PrototypeUmi />} />
                ) : (
                  <Route path="/" element={<Sma />} />
                ))}

              <Route path="/extraction_data" element={<Reports />} />
              <Route path="/dga" element={<Dga />} />
              <Route path="/charts" element={<MyGraphics />} />
              <Route path="/reports" element={<DriveInternal />} />
              <Route path="/registers_pti" element={<DataTable />} />
              <Route path="/well" element={<Well />} />
            </Routes>
          </div>
        </QueueAnim>
      </Flex>
      {state.selected_profile.dga.type_dga === "SUBTERRANEO" && (
        <Flex style={{ width: "25%" }}>
          <SiderLeft />
        </Flex>
      )}
    </Flex>
  );
};

export default Home;
