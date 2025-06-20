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
  Row,
  Col,
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
  WifiOutlined,
} from "@ant-design/icons";
import sh from "../api/sh/endpoints";
import { useResponsive } from "../hooks/useResponsive";

const { Title } = Typography;

const Sma = () => {
  const { state } = useContext(AppContext);
  const { isMobile, getSpacing, getColSpan, getTableScroll } = useResponsive();
  const [selected, setSelect] = useState(state.user.catchment_points[0].id);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [dataSelected, setDataSelected] = useState(state.selected_profile);
  const [page, setPage] = useState(1);
  const [getter, setGetter] = useState(false);
  const [initialDate, setInitialDate] = useState(null);
  const [finishDate, setFinishDate] = useState(null);
  const [data, setData] = useState(state.selected_profile.modules.today);
  const [countApi, setCountApi] = useState(0);
  const activate = state.selected_profile.profile_ikolu.m3;

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
    setCountApi(rq.count);
    setData(rq.results);
  };

  const downloadDataToExcel = async () => {
    setLoadingExcel(true);
    var date_i = new Date(initialDate).toISOString().split("T")[0];
    var date_f = new Date(finishDate).toISOString().split("T")[0];

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

  // Configuración de estilos responsivos
  const cardStyle = {
    borderRadius: 16,
    border: "2px solid #1f3461",
    background: "#ffffff",
    boxShadow: "0 8px 24px rgba(31, 52, 97, 0.12)",
    transition: "all 0.3s ease",
  };

  const cardHoverStyle = {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(31, 52, 97, 0.18)",
    borderColor: "#1f3461",
  };

  const primaryColor = "#1f3461";
  const successColor = "#52c41a";
  const errorColor = "#f5222d";

  return (
    <div
      style={{
        padding: getSpacing(12, 24),
        background: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      {/* Header del módulo */}
      <div
        style={{
          background: primaryColor,
          color: "white",
          padding: getSpacing(16, 24),
          borderRadius: "16px 16px 0 0",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Title
          level={isMobile ? 4 : 2}
          style={{
            color: "white",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <DatabaseFilled />
          Smart Analytics
        </Title>
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: isMobile ? 12 : 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <WifiOutlined />
          {dataSelected?.title || "MÓDULO"}
        </div>
      </div>

      {/* Cards de estadísticas */}
      <Row
        gutter={[getSpacing(12, 16), getSpacing(12, 16)]}
        style={{ marginBottom: 24 }}
      >
        <Col span={getColSpan(24, 12, 8)}>
          <Card
            hoverable
            style={cardStyle}
            bodyStyle={{ padding: getSpacing(16, 20) }}
            onMouseEnter={(e) => Object.assign(e.target.style, cardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, cardStyle)}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  color: "white",
                  padding: "12px",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: 24,
                }}
              >
                <CalendarFilled />
              </div>
              <Title
                level={5}
                style={{ margin: "0 0 8px 0", color: primaryColor }}
              >
                Última Conexión
              </Title>
              <Statistic
                value={
                  dataSelected
                    ? `${dataSelected.modules.m1.date_time_medition.slice(
                        5,
                        10
                      )} / ${dataSelected.modules.m1.date_time_medition.slice(
                        11,
                        16
                      )}`
                    : "---"
                }
                suffix="hrs"
                valueStyle={{
                  fontSize: isMobile ? 18 : 20,
                  fontWeight: 600,
                  color: primaryColor,
                }}
              />
              <Badge
                status="processing"
                text="En línea"
                style={{ color: successColor, fontWeight: 500 }}
              />
            </div>
          </Card>
        </Col>

        <Col span={getColSpan(24, 12, 8)}>
          <Card
            hoverable
            style={cardStyle}
            bodyStyle={{ padding: getSpacing(16, 20) }}
            onMouseEnter={(e) => Object.assign(e.target.style, cardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, cardStyle)}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background:
                    dataSelected &&
                    dataSelected.modules.total_consumed_today * 1000 >
                      dataSelected.modules.total_consumed_yesterday * 1000
                      ? successColor
                      : errorColor,
                  color: "white",
                  padding: "12px",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: 24,
                }}
              >
                {dataSelected &&
                dataSelected.modules.total_consumed_today * 1000 >
                  dataSelected.modules.total_consumed_yesterday * 1000 ? (
                  <RiseOutlined />
                ) : (
                  <FallOutlined />
                )}
              </div>
              <Title
                level={5}
                style={{ margin: "0 0 8px 0", color: primaryColor }}
              >
                Hoy -{" "}
                {new Date().toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </Title>
              <Statistic
                value={
                  dataSelected
                    ? (
                        dataSelected.modules.total_consumed_today * 1000
                      ).toLocaleString("es-ES")
                    : 0
                }
                suffix="lt/d"
                valueStyle={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 600,
                  color:
                    dataSelected &&
                    dataSelected.modules.total_consumed_today * 1000 >
                      dataSelected.modules.total_consumed_yesterday * 1000
                      ? successColor
                      : errorColor,
                }}
              />
            </div>
          </Card>
        </Col>

        <Col span={getColSpan(24, 12, 8)}>
          <Card
            hoverable
            style={cardStyle}
            bodyStyle={{ padding: getSpacing(16, 20) }}
            onMouseEnter={(e) => Object.assign(e.target.style, cardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, cardStyle)}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background:
                    dataSelected &&
                    dataSelected.modules.total_consumed_yesterday * 1000 >=
                      dataSelected.modules.total_consumed_today * 1000
                      ? successColor
                      : errorColor,
                  color: "white",
                  padding: "12px",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: 24,
                }}
              >
                {dataSelected &&
                dataSelected.modules.total_consumed_yesterday * 1000 >=
                  dataSelected.modules.total_consumed_today * 1000 ? (
                  <RiseOutlined />
                ) : (
                  <FallOutlined />
                )}
              </div>
              <Title
                level={5}
                style={{ margin: "0 0 8px 0", color: primaryColor }}
              >
                Ayer -{" "}
                {new Date(Date.now() - 86400000).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </Title>
              <Statistic
                value={
                  dataSelected
                    ? (
                        dataSelected.modules.total_consumed_yesterday * 1000
                      ).toLocaleString("es-ES")
                    : 0
                }
                suffix="lt/d"
                valueStyle={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 600,
                  color:
                    dataSelected &&
                    dataSelected.modules.total_consumed_yesterday * 1000 >=
                      dataSelected.modules.total_consumed_today * 1000
                      ? successColor
                      : errorColor,
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabla de registros */}
      <Card
        style={{
          ...cardStyle,
          borderRadius: "0 0 16px 16px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          size={isMobile ? "small" : "middle"}
          title={() => (
            <div
              style={{
                padding: getSpacing(16, 24),
                background: "#fafafa",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                gap={isMobile ? 16 : 24}
              >
                <Title
                  level={isMobile ? 4 : 3}
                  style={{
                    margin: 0,
                    color: primaryColor,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <DatabaseFilled />
                  Registros de Medición
                </Title>

                <Form
                  layout={isMobile ? "vertical" : "inline"}
                  onFinish={getResults}
                  style={{ width: isMobile ? "100%" : "auto" }}
                >
                  <Row gutter={[8, 8]} style={{ width: "100%" }}>
                    <Col span={isMobile ? 24 : 6}>
                      <Form.Item
                        name="initialDate"
                        label={isMobile ? "Fecha inicial" : ""}
                        rules={[
                          {
                            required: true,
                            message: "Fecha inicial requerida",
                          },
                        ]}
                        style={{ marginBottom: isMobile ? 12 : 0 }}
                      >
                        <DatePicker
                          placeholder="Desde"
                          onChange={(date) => setInitialDate(date)}
                          disabled={!activate}
                          style={{ width: "100%" }}
                          size={isMobile ? "large" : "middle"}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={isMobile ? 24 : 6}>
                      <Form.Item
                        name="finishDate"
                        label={isMobile ? "Fecha final" : ""}
                        rules={[
                          { required: true, message: "Fecha final requerida" },
                        ]}
                        style={{ marginBottom: isMobile ? 12 : 0 }}
                      >
                        <DatePicker
                          placeholder="Hasta"
                          onChange={(date) => setFinishDate(date)}
                          disabled={!activate}
                          style={{ width: "100%" }}
                          size={isMobile ? "large" : "middle"}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={isMobile ? 12 : 6}>
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          htmlType="submit"
                          disabled={!activate}
                          style={{
                            width: "100%",
                            height: isMobile ? 44 : 32,
                            borderRadius: 8,
                            background: primaryColor,
                            borderColor: primaryColor,
                            fontWeight: 600,
                          }}
                        >
                          {isMobile ? "Buscar" : "Buscar registros"}
                        </Button>
                      </Form.Item>
                    </Col>

                    <Col span={isMobile ? 12 : 6}>
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                          loading={loadingExcel}
                          type="default"
                          disabled={!initialDate || !finishDate || !activate}
                          icon={<DownloadOutlined />}
                          onClick={() => downloadDataToExcel()}
                          style={{
                            width: "100%",
                            height: isMobile ? 44 : 32,
                            borderRadius: 8,
                            borderColor: primaryColor,
                            color: primaryColor,
                            fontWeight: 600,
                          }}
                        >
                          {isMobile ? "Excel" : "Descarga"}
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Flex>
            </div>
          )}
          style={{
            borderRadius: "0 0 16px 16px",
            overflow: "hidden",
          }}
          bordered={false}
          scroll={getTableScroll()}
          columns={[
            {
              title: "Fecha de Medición",
              dataIndex: "date_time_medition",
              fixed: isMobile ? "left" : false,
              width: isMobile ? 140 : 180,
              render: (date) => {
                if (initialDate && finishDate) {
                  return (
                    <div style={{ fontWeight: 500, color: primaryColor }}>
                      <div>
                        {date.slice(8, 10)}-{date.slice(5, 7)}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {date.slice(11, 16)} hrs
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div style={{ fontWeight: 500, color: primaryColor }}>
                      <div>{date.slice(5, 10)}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {date.slice(11, 16)} hrs
                      </div>
                    </div>
                  );
                }
              },
              key: "date_time_medition",
            },
            {
              title: "Caudal",
              dataIndex: "flow",
              align: "center",
              width: isMobile ? 80 : 120,
              render: (value) => (
                <div style={{ fontWeight: 600, color: primaryColor }}>
                  {value}
                  <div style={{ fontSize: 11, color: "#999" }}>lt/s</div>
                </div>
              ),
              key: "flow",
            },
            {
              title: "Total",
              dataIndex: "total",
              align: "center",
              width: isMobile ? 100 : 140,
              render: (value) => (
                <div style={{ fontWeight: 600, color: successColor }}>
                  {parseInt(value).toLocaleString("es-CL")}
                  <div style={{ fontSize: 11, color: "#999" }}>m³</div>
                </div>
              ),
              key: "total",
            },
            {
              title: "Consumo",
              dataIndex: "total_diff",
              align: "center",
              width: isMobile ? 100 : 120,
              render: (value) => (
                <div style={{ fontWeight: 600, color: "#1890ff" }}>
                  {value}
                  <div style={{ fontSize: 11, color: "#999" }}>m³</div>
                </div>
              ),
              key: "total_diff",
            },
            {
              title: "Acumulado Diario",
              align: "center",
              dataIndex: "total_today_diff",
              width: isMobile ? 120 : 150,
              render: (value) => (
                <div style={{ fontWeight: 600, color: "#722ed1" }}>
                  {value}
                  <div style={{ fontSize: 11, color: "#999" }}>m³</div>
                </div>
              ),
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
            pageSize: isMobile ? 8 : 10,
            showQuickJumper: !isMobile,
            simple: isMobile,
            size: isMobile ? "small" : "default",
            showTotal: (total, range) =>
              isMobile
                ? `${range[0]}-${range[1]} de ${total}`
                : `Mostrando ${range[0]}-${range[1]} de ${total} registros`,
          }}
        />
      </Card>
    </div>
  );
};

export default Sma;
