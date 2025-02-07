import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../App";
import { Table, Flex, Select, Card, Statistic } from "antd";
import {
  DatabaseFilled,
  FilterFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const Sma = () => {
  const { state } = useContext(AppContext);
  const [selected, setSelect] = useState(null);
  const [page, setPage] = useState(1);
  const catchment_points = state.user.catchment_points;

  useEffect(() => {
    if (catchment_points.length > 0) {
      setSelect(catchment_points[0].id);
    }
  }, [catchment_points]);

  const handleSelectChange = (value) => {
    setSelect(value);
  };

  const selectedCatchmentPoint = catchment_points.find(
    (point) => point.id === selected
  );

  const todayData = selectedCatchmentPoint
    ? selectedCatchmentPoint.modules.today
    : [];

  const yesterdayData = selectedCatchmentPoint
    ? selectedCatchmentPoint.modules.yesterday
    : [];

  const firstDataToday = selectedCatchmentPoint
    ? selectedCatchmentPoint.modules.first_data_today
    : null;

  const lastDataYesterday = selectedCatchmentPoint
    ? selectedCatchmentPoint.modules.last_data_yesterday
    : null;

  const consumptionToday =
    firstDataToday && todayData.length > 0
      ? todayData[todayData.length - 1].total - firstDataToday.total
      : 0;

  const consumptionYesterday =
    lastDataYesterday && yesterdayData.length > 0
      ? lastDataYesterday.total - yesterdayData[0].total
      : 0;

  return (
    <Flex vertical gap={"small"} justify="center">
      <Flex
        style={{
          width: "100%",
          justifyContent: "start",
          alignItems: "center",
        }}
        gap={"small"}
      >
        <span style={{ fontSize: "25px", fontWeight: 400, textAlign: "start" }}>
          Telemetría: 1/min
        </span>
        <Select
          value={selected}
          placeholder="Selecciona un punto de captación"
          onChange={handleSelectChange}
          icon={<FilterFilled />}
        >
          {catchment_points.map((point) => (
            <Option key={point.id} value={point.id}>
              <DatabaseFilled /> {point.title}
            </Option>
          ))}
        </Select>
      </Flex>
      <Flex
        style={{ width: "100%", justifyContent: "space-evenly" }}
        gap={"small"}
      >
        <Table
          size="small"
          title={() => "Telemetría Últimos 48 Registros"}
          style={{ width: "500px" }}
          bordered
          columns={[
            {
              title: "Fecha de Medición",
              dataIndex: "date_time_medition",
              key: "date_time_medition",
            },
            {
              title: "Flujo",
              dataIndex: "flow",
              key: "flow",
            },
            {
              title: "Total",
              dataIndex: "total",
              key: "total",
            },
            {
              title: "Consumo",
              dataIndex: "total_diff",
              key: "total_diff",
            },
          ]}
          dataSource={todayData}
          rowKey="date_time_medition"
          pagination={{
            onChange: (page) => {
              console.log("Página cambiada a:", page);
              setPage(page);
            },
          }}
        />
        <Flex vertical gap={"small"}>
          <Card
            hoverable
            title={new Date().toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
            style={{ width: 300 }}
          >
            <Statistic
              value={consumptionToday}
              suffix="m³"
              valueStyle={{ fontSize: "24px" }}
              prefix={
                consumptionToday > consumptionYesterday ? (
                  <ArrowUpOutlined style={{ fontSize: "24px" }} />
                ) : (
                  <ArrowDownOutlined style={{ fontSize: "24px" }} />
                )
              }
            />
          </Card>
          <Card
            hoverable
            title={new Date(Date.now() - 86400000).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
            style={{ width: 300 }}
          >
            <Statistic
              value={consumptionYesterday}
              suffix="m³"
              valueStyle={{ fontSize: "24px" }}
              prefix={
                consumptionYesterday >= consumptionToday ? (
                  <ArrowUpOutlined style={{ fontSize: "24px" }} />
                ) : (
                  <ArrowDownOutlined style={{ fontSize: "24px" }} />
                )
              }
            />
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Sma;
