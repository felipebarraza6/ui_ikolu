import React, { useContext } from "react";
import { Affix, Flex } from "antd";
import HeaderNav from "../components/home/HeaderNav";
import { Routes, Route } from "react-router-dom";
import SiderRight from "../components/home/SiderLeft";
import SiderLeft from "../components/home/SiderRight";
import MyWell from "../components/mywell/MyWell";
import GraphisNav from "../components/smart_data/GraphisNav";
import DriveInternal from "../components/drive_internal/Drive";
import QueueAnim from "rc-queue-anim";
import Dga from "../components/dga/Dga";
import Sma from "../components/Sma";
import PrototypeUmi from "../components/prototype_umi/PrototypeUmi";
import DataTable from "../components/prototype_umi/DataTable";
import Reports from "../components/reports/Reports";
import Well from "../components/mywell/Well";
import GraphisNavDga from "../components/smart_data/GraphisNavDga";
import DocRes from "../components/docres/DocRes";
import { useLocation } from "react-router-dom";

import TableStandarVerySmall from "../components/mywell/TableStandarVerySmall";
import wallpaper from "../assets/images/walldga.png";

import { AppContext } from "../App";

const Home = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();
  var pathname = location.pathname;

  const validateWidth = () => {
    if (pathname !== "/dga" && pathname !== "/sys_data") {
      return { width: "100%" };
    } else {
      return "98%";
    }
  };

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
      <Flex vertical style={{ width: "100%", padding: " 5px" }}>
        <QueueAnim delay={400} duration={1200} type="bottom">
          <HeaderNav />
          <div
            key="home"
            style={{
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
              <Route path="/registers_pti" element={<DataTable />} />
              <Route path="/well" element={<Well />} />
              <Route path="/sys_data" element={<GraphisNav />} />
              <Route path="/sys_data_dga" element={<GraphisNavDga />} />
              <Route path="/sys_docs" element={<DocRes />} />
            </Routes>
          </div>
        </QueueAnim>
      </Flex>
      {state.selected_profile.dga.type_dga === "SUBTERRANEO" && (
        <Flex style={{ width: "25%" }}>
          {pathname !== "/dga" && pathname === "/" && <SiderLeft />}
        </Flex>
      )}
    </Flex>
  );
};

export default Home;
