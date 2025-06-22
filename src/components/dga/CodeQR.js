import React, { useContext } from "react";
import QueueAnim from "rc-queue-anim";
import {
  Card,
  Descriptions,
  Flex,
  Progress,
  QRCode,
  Badge,
  Typography,
  Tag,
  Button,
  Image,
  Affix,
} from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  QrcodeOutlined,
  FileExcelFilled,
  LinkOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../App";
import ModalQR from "./ModalQR";
import logo from "../../assets/images/channels4_profile.jpg";
const { Text, Title } = Typography;

const CodeQR = ({ dataProfile }) => {
  const { state } = useContext(AppContext);
  const { selected_profile } = state;

  if (!selected_profile || !selected_profile.profile_ikolu) {
    return (
      <Card>
        <Text>No hay datos de perfil para generar el código QR.</Text>
      </Card>
    );
  }

  const {
    id,
    title,
    profile_ikolu: { m3_goal, m3_percent, m3_total },
  } = selected_profile;

  const qrData = JSON.stringify({
    id: id,
    pozo: title,
    meta: m3_goal,
    porcentaje: m3_percent,
    total: m3_total,
  });

  const dataDga =
    state.selected_profile.modules.m2.length > 0
      ? state.selected_profile.modules.m2[0]
      : null;

  const configProfile = state.selected_profile.config_data;

  const premium_dga = state.selected_profile.profile_ikolu.m2;

  var last_data = 0;
  if (state.selected_profile.modules.m2.length > 0) {
    last_data = state.selected_profile.modules.m2[0];
  }
  var {
    send_dga,
    type_dga,
    code_dga,
    flow_granted_dga,
    total_granted_dga,
    shac,
    date_created_code,
    date_start_compliance,
    standard,
  } = dataProfile;

  if (!total_granted_dga) {
    total_granted_dga = 0;
  }

  const percentage =
    dataDga && total_granted_dga
      ? parseFloat(
          ((parseInt(dataDga.total) + parseInt(configProfile.d6)) /
            total_granted_dga) *
            100
        ).toFixed(2)
      : 0;

  return (
    <QueueAnim delay={500} type={["right", "left"]}>
      <div key={"codeqr"}>
        <Affix>
          <Card
            size="small"
            style={{
              backgroundColor: "rgb(0, 111, 179)",
              color: "white",
              minHeight: "80vh",
              borderRadius: "0px 10px 10px 0px",
              borderColor: "rgb(0, 111, 179)",
            }}
          >
            <Flex vertical gap={"small"} style={{ width: "100%" }}>
              <Descriptions
                colon={false}
                size="small"
                labelStyle={{ color: "white", width: "60%" }}
                style={{ width: "100%", color: "white" }}
              >
                <Descriptions.Item
                  label="Estado servicio"
                  style={{ color: "white" }}
                  span={3}
                >
                  <span
                    style={{
                      backgroundColor: "white",
                      paddingRight: "5px",
                      paddingLeft: "5px",
                      borderRadius: "5px",
                    }}
                  >
                    {send_dga ? (
                      <>
                        <Badge
                          status="processing"
                          style={{ marginRight: "5px" }}
                        />
                        Activado
                      </>
                    ) : (
                      <>Desactivado</>
                    )}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Extracciones MEE"
                  style={{ color: "white" }}
                  span={3}
                >
                  <Text style={{ color: "white" }}>
                    {premium_dga ? (
                      <Tag icon={<FileExcelFilled />} color="rgb(31, 52, 97)">
                        Activado
                      </Tag>
                    ) : (
                      <Tag>Desactivado</Tag>
                    )}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Código de obra"
                  style={{ color: "white" }}
                  span={3}
                >
                  <Text
                    style={{ color: "white" }}
                    copyable={{
                      text: code_dga,
                      icon: [
                        <CopyOutlined
                          key="copy-icon"
                          style={{ color: "white" }}
                        />,
                        <CheckCircleFilled
                          key="check-icon"
                          style={{ color: "white" }}
                        />,
                        <CloseCircleFilled
                          key="close-icon"
                          style={{ color: "white" }}
                        />,
                        <LoadingOutlined
                          key="loading-icon"
                          style={{ color: "white" }}
                        />,
                      ],
                    }}
                  >
                    {code_dga}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Estandar" span={3}>
                  <span style={{ color: "white" }}>
                    {standard
                      ? standard === "CAUDALES_MUY_PEQUENOS"
                        ? "Muy pequeños"
                        : standard
                      : "Sin registro"}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Creación "
                  style={{ color: "white" }}
                  span={3}
                >
                  <Text style={{ color: "white" }}>
                    {date_created_code ? date_created_code : "Sin registro"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Tipo captación"
                  style={{ color: "white" }}
                  span={3}
                >
                  <Text style={{ color: "white" }}>{type_dga}</Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Caudal autorizado"
                  style={{ color: "white" }}
                  span={3}
                >
                  <Flex vertical gap={"small"}>
                    <Text style={{ color: "white" }}>
                      {flow_granted_dga ? (
                        <Tag>{flow_granted_dga.toLocaleString()} lt/s</Tag>
                      ) : (
                        "Sin registro"
                      )}
                    </Text>
                  </Flex>
                </Descriptions.Item>
                <Descriptions.Item label="% Caudal en uso" span={3}>
                  <Text style={{ color: "white" }}>
                    {last_data && last_data.flow && flow_granted_dga
                      ? ((last_data.flow / flow_granted_dga) * 100).toFixed(2)
                      : "0.00"}{" "}
                    %
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label="Total autorizado"
                  style={{ color: "white" }}
                  span={3}
                >
                  <Text style={{ color: "white" }}>
                    {total_granted_dga ? (
                      <Tag>{total_granted_dga.toLocaleString("es-CL")} m³</Tag>
                    ) : (
                      "Sin registro"
                    )}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label="% Total autorizado"
                  style={{ color: "white" }}
                  span={3}
                >
                  <Text style={{ color: "white" }}>
                    {total_granted_dga && last_data && last_data.total ? (
                      <Text style={{ color: "white" }}>
                        {((last_data.total / total_granted_dga) * 100).toFixed(
                          2
                        )}{" "}
                        %
                      </Text>
                    ) : (
                      "Sin registro"
                    )}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Total puesta en marcha"
                  style={{ color: "white" }}
                  span={3}
                >
                  <Text style={{ color: "white" }}>
                    {configProfile && configProfile.d6 ? (
                      <Text style={{ color: "white" }}>
                        {configProfile.d6.toLocaleString("es-CL")} m³
                      </Text>
                    ) : (
                      "Sin registro"
                    )}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label="SHAC"
                  style={{ color: "white" }}
                  span={3}
                >
                  <Text style={{ color: "white" }}>
                    {shac ? <Tag>{shac}</Tag> : "Sin registro"}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label="Cumplimiento MEE"
                  style={{ color: "white" }}
                  span={3}
                >
                  {date_start_compliance ? (
                    <>
                      <Text style={{ color: "white" }}>
                        {date_start_compliance}
                        <br />(
                        {Math.floor(
                          (new Date() - new Date(date_start_compliance)) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        Días)
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ color: "white" }}>Sin registro</Text>
                    </>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Código QR" span={3}>
                  <ModalQR data={dataProfile} />
                </Descriptions.Item>
              </Descriptions>
              <Flex vertical align="center" justify="center" gap={"large"}>
                <Button
                  style={{
                    backgroundColor: "rgb(0, 111, 179)",
                    color: "white",
                    borderColor: "white",
                    borderRadius: "5px",
                    marginTop: "10px",
                  }}
                  icon={<LinkOutlined />}
                  onClick={() =>
                    window.open(
                      `https://snia.mop.gob.cl/cExtracciones2/#/consultaQR/${code_dga}`
                    )
                  }
                >
                  Validar sincronización DGA
                </Button>
                {dataDga && (
                  <Card
                    style={{
                      width: "100%",
                      background:
                        "linear-gradient(39deg, rgba(186,188,198,1) 0%, rgba(255,255,255,1) 100%)",
                    }}
                    size="small"
                  >
                    <Text>Has consumido:</Text>
                    <br />
                    <Text>
                      {dataDga.total &&
                      configProfile &&
                      configProfile.d6 &&
                      total_granted_dga
                        ? (
                            parseInt(dataDga.total) + parseInt(configProfile.d6)
                          ).toLocaleString("es-CL") +
                          " / " +
                          total_granted_dga.toLocaleString("es-CL") +
                          " m³"
                        : "Sin datos disponibles"}
                    </Text>
                    <Progress
                      trailColor="rgb(0, 111, 179, 0.5)"
                      strokeColor={"rgb(0, 111, 179)"}
                      status="active"
                      style={{ color: "white" }}
                      percent={percentage}
                      format={() => `${percentage}%`}
                    />
                    <Text>del total de tu consumo autorizado</Text>
                  </Card>
                )}
              </Flex>
            </Flex>
          </Card>
        </Affix>
      </div>
    </QueueAnim>
  );
};

export default CodeQR;
