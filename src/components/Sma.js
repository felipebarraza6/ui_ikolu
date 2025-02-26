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
  Typography,
  Form,
} from "antd";
import moment from "moment";
import {
  DatabaseFilled,
  FilterFilled,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
  SearchOutlined,
  CalendarFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import sh from "../api/sh/endpoints";

const { Title } = Typography;

const Sma = () => {
  const { state } = useContext(AppContext);
  const [selected, setSelect] = useState(state.user.catchment_points[0].id);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [dataSelected, setDataSelected] = useState(state.selected_profile);
  const [page, setPage] = useState(1);
  const [getter, setGetter] = useState(false);
  const [initialDate, setInitialDate] = useState(null);
  const [finishDate, setFinishDate] = useState(null);
  const [data, setData] = useState(state.selected_profile.modules.today);
  const [countApi, setCountApi] = useState(0);

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

  const downloadDataToExcel = async () => {
    setLoadingExcel(true);
    console.log(initialDate, finishDate);
    var date_i = new Date(initialDate).toISOString().split("T")[0];
    var date_f = new Date(finishDate).toISOString().split("T")[0];

    console.log(date_i);

    console.log(date_f);
    const rq = await sh
      .get_data_sh_range_to_excel(
        state.selected_profile.id,
        date_i,
        date_f,
        state.selected_profile.title
      )
      .then((res) => {
        setLoadingExcel(false);
      });
  };

  useEffect(() => {
    if (state.selected_profile) {
      setDataSelected(state.selected_profile);
      setData(state.selected_profile.modules.today);
    }
  }, [selected, initialDate, finishDate, page, state.selected_profile]);

  return (
    <Flex vertical gap={"small"} align="center" style={{ padding: "20px" }}>
      <Flex gap={"large"} justify="space-between" style={{ width: "100%" }}>
        <Card
          hoverable
          title={"Última conexión Logger"}
          style={{
            width: 300,
            background:
              "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
          }}
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
          style={{
            width: 300,
            background:
              "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
          }}
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
          style={{
            width: 300,
            background:
              "linear-gradient(90deg, rgba(2,0,36,0.14189425770308128) 0%, rgba(255,255,255,1) 100%)",
          }}
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
                <Title level={3}>Registros</Title>{" "}
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
                <Form.Item>
                  <Button
                    loading={loadingExcel}
                    type="primary"
                    disabled={!initialDate || !finishDate}
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      downloadDataToExcel();
                    }}
                  >
                    Descarga
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

              render: (date) => {
                if (initialDate && finishDate) {
                  var str_d =
                    date.slice(8, 10) +
                    "-" +
                    date.slice(5, 7) +
                    " / " +
                    date.slice(11, 16) +
                    " hrs";
                  return str_d;
                } else {
                  var str_d2 =
                    date.slice(5, 10) + " / " + date.slice(11, 16) + " hrs";
                  return str_d2;
                }
              },
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
