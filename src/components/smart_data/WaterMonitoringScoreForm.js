import React, { useMemo, useState } from "react";
import { Checkbox, Typography, Flex, Button, Space } from "antd";
import { useTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

// SVG minimalista para cada bandera
const FlagIcon = ({ code, size = 20 }) => {
  switch (code) {
    case "es": // México
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="6" fill="#fff" />
          <rect x="0" y="0" width="8" height="24" fill="#006341" />
          <rect x="16" y="0" width="8" height="24" fill="#ce1126" />
        </svg>
      );
    case "en": // USA
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="6" fill="#fff" />
          <rect y="0" width="24" height="4" fill="#b22234" />
          <rect y="8" width="24" height="4" fill="#b22234" />
          <rect y="16" width="24" height="4" fill="#b22234" />
          <rect width="10" height="12" fill="#3c3b6e" />
        </svg>
      );
    case "zh": // China
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="6" fill="#de2910" />
          <circle cx="6" cy="6" r="3" fill="#ffde00" />
          <circle cx="13" cy="4" r="1" fill="#ffde00" />
          <circle cx="10" cy="10" r="1" fill="#ffde00" />
          <circle cx="14" cy="9" r="1" fill="#ffde00" />
          <circle cx="12" cy="7" r="1" fill="#ffde00" />
        </svg>
      );
    default:
      return null;
  }
};

const LANGUAGES = [
  { code: "es", label: "ESP" },
  { code: "en", label: "ENG" },
  { code: "zh", label: "中文" },
];

const WaterMonitoringScoreForm = ({ selectedOptions, setSelectedOptions }) => {
  const { t, i18n } = useTranslation();
  const options = t("waterModule.options", { returnObjects: true });
  const [modalVisible, setModalVisible] = useState(false);

  const score = useMemo(() => {
    // Puntajes fijos según el índice de la opción
    const scores = [0.0, 0.88, 1.75, 2.63, 0.88];
    const totalScore = selectedOptions.reduce((acc, value) => {
      const idx = value - 1;
      return acc + (scores[idx] || 0);
    }, 0);
    return Math.min(totalScore, 3.5).toFixed(2);
  }, [selectedOptions]);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1F3461 0%, #3ec6a6 100%)",
        borderRadius: 18,
        padding: 28,
        boxShadow: "0 4px 24px 0 rgba(16, 114, 140, 0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Selector de idioma con banderas minimalistas */}
      <div style={{ position: "absolute", top: 16, right: 20, zIndex: 2 }}>
        <Space>
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.code}
              shape="round"
              size="small"
              style={{
                background: i18n.language === lang.code ? "#fff" : "#e6f7ff",
                border:
                  i18n.language === lang.code ? "2px solid #1677ff" : "none",
                fontWeight: 600,
                color: "#1677ff",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow:
                  i18n.language === lang.code ? "0 0 6px #1677ff55" : "none",
                transition: "all 0.2s",
                padding: "0 10px",
              }}
              onClick={() => i18n.changeLanguage(lang.code)}
            >
              <FlagIcon code={lang.code} size={16} />
              {lang.label}
            </Button>
          ))}
        </Space>
      </div>
      <Flex
        vertical
        gap="middle"
        style={{ marginBottom: 24, marginTop: "20px" }}
      >
        <Title level={4} style={{ margin: 0, color: "#fff" }}>
          {t("waterModule.title")}
        </Title>
        <Paragraph
          type="secondary"
          style={{ fontWeight: 300, color: "#e6f7ff" }}
        >
          {t("waterModule.description")}
        </Paragraph>
        <Checkbox.Group
          value={selectedOptions}
          onChange={setSelectedOptions}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {options.map((label, idx) => (
            <Checkbox
              key={idx + 1}
              value={idx + 1}
              style={{
                color: "#fff",
                background: "rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: 6,
              }}
            >
              {label}
            </Checkbox>
          ))}
        </Checkbox.Group>
        <Flex justify="flex-end" align="center">
          <Title level={5} style={{ margin: 0, color: "#fff" }}>
            {t("waterModule.totalScore")}: {score}
          </Title>
        </Flex>
      </Flex>
      {/* Capa decorativa de ondas suaves */}
      <svg
        viewBox="0 0 500 60"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: 60,
          zIndex: 1,
        }}
      >
        <path
          d="M0,30 Q125,60 250,30 T500,30 V60 H0 Z"
          fill="#fff"
          fillOpacity="0.13"
        />
        <path
          d="M0,40 Q125,20 250,40 T500,40 V60 H0 Z"
          fill="#fff"
          fillOpacity="0.09"
        />
      </svg>
    </div>
  );
};

export default WaterMonitoringScoreForm;
