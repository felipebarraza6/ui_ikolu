import { Flex, Typography, Divider } from "antd";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserProfilesContext } from "../../contexts/UserProfilesContext";
import logo from "../../assets/images/logozivo.png";
import minLogo from "../../assets/images/logo-blanco.png";
import QueueAnim from "rc-queue-anim";
import {
  GlobalOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  AreaChartOutlined,
  CloudDownloadOutlined,
  FileDoneOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import ListWells from "./ListWells";

const { Title } = Typography;

/**
 * 🧭 COMPONENTE SIDERLEFT FUNCIONAL
 *
 * Diseño profesional + navegación funcional
 * Respeta las condiciones de usuario y DGA
 */
const SiderLeft = ({
  visible = true,
  onClose,
  onMenuClick,
  isDesktop = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedProfile } = useUserProfilesContext();

  // Función para navegar
  const handleNavigation = (path) => {
    console.log("🧭 Navegando a:", path); // Debug log
    navigate(path);
    if (!isDesktop && onMenuClick) {
      onMenuClick();
    }
  };

  // Función para determinar si una ruta está activa
  const isActiveRoute = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Si no está visible en móvil, no renderizar
  if (!isDesktop && !visible) {
    return null;
  }

  return (
    <QueueAnim delay={200} duration={900} type="left">
      <div key="left">
        <Flex
          vertical
          style={{
            minHeight: "100vh",
            padding: "20px 16px",
            background: "linear-gradient(180deg, #1F3461 0%, #2A4A7A 100%)",
          }}
          justify="space-between"
          align="stretch"
        >
          {/* Header con Logo */}
          <Flex vertical align="center" style={{ marginBottom: "24px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "12px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <img
                src={logo}
                width="40px"
                alt="Ikolu App"
                style={{ display: "block", margin: "0 auto 8px" }}
                loading="eager"
              />
            </div>
            <Title
              level={5}
              style={{
                color: "white",
                margin: 0,
                textAlign: "center",
                fontWeight: "600",
                letterSpacing: "0.5px",
                fontSize: "16px",
              }}
            >
              Ikolu App
            </Title>
          </Flex>

          {/* Menú Principal - Scrolleable */}
          <Flex
            vertical
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "4px",
              marginBottom: "20px",
            }}
            gap="6px"
          >
            {/* Sección Principal */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "10px",
                  paddingLeft: "6px",
                }}
              >
                Navegación Principal
              </div>

              {/* Centro de Control */}
              <div
                style={{
                  background: isActiveRoute("/")
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleNavigation("/")}
                onMouseEnter={(e) => {
                  if (!isActiveRoute("/")) {
                    e.target.style.background = "rgba(255,255,255,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveRoute("/")) {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                  }
                }}
              >
                <Flex align="center" gap="10px">
                  <GlobalOutlined
                    style={{ color: "white", fontSize: "16px" }}
                  />
                  <span
                    style={{
                      color: "white",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Centro de Control
                  </span>
                </Flex>
              </div>

              {/* GEO Smart */}
              <div
                style={{
                  background: isActiveRoute("/geo")
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleNavigation("/geo")}
                onMouseEnter={(e) => {
                  if (!isActiveRoute("/geo")) {
                    e.target.style.background = "rgba(255,255,255,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveRoute("/geo")) {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                  }
                }}
              >
                <Flex align="center" gap="10px">
                  <EnvironmentOutlined
                    style={{ color: "white", fontSize: "16px" }}
                  />
                  <span
                    style={{
                      color: "white",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    GEO Smart
                  </span>
                </Flex>
              </div>
            </div>

            {/* Separador */}
            <Divider
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                margin: "24px 0",
              }}
            />

            {/* Sección Punto de Captación */}
            <div style={{ marginBottom: "20px" }}>
              {/* Selector de pozos */}
              <div style={{ marginBottom: "12px" }}>
                <ListWells />
              </div>

              {/* Telemetría */}
              <div
                style={{
                  background: isActiveRoute("/telemetria")
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleNavigation("/telemetria")}
                onMouseEnter={(e) => {
                  if (!isActiveRoute("/telemetria")) {
                    e.target.style.background = "rgba(255,255,255,0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveRoute("/telemetria")) {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                  }
                }}
              >
                <Flex align="center" gap="10px">
                  <WifiOutlined style={{ color: "white", fontSize: "16px" }} />
                  <span
                    style={{
                      color: "white",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Telemetría
                  </span>
                </Flex>
              </div>
            </div>

            {/* Separador */}
            <Divider
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                margin: "24px 0",
              }}
            />

            {/* Sección Análisis y Reportes - SOLO si NO es arrocerospti */}
            {user &&
              user.username !== "arrocerospti" &&
              user.username !== "lecheriavalleverde" && (
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "12px",
                      paddingLeft: "8px",
                    }}
                  >
                    Análisis y Reportes
                  </div>

                  {/* Smart Análisis */}
                  <div
                    style={{
                      background: isActiveRoute("/analisis")
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => handleNavigation("/analisis")}
                    onMouseEnter={(e) => {
                      if (!isActiveRoute("/analisis")) {
                        e.target.style.background = "rgba(255,255,255,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveRoute("/analisis")) {
                        e.target.style.background = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    <Flex align="center" gap="12px">
                      <BarChartOutlined
                        style={{ color: "white", fontSize: "18px" }}
                      />
                      <span style={{ color: "white", fontWeight: "500" }}>
                        Smart Análisis
                      </span>
                    </Flex>
                  </div>

                  {/* DGA - MEE - SOLO si tiene código DGA y NO es "1" */}
                  {selectedProfile?.dga?.code_dga &&
                    selectedProfile.dga.code_dga !== "1" && (
                      <>
                        {/* DGA - MEE */}
                        <div
                          style={{
                            background: isActiveRoute("/dga")
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "8px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => handleNavigation("/dga")}
                          onMouseEnter={(e) => {
                            if (!isActiveRoute("/dga")) {
                              e.target.style.background =
                                "rgba(255,255,255,0.15)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActiveRoute("/dga")) {
                              e.target.style.background =
                                "rgba(255,255,255,0.1)";
                            }
                          }}
                        >
                          <Flex align="center" gap="12px">
                            <Flex gap="4px">
                              <div
                                style={{
                                  width: "12px",
                                  height: "8px",
                                  background: "#006FB3",
                                  borderRadius: "2px",
                                }}
                              />
                              <div
                                style={{
                                  width: "12px",
                                  height: "8px",
                                  background: "#FE6565",
                                  borderRadius: "2px",
                                }}
                              />
                            </Flex>
                            <span style={{ color: "white", fontWeight: "500" }}>
                              DGA - MEE
                            </span>
                          </Flex>
                        </div>

                        {/* DGA Análisis */}
                        <div
                          style={{
                            background: isActiveRoute("/dga_analisis")
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "8px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => handleNavigation("/dga_analisis")}
                          onMouseEnter={(e) => {
                            if (!isActiveRoute("/dga_analisis")) {
                              e.target.style.background =
                                "rgba(255,255,255,0.15)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActiveRoute("/dga_analisis")) {
                              e.target.style.background =
                                "rgba(255,255,255,0.1)";
                            }
                          }}
                        >
                          <Flex align="center" gap="12px">
                            <AreaChartOutlined
                              style={{ color: "white", fontSize: "18px" }}
                            />
                            <span style={{ color: "white", fontWeight: "500" }}>
                              DGA Análisis
                            </span>
                          </Flex>
                        </div>
                      </>
                    )}
                </div>
              )}

            {/* Separador */}
            <Divider
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                margin: "24px 0",
              }}
            />

            {/* Sección Utilidades - SOLO si NO es arrocerospti */}
            {user &&
              user.username !== "arrocerospti" &&
              user.username !== "lecheriavalleverde" && (
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "12px",
                      paddingLeft: "8px",
                    }}
                  >
                    Utilidades
                  </div>

                  {/* Descarga */}
                  <div
                    style={{
                      background: isActiveRoute("/descarga")
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => handleNavigation("/descarga")}
                    onMouseEnter={(e) => {
                      if (!isActiveRoute("/descarga")) {
                        e.target.style.background = "rgba(255,255,255,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveRoute("/descarga")) {
                        e.target.style.background = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    <Flex align="center" gap="12px">
                      <CloudDownloadOutlined
                        style={{ color: "white", fontSize: "18px" }}
                      />
                      <span style={{ color: "white", fontWeight: "500" }}>
                        Descarga
                      </span>
                    </Flex>
                  </div>

                  {/* Documentos */}
                  <div
                    style={{
                      background: isActiveRoute("/documentos")
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => handleNavigation("/documentos")}
                    onMouseEnter={(e) => {
                      if (!isActiveRoute("/documentos")) {
                        e.target.style.background = "rgba(255,255,255,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveRoute("/documentos")) {
                        e.target.style.background = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    <Flex align="center" gap="12px">
                      <FileDoneOutlined
                        style={{ color: "white", fontSize: "18px" }}
                      />
                      <span style={{ color: "white", fontWeight: "500" }}>
                        Documentos
                      </span>
                    </Flex>
                  </div>

                  {/* Alertas */}
                  <div
                    style={{
                      background: isActiveRoute("/alertas")
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => handleNavigation("/alertas")}
                    onMouseEnter={(e) => {
                      if (!isActiveRoute("/alertas")) {
                        e.target.style.background = "rgba(255,255,255,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveRoute("/alertas")) {
                        e.target.style.background = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    <Flex align="center" gap="12px">
                      <AlertOutlined
                        style={{ color: "white", fontSize: "18px" }}
                      />
                      <span style={{ color: "white", fontWeight: "500" }}>
                        Alertas
                      </span>
                    </Flex>
                  </div>

                  {/* Soporte */}
                  <div
                    style={{
                      background: isActiveRoute("/soporte")
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => handleNavigation("/soporte")}
                    onMouseEnter={(e) => {
                      if (!isActiveRoute("/soporte")) {
                        e.target.style.background = "rgba(255,255,255,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActiveRoute("/soporte")) {
                        e.target.style.background = "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    <Flex align="center" gap="12px">
                      <DatabaseOutlined
                        style={{ color: "white", fontSize: "18px" }}
                      />
                      <span style={{ color: "white", fontWeight: "500" }}>
                        Soporte
                      </span>
                    </Flex>
                  </div>
                </div>
              )}

            {/* LÓGICA ESPECIAL PARA ARROCEROSPTI */}
            {user && user.username === "arrocerospti" && (
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                    paddingLeft: "8px",
                  }}
                >
                  Opciones Especiales
                </div>

                {/* Registros PTI */}
                <div
                  style={{
                    background: isActiveRoute("/registers_pti")
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleNavigation("/registers_pti")}
                  onMouseEnter={(e) => {
                    if (!isActiveRoute("/registers_pti")) {
                      e.target.style.background = "rgba(255,255,255,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveRoute("/registers_pti")) {
                      e.target.style.background = "rgba(255,255,255,0.1)";
                    }
                  }}
                >
                  <Flex align="center" gap="12px">
                    <DatabaseOutlined
                      style={{ color: "white", fontSize: "18px" }}
                    />
                    <span style={{ color: "white", fontWeight: "500" }}>
                      Registros
                    </span>
                  </Flex>
                </div>
              </div>
            )}
          </Flex>

          {/* Footer */}
          <Flex
            vertical
            align="center"
            style={{
              padding: "20px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Logo Smart Hydro */}
            <div style={{ textAlign: "center" }}>
              <img
                src={minLogo}
                alt="Smart Hydro"
                style={{
                  width: "80%",
                  maxWidth: "100px",
                  opacity: 0.9,
                  filter: "brightness(1.1)",
                }}
              />
            </div>
          </Flex>
        </Flex>
      </div>
    </QueueAnim>
  );
};

export default SiderLeft;
