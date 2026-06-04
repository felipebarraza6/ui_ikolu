import React, { memo, useCallback } from "react";
import { Row, Col, Flex, Typography, theme, Segmented, Tooltip, Button, message } from "antd";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaDownload,
} from "react-icons/fa";
import { SmartKPICard } from "../../shared/ui";

import ControlCenterChat from "./ControlCenterChat";
import SkeletonControlCenter from "./SkeletonControlCenter";
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

  return (
    <div className="ocean-layout">
      {loading ? (
        <SkeletonControlCenter />
      ) : (
        <Row id="cc-kpi-cards" gutter={[16, 24]} className="ocean-kpi-row">
          <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.05s" }}>
            <div className="card-lift">
              <Tooltip title="Cantidad total de puntos de captación registrados" placement="top">
                <div>
                  <SmartKPICard
                    icon={<FaMapMarkerAlt style={{ fontSize: 18, color: '#ffffff' }} />}
                    label="Total Puntos"
                    value={overview.total_points || 0}
                    gradient={`linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimary}dd 100%)`}
                  />
                </div>
              </Tooltip>
            </div>
          </Col>
          <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="card-lift">
              <Tooltip title="Puntos con telemetría funcionando en tiempo real" placement="top">
                <div>
                  <SmartKPICard
                    icon={<FaBroadcastTower style={{ fontSize: 18, color: '#ffffff' }} />}
                    label="Telemetría Activa"
                    value={`${overview.points_with_telemetry || 0}`}
                    suffix={`/${overview.total_points || 0}`}
                    gradient={`linear-gradient(135deg, ${token.colorInfo} 0%, ${token.colorInfo}dd 100%)`}
                  />
                </div>
              </Tooltip>
            </div>
          </Col>
          <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="card-lift">
              <Tooltip title="Puntos con configuración DGA/SMA completa" placement="top">
                <div>
                  <SmartKPICard
                    icon={<FaClipboardCheck style={{ fontSize: 18, color: '#ffffff' }} />}
                    label="Cumplimiento Normativo"
                    value={overview.points_with_compliance || 0}
                    gradient={`linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorSuccess}dd 100%)`}
                  />
                </div>
              </Tooltip>
            </div>
          </Col>
          <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="card-lift">
              <Tooltip title="Alertas y advertencias detectadas recientemente" placement="top">
                <div style={{
                  animation: warningsList.length > 0 ? 'warning-double-blink 2s ease-in-out infinite' : 'none',
                }}>
                  <SmartKPICard
                    icon={<FaExclamationTriangle style={{ fontSize: 18, color: '#ffffff' }} />}
                    label="Warnings"
                    value={warningsList.length}
                    gradient={`linear-gradient(135deg, ${token.colorWarning} 0%, ${token.colorError} 100%)`}
                    onClick={
                      warningsList.length > 0
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
      )}

      {!loading && (
        <ControlCenterChat points={points} chatQuota={chatQuota} />
      )}

      <div style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
        padding: 24,
        marginTop: 24,
      }}>
        <Flex justify="space-between" align="center" className="ocean-tabs-header">
          <Button
            size="small"
            icon={<FaDownload className="ocean-icon-xs" />}
            onClick={handleExport}
          >
            Exportar
          </Button>
          <Segmented
            options={[
              {
                value: "telemetry",
                label: (
                  <Flex align="center" gap={8}>
                    <FaBroadcastTower className="ocean-icon-cyan" />
                    <span className="ocean-tab-label">Telemetría</span>
                  </Flex>
                ),
              },
              {
                value: "compliance",
                label: (
                  <Flex align="center" gap={8}>
                    <FaClipboardCheck className="ocean-icon-cyan" />
                    <span className="ocean-tab-label">Cumplimiento</span>
                  </Flex>
                ),
              },
            ]}
            value={activeTab}
            onChange={onTabChange}
            className="ocean-segmented"
          />
        </Flex>

        {children}
      </div>
    </div>
  );
});

ControlCenterLayout.displayName = "ControlCenterLayout";

export default ControlCenterLayout;
