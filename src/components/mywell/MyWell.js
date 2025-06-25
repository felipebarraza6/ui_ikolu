import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Typography,
  Statistic,
  Card,
  Descriptions,
  Flex,
  Collapse,
  Table,
  Drawer,
  Button,
  Tag,
  Space,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  SettingOutlined,
  CopyOutlined,
  CheckCircleFilled,
  IdcardOutlined,
  ToolOutlined,
  AimOutlined,
  ExpandOutlined,
  CalculatorOutlined,
  ArrowDownOutlined,
  TableOutlined,
  CloseOutlined,
  DashboardOutlined,
  RiseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import logo_dga from "../../assets/images/channels4_profile.jpg";
import { AppContext } from "../../App";
import QueueAnim from "rc-queue-anim";
import MyLastRegisters from "./MyLastRegisters";
import sh from "../../api/sh/endpoints";
import Well from "./Well";
import { useResponsive } from "../../hooks/useResponsive";
import { useMediaQuery } from "react-responsive";
import moment from "moment";
import "moment/locale/es";
const { Countdown } = Statistic;
const { Title, Text } = Typography;
const { Panel } = Collapse;

moment.locale("es");

const numberForMiles = new Intl.NumberFormat("de-DE");

// --- Fila de información para la Ficha Técnica ---
const TechInfoRow = ({ icon, label, value }) => (
  <Flex
    justify="space-between"
    align="center"
    style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0" }}
  >
    <Flex align="center" gap="small">
      {icon}
      <Text type="secondary">{label}</Text>
    </Flex>
    <Text strong>{value}</Text>
  </Flex>
);

const SectionTitle = ({ children }) => (
  <Text
    style={{
      display: "block",
      color: "#8c8c8c",
      fontWeight: 500,
      marginTop: "12px",
      marginBottom: "4px",
      paddingLeft: "4px",
    }}
  >
    {children}
  </Text>
);

// --- Componente para Ficha Técnica (Rediseñado) ---
const WellTechnicalSheet = ({ profile }) => {
  // Usamos optional chaining para acceder a los datos de forma segura.
  const config_data = profile?.config_data ?? {};
  const dga = profile?.dga ?? {};
  const title = profile?.title ?? "N/A";

  if (!profile) return null;

  return (
    <Card
      title={
        <Flex align="center" gap="small">
          <DatabaseOutlined /> Ficha Técnica
        </Flex>
      }
      style={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >
      <div style={{ padding: "0 8px" }}>
        <TechInfoRow
          icon={<IdcardOutlined />}
          label="DGA"
          value={<Text copyable>{dga.code_dga || "N/A"}</Text>}
        />
        <TechInfoRow icon={<IdcardOutlined />} label="Nombre" value={title} />
        <TechInfoRow
          icon={<ArrowDownOutlined />}
          label="Profundidad"
          value={`${parseFloat(config_data.d1 || 0).toFixed(2)} m`}
        />
        <SectionTitle>Posicionamientos</SectionTitle>
        <TechInfoRow
          icon={<ToolOutlined />}
          label="Bomba"
          value={`${parseFloat(config_data.d2 || 0).toFixed(2)} m`}
        />
        <TechInfoRow
          icon={<AimOutlined />}
          label="Nivel"
          value={`${parseFloat(config_data.d3 || 0).toFixed(2)} m`}
        />
        <SectionTitle>Diámetros</SectionTitle>
        <TechInfoRow
          icon={<ExpandOutlined />}
          label="Ducto"
          value={`${parseFloat(config_data.d4 || 0).toFixed(2)} pulg`}
        />
        <TechInfoRow
          icon={<ExpandOutlined />}
          label="Flujómetro"
          value={`${parseFloat(config_data.d5 || 0).toFixed(2)} pulg`}
        />
        <SectionTitle>Totalizador</SectionTitle>
        <TechInfoRow
          icon={<CalculatorOutlined />}
          label="m³ Iniciales"
          value={`${numberForMiles.format(config_data.d6 || 0)}`}
        />
      </div>
    </Card>
  );
};

// --- Componente para Tarjetas de Métricas ---
const MetricCard = ({ title, value, unit, icon }) => (
  <Card
    hoverable
    style={{
      marginBottom: "16px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}
  >
    <Statistic
      title={
        <Flex align="center" gap="small">
          {icon}
          <Text style={{ fontSize: 12 }}>{title}</Text>
        </Flex>
      }
      value={value}
      suffix={unit}
      valueStyle={{
        color: "#1F3461",
        fontWeight: 600,
        fontSize: 20,
      }}
    />
  </Card>
);

const MyWell = () => {
  const { state, dispatch } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const isMobileQuery = useMediaQuery({ maxWidth: 768 });
  const [loading, setLoading] = useState(true);
  const [nivel, setNivel] = useState(0);
  const [caudal, setCaudal] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [acumDia, setAcumDia] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lastCaption, setLastCaption] = useState(null);
  const [acumAyer, setAcumAyer] = useState(0);
  const [lastRegisters, setLastRegisters] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    if (!state.selected_profile) return;
    setLoading(true);

    try {
      const profileId = state.selected_profile.id;

      const userProfileResponse = await sh.get_profile();
      const allProfiles = userProfileResponse?.user?.catchment_points ?? [];
      const selected_profile_data =
        allProfiles.find((p) => p.id === profileId) || allProfiles[0] || {};

      dispatch({
        type: "UPDATE",
        payload: { ...state, selected_profile: selected_profile_data },
      });

      const telemetryData = await sh.get_data_sh(profileId);

      // Acceso seguro a los datos de telemetría y perfil
      const modules = selected_profile_data?.modules ?? {};
      const frecuency = selected_profile_data?.frecuency ?? 0;
      const total_consumed_yesterday =
        selected_profile_data?.total_consumed_yesterday ?? 0;

      if (modules.m1) {
        setLastCaption(modules.m1.date_time_medition ?? null);
        setAcumDia(modules.m1.total_today_diff || 0);
        setNivel(modules.m1.water_table || 0);
        setCaudal(modules.m1.flow || 0);
        setAcumulado(modules.m1.total || 0);
      }

      if (telemetryData?.results) {
        const today = new Date().toISOString().slice(0, 10);
        const todayRegisters = telemetryData.results.filter(
          (reg) => reg.date_time_medition?.slice(0, 10) === today
        );

        const processedData = todayRegisters.map((result, i, arr) => ({
          ...result,
          total_hora: (result.total || 0) - (arr[i + 1]?.total || 0),
        }));
        setLastRegisters(processedData);
      }

      setAcumAyer(total_consumed_yesterday);

      if (frecuency > 0) {
        const now = new Date();
        const minutesUntilNext = frecuency - (now.getMinutes() % frecuency);
        setDeadline(new Date(now.getTime() + minutesUntilNext * 60000));
      }
    } catch (error) {
      console.error("Error fetching data in MyWell:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Evita el parpadeo al no reiniciar los datos si ya existen.
    if (state.selected_profile?.id) {
      fetchData();
    }
  }, [state.selected_profile?.id]);

  useEffect(() => {
    // Configura el intervalo para la actualización periódica.
    const interval = setInterval(() => {
      if (state.selected_profile?.id) {
        fetchData();
      }
    }, 60000); // 1 minuto

    // Limpia el intervalo cuando el componente se desmonta.
    return () => clearInterval(interval);
  }, [state.selected_profile?.id, fetchData]);

  const formatDate = (date) => {
    if (!date) return { date: "N/A", time: "" };
    const d = new Date(date);
    const datePart = d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timePart = `${String(d.getHours()).padStart(2, "0")}:00 hrs`;
    return { date: datePart, time: timePart };
  };

  const getDayMonth = (date) => {
    return date.toLocaleDateString("es-CL", { month: "short", day: "numeric" });
  };

  if (isMobile) {
    // --- VISTA MÓVIL ---
    return (
      <div>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <MetricCard
              title="Caudal"
              value={(parseFloat(caudal) || 0).toFixed(2)}
              unit="L/s"
              icon={<img src={caudal_img} alt="caudal" style={{ width: 24 }} />}
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Nivel Freático"
              value={(parseFloat(nivel) || 0).toFixed(2)}
              unit="m"
              icon={<img src={nivel_img} alt="nivel" style={{ width: 24 }} />}
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Acumulado Total"
              value={new Intl.NumberFormat("de-DE").format(acumulado)}
              unit="m³"
              icon={
                <img
                  src={acumulado_img}
                  alt="acumulado"
                  style={{ width: 24 }}
                />
              }
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Último Registro"
              value={lastCaption ? formatDate(lastCaption).date : "N/A"}
              unit={lastCaption ? formatDate(lastCaption).time : ""}
              icon={<ClockCircleOutlined style={{ color: "#1F3461" }} />}
            />
          </Col>
        </Row>

        <Flex justify="center" style={{ margin: "16px 0" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "280px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Well
              total={acumulado}
              nivel={nivel}
              caudal={caudal}
              profW={state.selected_profile?.config_data?.d1}
            />
          </div>
        </Flex>

        <Flex vertical={true} gap="middle">
          {/* Ficha Técnica */}
          <WellTechnicalSheet profile={state.selected_profile} />

          {/* Consumos Combinados */}
          <Card
            title={
              <Flex align="center" gap="small">
                <RiseOutlined /> Consumos
              </Flex>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Statistic
                    title={`Hoy (${moment().format("DD MMM")})`}
                    value={acumDia}
                    suffix="m³"
                    valueStyle={{ color: "#27AE60", fontSize: 18 }}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Statistic
                    title={`Ayer (${moment()
                      .subtract(1, "days")
                      .format("DD MMM")})`}
                    value={acumAyer}
                    suffix="m³"
                    valueStyle={{ color: "#F2994A", fontSize: 18 }}
                  />
                </Card>
              </Col>
            </Row>
            <div style={{ marginTop: "16px" }}>
              <MyLastRegisters />
            </div>
          </Card>
        </Flex>
      </div>
    );
  }

  const columns = [
    {
      title: "Hora",
      dataIndex: "date_time_medition",
      render: (time) => time.slice(11, 16) + " hrs",
      width: 90,
    },
    {
      title: "Caudal (Lt/s)",
      dataIndex: "flow",
      render: (flow) => (parseFloat(flow) || 0).toFixed(2),
      width: 100,
    },
    {
      title: "Nivel F. (m)",
      dataIndex: "water_table",
      render: (nivel) => (parseFloat(nivel) || 0).toFixed(2),
      width: 100,
    },
    {
      title: "m³/hora",
      dataIndex: "total_diff",
      render: (a) => numberForMiles.format(a || 0),
      width: 110,
    },
    {
      title: "m³/día",
      dataIndex: "total_today_diff",
      render: (a) => numberForMiles.format(a || 0),
      width: 110,
    },
    {
      title: "Totalizador (m³)",
      dataIndex: "total",
      render: (total) => numberForMiles.format(total || 0),
      width: 120,
    },
  ];

  const cardStyle = {
    padding: "0 !important",
  };

  // --- VISTA ESCRITORIO ---
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Columna Izquierda: Indicadores */}
        <Col xs={24} sm={24} md={7} lg={7} xl={7}>
          <QueueAnim delay={200} type="left">
            <div key="metrics">
              <div>
                <MetricCard
                  title="Caudal"
                  value={(parseFloat(caudal) || 0).toFixed(2)}
                  unit="(Lt/s)"
                  icon={
                    <img src={caudal_img} alt="caudal" style={{ width: 24 }} />
                  }
                />
                <MetricCard
                  title="Nivel Freático"
                  value={(parseFloat(nivel) || 0).toFixed(2)}
                  unit="(m)"
                  icon={
                    <img src={nivel_img} alt="nivel" style={{ width: 24 }} />
                  }
                />
                <MetricCard
                  title="Acumulado Total"
                  value={numberForMiles.format(acumulado || 0)}
                  unit="(m³)"
                  icon={
                    <img
                      src={acumulado_img}
                      alt="acumulado"
                      style={{ width: 24 }}
                    />
                  }
                />
                <MetricCard
                  title="Último Registro"
                  value={lastCaption ? formatDate(lastCaption).date : "N/A"}
                  unit={lastCaption ? formatDate(lastCaption).time : ""}
                  icon={<ClockCircleOutlined style={{ color: "#1F3461" }} />}
                />
              </div>
            </div>
            <div key="b">
              <Card
                title={
                  <Flex align="center" gap="small">
                    <RiseOutlined /> Consumos
                  </Flex>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <Statistic
                        title={`Hoy (${moment().format("DD MMM")})`}
                        value={acumDia}
                        suffix="m³"
                        valueStyle={{ color: "#27AE60", fontSize: 18 }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <Statistic
                        title={`Ayer (${moment()
                          .subtract(1, "days")
                          .format("DD MMM")})`}
                        value={acumAyer}
                        suffix="m³"
                        valueStyle={{ color: "#F2994A", fontSize: 18 }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </div>
          </QueueAnim>
        </Col>

        {/* Columna Central: Pozo y Mediciones (Más angosta) */}
        <Col xs={24} sm={24} md={10} lg={10} xl={10}>
          <QueueAnim delay={400} type="bottom">
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "24px 16px",
                height: "100%",
                position: "relative",
              }}
            >
              <Flex
                justify="flex-end"
                style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
              >
                <Button
                  type="primary"
                  icon={<TableOutlined />}
                  onClick={() => setDrawerVisible(true)}
                >
                  Mediciones ({lastRegisters.length})
                </Button>
              </Flex>
              <Flex
                vertical
                align="center"
                justify="center"
                style={{ height: "100%", width: "100%" }}
              >
                <Flex justify="center" align="center" style={{ width: "100%" }}>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "320px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Well
                      total={acumulado}
                      nivel={nivel}
                      caudal={caudal}
                      profW={state.selected_profile?.config_data?.d1}
                    />
                  </div>
                </Flex>
                {deadline && (
                  <Flex align="center" gap="middle">
                    <ClockCircleOutlined
                      style={{ fontSize: 20, color: "#5D6983" }}
                    />
                    <Countdown
                      title={
                        <Text style={{ color: "#5D6983" }}>
                          Próxima medición en:
                        </Text>
                      }
                      value={deadline}
                      format="HH:mm:ss"
                      valueStyle={{ color: "#1F3461", fontSize: 22 }}
                    />
                  </Flex>
                )}
              </Flex>
            </Card>
          </QueueAnim>
        </Col>

        {/* Columna Derecha: Ficha Técnica (Layout Flex/Tag con datos correctos) */}
        <Col xs={24} sm={24} md={7} lg={7} xl={7}>
          <QueueAnim type="right" delay={200}>
            <div key="d">
              <WellTechnicalSheet profile={state.selected_profile} />
            </div>
          </QueueAnim>
        </Col>
      </Row>
      <Drawer
        title={<Text style={{ color: "white" }}>Registros de Hoy</Text>}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
        closable={true}
        closeIcon={<CloseOutlined style={{ color: "white" }} />}
        headerStyle={{ backgroundColor: "#1F3461" }}
        bodyStyle={{ padding: "8px" }}
      >
        <Table
          dataSource={lastRegisters}
          columns={columns}
          size="small"
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
          rowKey="id"
          scroll={{ y: "calc(100vh - 120px)" }}
        />
      </Drawer>
    </div>
  );
};

export default MyWell;
