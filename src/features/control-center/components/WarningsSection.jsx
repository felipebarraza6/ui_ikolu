import React, { useCallback, useState } from "react";
import { Row, Col, Card, Flex, Typography, Tag } from "antd";
import { FaExclamationTriangle, FaEye } from "react-icons/fa";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

const { Text } = Typography;

const CCWarningsSection = ({ warningsList, warningsRaw, onWarningPointClick }) => {
  const token = useIkoluToken();
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (!warningsList || warningsList.length === 0) return null;

  return (
    <Card
      size="small"
      style={{
        borderRadius: token.voidRadius,
        marginBottom: 24,
        background: token.glassBg,
        border: `1px solid ${token.glassBorder}`,
        backdropFilter: "blur(12px)",
        boxShadow: token.voidShadow,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        onClick={handleToggle}
        style={{
          padding: "12px 16px",
          cursor: "pointer",
          borderBottom: expanded ? `1px solid ${token.voidBorder}` : "none",
        }}
      >
        <Flex justify="space-between" align="flex-start">
          <Flex vertical gap={2}>
            <Flex align="center" gap={8}>
              <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 14 }} />
              <Text strong style={{ fontSize: 14, color: token.voidTextHeading }}>Warnings Detectados</Text>
              <Tag style={{ fontSize: 10, margin: 0, background: `${token.colorWarning}15`, border: `1px solid ${token.colorWarning}30`, color: token.colorWarning }}>{warningsList.length}</Tag>
            </Flex>
            <Text style={{ fontSize: 11, color: token.voidTextMuted, paddingLeft: 22 }}>
              Warnings detectados activamente por nuestro sistema
            </Text>
          </Flex>
          <div style={{
            fontSize: 10,
            color: token.voidTextMuted,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            marginTop: 4,
          }}>
            ▼
          </div>
        </Flex>
      </div>

      {expanded && (
        <div style={{ padding: 12 }}>
          <Row gutter={[12, 12]}>
            {Object.entries(warningsRaw).map(([pointName, warnings]) => {
              const arr = Array.isArray(warnings) ? warnings : [];
              if (arr.length === 0) return null;
              return (
                <Col key={pointName} xs={24} sm={12} md={8}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onWarningPointClick(pointName);
                    }}
                    style={{
                      borderRadius: token.voidRadius,
                      background: token.voidSurface,
                      border: `1px solid ${token.voidBorder}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      padding: "10px 12px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = token.voidSurfaceHover;
                      e.currentTarget.style.borderColor = token.voidBorderStrong;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = token.voidSurface;
                      e.currentTarget.style.borderColor = token.voidBorder;
                    }}
                  >
                    <Flex justify="space-between" align="center">
                      <Flex align="center" gap={8}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: `${token.colorWarning}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <FaExclamationTriangle style={{ color: token.colorWarning, fontSize: 12 }} />
                        </div>
                        <div>
                          <Text strong style={{ fontSize: 13, display: "block", color: token.voidTextHeading }}>{pointName}</Text>
                          <Text style={{ fontSize: 11, color: token.voidTextMuted }}>
                            {arr.length} warning{arr.length > 1 ? "s" : ""}
                          </Text>
                        </div>
                      </Flex>
                      <FaEye style={{ fontSize: 12, color: token.voidTextMuted }} />
                    </Flex>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </Card>
  );
};

export default React.memo(CCWarningsSection);
