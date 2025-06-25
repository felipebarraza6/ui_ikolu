import React, { useContext, useCallback, useMemo, useEffect } from "react";
import { AppContext } from "../../App";
import { Row, Col, Tag, Badge, Select, Flex, Button, Dropdown } from "antd";
import { useNavigate } from "react-router";
import {
  SendOutlined,
  DatabaseFilled,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";
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

  // Validar que tengamos los datos necesarios
  const hasValidData = useMemo(() => {
    return (
      state.profile_client &&
      Array.isArray(state.profile_client) &&
      state.profile_client.length > 0
    );
  }, [state.profile_client]);

  // Función para sincronizar el perfil seleccionado si está desincronizado
  useEffect(() => {
    if (hasValidData && state.selected_profile && !state.selected_profile.id) {
      // Si tenemos profile_client pero selected_profile no tiene id, sincronizar
      const firstProfile = state.profile_client[0];
      if (firstProfile) {
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: {
            selected_profile: { ...firstProfile, key: firstProfile.id },
          },
        });
      }
    }
  }, [hasValidData, state.selected_profile, state.profile_client, dispatch]);

  const disabledWell = useCallback((well) => {
    if (!well || !well.config_data) return true;
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

      if (!hasValidData) {
        console.warn("No hay datos de perfil disponibles");
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
    [navigate, state.profile_client, dispatch, hasValidData]
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
    if (!hasValidData) {
      return [
        <Select.Option disabled value="no-data" key="no-data">
          No hay puntos de captación disponibles
        </Select.Option>,
      ];
    }

    const wellOptions = state.profile_client
      .map((e) => {
        // Validar que cada elemento tenga las propiedades necesarias
        if (!e || !e.id || !e.config_data || !e.dga || !e.profile_ikolu) {
          console.warn("Perfil con datos incompletos:", e);
          return null;
        }

        return (
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
                <span>{e.title || `Perfil ${e.id}`}</span>
              </Flex>
              <Tag
                color={e.dga.send_dga ? "green-inverse" : "rgb(31, 52, 97)"}
                icon={e.dga.send_dga ? <SendOutlined /> : <DatabaseFilled />}
                style={{ margin: 0 }}
              >
                {e.dga.code_dga || "N/A"}
              </Tag>
            </Flex>
          </Select.Option>
        );
      })
      .filter(Boolean); // Filtrar elementos null

    if (state.user && state.user.is_admin_view && wellOptions.length > 0) {
      const firstProfile = state.profile_client[0];
      if (firstProfile && firstProfile.code_dga_site) {
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
                {firstProfile.code_dga_site}
              </Tag>
            </Flex>
          </Select.Option>
        );
      }
    }

    if (wellOptions.length === 0) {
      return [
        <Select.Option disabled value="no-data" key="no-data">
          No hay puntos de captación disponibles
        </Select.Option>,
      ];
    }

    return wellOptions;
  }, [state.profile_client, state.user, disabledWell, hasValidData]);

  // Obtener el valor actual del select de forma segura
  const currentValue = useMemo(() => {
    if (!hasValidData || !state.selected_profile) return undefined;
    return state.selected_profile.id || undefined;
  }, [state.selected_profile, hasValidData]);

  return (
    <Flex align="bottom" justify="end" gap="small" wrap="wrap">
      <Select
        style={selectStyle}
        placeholder="Seleccione punto de captación"
        value={currentValue}
        onSelect={onSelectWell}
        dropdownStyle={{ zIndex: 1001 }}
        loading={!hasValidData}
      >
        {options}
      </Select>

      {state.user && state.user.username === "demosmart" && (
        <Flex gap="small" align="center">
          <Button
            onClick={() => navigate("formmultidata")}
            icon={<FcDoughnutChart />}
          >
            MODULO B
          </Button>
        </Flex>
      )}
      <Dropdown
        menu={{
          items: [
            {
              key: "user-doc",
              icon: <UserOutlined />,
              label: "Documentación Usuario",
              onClick: () => navigate("/user-documentation"),
            },
            {
              key: "tech-doc",
              icon: <BookOutlined />,
              label: "Documentación Técnica",
              onClick: () => navigate("/documentation"),
            },
          ],
        }}
        placement="bottomRight"
      >
        <Button icon={<BookOutlined />}>Documentación</Button>
      </Dropdown>
    </Flex>
  );
};

export default React.memo(ListWells);
