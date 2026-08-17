import React, { memo, useCallback } from "react";
import { Row, Col, Flex, Segmented, Tooltip, Select, DatePicker } from "antd";
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
      <Row id="cc-kpi-cards" gutter={[12, 12]} className="ocean-kpi-row">
        <Col xs={12} sm={6} md={6}>
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
        </Col>
        <Col xs={12} sm={6} md={6}>
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
        </Col>
        <Col xs={12} sm={6} md={6}>
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
        </Col>
        <Col xs={12} sm={6} md={6}>
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
        </Col>
      </Row>
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

      <div className="ocean-tabs-container">
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
                value={selectedProject ? String(selectedProject) : undefined}
                onChange={(value) => onSelectProject(value ? String(value) : null)}
                options={projects.map((p) => {
                  const pId = p?.id ?? p?.project_id ?? p?.pk;
                  const pName = p?.name || p?.project_name || p?.title || (pId ? `Proyecto ${pId}` : "Sin nombre");
                  return { value: String(pId), label: String(pName) };
                })}
                filterOption={(input, option) =>
                  String(option?.label || "")
                    .toLowerCase()
                    .includes((input || "").toLowerCase().trim())
                }
                optionFilterProp="label"
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
