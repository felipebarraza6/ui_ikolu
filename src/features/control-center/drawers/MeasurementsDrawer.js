import React from "react";
import { Row, Col, Flex, Typography, Select, Tabs, Segmented, Tag } from "antd";
import { FaMapMarkerAlt, FaArrowLeft, FaArrowRight, FaChartLine, FaTable } from "react-icons/fa";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale/es";
import { useIkoluToken } from "../../../hooks/useIkoluToken";

const { Text } = Typography;

const MeasurementsDrawerHeader = ({
  pointsRef,
  selectedMeasurementPoint,
  handleNavigatePointTo,
  handleNavigateDate,
  measurementsViewMode,
  setMeasurementsViewMode,
  measurementsTab,
  setMeasurementsTab,
}) => {
  const token = useIkoluToken();

  return (
    <div style={{ width: "100%" }}>
      <Flex align="center" justify="space-between" gap={16}>
        <Select
          showSearch
          value={selectedMeasurementPoint?.pointId}
          onChange={(val) => {
            const point = pointsRef.current?.find(p => p.id === val);
            if (!point) return;
            handleNavigatePointTo(point);
          }}
          style={{ minWidth: 280, maxWidth: 400, background: token.glassBg, borderColor: token.glassBorder }}
          placeholder="Seleccionar punto"
          optionFilterProp="label"
          optionLabelProp="label"
          size="middle"
          popupMatchSelectWidth={false}
          getPopupContainer={() => document.body}
          listHeight={320}
          dropdownStyle={{ borderRadius: token.voidRadius, boxShadow: token.voidShadow }}
          suffixIcon={<FaMapMarkerAlt size={12} style={{ color: token.voidTextHeading }} />}
        >
          {pointsRef.current.map((p) => {
            const hasGPS = p.hasGPS;
            const typeDGA = p.type_dga || '—';
            const codeDGA = p.code_dga;

            return (
              <Select.Option key={p.id} value={p.id} label={p.title || p.name || `Punto ${p.id}`}>
                <Flex align="center" justify="space-between" style={{ width: '100%', padding: '4px 0' }}>
                  <Flex align="center" gap={10}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: token.voidSurface,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaMapMarkerAlt size={12} style={{ color: token.voidTextHeading }} />
                    </div>
                    <Flex vertical>
                      <span style={{ fontWeight: 600, fontSize: 13, color: token.voidTextHeading }}>{p.title || p.name || `Punto ${p.id}`}</span>
                      {codeDGA && (
                        <span style={{ fontSize: 11, color: token.voidTextMuted }}>{codeDGA}</span>
                      )}
                    </Flex>
                  </Flex>
                  <Flex gap={6}>
                    {hasGPS && (
                      <Tag size="small" style={{ fontSize: 10, margin: 0, background: token.voidSurface, borderColor: token.voidBorder, color: token.voidTextHeading }}>
                        GPS
                      </Tag>
                    )}
                    <Tag size="small" style={{ fontSize: 10, margin: 0, background: typeDGA === 'SUBTERRANEO' ? `${token.colorSuccess}15` : `${token.colorWarning}15`, border: 'none', color: typeDGA === 'SUBTERRANEO' ? token.colorSuccess : token.colorWarning }}>
                      {typeDGA === 'SUBTERRANEO' ? 'SUB' : typeDGA === 'SUPERFICIAL' ? 'SUP' : typeDGA}
                    </Tag>
                  </Flex>
                </Flex>
              </Select.Option>
            );
          })}
        </Select>

        <Flex align="center" gap={16}>
          <Flex align="center" gap={8}>
            {(() => {
              const today = format(new Date(), 'yyyy-MM-dd');
              const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
              const currentDate = selectedMeasurementPoint?.date;
              const canGoBack = currentDate > sevenDaysAgo;
              const canGoForward = currentDate < today;

              return (
                <>
                  <FaArrowLeft
                    size={12}
                    onClick={() => canGoBack && handleNavigateDate(-1)}
                    style={{
                      cursor: canGoBack ? 'pointer' : 'default',
                      opacity: canGoBack ? 0.8 : 0.2,
                      transition: 'opacity 0.2s',
                      color: token.voidTextHeading,
                    }}
                  />
                  <Text style={{ fontSize: 12, fontWeight: 500, color: token.voidTextHeading }}>
                    {selectedMeasurementPoint?.date ? format(parseISO(selectedMeasurementPoint.date), "EEE d MMM yyyy", { locale: es }) : ""}
                  </Text>
                  <FaArrowRight
                    size={12}
                    onClick={() => canGoForward && handleNavigateDate(1)}
                    style={{
                      cursor: canGoForward ? 'pointer' : 'default',
                      opacity: canGoForward ? 0.8 : 0.2,
                      transition: 'opacity 0.2s',
                      color: token.voidTextHeading,
                    }}
                  />
                </>
              );
            })()}
          </Flex>

          {measurementsViewMode === "chart" && (
            <Tabs
              activeKey={measurementsTab}
              onChange={setMeasurementsTab}
              size="small"
              tabBarStyle={{ marginBottom: 0 }}
              items={[
                { key: "1", label: "Hidrometría" },
                { key: "2", label: "Niveles" },
              ]}
            />
          )}
        </Flex>

        <Segmented
          value={measurementsViewMode}
          onChange={setMeasurementsViewMode}
          options={[
            { label: <Flex align="center" gap={4}><FaChartLine size={12} style={{ color: token.voidTextHeading }} />Gráfico</Flex>, value: "chart" },
            { label: <Flex align="center" gap={4}><FaTable size={12} style={{ color: token.voidTextHeading }} />Datos</Flex>, value: "table" },
          ]}
          size="small"
          style={{ background: token.voidSurface }}
        />
      </Flex>
    </div>
  );
};

const MeasurementsDrawerLoading = () => {
  const token = useIkoluToken();

  return (
    <Flex vertical gap={16} style={{ padding: "10px 0" }}>
      <Row gutter={[16, 16]}>
        {[1, 2].map(i => (
          <Col xs={24} md={12} key={i}>
            <div style={{ borderRadius: token.voidRadius, border: `1px solid ${token.voidBorder}`, overflow: "hidden", background: token.glassBg, backdropFilter: "blur(8px)" }}>
              <div style={{ height: 40, background: token.voidSurface }} />
              <div style={{ height: 50, padding: "10px 16px", display: "flex", gap: 8, justifyContent: "center" }}>
                {[1, 2, 3].map(j => <div key={j} style={{ flex: 1, height: 40, borderRadius: 6, background: token.voidSurfaceHover }} />)}
              </div>
              <div style={{ height: 220, padding: 16 }}>
                <div style={{ height: "100%", borderRadius: 8, background: token.voidSurfaceHover }} />
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Flex>
  );
};

export { MeasurementsDrawerHeader, MeasurementsDrawerLoading };
