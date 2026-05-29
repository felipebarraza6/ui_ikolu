import React from "react";
import { Skeleton, Row, Col, Card, Flex, Table } from "antd";
import { FaMapMarkerAlt, FaBroadcastTower, FaClipboardCheck, FaExclamationTriangle } from "react-icons/fa";

const ShimmerBar = ({ width, height, active = false, style = {} }) => (
  <div
    className={active ? undefined : "ikolu-shimmer"}
    style={{
      width,
      height,
      borderRadius: 4,
      ...(active
        ? {
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 37%, rgba(255,255,255,0.15) 63%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
          }
        : {}),
      ...style,
    }}
  />
);

const SkeletonControlCenter = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* KPI Cards - Dimensiones exactas: padding 12px 14px, icono 32x32 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 8 }}>
        {[
          { icon: <FaMapMarkerAlt style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }} />, label: "Total Puntos", width: 30 },
          { icon: <FaBroadcastTower style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }} />, label: "Telemetría Activa", width: 50 },
          { icon: <FaClipboardCheck style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }} />, label: "Cumplimiento Normativo", width: 30 },
          { icon: <FaExclamationTriangle style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }} />, label: "Warnings", width: 25 },
        ].map((item, i) => (
          <Col xs={12} sm={6} md={6} key={i}>
            <Card
              size="small"
              style={{
                borderRadius: 10,
                background: i === 0 
                  ? "linear-gradient(135deg, #1F3461 0%, #2A4A8A 100%)" 
                  : "linear-gradient(135deg, #2A4A8A 0%, #3B6CA8 100%)",
                border: "none",
                boxShadow: "0 2px 8px rgba(31, 52, 97, 0.2)",
                height: 68,
              }}
              bodyStyle={{ padding: "12px 14px" }}
            >
              <Flex align="center" gap="small">
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "block", lineHeight: 1.2 }}>{item.label}</span>
                  <Skeleton active paragraph={{ rows: 0 }} title={{ width: item.width, style: { background: "rgba(255,255,255,0.3)", height: 20, margin: 0, marginTop: 4 } }} />
                </div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Segmented - Dimensiones exactas */}
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <div style={{
          display: "flex",
          gap: 4,
          padding: "2px",
          borderRadius: 6,
          background: "#f5f5f5",
        }}>
          {[
            { active: true, label: "Telemetría" },
            { active: false, label: "Cumplimiento" },
          ].map((item, i) => (
            <div 
              key={i}
              style={{ 
                padding: "6px 16px", 
                borderRadius: 4, 
                background: item.active ? "#1F3461" : "transparent",
                minWidth: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShimmerBar width="100%" height={16} active={item.active} style={{ borderRadius: 3 }} />
            </div>
          ))}
        </div>
      </Flex>

      {/* Calendar Days - Dimensiones exactas: minHeight 90px, padding 10px 8px */}
      <Flex gap={12} style={{ marginBottom: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div 
            key={i} 
            style={{ 
              flex: 1,
              minHeight: 90,
              padding: "10px 8px",
              borderRadius: 8,
              border: "1.5px solid #f0f0f0",
              background: i === 7 ? "#1F3461" : "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <ShimmerBar width={50} height={12} active={i === 7} />
            <ShimmerBar width={28} height={24} active={i === 7} />
            <ShimmerBar width={55} height={12} active={i === 7} />
          </div>
        ))}
      </Flex>

      {/* Tabla Telemetría - Usando Table de Ant Design para coincidir exactamente */}
      <Table
        size="small"
        pagination={false}
        dataSource={[1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ key: i }))}
        columns={[
          {
            title: "#",
            key: "status",
            width: 40,
            align: "center",
            render: () => (
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <ShimmerBar width={10} height={10} style={{ borderRadius: "50%" }} />
              </div>
            ),
          },
          {
            title: "Punto",
            key: "point",
            width: 70,
            render: () => <ShimmerBar width="70%" height={14} />,
          },
          {
            title: "Consumo (m³)",
            key: "consumption",
            width: 130,
            align: "right",
            render: () => <ShimmerBar width={50} height={14} style={{ marginLeft: "auto" }} />,
          },
          {
            title: "Caudal prom. (L/s)",
            key: "flow",
            width: 120,
            align: "right",
            render: () => <ShimmerBar width={40} height={14} style={{ marginLeft: "auto" }} />,
          },
          {
            title: "Nivel prom. (m)",
            key: "level",
            width: 100,
            align: "right",
            render: () => <ShimmerBar width={35} height={14} style={{ marginLeft: "auto" }} />,
          },
          {
            title: "",
            key: "actions",
            width: 120,
            align: "center",
            render: () => (
              <Flex align="center" justify="center" gap={4}>
                {[1, 2, 3].map((btn) => (
                  <div
                    key={btn}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "1px solid #f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ShimmerBar width={10} height={10} style={{ borderRadius: "50%" }} />
                  </div>
                ))}
              </Flex>
            ),
          },
        ]}
      />
    </div>
  );
};

export default React.memo(SkeletonControlCenter);