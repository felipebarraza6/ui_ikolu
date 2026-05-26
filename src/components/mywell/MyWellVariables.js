import React from "react";
import { Typography, Flex, Skeleton, Tag } from "antd";
import {
  DashboardOutlined,
  ColumnHeightOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { ikoluTokens } from "../../theme";

const { Text } = Typography;

const numberForMiles = new Intl.NumberFormat("de-DE");

const ConfiguredVariables = ({ variables, loading = false }) => {
  const typeLabels = {
    CAUDAL_PROMEDIO: "Caudal Promedio",
    CAUDAL: "Caudal",
    NIVEL: "Nivel",
    TOTALIZADO: "Totalizado",
  };

  const tagStyle = {
    fontSize: 9,
    margin: 0,
    padding: "0 8px",
    lineHeight: "18px",
    borderRadius: 4,
    background: "#f0f5ff",
    color: "#1F3461",
    border: "1px solid #d6e4ff",
    fontWeight: 600,
  };

  const renderTypeIcon = (type) => {
    const style = { fontSize: 14, color: "#1F3461" };
    if (type?.includes("CAUDAL")) return <DashboardOutlined style={style} />;
    if (type?.includes("NIVEL")) return <ColumnHeightOutlined style={style} />;
    if (type?.includes("TOTALIZADO")) return <DatabaseOutlined style={style} />;
    return <SettingOutlined style={style} />;
  };

  if (!loading && (!variables || variables.length === 0)) return null;

  return (
    <div>
      <Flex align="center" gap="small" style={{ marginBottom: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: ikoluTokens.borderRadius,
            background: "linear-gradient(135deg, #1F3461 0%, #1890ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SettingOutlined style={{ color: ikoluTokens.colorWhite, fontSize: ikoluTokens.fontSizeLarge }} />
        </div>
        <Text strong style={{ fontSize: ikoluTokens.fontSizeMid, color: ikoluTokens.colorCorporateBlue }}>
          Variables Configuradas
        </Text>
      </Flex>

      {loading ? (
        <Flex vertical gap={8}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderRadius: ikoluTokens.borderRadius,
                background: "#f8fafc",
                border: `1px solid ${ikoluTokens.colorBorderLight}`,
              }}
            >
              <Skeleton active paragraph={false} title={{ width: "80%" }} />
            </div>
          ))}
        </Flex>
      ) : (
        <Flex vertical gap={8}>
          {variables.map((variable, index) => (
            <div
              key={variable.id || index}
              style={{
                padding: "10px 12px",
                borderRadius: ikoluTokens.borderRadius,
                background: ikoluTokens.colorWhite,
                border: `1px solid ${ikoluTokens.colorBorderLight}`,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "#e6e6e6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#f0f0f0";
              }}
            >
              <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                <Flex align="center" gap={8}>
                  {renderTypeIcon(variable.type_variable)}
                  <Text strong style={{ fontSize: ikoluTokens.fontSizeBase, color: ikoluTokens.colorCorporateBlue }}>
                    {variable.label || "Sin Etiqueta"}
                  </Text>
                </Flex>
                <span style={tagStyle}>
                  {typeLabels[variable.type_variable] || variable.type_variable}
                </span>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text style={{ fontSize: 10, color: ikoluTokens.colorGreyText, fontWeight: 500 }}>
                  {variable.str_variable || `Var ${variable.id}`}
                </Text>
                <Flex gap="small" wrap="wrap">
                  {variable.type_variable === "TOTALIZADO" && (
                    <Text style={{ fontSize: 10, color: ikoluTokens.colorGreyTextMid }}>
                      {variable.pulses_factor ? `${numberForMiles.format(variable.pulses_factor)} Lt/p · ` : ""}
                      Adic: {numberForMiles.format(variable.addition || 0)}
                    </Text>
                  )}
                  {variable.type_variable === "NIVEL" && variable.calculate_nivel !== null && variable.calculate_nivel !== undefined && (
                    <Text style={{ fontSize: 10, color: ikoluTokens.colorGreyTextMid }}>
                      Base: {variable.calculate_nivel}
                    </Text>
                  )}
                  {variable.type_variable === "CAUDAL" && (
                    <Text style={{ fontSize: 10, color: ikoluTokens.colorGreyTextMid }}>
                      Conv: {variable.convert_to_lt ? "Si" : "No"}
                    </Text>
                  )}
                </Flex>
              </Flex>
            </div>
          ))}
        </Flex>
      )}
    </div>
  );
};

export default React.memo(ConfiguredVariables);
