import React, { useState, useContext, useEffect } from "react";
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

const { TabPane } = Tabs;

const GraphisNav = () => {
  const [activeKey, setActiveKey] = useState("1");
  const [dateType, setDateType] = useState("1");

  const [monthMode, setMonthMode] = useState(false);

  const [maxConsumoHora, setMaxConsumoHora] = useState({
    hour: "00:00",
    value: 0,
  });
  const [minConsumoHora, setMinConsumoHora] = useState({
    hour: "00:00",
    value: 0,
  });
  const [acumulado, setAcumulado] = useState({
    first: {
      hour: "00:00",
      value: 0,
    },
    last: {
      hour: "00:00",
      value: 0,
    },
  });

  const [caudalMax, setCaudalMax] = useState(0);
  const [caudalMin, setCaudalMin] = useState(0);

  const [nivelMax, setNivelMax] = useState(0);
  const [nivelMin, setNivelMin] = useState(0);

  const { state } = useContext(AppContext);
  const [data, setData] = useState(state.selected_profile.modules.today);
  const [dataMonth, setDataMonth] = useState([]);
  const activate = state.selected_profile.profile_ikolu.m4;
  console.log(activate);
  const [dateSelected, setDateSelected] = useState(
    moment().format("YYYY-MM-DD")
  );

  const getData = async () => {
    if (!monthMode) {
      const response = await sh
        .get_data_day(state.selected_profile.id, dateSelected, dateSelected)
        .then((response) => {
          setData(response || []);
        });
    } else {
      const response = await sh
        .get_data_month(state.selected_profile.id, dateSelected, dateSelected)
        .then((response) => {
          setDataMonth(response || []);
        });
    }
  };

  const handleDateTypeChange = (value) => {
    setDateType(value);
    if (value === "2") {
      setMonthMode(true);
    } else {
      setMonthMode(false);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      let caudalMax = data.reduce((prev, current) =>
        prev.flow > current.flow ? prev : current
      );

      let caudalMin = data.reduce((prev, current) => {
        if (current.flow === 0) return prev;
        return prev.flow < current.flow && prev.flow !== 0 ? prev : current;
      });

      setCaudalMax({
        hour: caudalMax.date_time_medition.slice(11, 16),
        value: caudalMax.flow,
      });
      setCaudalMin({
        hour: caudalMin.date_time_medition.slice(11, 16),
        value: caudalMin.flow,
      });

      let nivelMax = data.reduce((prev, current) =>
        prev.water_table > current.water_table ? prev : current
      );

      setNivelMax({
        hour: nivelMax.date_time_medition.slice(11, 16),
        value: nivelMax.flow,
      });

      let nivelMin = data.reduce((prev, current) => {
        if (current.water_table === 0) return prev;
        return prev.water_table < current.water_table && prev.water_table !== 0
          ? prev
          : current;
      });

      setNivelMin({
        hour: nivelMin.date_time_medition.slice(11, 16),
        value: nivelMin.flow,
      });

      let max = data.reduce((prev, current) =>
        prev.total_diff > current.total_diff ? prev : current
      );
      console.log(max.date_time_medition.slice(11, 16));
      setMaxConsumoHora({
        hour: max.date_time_medition.slice(11, 16),
        value: max.total_diff,
      });

      let min = data.reduce((prev, current) => {
        if (current.total_diff === 0) return prev;
        return prev.total_diff < current.total_diff && prev.total_diff !== 0
          ? prev
          : current;
      });

      setMinConsumoHora({
        hour: min.date_time_medition.slice(11, 16),
        value: min.total_diff,
      });
      setAcumulado({
        first: {
          hour: data[0].date_time_medition.slice(11, 16),
          value: parseInt(data[0].total).toLocaleString("es-CL"),
        },
        last: {
          hour: data[data.length - 1].date_time_medition.slice(11, 16),
          value: parseInt(data[data.length - 1].total).toLocaleString("es-CL"),
        },
      });
    }
  }, [data, monthMode]);

  return (
    <QueueAnim delay={300} duration={900} type="alpha">
      <div key="login">
        <Card
          style={{ width: "100%" }}
          headStyle={{
            borderColor: "transparent",
            background:
              "linear-gradient(90deg, rgba(202,215,222,1) 0%, rgba(229,236,240,1) 35%, rgba(202,215,222,1) 100%)",
          }}
          title={
            <Flex
              gap="small"
              justify="space-between"
              style={{
                marginTop: "8px",
                marginBottom: "8px",
              }}
            >
              <Select
                placeholder="Tipo"
                style={{ width: "200px" }}
                defaultValue={"1"}
                onChange={handleDateTypeChange}
                disabled={!activate}
              >
                <Select.Option value="1">Diario</Select.Option>
                <Select.Option value="2">Mensual</Select.Option>
              </Select>
              <Form layout="inline">
                <Form.Item rules={[{ required: true }]}>
                  <DatePicker
                    placeholder={dateSelected}
                    onChange={(date) => {
                      if (date) {
                        setDateSelected(date.format("YYYY-MM-DD"));
                      }
                    }}
                    style={{ width: "200px" }}
                    picker={dateType === "1" ? "date" : "month"}
                    disabled={!activate}
                    todayButton="Hoy"
                    disabledDate={(current) =>
                      current && current > moment().endOf("day")
                    }
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PiAtomLight />}
                    onClick={getData}
                    disabled={!activate}
                  >
                    Analizar {dateType === "1" ? "Día" : "Mes"}
                  </Button>
                </Form.Item>
              </Form>
            </Flex>
          }
          size="small"
        >
          <Flex vertical gap="small" style={{ width: "100%" }}>
            {monthMode ? (
              <ContainerMonth data={dataMonth} dateSelected={dateSelected} />
            ) : (
              <ContainerDays data={data} />
            )}
          </Flex>
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
