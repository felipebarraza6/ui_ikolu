import React, { memo, useCallback } from "react";
import { Row, Col, Flex, Typography, theme, Segmented, Tooltip, Button, Input, message } from "antd";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaClipboardCheck,
  FaDownload,
  FaSearch,
} from "react-icons/fa";
import { SmartKPICard } from "../../../shared/ui";
import { BlinkingDot } from "../components";

import ControlCenterChat from "../components/Chat/ControlCenterChat";
import { format } from "date-fns";

const { Text } = Typography;
const { useToken } = theme;

const ControlCenterLayout = memo(({
  overview,
  points,
  warningsList,
  warningsRaw,
  chatQuota,
  activeTab,
  onTabChange,
  onWarningClick,
  children,
  loading,
  search,
  onSearchChange,
}) => {
  const { token } = useToken();

  const handleExport = useCallback(() => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const headers = [
        "Fecha del reporte",
        "Total Puntos",
        "Telemetria Activa",
        "Cumplimiento Normativo",
        "Warnings",
        "Nombre Punto",
        "Caudal (L/s)",
        "Consumo (m3)",
        "Estado",
      ];
      const rows = (points || []).map((p) => {
        const level = p.compliance_warning?.level || "safe";
        const statusMap = { safe: "Dentro de limites", warning: "Cerca de superar limite", critical: "Incumplimiento detectado", unknown: "Sin limites configurados" };
        return [
          today,
          overview.total_points || 0,
          overview.points_with_telemetry || 0,
          overview.points_with_compliance || 0,
          warningsList.length,
          p.title || "",
          p.flow_lps != null ? Number(p.flow_lps).toFixed(1) : "",
          p.total_m3 != null ? Number(p.total_m3).toFixed(0) : "",
          statusMap[level] || level,
        ];
      });
      const csv = [headers.join(","), ...rows.map((r) => r.map((v) => typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v).join(","))].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ikolu_reporte_${today}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      message.success("Reporte exportado exitosamente");
    } catch (err) {
      console.error("[ExportReport] Error:", err);
      message.error("Error al exportar el reporte");
    }
  }, [overview, points, warningsList]);

  const hasWarnings = warningsList.length > 0;

  return (
    <div className="ocean-layout">
      <Row id="cc-kpi-cards" gutter={[16, 24]} className="ocean-kpi-row">
        <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="card-lift">
            <Tooltip title="Cantidad total de puntos de captacion registrados" placement="top">
              <div>
                <SmartKPICard
                  icon={<FaMapMarkerAlt style={{ fontSize: 18, color: '#ffffff' }} />}
                  label="Total Puntos"
                  value={overview.total_points || 0}
                  gradient={`linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimary}dd 100%)`}
                  wave={true}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </div>
        </Col>
        <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="card-lift">
            <Tooltip title="Puntos con telemetria funcionando en tiempo real" placement="top">
              <div>
                <SmartKPICard
                  icon={<BlinkingDot size={12} color="#ffffff" variant="telemetry" />}
                  label="Telemetria Activa"
                  value={`${overview.points_with_telemetry || 0}`}
                  suffix={`/${overview.total_points || 0}`}
                  gradient={`linear-gradient(135deg, ${token.colorInfo} 0%, ${token.colorInfo}dd 100%)`}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </div>
        </Col>
        <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="card-lift">
            <Tooltip title="Puntos con configuracion DGA/SMA completa" placement="top">
              <div>
                <SmartKPICard
                  icon={<FaClipboardCheck style={{ fontSize: 18, color: '#ffffff' }} />}
                  label="Cumplimiento Normativo"
                  value={overview.points_with_compliance || 0}
                  gradient={`linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorSuccess}dd 100%)`}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </div>
        </Col>
        <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="card-lift">
            <Tooltip title="Alertas y advertencias detectadas recientemente" placement="top">
              <div>
                <SmartKPICard
                  icon={<BlinkingDot size={12} color="#ffffff" variant="warning" active={hasWarnings} />}
                  label="Warnings"
                  value={warningsList.length}
                  gradient={`linear-gradient(135deg, ${token.colorWarning} 0%, ${token.colorError} 100%)`}
                  loading={loading}
                  onClick={
                    hasWarnings
                      ? () => {
                          const firstPoint = Object.keys(warningsRaw)[0];
                          if (firstPoint) onWarningClick(firstPoint);
                        }
                      : undefined
                  }
                />
              </div>
            </Tooltip>
          </div>
        </Col>
      </Row>

      {!loading && (
        <ControlCenterChat points={points} chatQuota={chatQuota} />
      )}

      <div className="ocean-tabs-container"
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
        }}
      >
        <Flex justify="space-between" align="center" className="ocean-tabs-header">
          <Flex align="center" gap={12}>
            <Button
              size="small"
              icon={<FaDownload className="ocean-icon-xs" />}
              onClick={handleExport}
            >
              Exportar
            </Button>
            <Input
              variant="borderless"
              placeholder="Buscar punto..."
              allowClear
              prefix={<FaSearch style={{ color: token.colorTextQuaternary, fontSize: 13 }} />}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: 220 }}
              size="small"
            />
          </Flex>
          <Segmented
            options={[
              {
                value: "telemetry",
                label: (
                  <Flex align="center" gap={8}>
                    <FaBroadcastTower style={{ color: token.colorInfo, fontSize: 14 }} />
                    <span style={{ color: activeTab === "telemetry" ? token.colorInfo : token.colorTextSecondary, fontWeight: 500 }}>Telemetria</span>
                  </Flex>
                ),
              },
              {
                value: "compliance",
                label: (
                  <Flex align="center" gap={8}>
                    <FaClipboardCheck style={{ color: token.colorSuccess, fontSize: 14 }} />
                    <span style={{ color: activeTab === "compliance" ? token.colorSuccess : token.colorTextSecondary, fontWeight: 500 }}>Cumplimiento</span>
                  </Flex>
                ),
              },
            ]}
            value={activeTab}
            onChange={onTabChange}
            style={{
              background: token.colorFillSecondary,
              borderRadius: token.borderRadius,
              padding: 4,
            }}
          />
        </Flex>

        {children}
      </div>
    </div>
  );
});

ControlCenterLayout.displayName = "ControlCenterLayout";

export default ControlCenterLayout;
