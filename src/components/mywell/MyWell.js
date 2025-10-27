import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Typography,
  Statistic,
  Card,
  Flex,
  Collapse,
  Table,
  Drawer,
  Button,
} from "antd";
import {
  ClockCircleOutlined,
  DatabaseOutlined,
  IdcardOutlined,
  ToolOutlined,
  AimOutlined,
  ExpandOutlined,
  CalculatorOutlined,
  ArrowDownOutlined,
  TableOutlined,
  CloseOutlined,
  RiseOutlined,
  CalendarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import caudal_img from "../../assets/images/caudal.png";
import nivel_img from "../../assets/images/nivel.png";
import acumulado_img from "../../assets/images/acumulado.png";
import { AppContext } from "../../App";
import QueueAnim from "rc-queue-anim";
import MyLastRegisters from "./MyLastRegisters";
import sh from "../../api/sh/endpoints";
import Well from "./Well";
import { useResponsive } from "../../hooks/useResponsive";
import moment from "moment";
import "moment/locale/es";
const { Countdown } = Statistic;
const { Text } = Typography;

moment.locale("es");

const numberForMiles = new Intl.NumberFormat("de-DE");

// --- Fila de información para la Ficha Técnica ---
const TechInfoRow = ({ icon, label, value, loading = false }) => (
  <Flex
    justify="space-between"
    align="center"
    style={{ padding: "4px 2px", borderBottom: "1px solid #f0f0f0" }}
  >
    <Flex align="center" gap="small">
      {icon}
      <Text type="secondary" style={{ fontSize: 11 }}>
        {label}
      </Text>
    </Flex>
    {loading ? (
      <div
        style={{
          width: "60px",
          height: "14px",
          background:
            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "loading 1.5s infinite",
          borderRadius: "3px",
        }}
      />
    ) : (
      <Text strong style={{ fontSize: 12 }}>
        {value}
      </Text>
    )}
  </Flex>
);

const SectionTitle = ({ children }) => (
  <Text
    style={{
      display: "block",
      color: "#8c8c8c",
      fontWeight: 500,
      marginTop: "6px",
      marginBottom: "2px",
      paddingLeft: "2px",
      fontSize: 10,
    }}
  >
    {children}
  </Text>
);

// --- Componente para Ficha Técnica (Rediseñado) ---
const WellTechnicalSheet = ({ profile, loading = false }) => {
  // Usamos optional chaining para acceder a los datos de forma segura.
  const config_data = profile?.config_data ?? {};
  const dga = profile?.dga ?? {};
  const title = profile?.title ?? "N/A";
  const date_init = config_data?.date_start_telemetry ?? "N/A";

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
      <div style={{ padding: "0 4px" }}>
        <TechInfoRow
          icon={<IdcardOutlined />}
          label="DGA"
          value={<Text copyable>{dga.code_dga || "N/A"}</Text>}
          loading={loading}
        />
        <TechInfoRow
          icon={<IdcardOutlined />}
          label="Nombre"
          value={title}
          loading={loading}
        />
        <TechInfoRow
          icon={<CalendarOutlined />}
          label="Fecha inicio telemetría"
          value={date_init}
          loading={loading}
        />
        <TechInfoRow
          icon={<ArrowDownOutlined />}
          label="Profundidad"
          value={`${parseFloat(config_data.d1 || 0).toFixed(2)} m`}
          loading={loading}
        />
        <SectionTitle>Posicionamientos</SectionTitle>
        <TechInfoRow
          icon={<ToolOutlined />}
          label="Bomba"
          value={`${parseFloat(config_data.d2 || 0).toFixed(2)} m`}
          loading={loading}
        />
        <TechInfoRow
          icon={<AimOutlined />}
          label="Nivel"
          value={`${parseFloat(config_data.d3 || 0).toFixed(2)} m`}
          loading={loading}
        />
        <SectionTitle>Diámetros</SectionTitle>
        <TechInfoRow
          icon={<ExpandOutlined />}
          label="Ducto"
          value={`${parseFloat(config_data.d4 || 0).toFixed(2)} pulg`}
          loading={loading}
        />
        <TechInfoRow
          icon={<ExpandOutlined />}
          label="Flujómetro"
          value={`${parseFloat(config_data.d5 || 0).toFixed(2)} pulg`}
          loading={loading}
        />
        <SectionTitle>Totalizador</SectionTitle>
        <TechInfoRow
          icon={<CalculatorOutlined />}
          label="m³ Iniciales"
          value={`${numberForMiles.format(config_data.d6 || 0)}`}
          loading={loading}
        />
      </div>
    </Card>
  );
};

// --- Componente para Tarjetas de Métricas ---
const MetricCard = ({ title, value, unit, icon, loading = false }) => (
  <Card
    hoverable
    style={{
      marginBottom: "8px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
  >
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ marginBottom: 6 }}>
        <Flex align="center" gap="small" justify="center">
          {icon}
          <Text style={{ fontSize: 11 }}>{title}</Text>
        </Flex>
      </div>
      {loading ? (
        <div>
          <div
            style={{
              width: "50px",
              height: "18px",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
              borderRadius: "3px",
              margin: "0 auto 2px auto",
            }}
          />
          <div
            style={{
              width: "40px",
              height: "11px",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
              borderRadius: "2px",
              margin: "0 auto",
            }}
          />
        </div>
      ) : (
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1F3461",
              marginBottom: 2,
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: 11, color: "#666" }}>{unit}</div>
        </div>
      )}
    </div>
  </Card>
);

const MyWell = () => {
  const { state, dispatch } = useContext(AppContext);
  const { isMobile } = useResponsive();
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

  // useEffect consolidado para manejar carga inicial y actualizaciones periódicas
  useEffect(() => {
    // Función para obtener datos
    const fetchData = async () => {
      if (!state.selected_profile) return;

      // Activar estado de carga global y local
      dispatch({ type: "SET_LOADING", payload: { isLoading: true } });
      setLoading(true);

      try {
        const profileId = state.selected_profile.id;

        const userProfileResponse = await sh.get_profile();
        const allProfiles = userProfileResponse?.user?.catchment_points ?? [];
        const selected_profile_data =
          allProfiles.find((p) => p.id === profileId) || allProfiles[0] || {};

        // Solo actualizar si el perfil realmente cambió
        if (selected_profile_data.id !== state.selected_profile.id) {
          dispatch({
            type: "UPDATE",
            payload: { ...state, selected_profile: selected_profile_data },
          });
        }

        const telemetryData = await sh.get_data_sh(profileId);

        // Acceso seguro a los datos de telemetría y perfil
        const modules = selected_profile_data?.modules ?? {};
        const frecuency = selected_profile_data?.frecuency ?? 0;
        const total_consumed_yesterday =
          selected_profile_data?.modules.total_consumed_yesterday ?? 0;

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

          setLastRegisters(modules.today);
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
        // Desactivar estado de carga global y local
        dispatch({ type: "SET_LOADING", payload: { isLoading: false } });
        setLoading(false);
      }
    };

    // Función para limpiar intervalos existentes
    const clearExistingInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Cargar datos iniciales si hay un perfil seleccionado
    if (state.selected_profile?.id) {
      fetchData();

      // Configurar intervalo de actualización periódica
      clearExistingInterval();
      intervalRef.current = setInterval(() => {
        if (state.selected_profile?.id) {
          fetchData();
        }
      }, 60000); // 1 minuto
    }

    // Limpiar intervalo al desmontar o cambiar de perfil
    return () => {
      clearExistingInterval();
    };
  }, [state.selected_profile?.id]); // Solo depende del ID del perfil

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
              loading={loading}
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Nivel Freático"
              value={(parseFloat(nivel) || 0).toFixed(2)}
              unit="m"
              icon={<img src={nivel_img} alt="nivel" style={{ width: 24 }} />}
              loading={loading}
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
              loading={loading}
            />
          </Col>
          <Col span={24}>
            <MetricCard
              title="Último Registro"
              value={lastCaption ? formatDate(lastCaption).date : "N/A"}
              unit={lastCaption ? formatDate(lastCaption).time : ""}
              icon={<ClockCircleOutlined style={{ color: "#1F3461" }} />}
              loading={loading}
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
              loading={loading}
            />
          </div>
        </Flex>

        <Flex vertical={true} gap="middle">
          {/* Ficha Técnica */}
          <WellTechnicalSheet
            profile={state.selected_profile}
            loading={loading}
          />

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
                    padding: "4px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{ fontSize: 11, color: "#666", marginBottom: 4 }}
                    >
                      Hoy ({moment().format("DD MMM")})
                    </div>
                    {loading ? (
                      <LoadingOutlined
                        spin
                        style={{ fontSize: 16, color: "#27AE60" }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#27AE60",
                        }}
                      >
                        {acumDia} m³
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
              <Col span={24}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                    padding: "4px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{ fontSize: 11, color: "#666", marginBottom: 4 }}
                    >
                      Ayer ({moment().subtract(1, "days").format("DD MMM")})
                    </div>
                    {loading ? (
                      <LoadingOutlined
                        spin
                        style={{ fontSize: 16, color: "#F2994A" }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#F2994A",
                        }}
                      >
                        {acumAyer} m³
                      </div>
                    )}
                  </div>
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
                  loading={loading}
                />
                <MetricCard
                  title="Nivel Freático"
                  value={(parseFloat(nivel) || 0).toFixed(2)}
                  unit="(m)"
                  icon={
                    <img src={nivel_img} alt="nivel" style={{ width: 24 }} />
                  }
                  loading={loading}
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
                  loading={loading}
                />
                <MetricCard
                  title="Último Registro"
                  value={lastCaption ? formatDate(lastCaption).date : "N/A"}
                  unit={lastCaption ? formatDate(lastCaption).time : ""}
                  icon={<ClockCircleOutlined style={{ color: "#1F3461" }} />}
                  loading={loading}
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
                        padding: "4px",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#666",
                            marginBottom: 4,
                          }}
                        >
                          Hoy ({moment().format("DD MMM")})
                        </div>
                        {loading ? (
                          <LoadingOutlined
                            spin
                            style={{ fontSize: 16, color: "#27AE60" }}
                          />
                        ) : (
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              color: "#27AE60",
                            }}
                          >
                            {acumDia} m³
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        textAlign: "center",
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                        padding: "4px",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#666",
                            marginBottom: 4,
                          }}
                        >
                          Ayer ({moment().subtract(1, "days").format("DD MMM")})
                        </div>
                        {loading ? (
                          <LoadingOutlined
                            spin
                            style={{ fontSize: 16, color: "#F2994A" }}
                          />
                        ) : (
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              color: "#F2994A",
                            }}
                          >
                            {acumAyer} m³
                          </div>
                        )}
                      </div>
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
                  icon={loading ? <LoadingOutlined spin /> : <TableOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  disabled={loading}
                  loading={loading}
                >
                  Mediciones ({loading ? "..." : lastRegisters.length})
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
                      loading={loading}
                    />
                  </div>
                </Flex>
                {loading ? (
                  <Flex align="center" gap="middle">
                    <ClockCircleOutlined
                      style={{ fontSize: 20, color: "#5D6983" }}
                    />
                    <div>
                      <div
                        style={{
                          color: "#5D6983",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        Próxima medición en:
                      </div>
                      <div
                        style={{
                          width: "80px",
                          height: "22px",
                          background:
                            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                          backgroundSize: "200% 100%",
                          animation: "loading 1.5s infinite",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </Flex>
                ) : deadline ? (
                  <Flex align="center" gap="middle">
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
                ) : null}
              </Flex>
            </Card>
          </QueueAnim>
        </Col>

        {/* Columna Derecha: Ficha Técnica (Layout Flex/Tag con datos correctos) */}
        <Col xs={24} sm={24} md={7} lg={7} xl={7}>
          <QueueAnim type="right" delay={200}>
            <div key="d">
              <WellTechnicalSheet
                profile={state.selected_profile}
                loading={loading}
              />
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
          bordered={true}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          rowKey="id"
        />
      </Drawer>

      {/* Estilos CSS para la animación del skeleton */}
      <style>
        {`
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default MyWell;
