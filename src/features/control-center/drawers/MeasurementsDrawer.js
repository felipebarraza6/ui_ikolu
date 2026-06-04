import React from "react";
import { Row, Col, Flex, Typography, Select, Tabs, Segmented, Tag, theme } from "antd";
import { FaMapMarkerAlt, FaArrowLeft, FaArrowRight, FaChartLine, FaTable } from "react-icons/fa";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale/es";

import { MeasurementsDrawerContentMemo } from "../measurements/MeasurementDrawer";

const { Text } = Typography;
const { useToken } = theme;

const MeasurementsDrawerHeader = ({
  pointsRef,
  last7Ref,
  selectedMeasurementPoint,
  handleNavigatePointTo,
  handleNavigateDate,
  measurementsViewMode,
  setMeasurementsViewMode,
  measurementsTab,
  setMeasurementsTab,
}) => {
  const { token } = useToken();

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
          style={{ minWidth: 280, maxWidth: 400 }}
          placeholder="Seleccionar punto"
          optionFilterProp="label"
          optionLabelProp="label"
          size="middle"
          popupMatchSelectWidth={false}
          getPopupContainer={() => document.body}
          listHeight={320}
          dropdownStyle={{ borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
          suffixIcon={<FaMapMarkerAlt size={12} style={{ color: token.colorPrimary }} />}
        >
          {pointsRef.current.map((p) => {
            const pointData = last7Ref.current?.[p.title] || {};
            const hasGPS = p.hasGPS || pointData.hasGPS;
            const typeDGA = p.type_dga || pointData.type_dga || '—';
            const codeDGA = p.code_dga || pointData.code_dga;

            return (
              <Select.Option key={p.id} value={p.id} label={p.title || p.name || `Punto ${p.id}`}>
                <Flex align="center" justify="space-between" style={{ width: '100%', padding: '4px 0' }}>
                  <Flex align="center" gap={10}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: `${token.colorPrimary}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaMapMarkerAlt size={12} style={{ color: token.colorPrimary }} />
                    </div>
                    <Flex vertical>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{p.title || p.name || `Punto ${p.id}`}</span>
                      {codeDGA && (
                        <span style={{ fontSize: 11, color: token.colorTextSecondary }}>{codeDGA}</span>
                      )}
                    </Flex>
                  </Flex>
                  <Flex gap={6}>
                    {hasGPS && (
                      <Tag size="small" style={{ fontSize: 10, margin: 0, background: 'rgba(58, 104, 170, 0.15)', color: token.colorWarning, border: 'none' }}>
                        GPS
                      </Tag>
                    )}
                    <Tag size="small" style={{ fontSize: 10, margin: 0, background: typeDGA === 'SUBTERRANEO' ? 'rgba(42, 157, 143, 0.15)' : 'rgba(244, 162, 97, 0.15)', color: typeDGA === 'SUBTERRANEO' ? token.colorSuccess : token.colorWarning, border: 'none' }}>
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
                    }}
                  />
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>
                    {selectedMeasurementPoint?.date ? format(parseISO(selectedMeasurementPoint.date), "EEE d MMM yyyy", { locale: es }) : ""}
                  </Text>
                  <FaArrowRight
                    size={12}
                    onClick={() => canGoForward && handleNavigateDate(1)}
                    style={{
                      cursor: canGoForward ? 'pointer' : 'default',
                      opacity: canGoForward ? 0.8 : 0.2,
                      transition: 'opacity 0.2s',
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
            { label: <Flex align="center" gap={4}><FaChartLine size={12} />Gráfico</Flex>, value: "chart" },
            { label: <Flex align="center" gap={4}><FaTable size={12} />Datos</Flex>, value: "table" },
          ]}
          size="small"
        />
      </Flex>
    </div>
  );
};

const MeasurementsDrawerLoading = () => {
  const { token } = useToken();

  return (
    <Flex vertical gap={16} style={{ padding: "10px 0" }}>
      <Row gutter={[16, 16]}>
        {[1, 2].map(i => (
          <Col xs={24} md={12} key={i}>
            <div style={{ borderRadius: 12, border: `1px solid ${token.colorBorder}`, overflow: "hidden" }}>
              <div style={{ height: 40, background: token.colorBgLayout }} />
              <div style={{ height: 50, padding: "10px 16px", display: "flex", gap: 8, justifyContent: "center" }}>
                {[1, 2, 3].map(j => <div key={j} style={{ flex: 1, height: 40, borderRadius: 6, background: token.colorFillQuaternary }} />)}
              </div>
              <div style={{ height: 220, padding: 16 }}>
                <div style={{ height: "100%", borderRadius: 8, background: token.colorFillQuaternary }} />
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Flex>
  );
};

export { MeasurementsDrawerHeader, MeasurementsDrawerLoading };
