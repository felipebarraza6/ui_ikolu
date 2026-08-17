import React, { useMemo } from "react";
import { Flex, Typography, Tag } from "antd";
import { FaInfoCircle, FaExternalLinkAlt } from "react-icons/fa";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

const { Text } = Typography;

const PointHeader = ({ record, onViewPointConfig, projects = [] }) => {
  const token = useIkoluToken();
  const hasDga = record.compliance_type?.includes("DGA");
  const hasSma = record.compliance_type?.includes("SMA");

  const projectName = useMemo(() => {
    if (!record.project_id || !projects.length) return null;
    const p = projects.find((pr) => String(pr.id) === String(record.project_id));
    return p?.project_name || p?.name || null;
  }, [record.project_id, projects]);

  return (
    <Flex vertical gap={2}>
      <Flex justify="space-between" align="center">
        <Text
          strong
          style={{
            fontSize: 13,
            color: token.colorPrimary,
            lineHeight: 1.2,
            fontFamily: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {(record.title || record.point_name || record.name || "—").slice(0, 24)}
        </Text>
        <FaInfoCircle
          style={{
            fontSize: 11,
            color: token.voidTextMuted,
            cursor: "pointer",
            opacity: 0.6,
            flexShrink: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onViewPointConfig?.();
          }}
        />
      </Flex>

      {record.client_name && (
        <Text
          style={{
            fontSize: 11,
            color: token.voidTextMuted,
            lineHeight: 1.2,
            fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {record.client_name}
        </Text>
      )}

      {projectName && (
        <Text
          style={{
            fontSize: 10,
            color: token.voidTextMuted,
            opacity: 0.7,
            lineHeight: 1.2,
            fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          {projectName}
        </Text>
      )}

      <Flex gap={4} wrap="wrap" align="center">
        {hasDga && (
          <Tag
            style={{
              fontSize: 9,
              margin: 0,
              padding: "0px 4px",
              lineHeight: "14px",
              background: token.voidSurface,
              border: `1px solid ${token.voidBorder}`,
              color: token.voidTextHeading,
              fontWeight: 600,
            }}
          >
            DGA
          </Tag>
        )}
        {hasSma && (
          <Tag
            style={{
              fontSize: 9,
              margin: 0,
              padding: "0px 4px",
              lineHeight: "14px",
              background: `${token.colorSuccess}15`,
              border: "none",
              color: token.colorSuccess,
              fontWeight: 600,
            }}
          >
            SMA
          </Tag>
        )}
        {record.code && (
          hasDga ? (
            <a
              href={`https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${encodeURIComponent(record.code)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: token.voidText,
                fontSize: 10,
                fontWeight: 500,
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {record.code}
              <FaExternalLinkAlt style={{ fontSize: 8, opacity: 0.6 }} />
            </a>
          ) : (
            <Text
              style={{
                fontSize: 10,
                color: token.voidTextMuted,
              }}
            >
              {record.code}
            </Text>
          )
        )}
      </Flex>
    </Flex>
  );
};

export default PointHeader;
