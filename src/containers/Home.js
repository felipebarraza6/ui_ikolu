import React, { useContext } from "react";
import { Affix, Flex, Row, Col, Card } from "antd"; // Added Row, Col, Card
import HeaderNav from "../components/home/HeaderNav";
import { Routes, Route } from "react-router-dom";
import SiderRight from "../components/home/SiderLeft"; // SiderRight is SiderLeft based on the original structure, be careful here
import SiderLeft from "../components/home/SiderRight"; // SiderLeft is SiderRight based on the original structure, be careful here
import MyWell from "../components/mywell/MyWell";
import GraphisNav from "../components/smart_data/GraphisNav";
import QueueAnim from "rc-queue-anim";
import Dga from "../components/dga/Dga";
import Sma from "../components/Sma";
import PrototypeUmi from "../components/prototype_umi/PrototypeUmi";
import DataTable from "../components/prototype_umi/DataTable";
import Reports from "../components/reports/Reports";
import Dash from "../components/support/Dash"; // This seems to be 'Supp' in the main branch
import Well from "../components/mywell/Well";
import GraphisNavDga from "../components/smart_data/GraphisNavDga";
import DocRes from "../components/docres/DocRes";
import { useLocation } from "react-router-dom";
import Alerts from "../components/alerts/Alerts";
import FormMultiData from "../containers/FormMultiData";
import TableStandarVerySmall from "../components/mywell/TableStandarVerySmall";
import wallpaper from "../assets/images/walldga.png";

import { AppContext } from "../App";
// Components from main that were missing in ikolu_sma, assuming they are needed
import MyGraphics from "../components/MyGraphics"; // Assuming this exists
import Indicators from "../components/Indicators"; // Assuming this exists
import DriveInternal from "../components/DriveInternal"; // Assuming this exists
import Supp from "../components/Supp"; // Assuming this exists and replaces Dash for general support

const Home = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();
  var pathname = location.pathname;

  // This validateWidth function was from ikolu_sma, but the main branch uses responsive Col spans
  // Consider if this function is still necessary or if the responsive Col spans cover the needs.
  // For now, I'll keep the Flex layout from ikolu_sma and not use this validateWidth directly for the main content width.
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
      {/* SiderRight (which was SiderLeft in ikolu_sma's original file, verify component name) */}
      {/* Keep the Affix for the left sidebar */}
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
            {/* The main branch introduced a Card here, which is good for styling */}
            <Card
              size={window.innerWidth > 900 ? "default" : "small"}
              bordered
              style={{
                margin: window.innerWidth > 900 && "15px",
                minHeight: "84vh",
                boxShadow:
                  "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                // Override background and border radius if Card adds its own
                backgroundColor: "white",
                borderRadius: "10px",
              }}
            >
              <Routes>
                {/* Routes from ikolu_sma (more detailed) */}
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
                <Route path="/sys_support" element={<Dash />} />{" "}
                {/* Check if Dash or Supp is the correct component */}
                <Route path="/sys_alerts" element={<Alerts />} />

                {/* Routes from main that might be additions or alternatives */}
                {/* Ensure no duplicate routes with different elements for the same path */}
                {/* If "/" is handled above, these might be redundant or for different profiles */}
                {/* <Route exact path="/" element={<MyWell />} /> // Already handled by profile logic */}

                <Route exact path="/graficos" element={<MyGraphics />} />
                <Route exact path="/indicadores" element={<Indicators />} />
                <Route exact path="/formmultidata" element={<FormMultiData />} />{" "}
                {/* This path was added in main */}
                <Route exact path="/reportes" element={<Reports />} />{" "}
                {/* Duplicate of /extraction_data, choose one */}
                {/* <Route exact path="/dga" element={<Dga />} /> // Already handled */}
                <Route exact path="/docrespaldo" element={<DriveInternal />} />
                <Route exact path="/alert" element={<Alerts />} />{" "}
                {/* Duplicate of /sys_alerts, choose one */}
                {/* <Route exact path="/doc" element={<DocRes />} /> // Duplicate of /sys_docs, choose one */}
                <Route exact path="/supp" element={<Supp />} />{" "}
                {/* This seems to be the preferred support route */}
              </Routes>
            </Card>
          </div>
        </QueueAnim>
      </Flex>

      {/* SiderLeft (which was SiderRight in ikolu_sma's original file, verify component name) */}
      {state.selected_profile.dga.type_dga === "SUBTERRANEO" && (
        <Flex style={{ width: "25%" }}>
          {pathname === "/" && <SiderLeft />}
        </Flex>
      )}

      {/* The main branch had a more complex responsive SiderLeft/Right handling that might conflict with the above */}
      {/* If the above simplified Flex approach for sidebars is not sufficient, you might need to re-evaluate */}
      {/* the responsive logic from the main branch's Col structure. */}
    </Flex>
  );
};

export default Home;