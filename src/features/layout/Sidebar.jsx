import React from "react";
import { Layout, Menu, Typography, Drawer, theme } from "antd";
import { DashboardOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import logoSrc from "../../assets/images/ikolu.png";

const { Sider } = Layout;
const { Text } = Typography;

const AppLogo = ({ collapsed }) => (
  <img
    src={logoSrc}
    alt="Ikolu"
    style={{
      height: collapsed ? 28 : 36,
      width: "auto",
      objectFit: "contain",
    }}
  />
);

const menuItems = [
  {
    key: "/control-center/telemetry",
    icon: <DashboardOutlined />,
    label: "Centro de Control",
  },
];

const SidebarContent = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const handleClick = (e) => {
    navigate(e.key);
    if (onMenuClick) onMenuClick();
  };

  return (
    <div
      style={{
        background: token.colorBgContainer,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: collapsed ? 0 : 12,
          borderBottom: `1px solid ${token.colorBorder}`,
          padding: "0 16px",
        }}
      >
        <AppLogo collapsed={collapsed} />
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text
              style={{
                color: token.colorTextLightSolid || "#fff",
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Ikolu
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 10,
              }}
            >
              Centro de Control
            </Text>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleClick}
        style={{
          background: "transparent",
          borderRight: "none",
          marginTop: 16,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: "16px",
          borderTop: `1px solid ${token.colorBorder}`,
          textAlign: "center",
        }}
      >
        <img
          src={logoSrc}
          alt="Ikolu"
          style={{
            height: 20,
            width: "auto",
            opacity: 0.4,
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};

const Sidebar = ({ collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen }) => {
  const { token } = theme.useToken();

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        width={280}
        closable={false}
        styles={{ body: { padding: 0 } }}
        style={{ background: token.colorPrimary }}
      >
        <SidebarContent collapsed={false} onMenuClick={() => setMobileOpen(false)} />
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="dark"
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorder}`,
      }}
      width={240}
    >
      <SidebarContent collapsed={collapsed} />
    </Sider>
  );
};

export default Sidebar;
