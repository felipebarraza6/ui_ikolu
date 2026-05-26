import React from "react";
import { Flex, Tooltip, Typography, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { ikoluTokens } from "../../theme";

const { Text } = Typography;
const { Countdown } = Statistic;

const validateNumericValue = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
};

const calculateChangePercent = (current, previous) => {
  if (!previous || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return change;
};

const ConsumptionStats = ({
  acumDia,
  acumAyer,
  loading,
  deadline,
  onRefresh,
  vars = [],
}) => {
  const showVolume = vars.some((v) => v.type_variable?.includes("TOTALIZADO"));

  const validHoy = validateNumericValue(acumDia, 0);
  const validAyer = validateNumericValue(acumAyer, 0);
  const changePercent = calculateChangePercent(validHoy, validAyer);
  const isIncrease = changePercent !== null && changePercent > 0;
  const isDecrease = changePercent !== null && changePercent < 0;

  return (
    <div
      style={{
        width: "100%",
        padding: "12px 16px",
        background: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(5px)",
        borderRadius: ikoluTokens.borderRadiusLG,
        border: "1px solid rgba(255, 255, 255, 0.5)",
        marginTop: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      <Flex gap="middle" wrap="wrap" justify="space-between" align="center">
        {showVolume && (
          <>
            <Tooltip title="Consumo acumulado del dia de hoy">
              <Flex
                vertical
                align="center"
                gap={2}
                style={{ flex: 1, minWidth: "70px" }}
              >
                <Flex align="center" gap={4}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: ikoluTokens.colorGreyText,
                      textTransform: "uppercase",
                    }}
                  >
                    Hoy
                  </Text>
                  {changePercent !== null && (
                    <Flex align="center" gap={2}>
                      {isIncrease ? (
                        <ArrowUpOutlined
                          style={{ fontSize: 10, color: ikoluTokens.colorWarning }}
                        />
                      ) : (
                        <ArrowDownOutlined
                          style={{ fontSize: 10, color: ikoluTokens.colorSuccess }}
                        />
                      )}
                      <Text
                        style={{
                          fontSize: 10,
                          color: isIncrease ? "#faad14" : "#52c41a",
                          fontWeight: 800,
                        }}
                      >
                        {Math.abs(changePercent).toFixed(1)}%
                      </Text>
                    </Flex>
                  )}
                </Flex>
                <Text
                  style={{
                    fontSize: ikoluTokens.fontSize2XL,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: loading ? "#bfbfbf" : "#52c41a",
                    transition: "color 0.25s ease",
                  }}
                >
                  {loading ? "—" : <>{validHoy !== null ? `${validHoy}` : "0"}{" "}<span style={{ fontSize: 10, fontWeight: 600 }}>m3</span></>}
                </Text>
              </Flex>
            </Tooltip>

            <div
              style={{
                width: "1px",
                height: "30px",
                background: "rgba(0,0,0,0.05)",
              }}
            ></div>

            <Tooltip title="Consumo acumulado del dia anterior">
              <Flex
                vertical
                align="center"
                gap={2}
                style={{ flex: 1, minWidth: "70px" }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: ikoluTokens.colorGreyText,
                    textTransform: "uppercase",
                  }}
                >
                  Ayer
                </Text>
                <Text
                  style={{
                    fontSize: ikoluTokens.fontSize2XL,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: loading ? "#bfbfbf" : "#faad14",
                    transition: "color 0.25s ease",
                  }}
                >
                  {loading ? "—" : <>{validAyer !== null ? `${validAyer}` : "0"}{" "}<span style={{ fontSize: 10, fontWeight: 600 }}>m3</span></>}
                </Text>
              </Flex>
            </Tooltip>

            <div
              style={{
                width: "1px",
                height: "30px",
                background: "rgba(0,0,0,0.05)",
              }}
            ></div>
          </>
        )}

        <Tooltip
          title={
            deadline ? "Tiempo hasta la proxima medicion" : "No configurado"
          }
        >
          <Flex
            vertical
            align="center"
            gap={2}
            style={{ flex: 1, minWidth: "90px" }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: ikoluTokens.colorGreyText,
                textTransform: "uppercase",
              }}
            >
              Refresco
            </Text>
            {loading ? (
              <Text style={{ fontSize: ikoluTokens.fontSize2XL, fontWeight: 900, lineHeight: 1, color: ikoluTokens.colorGreyTextLight }}>—</Text>
            ) : deadline ? (
              <Countdown
                value={deadline}
                format="mm:ss"
                valueStyle={{
                  color: "#1F3461",
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
                onFinish={onRefresh}
              />
            ) : (
              <Text style={{ fontSize: ikoluTokens.fontSizeLarge, color: ikoluTokens.colorGreyTextLight, fontWeight: 700 }}>
                N/A
              </Text>
            )}
          </Flex>
        </Tooltip>
      </Flex>
    </div>
  );
};

export default React.memo(ConsumptionStats);
