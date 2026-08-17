import React, { useState } from "react";
import { Layout, Grid } from "antd";
import { useIkoluToken } from "../../hooks/useIkoluToken";
import Sidebar from "./Sidebar";
import HeaderNav from "./HeaderNav";
import BottomNav from "./BottomNav";

const { Content } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const token = useIkoluToken();

  const siderWidth = collapsed ? 80 : 260;

  return (
    <Layout style={{ minHeight: "100vh", background: token.voidBg }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: siderWidth,
            zIndex: 200,
            transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            background: token.colorHeaderBg,
            borderRight: `1px solid ${token.colorHeaderBorder}`,
            overflow: "auto",
          }}
        >
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            isMobile={isMobile}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
        </div>
      )}

      <Layout
        style={{
          background: token.voidBg,
          marginLeft: isMobile ? 0 : siderWidth,
          transition: "margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Desktop header */}
        {!isMobile && (
          <HeaderNav
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            isMobile={isMobile}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
        )}

        <Content
          className="app-layout-content"
          style={{
            margin: 0,
            padding: isMobile ? "12px 12px 80px 12px" : 24,
            background: token.voidBg,
            minHeight: isMobile ? "100vh" : "calc(100vh - 64px)",
            overflow: "auto",
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}
    </Layout>
  );
};

export default AppLayout;
