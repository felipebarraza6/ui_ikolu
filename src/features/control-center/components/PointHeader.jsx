import React from "react";
import { Flex, Typography, Tag } from "antd";
import { FaInfoCircle, FaExternalLinkAlt } from "react-icons/fa";


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
            fontSize: 12,
            color: token?.colorText || '#212529',
            lineHeight: 1.2,
            fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {record.title?.slice(0, 20) || "—"}
        </Text>
        <FaInfoCircle
          style={{
            fontSize: 11,
            color: token?.colorPrimary || '#203562',
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
              background: `${token?.colorPrimary || '#203562'}10`,
              border: "none",
              color: token?.colorPrimary || '#203562',
              fontWeight: 600,
              fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
              background: 'rgba(42, 157, 143, 0.15)',
              border: "none",
              color: token?.colorSuccess || '#2A9D8F',
              fontWeight: 600,
              fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
                color: token?.colorPrimary || '#203562',
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
                color: token?.colorTextSecondary || '#6C757D',
                fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
