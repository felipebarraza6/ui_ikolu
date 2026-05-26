import { Button, Flex, Divider } from "antd";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import {
  OneToOneOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  BarChartOutlined,
  FileDoneOutlined,
  AlertOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import logo from "../../assets/images/logozivo.png";
import minLogo from "../../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";
import { BiSupport } from "react-icons/bi";
import { VscRadioTower } from "react-icons/vsc";

const SiderLeft = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selected_profile } = useData();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/" || location.pathname === "/control_center";
    return location.pathname === path;
  };

  const buttonStyle = (path) => ({
    backgroundColor: isActive(path) ? "white" : "transparent",
    color: isActive(path) ? "#1f3461" : "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    height: "auto",
    transition: "all 0.2s ease",
  });

  const renderNavItem = (path, icon, label, extra = null) => (
    <Button
      block
      style={buttonStyle(path)}
      onClick={() => navigate(path)}
      onMouseEnter={(e) => {
        if (!isActive(path)) {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive(path)) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <Flex justify="space-between" align="center" style={{ width: "100%" }}>
        <Flex align="center" gap="small">
          {icon}
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}
          </span>
        </Flex>
        {extra}
      </Flex>
    </Button>
  );

  return (
    <QueueAnim delay={200} duration={900} type="left">
      <div key="left">
        <Flex
          vertical
          style={{
            minHeight: "100vh",
            maxHeight: "100vh",
            overflowY: "auto",
            padding: "16px 12px",
          }}
        >
          {/* Logo */}
          <Flex vertical style={{ marginBottom: "20px", paddingLeft: "8px" }}>
            <Flex align="center" gap="small">
              <img src={logo} width="40px" alt="logo" />
              <span style={{ color: "white", fontSize: "18px", fontWeight: 600 }}>
                Ikolu App
              </span>
            </Flex>
          </Flex>

          {/* Main Navigation */}
          <Flex vertical gap="small">
            {selected_profile.profile_ikolu.entry_by_form ? (
              renderNavItem("/", <OneToOneOutlined style={{ fontSize: "16px" }} />, "Formulario")
            ) : (
              renderNavItem("/", <VscRadioTower style={{ fontSize: "16px" }} />, "Telemetría")
            )}

            {user.username === "arrocerospti" && (
              renderNavItem("/registers-pti", <DatabaseOutlined style={{ fontSize: "16px" }} />, "Registros")
            )}
          </Flex>

          <Divider style={{ borderColor: "rgba(255,255,255,0.15)", margin: "16px 0" }} />

          {/* Analysis Section */}
          {user.username !== "arrocerospti" && user.username !== "lecheriavalleverde" && (
            <>
              <Flex vertical gap="small">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "4px" }}>
                  Análisis
                </div>
                {renderNavItem("/sys-data", <BarChartOutlined style={{ fontSize: "16px" }} />, "Smart Análisis")}

                {selected_profile.dga.code_dga && selected_profile.dga.code_dga !== "1" && (
                  <>
                    {renderNavItem(
                      "/dga",
                      <Flex>
                        <div style={{ backgroundColor: "#006FB3", width: "12px", height: "8px", borderRadius: "2px 0 0 2px" }}></div>
                        <div style={{ backgroundColor: "#FE6565", width: "12px", height: "8px", borderRadius: "0 2px 2px 0" }}></div>
                      </Flex>,
                      "DGA - MEE"
                    )}
                    {renderNavItem("/sys-data-dga", <AreaChartOutlined style={{ fontSize: "16px" }} />, "DGA Análisis")}
                  </>
                )}

                {renderNavItem("/extraction-data", <CloudDownloadOutlined style={{ fontSize: "16px" }} />, "Descarga")}
              </Flex>

              <Divider style={{ borderColor: "rgba(255,255,255,0.15)", margin: "16px 0" }} />

              {/* Management Section */}
              <Flex vertical gap="small">
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "4px" }}>
                  Gestión
                </div>
                {renderNavItem("/sys-docs", <FileDoneOutlined style={{ fontSize: "16px" }} />, "Documentos")}
                {renderNavItem("/sys-alerts", <AlertOutlined style={{ fontSize: "16px" }} />, "Alertas")}
                {renderNavItem("/sys-support", <BiSupport style={{ fontSize: "16px" }} />, "Soporte")}
              </Flex>
            </>
          )}

          {/* Bottom spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer logo */}
          <Flex justify="center" style={{ marginTop: "16px", opacity: 0.6 }}>
            <img src={minLogo} width="60px" alt="logo" />
          </Flex>
        </Flex>
      </div>
    </QueueAnim>
  );
};

export default SiderLeft;
