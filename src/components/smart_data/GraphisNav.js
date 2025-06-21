import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  Tabs,
  Card,
  Flex,
  Statistic,
  DatePicker,
  Select,
  Form,
  Button,
  Tag,
  ConfigProvider,
} from "antd";
import {
  FlowArea,
  TotalLine,
  TotalHour,
  TotalDay,
  WaterTableBar,
} from "./days/LineGraph";
import { DatabaseOutlined } from "@ant-design/icons";
import TableData from "./days/TableData";
import img_caudal from "../../assets/images/caudal.png";
import img_nivel from "../../assets/images/nivel.png";
import img_total from "../../assets/images/acumulado.png";
import { AppContext } from "../../App";
import { PiAtomLight } from "react-icons/pi";
import QueueAnim from "rc-queue-anim";
import moment from "moment";
import sh from "../../api/sh/endpoints";
import ContainerDays from "./days/Container";
import ContainerMonth from "./month/Container";
import { type } from "@testing-library/user-event/dist/type";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";
import { useResponsive } from "../../hooks/useResponsive";

// Configurar dayjs para español
dayjs.locale("es");

const { TabPane } = Tabs;

const GraphisNav = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();

  const [activeKey, setActiveKey] = useState("1");
  const [dateType, setDateType] = useState("1");
  const [monthMode, setMonthMode] = useState(false);
  const [data, setData] = useState(state.selected_profile.modules.today);
  const [dataMonth, setDataMonth] = useState([]);
  const activate = state.selected_profile.profile_ikolu.m4;
  const [dateSelected, setDateSelected] = useState(dayjs());

  const [stats, setStats] = useState({
    maxConsumoHora: { hour: "00:00", value: 0 },
    minConsumoHora: { hour: "00:00", value: 0 },
    acumulado: {
      first: { hour: "00:00", value: 0 },
      last: { hour: "00:00", value: 0 },
    },
    caudalMax: { hour: "00:00", value: 0 },
    caudalMin: { hour: "00:00", value: 0 },
    nivelMax: { hour: "00:00", value: 0 },
    nivelMin: { hour: "00:00", value: 0 },
  });

  const getData = useCallback(async () => {
    const formattedDate = dateSelected.format("YYYY-MM-DD");
    try {
      if (monthMode) {
        const response = await sh.get_data_month(
          state.selected_profile.id,
          formattedDate,
          formattedDate
        );
        setDataMonth(response || []);
      } else {
        const response = await sh.get_data_day(
          state.selected_profile.id,
          formattedDate,
          formattedDate
        );
        setData(response || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [dateSelected, monthMode, state.selected_profile.id]);

  const handleDateTypeChange = (value) => {
    setDateType(value);
    setMonthMode(value === "2");
  };

  useEffect(() => {
    if (data && data.length > 0) {
      let caudalMax = data.reduce((prev, current) =>
        prev.flow > current.flow ? prev : current
      );

      let caudalMin = data.reduce((prev, current) => {
        if (current.flow === 0) return prev;
        return prev.flow < current.flow && prev.flow !== 0 ? prev : current;
      });

      setStats({
        ...stats,
        caudalMax: {
          hour: caudalMax.date_time_medition.slice(11, 16),
          value: caudalMax.flow,
        },
        caudalMin: {
          hour: caudalMin.date_time_medition.slice(11, 16),
          value: caudalMin.flow,
        },
      });

      let nivelMax = data.reduce((prev, current) =>
        prev.water_table > current.water_table ? prev : current
      );

      setStats({
        ...stats,
        nivelMax: {
          hour: nivelMax.date_time_medition.slice(11, 16),
          value: nivelMax.flow,
        },
      });

      let nivelMin = data.reduce((prev, current) => {
        if (current.water_table === 0) return prev;
        return prev.water_table < current.water_table && prev.water_table !== 0
          ? prev
          : current;
      });

      setStats({
        ...stats,
        nivelMin: {
          hour: nivelMin.date_time_medition.slice(11, 16),
          value: nivelMin.flow,
        },
      });

      let max = data.reduce((prev, current) =>
        prev.total_diff > current.total_diff ? prev : current
      );
      console.log(max.date_time_medition.slice(11, 16));
      setStats({
        ...stats,
        maxConsumoHora: {
          hour: max.date_time_medition.slice(11, 16),
          value: max.total_diff,
        },
      });

      let min = data.reduce((prev, current) => {
        if (current.total_diff === 0) return prev;
        return prev.total_diff < current.total_diff && prev.total_diff !== 0
          ? prev
          : current;
      });

      setStats({
        ...stats,
        minConsumoHora: {
          hour: min.date_time_medition.slice(11, 16),
          value: min.total_diff,
        },
      });
      setStats({
        ...stats,
        acumulado: {
          first: {
            hour: data[0].date_time_medition.slice(11, 16),
            value: parseInt(data[0].total).toLocaleString("es-CL"),
          },
          last: {
            hour: data[data.length - 1].date_time_medition.slice(11, 16),
            value: parseInt(data[data.length - 1].total).toLocaleString(
              "es-CL"
            ),
          },
        },
      });
    }
  }, [data]);

  return (
    <QueueAnim delay={300} duration={900} type="alpha">
      <div key="smart-analysis" style={{ paddingTop: "0px" }}>
        <Card
          style={{ width: "100%" }}
          title={
            <Flex
              gap="small"
              justify="space-between"
              vertical={isMobile}
              style={{ marginTop: "8px", marginBottom: "8px" }}
            >
              <Select
                placeholder="Tipo"
                style={{ width: isMobile ? "100%" : "200px" }}
                defaultValue="1"
                onChange={handleDateTypeChange}
                disabled={!activate}
              >
                <Select.Option value="1">Diario</Select.Option>
                <Select.Option value="2">Mensual</Select.Option>
              </Select>
              <Form layout="inline" onFinish={getData}>
                <Form.Item style={{ marginBottom: isMobile ? 8 : 0 }}>
                  <ConfigProvider locale={locale}>
                    <DatePicker
                      placeholder="Seleccionar fecha"
                      value={dateSelected}
                      onChange={setDateSelected}
                      style={{ width: isMobile ? "100%" : "200px" }}
                      picker={dateType === "1" ? "date" : "month"}
                      disabled={!activate}
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                      format={dateType === "1" ? "DD/MM/YYYY" : "MM/YYYY"}
                    />
                  </ConfigProvider>
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PiAtomLight />}
                    disabled={!activate}
                    style={{ width: isMobile ? "100%" : "auto" }}
                  >
                    Analizar
                  </Button>
                </Form.Item>
              </Form>
            </Flex>
          }
        >
          {monthMode ? (
            <ContainerMonth data={dataMonth} stats={stats} />
          ) : (
            <ContainerDays data={data} stats={stats} />
          )}
        </Card>
      </div>
    </QueueAnim>
  );
};

const styles = {
  cardStat: {
    width: "100%",
    background:
      "linear-gradient(90deg, rgba(89,128,55,0.40940126050420167) 0%, rgba(30,48,85,0.7763480392156863)",
    header: {
      color: "white",
      fontWeight: "700",
      background: "rgba(30,48,85)",
      textAlign: "center",
      borderRadius: "5px 5px 0px 0px",
      borderColor: "transparent",
    },
  },

  card: {
    marginTop: "-16px",
    borderRadius: "0px 0px 10px 10px",
    width: "100%",
    background:
      "radial-gradient(circle, rgba(30,48,85,1) 0%, rgba(43,46,51,1) 100%)",
  },
  cardData: {
    marginTop: "-16px",
    borderRadius: "0px",
    width: "100%",
  },
};

export default GraphisNav;
