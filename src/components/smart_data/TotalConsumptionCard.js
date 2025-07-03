import React from "react";
import { Typography, Checkbox, Flex } from "antd";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;
const B_CORP_LOGO_URL =
  "https://s3.amazonaws.com/blab-impact-js-production/app/images/es-es/BIA-Logo@2x-6d655d272b0461db5c9c7ce0959a1a71.png";

const TotalConsumptionCard = ({ records, noTracking, setNoTracking }) => {
  const { t, i18n } = useTranslation();
  // Sumar todos los totales de los registros
  const total = records.reduce(
    (sum, rec) => sum + rec.monthly.reduce((s, v) => s + (Number(v) || 0), 0),
    0
  );
  // Formato: punto como miles, sin decimales ni coma
  const formatNumber = (num) => {
    if (typeof num !== "number") return num;
    return Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Texto explicativo multi-idioma
  const description =
    i18n.language === "es"
      ? "Suma total de todos los registros anuales ingresados. Este valor representa el consumo total de agua registrado en todos los puntos/años."
      : i18n.language === "en"
      ? "Total sum of all annual records entered. This value represents the total water consumption recorded across all points/years."
      : "所有年度记录的总和。此值表示所有点/年度的总用水量。";

  // Ajustar tamaño del número según longitud
  const totalLength = formatNumber(total).length;
  let fontSize = 48;
  if (totalLength > 8) fontSize = 38;
  if (totalLength > 12) fontSize = 28;

  return (
    <Flex
      vertical
      gap="small"
      align="center"
      justify="space-between"
      style={{
        background: "linear-gradient(135deg, #1F3461 0%, #dbe6f6 100%)",
        borderRadius: 22,
        padding: 32,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 24px 0 rgba(31,52,97,0.10)",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        maxWidth: 420,
        minWidth: 200,
      }}
    >
      {/* Solo el número grande de m³ */}
      <Title
        level={5}
        style={{
          color: "#fff",
          margin: 0,
          fontSize,
          textShadow: "0 2px 8px #1F346155",
        }}
      >
        {noTracking ? "-" : formatNumber(total)} m³
      </Title>
      <Paragraph
        style={{
          color: "#eaf3fa",
          fontWeight: 400,
          margin: "12px 0 8px 0",
          maxWidth: 500,
        }}
      >
        {description}
      </Paragraph>
      <Checkbox
        checked={noTracking}
        onChange={(e) => setNoTracking(e.target.checked)}
        style={{ color: "#fff", fontWeight: 500, marginTop: 12 }}
      >
        {t("waterModule.noTracking", "No realizamos seguimiento ")}
      </Checkbox>
      <img
        src={B_CORP_LOGO_URL}
        alt="Empresas B"
        style={{
          width: "80%",
          maxWidth: "100%",
          filter: "brightness(0) invert(1)",
          opacity: 0.9,
          marginTop: 24,
          marginBottom: 8,
          display: "block",
        }}
      />
      {/* Waves decorativas */}
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
    </Flex>
  );
};

export default TotalConsumptionCard;
