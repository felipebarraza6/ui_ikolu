import React from "react";
import { Table, Flex } from "antd";
import ShimmerBar from "./ShimmerBar";
import ShimmerCircle from "./ShimmerCircle";
import "./skeleton.css";

const SkeletonTable = ({ columns, rows = 5, size = "small", ...props }) => {
  const skeletonColumns = columns.map((col) => ({
    ...col,
    render: () => {
      if (col.key === "status" || col.key === "#") {
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShimmerCircle size={20} />
          </div>
        );
      }
      if (col.key === "actions") {
        return (
          <Flex align="center" justify="center" gap={4}>
            {[1, 2, 3].map((btn) => (
              <ShimmerCircle key={btn} size={22} />
            ))}
          </Flex>
        );
      }
      if (col.align === "right") {
        return <ShimmerBar width={col.width * 0.5} height={14} style={{ marginLeft: "auto" }} />;
      }
      if (col.align === "center") {
        return <ShimmerBar width={col.width * 0.6} height={14} style={{ margin: "0 auto" }} />;
      }
      return <ShimmerBar width="80%" height={14} />;
    },
  }));

  return (
    <Table
      size={size}
      pagination={false}
      dataSource={Array.from({ length: rows }, (_, i) => ({ key: i }))}
      columns={skeletonColumns}
      locale={{ emptyText: null }}
      {...props}
    />
  );
};

export default SkeletonTable;
