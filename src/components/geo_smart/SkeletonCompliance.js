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

const SkeletonCompliance = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Table
        size="small"
        pagination={false}
        dataSource={[1, 2, 3, 4, 5].map((i) => ({ key: i }))}
        columns={[
          {
            title: "Punto",
            key: "point_name",
            width: 100,
            render: () => (
              <Flex vertical gap={2}>
                <ShimmerBar width="80%" height={13} />
                <Flex gap={4}>
                  <div
                    style={{
                      padding: "1px 5px",
                      borderRadius: 4,
                      background: "#f5f5f5",
                      display: "inline-block",
                    }}
                  >
                    <ShimmerBar width={30} height={10} />
                  </div>
                  <ShimmerBar width={60} height={10} />
                </Flex>
              </Flex>
            ),
          },
          {
            title: "Tipo",
            key: "type",
            width: 100,
            align: "center",
            render: () => (
              <Flex vertical gap={2} align="center">
                <div
                  style={{
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: "#f5f5f5",
                    display: "inline-block",
                  }}
                >
                  <ShimmerBar width={50} height={12} />
                </div>
                <ShimmerBar width={40} height={10} />
              </Flex>
            ),
          },
          {
            title: "Consumo",
            key: "consumption",
            width: 120,
            align: "center",
            render: () => (
              <Flex vertical gap={2} align="center">
                <ShimmerBar width={50} height={14} />
                <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#f5f5f5", overflow: "hidden" }}>
                  <ShimmerBar width="60%" height={6} />
                </div>
                <ShimmerBar width={80} height={9} />
              </Flex>
            ),
          },
          {
            title: "Caudal",
            key: "flow",
            width: 120,
            align: "center",
            render: () => (
              <Flex vertical gap={2} align="center">
                <ShimmerBar width={60} height={14} />
                <ShimmerBar width={50} height={10} />
              </Flex>
            ),
          },
          {
            title: "Nivel F.",
            key: "water_table",
            width: 85,
            align: "right",
            render: () => <ShimmerBar width={50} height={13} style={{ marginLeft: "auto" }} />,
          },
          {
            title: "Auditoría",
            key: "audit",
            width: 140,
            align: "center",
            render: () => (
              <Flex vertical gap={2} align="center">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    background: "#fff2f0",
                    borderRadius: 4,
                    padding: "2px 6px",
                    border: "1px solid #ffccc7",
                    minWidth: 40,
                    height: 22,
                  }}
                >
                  <ShimmerBar width={10} height={10} style={{ borderRadius: "50%" }} />
                  <ShimmerBar width={20} height={10} />
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    background: "#fff7e6",
                    borderRadius: 4,
                    padding: "2px 6px",
                    border: "1px solid #ffd591",
                    minWidth: 40,
                    height: 22,
                  }}
                >
                  <ShimmerBar width={10} height={10} style={{ borderRadius: "50%" }} />
                  <ShimmerBar width={20} height={10} />
                </div>
              </Flex>
            ),
          },
          {
            title: "Estado",
            key: "compliance_status",
            width: 110,
            align: "center",
            render: () => (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: "#f6ffed",
                  borderRadius: 4,
                  padding: "3px 8px",
                  border: "1px solid #b7eb8f",
                  minWidth: 80,
                  height: 24,
                }}
              >
                <ShimmerBar width={10} height={10} style={{ borderRadius: "50%" }} />
                <ShimmerBar width={30} height={10} />
              </div>
            ),
          },
          {
            title: "",
            key: "actions",
            width: 110,
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

export default React.memo(SkeletonCompliance);
