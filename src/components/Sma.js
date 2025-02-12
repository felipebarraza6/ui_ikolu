import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../App";
import {
  Table,
  Flex,
  Select,
  Card,
  Statistic,
  Badge,
  DatePicker,
  Button,
  Form,
} from "antd";
import {
  DatabaseFilled,
  FilterFilled,
  RiseOutlined,
  FallOutlined,
  SearchOutlined,
  CalendarFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import sh from "../api/sh/endpoints";

const { Option } = Select;

const Sma = () => {
  const { state } = useContext(AppContext);
  const [selected, setSelect] = useState(state.user.catchment_points[0].id);
  const [dataSelected, setDataSelected] = useState(
    state.user.catchment_points[0]
  );
  const [page, setPage] = useState(1);
  const [getter, setGetter] = useState(false);
  const [initialDate, setInitialDate] = useState(null);
  const [finishDate, setFinishDate] = useState(null);
  const [data, setData] = useState(state.user.catchment_points[0].modules.m2);
  const [countApi, setCountApi] = useState(0);

  const catchment_points = state.user.catchment_points;

  const handleSelectChange = (value) => {
    setSelect(value);
    setDataSelected(catchment_points.filter((point) => point.id === value)[0]);
    setData(
      catchment_points.filter((point) => point.id === value)[0].modules.m2
    );
  };

  const getResults = async () => {
    const formatDateTime = (date) => {
      return date ? date.format("YYYY-MM-DD") : null;
    };

    const rq = await sh.get_data_sh_range(
      selected,
      formatDateTime(initialDate),
      formatDateTime(finishDate),
      page
    );
    setPage(1);
    setCountApi(rq.count);
    setData(rq.results);
  };

  const getResultsUpdate = async () => {
    const formatDateTime = (date) => {
      return date
        ? date.format("YYYY-MM-DD")
        : new Date().toISOString().split("T")[0];
    };

    const rq = await sh.get_data_sh_range(
      selected,
      formatDateTime(initialDate),
      formatDateTime(finishDate),
      page
    );
    console.log(rq);
    setCountApi(rq.count);
    setData(rq.results);
  };

  const getUpdateData = async () => {};

  useEffect(() => {}, [selected, initialDate, finishDate, page]);

  return (
    <Flex vertical gap={"small"} align="center" style={{ padding: "20px" }}>
      <Flex gap={"large"} justify="space-between" style={{ width: "100%" }}>
        <Card
          hoverable
          title={"Última conexión Logger"}
          style={{ width: 300 }}
          extra={<Badge status="processing" text="" />}
          size="small"
        >
          <Statistic
            value={
              dataSelected ? dataSelected.modules.m1.date_time_medition : 0
            }
            valueStyle={{ fontSize: "20px" }}
            suffix="hrs"
            prefix={
              <CalendarFilled style={{ fontSize: "17px", marginTop: "0px" }} />
            }
          />
        </Card>
        <Card
          size="small"
          hoverable
          title={new Date().toLocaleDateString("es-ES", {
            month: "long",
            day: "numeric",
          })}
          style={{ width: 300 }}
          extra={
            <CalendarOutlined style={{ fontSize: "15px", color: "#1f3461" }} />
          }
        >
          <Statistic
            value={
              dataSelected
                ? (
                    dataSelected.modules.total_consumed_today * 1000
                  ).toLocaleString("es-ES")
                : 0
            }
            suffix="lt/d"
            valueStyle={{ fontSize: "24px" }}
            prefix={
              dataSelected &&
              dataSelected.modules.total_consumed_today * 1000 >
                dataSelected.modules.total_consumed_yesterday * 1000 ? (
                <RiseOutlined style={{ fontSize: "24px", color: "green" }} />
              ) : (
                <FallOutlined style={{ fontSize: "24px", color: "red" }} />
              )
            }
          />
        </Card>
        <Card
          size="small"
          hoverable
          title={new Date(Date.now() - 86400000).toLocaleDateString("es-ES", {
            month: "long",
            day: "numeric",
          })}
          style={{ width: 300 }}
          extra={
            <CalendarOutlined style={{ fontSize: "15px", color: "#1f3461" }} />
          }
        >
          <Statistic
            value={
              dataSelected
                ? (
                    dataSelected.modules.total_consumed_yesterday * 1000
                  ).toLocaleString("es-ES")
                : 0
            }
            suffix="lt/d"
            valueStyle={{ fontSize: "24px" }}
            prefix={
              dataSelected &&
              dataSelected.modules.total_consumed_yesterday * 1000 >=
                dataSelected.modules.total_consumed_today * 1000 ? (
                <RiseOutlined style={{ fontSize: "24px", color: "green" }} />
              ) : (
                <FallOutlined style={{ fontSize: "24px", color: "red" }} />
              )
            }
          />
        </Card>
      </Flex>
      <Flex style={{ width: "100%" }} justify="center">
        <Table
          size="small"
          title={() => (
            <Flex justify="space-between" align="center">
              <Flex>
                {" "}
                <Select
                  value={selected}
                  placeholder="Selecciona un punto de captación"
                  onChange={handleSelectChange}
                  style={{ width: "100%" }}
                  icon={<FilterFilled />}
                >
                  {catchment_points
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((point) => (
                      <Option key={point.id} value={point.id} disabled={false}>
                        {console.log(point)}
                        <DatabaseFilled /> {point.title}
                      </Option>
                    ))}
                </Select>
              </Flex>
              <Form layout="inline" onFinish={getResults}>
                <Form.Item
                  name="initialDate"
                  rules={[
                    { required: true, message: "Fecha inicial requerida" },
                  ]}
                >
                  <DatePicker
                    placeholder="Desde"
                    onChange={(date) => setInitialDate(date)}
                  />
                </Form.Item>
                <Form.Item
                  name="finishDate"
                  rules={[{ required: true, message: "Fecha final requerida" }]}
                >
                  <DatePicker
                    placeholder="Hasta"
                    onChange={(date) => setFinishDate(date)}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    htmlType="submit"
                  >
                    Buscar registros
                  </Button>
                </Form.Item>
              </Form>
            </Flex>
          )}
          style={{ width: "100%" }}
          bordered
          columns={[
            {
              title: "Fecha de Medición",
              dataIndex: "date_time_medition",
              render: (date) => new Date(date).toLocaleString("es-ES"),
              key: "date_time_medition",
            },
            {
              title: "Caudal(lt/s)",
              dataIndex: "flow",
              align: "center",
              key: "flow",
            },
            {
              title: "Total(m³)",
              dataIndex: "total",
              align: "center",
              key: "total",
            },
            {
              title: "Consumo(m³)",
              dataIndex: "total_diff",
              align: "end",
              key: "total_diff",
            },
            {
              title: "Acumulado Diario(m³)",
              align: "end",
              dataIndex: "total_today_diff",
              key: "total_today_diff",
            },
          ]}
          dataSource={data}
          rowKey="date_time_medition"
          pagination={{
            onChange: (page_x) => {
              setPage(page);
              if (getter) {
                getResults();
                setPage(page_x);
              } else {
                setPage(page_x);
                getResultsUpdate();
              }
            },
            total: countApi,
            current: page,
            showSizeChanger: false,
          }}
        />
      </Flex>
    </Flex>
  );
};

export default Sma;
