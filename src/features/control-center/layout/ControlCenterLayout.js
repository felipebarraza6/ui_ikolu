import React, { memo, useCallback } from "react";
import { Row, Col, Flex, Typography, theme, Segmented, Tooltip, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import {
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaClipboardCheck,
  FaProjectDiagram,
} from "react-icons/fa";
import { SmartKPICard } from "../../../shared/ui";
import { BlinkingDot } from "../components";

import ControlCenterChat from "../components/Chat/ControlCenterChat";

const { Text } = Typography;
const { useToken } = theme;

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
                  value={warningsCount}
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
  const { token } = useToken();

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
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
        }}
      >
        <Flex justify="space-between" align="center" className="ocean-tabs-header">
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
                prefix={<FaProjectDiagram style={{ color: token.colorTextQuaternary, fontSize: 13 }} />}
              />
            )}
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
