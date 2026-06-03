import React from "react";
import { Flex, Typography, Tag } from "antd";
import { FaInfoCircle, FaExternalLinkAlt } from "react-icons/fa";
import { smarthydro } from "../../../theme/smarthydro.tokens";

const { Text } = Typography;

const typeDgaLabels = {
  SUPERFICIAL: "Superficial",
  SUBTERRANEO: "Subterráneo",
  SUPERFICIAL_MAYOR: "Superficial Mayor",
  SUBTERRANEO_MENOR: "Subterráneo Menor",
  CAUDALES_MUY_PEQUENOS: "Caudales muy pequeños",
  MEDIO: "Medio",
  MAYOR: "Mayor",
  MENOR: "Menor",
  CAUDAL: "Caudal",
  VOLUMEN: "Volumen",
};

const PointHeader = ({ record, onViewPointConfig, token }) => {
  const hasDga = record.compliance_type?.includes("DGA");
  const hasSma = record.compliance_type?.includes("SMA");

  return (
    <Flex vertical>
      <Flex justify="space-between" align="center">
        <Text
          strong
          style={{
            fontSize: smarthydro.typography.sizes.sm,
            color: token?.colorText || smarthydro.colors.neutral[800],
            lineHeight: 1.2,
            fontFamily: smarthydro.typography.heading,
          }}
        >
          {record.title?.slice(0, 20) || "—"}
        </Text>
        <FaInfoCircle
          style={{
            fontSize: 11,
            color: token?.colorPrimary || smarthydro.colors.primary[500],
            cursor: "pointer",
            opacity: 0.7,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onViewPointConfig?.(record.title || record.name);
          }}
        />
      </Flex>
      <Flex justify="space-between" gap={4} wrap="wrap">
        {hasDga && (
          <Tag
            style={{
              fontSize: 10,
              margin: 0,
              padding: "1px 5px",
              lineHeight: "15px",
              background: `${smarthydro.colors.primary[500]}10`,
              border: "none",
              color: smarthydro.colors.primary[500],
              fontWeight: smarthydro.typography.weights.semibold,
              fontFamily: smarthydro.typography.body,
            }}
          >
            DGA
          </Tag>
        )}
        {hasSma && (
          <Tag
            style={{
              fontSize: 10,
              margin: 0,
              padding: "1px 5px",
              lineHeight: "15px",
              background: smarthydro.colors.semantic.successBg,
              border: "none",
              color: smarthydro.colors.semantic.success,
              fontWeight: smarthydro.typography.weights.semibold,
              fontFamily: smarthydro.typography.body,
            }}
          >
            SMA
          </Tag>
        )}
        {record.code &&
          (hasDga ? (
            <a
              href={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${encodeURIComponent(record.code)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: smarthydro.colors.primary[500],
                fontSize: 11,
                fontWeight: smarthydro.typography.weights.semibold,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontFamily: smarthydro.typography.body,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {record.code}
              <FaExternalLinkAlt style={{ fontSize: 9, opacity: 0.7 }} />
            </a>
          ) : (
            <Text
              style={{
                fontSize: 11,
                color: token?.colorTextSecondary || smarthydro.colors.neutral[500],
                fontFamily: smarthydro.typography.body,
              }}
            >
              {record.code}
            </Text>
          ))}
      </Flex>
    </Flex>
  );
};

export { typeDgaLabels };
export default PointHeader;
