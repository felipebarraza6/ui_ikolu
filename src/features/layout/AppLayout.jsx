import React, { useState } from "react";
import { Layout, Grid, theme } from "antd";
import Sidebar from "./Sidebar";
import HeaderNav from "./HeaderNav";

const { Content } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh", background: token.colorBgLayout }}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Layout style={{ background: token.colorBgLayout }}>
        <HeaderNav
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <Content
          className="app-layout-content"
          style={{
            margin: "24px 16px",
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            minHeight: 280,
            overflow: "auto",
            border: `1px solid ${token.colorBorder}`,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
