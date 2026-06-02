import React from "react";
import { Flex, Typography } from "antd";
import { formatInteger } from "../../../utils/numberFormatter";
import { smarthydro } from "../../../theme/smarthydro.tokens";

const { Text } = Typography;

const ConsumptionCell = ({ record, token }) => {
  const pct = record.pct_consumed;
  const pctNum = pct != null ? Number(pct) : null;
  
  const color = pctNum == null
    ? token?.colorTextDisabled || smarthydro.colors.neutral[400]
    : pctNum > 100
    ? token?.colorError || smarthydro.colors.semantic.error
    : pctNum > 80
    ? token?.colorWarning || smarthydro.colors.semantic.warning
    : token?.colorSuccess || smarthydro.colors.semantic.success;

  return (
    <Flex vertical gap={2} align="center">
      {pctNum != null ? (
        <>
          <Text
            strong
            style={{
              fontSize: smarthydro.typography.sizes.base,
              color,
              fontFamily: smarthydro.typography.heading,
            }}
          >
            {pctNum.toFixed(1)}%
          </Text>
          <div
            style={{
              width: "100%",
              height: 6,
              borderRadius: 3,
              background: token?.colorBgLayout || smarthydro.colors.neutral[100],
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(pctNum, 100)}%`,
                borderRadius: 3,
                background: color,
                transition: smarthydro.transitions.base,
              }}
            />
          </div>
          {record.authorized_total > 0 && record.annual_consumption != null && (
            <Text
              style={{
                fontSize: 9,
                color: token?.colorTextSecondary || smarthydro.colors.neutral[500],
                fontFamily: smarthydro.typography.body,
              }}
            >
              {formatInteger(record.annual_consumption)} / {formatInteger(record.authorized_total)} m³
            </Text>
          )}
        </>
      ) : (
        <Text
          style={{
            fontSize: smarthydro.typography.sizes.sm,
            color: token?.colorTextDisabled || smarthydro.colors.neutral[400],
            fontFamily: smarthydro.typography.body,
          }}
        >
          —
        </Text>
      )}
    </Flex>
  );
};

export default ConsumptionCell;
