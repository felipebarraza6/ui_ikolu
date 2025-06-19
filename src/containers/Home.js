import React, { useContext, useState, useEffect } from "react";
import { Layout, Menu, Button, Flex } from "antd";
import {
  HomeOutlined,
  BarChartOutlined,
  FileTextOutlined,
  WifiOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Outlet, Link, Routes, Route, useLocation } from "react-router-dom";
import logo from "../assets/images/logozivo.png";
import HeaderNav from "../components/home/HeaderNav";
import MyWell from "../components/mywell/MyWell";
import GraphisNav from "../components/smart_data/GraphisNav";
import ResponsiveSmartAnalysis from "../components/smart_data/ResponsiveSmartAnalysis";
import ResponsiveDga from "../components/dga/ResponsiveDga";
import Sma from "../components/Sma";
import PrototypeUmi from "../components/prototype_umi/PrototypeUmi";
import DataTable from "../components/prototype_umi/DataTable";
import Reports from "../components/reports/Reports";
import Dash from "../components/support/Dash";
import Well from "../components/mywell/Well";
import GraphisNavDga from "../components/smart_data/GraphisNavDga";
import DocRes from "../components/docres/DocRes";
import ResponsiveAlerts from "../components/alerts/ResponsiveAlerts";
import FormMultiData from "../containers/FormMultiData";
import TableStandarVerySmallResponsive from "../components/mywell/TableStandarVerySmallResponsive";
import { AppContext } from "../App";
import MyGraphics from "../components/graphics/MyGraphics";
import Supp from "../components/home/Supp";
import minLogo from "../assets/images/logo-blanco.png";

const { Header, Sider, Content, Footer } = Layout;

const Home = () => {
  const { state } = useContext(AppContext);
  let location = useLocation();
  var pathname = location.pathname;

  // 🔧 FIX: Estado para manejar responsividad
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* 🔧 CSS crítico para móvil */}
      {isMobile && (
        <style>{`
          .ant-layout-sider {
            display: none !important;
            width: 0 !important;
          }
          .ant-layout {
            margin-left: 0 !important;
          }
          body {
            overflow-x: hidden !important;
          }
          /* 🔧 FIX: Asegurar que el contenido esté posicionado correctamente */
          .mobile-content {
            position: relative;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1;
          }
        `}</style>
      )}

      {/* 📱 Header Fixed para móvil */}
      {isMobile && <HeaderNav />}

      {isMobile ? (
        // 📱 ESTRUCTURA MÓVIL: Contenido directo sin Layout complejo
        <div
          className="mobile-content"
          style={{
            paddingTop: "105px", // Espacio para header fixed + margen perfecto
            minHeight: "100vh",
            background: "#f0f2f5",
          }}
        >
          <div
            style={{
              margin: "8px",
              background: "#fff",
              borderRadius: 8,
              padding: 4,
              minHeight: "calc(100vh - 86px)",
            }}
          >
            <div
              key="home"
              style={{
                borderRadius: "10px",
                minHeight: "calc(100vh - 94px)",
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
                        <TableStandarVerySmallResponsive
                          data={state.selected_profile}
                        />
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
                <Route path="/analisis" element={<ResponsiveSmartAnalysis />} />
                {/* DGA - MEE */}
                <Route path="/dga" element={<ResponsiveDga />} />
                {/* DGA Análisis */}
                <Route path="/dga-analisis" element={<GraphisNavDga />} />
                {/* Descarga */}
                <Route path="/descarga" element={<Reports />} />
                {/* Documentos */}
                <Route path="/documentos" element={<DocRes />} />
                {/* Alertas */}
                <Route path="/alertas" element={<ResponsiveAlerts />} />
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
                <Route path="/sys_alerts" element={<ResponsiveAlerts />} />
                <Route exact path="/graficos" element={<MyGraphics />} />
                <Route
                  exact
                  path="/formmultidata"
                  element={<FormMultiData />}
                />
                <Route exact path="/reportes" element={<Reports />} />
                <Route exact path="/supp" element={<Supp />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        // 💻 ESTRUCTURA DESKTOP: Layout original
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "20px 0 0 0",
              }}
            >
              {/* Logo superior */}
              <div style={{ textAlign: "center", paddingBottom: "20px" }}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{ width: 60, marginBottom: 8 }}
                />
              </div>

              {/* Menú central - Flex: 1 para ocupar espacio disponible */}
              <div style={{ flex: 1 }}>
                <Menu
                  theme="dark"
                  mode="inline"
                  defaultSelectedKeys={["1"]}
                  style={{
                    background: "#1F3461",
                    border: "none",
                  }}
                >
                  <Menu.Item key="1" icon={<WifiOutlined />}>
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
                    <Link to="/descarga">Descarga</Link>
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
              </div>

              {/* Logo Smart Hydro al final - Lo más abajo posible */}
              <div
                style={{
                  textAlign: "center",
                  padding: "10px 16px 15px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  marginTop: "100%",
                }}
              >
                <img
                  src={minLogo}
                  alt="Smart Hydro"
                  style={{
                    width: "75%",
                    maxWidth: "120px",
                    opacity: 0.9,
                  }}
                />
              </div>
            </div>
          </Sider>

          {/* Layout principal */}
          <Layout
            style={{
              marginLeft: 200,
              minHeight: "100vh",
            }}
          >
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
                padding: 24,
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
                          <TableStandarVerySmallResponsive
                            data={state.selected_profile}
                          />
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
                  <Route
                    path="/analisis"
                    element={<ResponsiveSmartAnalysis />}
                  />
                  {/* DGA - MEE */}
                  <Route path="/dga" element={<ResponsiveDga />} />
                  {/* DGA Análisis */}
                  <Route path="/dga-analisis" element={<GraphisNavDga />} />
                  {/* Descarga */}
                  <Route path="/descarga" element={<Reports />} />
                  {/* Documentos */}
                  <Route path="/documentos" element={<DocRes />} />
                  {/* Alertas */}
                  <Route path="/alertas" element={<ResponsiveAlerts />} />
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
                  <Route path="/sys_alerts" element={<ResponsiveAlerts />} />
                  <Route exact path="/graficos" element={<MyGraphics />} />
                  <Route
                    exact
                    path="/formmultidata"
                    element={<FormMultiData />}
                  />
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
      )}
    </>
  );
};

export default Home;
