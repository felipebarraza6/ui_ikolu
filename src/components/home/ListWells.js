import React, { useContext, useCallback, useMemo } from "react";
import { AppContext } from "../../App";
import { Row, Col, Tag, Badge, Select, Flex, Button } from "antd";
import { useNavigate } from "react-router";
import { SendOutlined, DatabaseFilled } from "@ant-design/icons";
import { GiConsoleController } from "react-icons/gi";
import { FcDoughnutChart } from "react-icons/fc";
import { useResponsive } from "../../hooks/useResponsive";

// --- Helpers ---
const safeParseJSON = (item, fallback = null) => {
  try {
    const value = localStorage.getItem(item);
    if (value === null || value === "undefined" || value === "null") {
      return fallback;
    }
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Error parsing localStorage item "${item}":`, error);
    return fallback;
  }
};

const ListWells = () => {
  const { state, dispatch } = useContext(AppContext);
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const disabledWell = useCallback((well) => {
    return !(
      well.config_data.is_telemetry ||
      well.standard === "CAUDALES_MUY_PEQUENOS" ||
      well.standard === "MENOR"
    );
  }, []);

  const onSelectWell = useCallback(
    (key) => {
      if (key === "admin") {
        navigate("/supp");
        return;
      }

      const selectedProfile = state.profile_client.find(
        (profile) => profile.id === key
      );

      if (selectedProfile) {
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: {
            selected_profile: { ...selectedProfile, key },
          },
        });
        navigate("/");
      }
    },
    [navigate, state.profile_client, dispatch]
  );

  const selectStyle = useMemo(
    () => ({
      width: isMobile ? "100%" : "300px",
      zIndex: 1000,
      color: "black",
    }),
    [isMobile]
  );

  const options = useMemo(() => {
    const wellOptions =
      state.profile_client?.map((e) => (
        <Select.Option key={e.id} disabled={disabledWell(e)} value={e.id}>
          <Flex gap="large" justify="space-between" align="center">
            <Flex gap="small" align="center">
              <Badge
                status={
                  e.config_data.is_telemetry
                    ? e.profile_ikolu.entry_by_form
                      ? "success"
                      : "processing"
                    : "warning"
                }
              />
              <span>{e.title}</span>
            </Flex>
            <Tag
              color={e.dga.send_dga ? "green-inverse" : "rgb(31, 52, 97)"}
              icon={e.dga.send_dga ? <SendOutlined /> : <DatabaseFilled />}
              style={{ margin: 0 }}
            >
              {e.dga.code_dga}
            </Tag>
          </Flex>
        </Select.Option>
      )) || [];

    if (state.user.is_admin_view && state.profile_client?.length > 0) {
      wellOptions.push(
        <Select.Option key="admin" value="admin">
          <Flex gap="large" align="center">
            <Badge status="success" />
            <span>Total</span>
            <Tag
              color="green-inverse"
              icon={<DatabaseFilled />}
              style={{ margin: 0 }}
            >
              {state.profile_client[0].code_dga_site}
            </Tag>
          </Flex>
        </Select.Option>
      );
    }

    if (wellOptions.length === 0) {
      return [
        <Select.Option disabled value="no-data" key="no-data">
          No hay puntos de captación disponibles
        </Select.Option>,
      ];
    }

    return wellOptions;
  }, [state.profile_client, state.user.is_admin_view, disabledWell]);

  return (
    <Flex align="bottom" justify="end" gap="small" wrap="wrap">
      <Select
        style={selectStyle}
        placeholder="Seleccione punto de captación"
        value={state.selected_profile?.id}
        onSelect={onSelectWell}
        dropdownStyle={{ zIndex: 1001 }}
      >
        {options}
      </Select>

      {state.user.username === "demosmart" && (
        <Button
          onClick={() => navigate("formmultidata")}
          icon={<FcDoughnutChart />}
        >
          MODULO B
        </Button>
      )}
    </Flex>
  );
};

export default React.memo(ListWells);
