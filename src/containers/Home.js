import { Layout } from "antd";
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useResponsive } from "../hooks/useResponsive";
import { useUserProfilesContext } from "../contexts/UserProfilesContext";
import HeaderNav from "../components/home/HeaderNav";
import SiderLeft from "../components/home/SiderLeft";
import CentroControl from "../components/home/CentroControl";
import MyWell from "../components/mywell/MyWell";
import Sma from "../components/Sma";
import GeoSmart from "../components/geo_smart/GeoSmart";
import DataSummary from "../components/smart_data/DataSummary";
import Dga from "../components/dga/Dga";
import PrototypeUmi from "../components/prototype_umi/PrototypeUmi";

const { Sider, Content } = Layout;

const Home = () => {
  const { isMobile } = useResponsive();
  const { selectedProfile, loading: profilesLoading } =
    useUserProfilesContext();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Función para renderizar el centro de control
  const renderCentroControl = () => {
    return (
      <div>
        <CentroControl />
      </div>
    );
  };

  // Función para actualizar datos
  const handleRefresh = () => {
    // Aquí se pueden implementar las funciones de actualización
    window.location.reload();
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header simplificado - Solo logo y usuario */}
      <HeaderNav onMenuClick={() => setDrawerVisible(true)} />

      <Layout style={{ marginTop: isMobile ? "56px" : "64px" }}>
        {/* Sidebar unificado - Logo + Menú completo */}
        {!isMobile ? (
          <Sider
            width={280}
            style={{
              background: "#1F3461",
              position: "fixed",
              height: "100vh",
              left: 0,
              top: 0,
              zIndex: 1000,
              overflow: "hidden", // Ocultar scroll del sidebar
              boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ height: "100%", overflowY: "auto" }}>
              <SiderLeft
                visible={true}
                onClose={() => {}}
                onMenuClick={() => {}}
                isDesktop={true}
              />
            </div>
          </Sider>
        ) : (
          <SiderLeft
            visible={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            onMenuClick={() => setDrawerVisible(false)}
            isDesktop={false}
          />
        )}

        <Content
          style={{
            marginLeft: isMobile ? 0 : 280,
            padding: isMobile ? "0" : "0",
            background: "#f8f9fa",
            minHeight: "calc(100vh - 64px)",
            transition: "margin-left 0.3s ease",
            overflow: "hidden", // Ocultar scroll del content
          }}
        >
          {/* Contenido de las rutas */}
          <div style={{ height: "100%", overflowY: "auto" }}>
            <Routes>
              <Route path="/" element={renderCentroControl()} />
              <Route path="/geo" element={<GeoSmart />} />
              <Route path="/telemetria" element={<MyWell />} />
              <Route path="/analisis" element={<DataSummary />} />
              <Route path="/dga" element={<Dga />} />
              <Route path="/dga_analisis" element={<DataSummary />} />
              <Route path="/registers_pti" element={<PrototypeUmi />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
