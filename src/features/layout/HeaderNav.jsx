import React from "react";
import { Layout, Button, Dropdown, Avatar, Typography, Space, Tooltip } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../contexts/ThemeContext";
import { useIkoluToken } from "../../hooks/useIkoluToken";

const { Header } = Layout;
const { Text } = Typography;

const HeaderNav = ({ collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const token = useIkoluToken();

  const handleLogout = () => {
    navigate("/login", { replace: true });
    logout();
  };

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Mi Perfil",
      onClick: () => navigate("/profile"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: isMobile ? "0 12px" : "0 24px",
        background: token.colorHeaderBg,
        color: '#ffffff',
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderBottom: `1px solid ${token.colorHeaderBorder}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Button
        type="text"
        icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
        onClick={handleToggle}
        style={{
          fontSize: "16px",
          width: isMobile ? 48 : 64,
          height: isMobile ? 48 : 64,
          color: 'rgba(255,255,255,0.85)',
        }}
      />

      <Space align="center" size={isMobile ? "small" : "middle"}>
        <Tooltip title={isDark ? "Modo Claro" : "Modo Oscuro"}>
          <Button
            type="text"
            icon={
              <BulbOutlined
                style={{
                  color: isDark ? '#FFD700' : 'rgba(255,255,255,0.85)',
                  filter: isDark ? 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            }
            onClick={toggleTheme}
            style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}
          />
        </Tooltip>

        {!isMobile && (
          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
            {user?.first_name || user?.username || "Usuario"}
          </Text>
        )}

        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow destroyPopupOnHide>
          <Avatar
            style={{
              background: token.colorPrimary,
              cursor: "pointer",
              border: `2px solid ${token.colorPrimaryHover}`,
            }}
            icon={<UserOutlined />}
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default HeaderNav;
