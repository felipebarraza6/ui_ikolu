import React, { useState, useContext, useEffect } from "react";
import {
  Tabs,
  Card,
  Flex,
  DatePicker,
  Select,
  Tag,
  Spin,
  Typography,
  Empty,
} from "antd";
import { CalendarOutlined, ApartmentOutlined } from "@ant-design/icons";
import img_caudal from "../../assets/images/caudal.png";
import img_nivel from "../../assets/images/nivel.png";
import { AppContext } from "../../App";
import sh from "../../api/sh/endpoints";
import ContainerDays from "./dga/days/Container";
import ContainerMonth from "./dga/month/Container";
import TableData from "./TableData";
import dayjs from "dayjs";
import locale from "antd/locale/es_ES";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useResponsive } from "../../hooks/useResponsive";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");
dayjs.tz.setDefault("America/Santiago");

const { Title } = Typography;

/**
 * 📊 DGA ANÁLISIS RESPONSIVO — Rediseñado
 */
const GraphisNavDga = () => {
  const { state } = useContext(AppContext);
  const { isMobile } = useResponsive();

  const [activeKey, setActiveKey] = useState("1");
  const [dateType, setDateType] = useState("1");
  const [monthMode, setMonthMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [dataMonth, setDataMonth] = useState([]);
  const [dayDate, setDayDate] = useState(null);
  const [monthDate, setMonthDate] = useState(null);

  const activate = state.selected_profile?.profile_ikolu?.m2;

  const handleDateTypeChange = (value) => {
    setDateType(value);
    setMonthMode(value === "2");
    setDayDate(null);
    setMonthDate(null);
    setData([]);
    setDataMonth([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const dateToUse = monthMode ? monthDate : dayDate;
      if (!dateToUse) {
        setData([]);
        setDataMonth([]);
        return;
      }

      setLoading(true);
      const formattedDate = dateToUse.format("YYYY-MM-DD");
      try {
        if (monthMode) {
          const response = await sh.get_data_month_dga(
            state.selected_profile.id,
            formattedDate
          );
          setDataMonth(response || []);
        } else {
          const response = await sh.get_data_day(
            state.selected_profile.id,
            formattedDate
          );
          setData(response || []);
        }
      } catch (error) {
        console.error("Error fetching DGA data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activate) {
      fetchData();
    }
  }, [dayDate, monthDate, monthMode, state.selected_profile.id, activate]);

  const dateToUse = monthMode ? monthDate : dayDate;
  const dateLabel = dateToUse
    ? dayjs(dateToUse).format("DD/MM/YYYY")
    : "hoy " + dayjs().format("DD/MM/YYYY");

  if (!activate) {
    return (
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <Flex justify="center" align="center" style={{ padding: 40 }} vertical>
          <CalendarOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
          <Title level={4} style={{ color: "#999", marginBottom: 8 }}>
            Módulo DGA Análisis no disponible
          </Title>
          <p style={{ color: "#666" }}>
            Contacta a soporte para activar esta funcionalidad.
          </p>
        </Flex>
      </Card>
    );
  }

  const currentData = monthMode ? dataMonth : data;
  const noData = !currentData || currentData.length === 0;

  const tabItems = [
    {
      key: "1",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src={img_caudal} alt="caudal" style={{ width: 18 }} />
          Caudal
        </span>
      ),
      children: (
        <div style={{ minHeight: 300 }}>
          {loading ? (
            <Flex justify="center" align="center" style={{ height: 300 }}>
              <Spin size="large" />
            </Flex>
          ) : noData ? (
            <Flex justify="center" align="center" style={{ height: 300 }}>
              <Empty
                description={
                  dayDate || monthDate
                    ? "No se encontraron datos para la fecha seleccionada."
                    : "Selecciona una fecha para visualizar los datos."
                }
              />
            </Flex>
          ) : (
            <>
              {monthMode ? (
                <ContainerMonth data={currentData} type="caudal" />
              ) : (
                <ContainerDays data={currentData} type="caudal" />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src={img_nivel} alt="nivel" style={{ width: 18 }} />
          Nivel Freático
        </span>
      ),
      children: (
        <div style={{ minHeight: 300 }}>
          {loading ? (
            <Flex justify="center" align="center" style={{ height: 300 }}>
              <Spin size="large" />
            </Flex>
          ) : noData ? (
            <Flex justify="center" align="center" style={{ height: 300 }}>
              <Empty
                description={
                  dayDate || monthDate
                    ? "No se encontraron datos para la fecha seleccionada."
                    : "Selecciona una fecha para visualizar los datos."
                }
              />
            </Flex>
          ) : (
            <>
              {monthMode ? (
                <ContainerMonth data={currentData} type="nivel" />
              ) : (
                <ContainerDays data={currentData} type="nivel" />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ApartmentOutlined style={{ fontSize: 16 }} />
          Resumen
        </span>
      ),
      children: (
        <div style={{ minHeight: 300 }}>
          {loading ? (
            <Flex justify="center" align="center" style={{ height: 300 }}>
              <Spin size="large" />
            </Flex>
          ) : noData ? (
            <Flex justify="center" align="center" style={{ height: 300 }}>
              <Empty
                description={
                  dayDate || monthDate
                    ? "No se encontraron datos para la fecha seleccionada."
                    : "Selecciona una fecha para visualizar los datos."
                }
              />
            </Flex>
          ) : (
            <TableData
              data={currentData}
              isToday={!dateToUse}
              periodType={monthMode ? "month" : "day"}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="middle"
        style={{ marginBottom: 16 }}
      >
        <Flex gap="middle" align="center" wrap="wrap">
          <Select
            defaultValue="1"
            style={{ width: 180 }}
            onChange={handleDateTypeChange}
            options={[
              { value: "1", label: "Análisis Diario" },
              { value: "2", label: "Análisis Mensual" },
            ]}
          />
          {monthMode ? (
            <DatePicker
              picker="month"
              onChange={(date) => setMonthDate(date)}
              value={monthDate}
              placeholder="Seleccionar mes"
            />
          ) : (
            <DatePicker
              onChange={(date) => setDayDate(date)}
              value={dayDate}
              placeholder="Seleccionar fecha"
            />
          )}
        </Flex>
        <Tag
          icon={<CalendarOutlined />}
          color="blue"
          style={{ fontSize: 13, padding: "4px 10px" }}
        >
          Datos de {dateLabel}
        </Tag>
      </Flex>

      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        size="large"
        tabBarStyle={{ marginBottom: 16, borderBottom: "1px solid #f0f0f0" }}
        items={tabItems}
      />
    </Card>
  );
};

export default GraphisNavDga;
