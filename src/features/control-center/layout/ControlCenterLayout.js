import React, { memo, useCallback } from "react";
import { Row, Col, Flex, Typography, Segmented, Tooltip, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaClipboardCheck,
  FaProjectDiagram,
} from "react-icons/fa";
import { SmartKPICard } from "../../../shared/ui";
import { useIkoluToken } from "../../../hooks/useIkoluToken";
import { BlinkingDot } from "../components";

import ControlCenterChat from "../components/Chat/ControlCenterChat";

const { Text } = Typography;

const KPIsSection = memo(({
  overview,
  points,
  warningsRaw,
  chatQuota,
  loading,
  onWarningClick,
  token,
}) => {
  const warningsCount = overview.warnings || 0;
  const hasWarnings = warningsCount > 0;

  return (
    <>
      <Row id="cc-kpi-cards" gutter={[16, 24]} className="ocean-kpi-row">
        <Col xs={12} sm={6} md={6} className="fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="card-lift">
            <Tooltip title="Cantidad total de puntos de captacion registrados" placement="top">
              <div>
                <SmartKPICard
                  icon={<FaMapMarkerAlt style={{ fontSize: 18, color: token.voidTextHeading }} />}
                  label="Total Puntos"
                  value={overview.total_points || 0}
                  variant="void"
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
                  icon={<BlinkingDot size={12} color={token.voidTextHeading} variant="telemetry" />}
                  label="Telemetria Activa"
                  value={`${overview.points_with_telemetry || 0}`}
                  suffix={`/${overview.total_points || 0}`}
                  variant="void"
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
                  icon={<FaClipboardCheck style={{ fontSize: 18, color: token.voidTextHeading }} />}
                  label="Cumplimiento Normativo"
                  value={overview.points_with_compliance || 0}
                  variant="void"
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
                  icon={<BlinkingDot size={12} color={token.voidTextHeading} variant="warning" active={hasWarnings} />}
                  label="Warnings"
                  value={warningsCount}
                  variant="void"
                  loading={loading}
                  onClick={() => onWarningClick()}
                />
              </div>
            </Tooltip>
          </div>
        </Col>
      </Row>

      {!loading && (
        <ControlCenterChat points={points} chatQuota={chatQuota} />
      )}
    </>
  );
});

KPIsSection.displayName = "KPIsSection";

const ControlCenterLayout = memo(({
  overview,
  points,
  warningsList,
  warningsRaw,
  chatQuota,
  projects,
  selectedProject,
  onSelectProject,
  dateRange,
  onDateRangeChange,
  activeTab,
  onTabChange,
  onWarningClick,
  children,
  loading,
  tableLoading,
}) => {
  const token = useIkoluToken();

  const handleRangeChange = useCallback((dates) => {
    if (!dates || dates.length !== 2) return;
    onDateRangeChange({
      startDate: dates[0].format("YYYY-MM-DD"),
      endDate: dates[1].format("YYYY-MM-DD"),
    });
  }, [onDateRangeChange]);

  return (
    <div className="ocean-layout">
      <KPIsSection
        overview={overview}
        points={points}
        warningsRaw={warningsRaw}
        chatQuota={chatQuota}
        loading={loading}
        onWarningClick={onWarningClick}
        token={token}
      />

      <div className="ocean-tabs-container"
        style={{
          background: token.glassBg,
          borderRadius: token.voidRadius,
          border: `1px solid ${token.glassBorder}`,
          backdropFilter: "blur(12px)",
          boxShadow: token.voidShadow,
        }}
      >
        <Flex justify="space-between" align="center" className="ocean-tabs-header" wrap="wrap" gap={12}>
          <Flex align="center" gap={12}>
            <DatePicker.RangePicker
              size="small"
              disabled={tableLoading}
              value={[
                dateRange?.startDate ? dayjs(dateRange.startDate) : null,
                dateRange?.endDate ? dayjs(dateRange.endDate) : null,
              ]}
              onChange={handleRangeChange}
              allowClear={false}
              format="DD/MM/YYYY"
              style={{ background: token.glassBg, borderColor: token.glassBorder }}
            />
            {projects.length > 0 && (
              <Select
                placeholder="Filtrar por proyecto"
                allowClear
                showSearch
                size="small"
                style={{ minWidth: 220 }}
                value={selectedProject || undefined}
                onChange={(value) => onSelectProject(value || null)}
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                prefix={<FaProjectDiagram style={{ color: token.voidTextMuted, fontSize: 13 }} />}
              />
            )}
          </Flex>
          <Segmented
            options={[
              {
                value: "telemetry",
                label: (
                  <Flex align="center" gap={8}>
                    <FaBroadcastTower style={{ color: activeTab === "telemetry" ? token.voidTextHeading : token.voidTextMuted, fontSize: 14 }} />
                    <span style={{ color: activeTab === "telemetry" ? token.voidTextHeading : token.voidTextMuted, fontWeight: 500 }}>Telemetria</span>
                  </Flex>
                ),
              },
              {
                value: "compliance",
                label: (
                  <Flex align="center" gap={8}>
                    <FaClipboardCheck style={{ color: activeTab === "compliance" ? token.voidTextHeading : token.voidTextMuted, fontSize: 14 }} />
                    <span style={{ color: activeTab === "compliance" ? token.voidTextHeading : token.voidTextMuted, fontWeight: 500 }}>Cumplimiento</span>
                  </Flex>
                ),
              },
            ]}
            value={activeTab}
            onChange={onTabChange}
            style={{
              background: token.voidSurface,
              borderRadius: token.voidRadius,
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
