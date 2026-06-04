import React from "react";
import { Flex, Typography } from "antd";
import { formatInteger } from "../../../utils/numberFormatter";


const { Text } = Typography;

const ConsumptionCell = ({ record, token }) => {
  const pct = record.pct_consumed;
  const pctNum = pct != null ? Number(pct) : null;
  
  const isDark = token?.colorBgLayout === "#141414" || token?.colorBgLayout === "#000";
  
  const color = pctNum == null
    ? token?.colorTextDisabled
    : pctNum > 100
    ? token?.colorError
    : pctNum > 80
    ? token?.colorWarning
    : token?.colorSuccess;

  const bgColor = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : '#E9ECEF';

  const trackColor = isDark
    ? "rgba(255, 255, 255, 0.04)"
    : '#F8F9FA';

  return (
    <Flex vertical gap={3} align="center">
      {pctNum != null ? (
        <>
          <Text
            strong
            style={{
              fontSize: 16,
              color,
              fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              lineHeight: 1.2,
            }}
          >
            {pctNum.toFixed(1)}%
          </Text>
          <div
            style={{
              width: "100%",
              height: 8,
              borderRadius: 4,
              background: bgColor,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(pctNum, 100)}%`,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                transition: "width 0.4s ease",
                position: "relative",
              }}
            />
            {pctNum > 100 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${Math.min(pctNum, 100)}%`,
                  width: `${Math.min(pctNum - 100, 20)}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${token?.colorError}dd 0%, ${token?.colorError} 100%)`,
                  borderRadius: "0 4px 4px 0",
                }}
              />
            )}
          </div>
          {record.authorized_total > 0 && record.annual_consumption != null && (
            <Text
              style={{
                fontSize: 9,
                color: token?.colorTextSecondary,
                fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                lineHeight: 1.2,
              }}
            >
              {formatInteger(record.annual_consumption)} / {formatInteger(record.authorized_total)} m³
            </Text>
          )}
        </>
      ) : (
        <Text
          style={{
            fontSize: 12,
            color: token?.colorTextDisabled,
            fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          —
        </Text>
      )}
    </Flex>
  );
};

export default ConsumptionCell;
