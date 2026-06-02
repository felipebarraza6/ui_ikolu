import React from "react";
import { Table, Flex } from "antd";

const ShimmerBar = ({ width, height, style = {} }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 4,
      background: "#f5f5f5",
      ...style,
    }}
  />
);

const SkeletonTelemetry = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Calendar Days - 7 cuadritos */}
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
            <ShimmerBar width={50} height={12} />
            <ShimmerBar width={28} height={24} />
            <ShimmerBar width={55} height={12} />
          </div>
        ))}
      </Flex>

      {/* Telemetry Table - Exactamente igual a CCWeekConsumption */}
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
              <div
                style={{
                  width: 20,
                  height: 20,
                  minWidth: 20,
                  minHeight: 20,
                  borderRadius: "50%",
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <ShimmerBar width={10} height={10} style={{ borderRadius: "50%" }} />
              </div>
            ),
          },
          {
            title: "Punto",
            key: "pointName",
            width: 140,
            render: () => <ShimmerBar width="80%" height={14} />,
          },
          {
            title: "Consumo (m³)",
            key: "consumption",
            width: 130,
            align: "right",
            render: () => <ShimmerBar width={60} height={14} style={{ marginLeft: "auto" }} />,
          },
          {
            title: "Caudal prom. (L/s)",
            key: "avg_flow",
            width: 120,
            align: "right",
            render: () => <ShimmerBar width={50} height={14} style={{ marginLeft: "auto" }} />,
          },
          {
            title: "Nivel prom. (m)",
            key: "avg_level",
            width: 100,
            align: "right",
            render: () => <ShimmerBar width={40} height={14} style={{ marginLeft: "auto" }} />,
          },
          {
            title: "",
            key: "actions",
            width: 120,
            align: "center",
            render: () => (
              <Flex align="center" justify="center" gap={4}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 6px",
                    borderRadius: 10,
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <ShimmerBar width={10} height={10} style={{ borderRadius: "50%" }} />
                  <ShimmerBar width={16} height={10} />
                </div>
                {[1, 2].map((btn) => (
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

export default React.memo(SkeletonTelemetry);
