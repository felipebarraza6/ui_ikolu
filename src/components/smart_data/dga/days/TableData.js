import React from "react";
import { Table } from "antd";
import { render } from "@testing-library/react";

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
      align: "end",

      dataIndex: "n_voucher",
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
