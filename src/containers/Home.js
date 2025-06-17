import React, { useContext } from "react";
import { Layout, Menu, Button, Affix } from "antd";
import {
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Outlet, Link, Routes, Route, useLocation } from "react-router-dom";
import logo from "../assets/images/logozivo.png";
import HeaderNav from "../components/home/HeaderNav";
import SiderRight from "../components/home/SiderLeft";
import SiderLeft from "../components/home/SiderRight";
import MyWell from "../components/mywell/MyWell";
import GraphisNav from "../components/smart_data/GraphisNav";
import QueueAnim from "rc-queue-anim";
import Dga from "../components/dga/Dga";
import Sma from "../components/Sma";
import PrototypeUmi from "../components/prototype_umi/PrototypeUmi";
import DataTable from "../components/prototype_umi/DataTable";
import Reports from "../components/reports/Reports";
import Dash from "../components/support/Dash";
import Well from "../components/mywell/Well";
import GraphisNavDga from "../components/smart_data/GraphisNavDga";
import DocRes from "../components/docres/DocRes";
import Alerts from "../components/alerts/Alerts";
import FormMultiData from "../containers/FormMultiData";
import TableStandarVerySmall from "../components/mywell/TableStandarVerySmall";
import { AppContext } from "../App";
import MyGraphics from "../components/graphics/MyGraphics";
import Supp from "../components/home/Supp";

const { Header, Sider, Content, Footer } = Layout;

const Home = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();
  var pathname = location.pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: "#1F3461",
          minHeight: "100vh",
          position: "fixed",
          left: 0,
          zIndex: 100,
        }}
      >
        <div style={{ padding: 24, textAlign: "center" }}>
          <img src={logo} alt="Logo" style={{ width: 60, marginBottom: 16 }} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ background: "#1F3461" }}
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/">Telemetría</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<BarChartOutlined />}>
            <Link to="/analisis">Smart Análisis</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<FileTextOutlined />}>
            <Link to="/dga">DGA - MEE</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<BarChartOutlined />}>
            <Link to="/dga-analisis">DGA Análisis</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<DownloadOutlined />}>
            <Link to="/descarga">Descarga </Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<FileTextOutlined />}>
            <Link to="/documentos">Documentos</Link>
          </Menu.Item>
          <Menu.Item key="7" icon={<AlertOutlined />}>
            <Link to="/alertas">Alertas</Link>
          </Menu.Item>
          <Menu.Item key="8" icon={<CustomerServiceOutlined />}>
            <Link to="/soporte">Soporte</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Layout principal */}
      <Layout style={{ marginLeft: 200, minHeight: "100vh" }}>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px #f0f1f2",
          }}
        >
          <div style={{ width: "100%" }}>
            <HeaderNav />
          </div>
        </Header>

        {/* Contenido principal */}
        <Content
          style={{
            margin: "24px 16px 0",
            overflow: "auto",
            background: "#fff",
            borderRadius: 8,
            minHeight: "80vh",
            padding: window.innerWidth < 900 ? 8 : 24,
          }}
        >
          <div
            key="home"
            style={{
              borderRadius: "10px",
              minHeight: "90vh",
            }}
          >
            <Routes>
              {/* Telemetría */}
              <Route
                path="/"
                element={
                  state.selected_profile.dga.type_dga === "SUBTERRANEO" ? (
                    state.selected_profile.dga.standard ===
                    "CAUDALES_MUY_PEQUENOS" ? (
                      <TableStandarVerySmall data={state.selected_profile} />
                    ) : (
                      <MyWell />
                    )
                  ) : state.user.username === "arrocerospti" ? (
                    <PrototypeUmi />
                  ) : (
                    <Sma />
                  )
                }
              />
              {/* Smart Análisis */}
              <Route path="/analisis" element={<GraphisNav />} />
              {/* DGA - MEE */}
              <Route path="/dga" element={<Dga />} />
              {/* DGA Análisis */}
              <Route path="/dga-analisis" element={<GraphisNavDga />} />
              {/* Descarga */}
              <Route path="/descarga" element={<Reports />} />
              {/* Documentos */}
              <Route path="/documentos" element={<DocRes />} />
              {/* Alertas */}
              <Route path="/alertas" element={<Alerts />} />
              {/* Soporte */}
              <Route path="/soporte" element={<Dash />} />
              {/* Rutas adicionales existentes */}
              <Route path="/extraction_data" element={<Reports />} />
              <Route path="/registers_pti" element={<DataTable />} />
              <Route path="/well" element={<Well />} />
              <Route path="/sys_data" element={<GraphisNav />} />
              <Route path="/sys_data_dga" element={<GraphisNavDga />} />
              <Route path="/sys_docs" element={<DocRes />} />
              <Route path="/sys_support" element={<Dash />} />
              <Route path="/sys_alerts" element={<Alerts />} />
              <Route exact path="/graficos" element={<MyGraphics />} />
              <Route exact path="/formmultidata" element={<FormMultiData />} />
              <Route exact path="/reportes" element={<Reports />} />
              <Route exact path="/supp" element={<Supp />} />
            </Routes>
          </div>
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: "center",
            background: "#fff",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          Smart Hydro ©{new Date().getFullYear()} | Soporte:
          soporte@smarthydro.cl
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Home;
