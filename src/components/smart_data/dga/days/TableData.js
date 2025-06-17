import React from "react";
import { Table, Flex, Typography } from "antd";
import { render } from "@testing-library/react";

const { Text } = Typography;

const TableData = ({ data }) => {
  console.log(data);
  const columns = [
    {
      title: "Hora",
      dataIndex: "date_time_medition",
      key: "date",
      align: "center",
      render: (date_time_medition) => {
        return <div>{date_time_medition.slice(11, 18)} hrs</div>;
      },
    },
    {
      title: "Caudal (lt/s)",
      dataIndex: "flow",
      key: "flow",
      align: "end",
      render: (flow) => {
        return <div>{flow}</div>;
      },
    },
    {
      title: "Total(m³)",
      dataIndex: "total",
      key: "total",
      align: "end",
      render: (total) => total.toLocaleString("es-CL"),
    },

    {
      title: "Nivel freático(m)",
      dataIndex: "water_table",
      key: "water_table",
      align: "end",
    },
    {
      title: "Comprobante MEE",
      width: "30%",
      align: "end",
      render: (obj) => {
        if (obj.n_voucher) {
          return (
            <Flex vertical justify="center" align="center" gap="small">
              <Text
                hoverable
                copyable
                size="small"
                style={{
                  border: "1px solid rgb(0, 111, 179)",
                  color: "rgb(0, 111, 179)",
                  padding: "5px",
                  textAlign: "center",
                  fontSize: "12px",
                  width: "100%",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {obj.n_voucher}
              </Text>
              <span
                hoverable
                size="small"
                style={{
                  backgroundColor: "rgb(0, 111, 179)",
                  color: "white",
                  padding: "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {obj.return_dga}
              </span>
            </Flex>
          );
        }
      },
    },
  ];
  return (
    <Table
      dataSource={data}
      columns={columns}
      bordered
      size="small"
      pagination={{ pageSize: 7 }}
    />
  );
};

export default TableData;
