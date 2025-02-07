import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../App";
import { Table, Flex, Select, Card } from "antd";
import moment from "moment";

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

  // Calcular el consumo de hoy restando el último dato de today con el primer dato de today
  const consumptionToday =
    firstDataToday && todayData.length > 0
      ? todayData[todayData.length - 1].total - firstDataToday.total
      : 0;

  // Calcular el consumo de ayer restando el último dato de yesterday con el primer dato de yesterday
  const consumptionYesterday =
    lastDataYesterday && yesterdayData.length > 0
      ? lastDataYesterday.total - yesterdayData[0].total
      : 0;

  return (
    <Flex vertical gap={"small"} justify="center">
      <Flex style={{ width: "100%", justifyContent: "center" }}>
        <Select
          style={{ width: 200 }}
          value={selected}
          onChange={handleSelectChange}
        >
          {catchment_points.map((point) => (
            <Option key={point.id} value={point.id}>
              {point.title}
            </Option>
          ))}
        </Select>
      </Flex>
      <Flex style={{ width: "100%", justifyContent: "center" }} gap={"small"}>
        <Table
          size="small"
          title={() => "Telemetría Úlimos 48 Registros"}
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
        <Card
          hoverable
          title="Indicadores de Consumo"
          style={{ width: 300, height: 200 }}
        >
          <p>Consumo Hoy: {consumptionToday} m³</p>
          <p>Consumo Ayer: {consumptionYesterday} m³</p>
        </Card>
      </Flex>
      <Flex style={{ width: "100%", justifyContent: "center" }}></Flex>
    </Flex>
  );
};

export default Sma;
