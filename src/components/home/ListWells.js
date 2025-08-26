import React, { useContext, useCallback, useMemo, useEffect } from "react";
import { AppContext } from "../../App";
import { Tag, Badge, Select, Flex, Button, Tooltip } from "antd";
import { useNavigate } from "react-router";

const ListWells = () => {
  const { state, dispatch } = useContext(AppContext);
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
      // Bloquear cambio si está cargando datos
      if (state.isLoading) {
        console.warn("No se puede cambiar de pozo mientras se cargan datos");
        return;
      }

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
        navigate("/telemetria");
      }
    },
    [navigate, state.profile_client, dispatch, hasValidData, state.isLoading]
  );

  const selectStyle = useMemo(
    () => ({
      width: "100%",
      zIndex: 1000,
      color: "black",
    }),
    []
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
          <Select.Option
            key={e.id}
            value={e.id}
            label={e.title + " " + (e.dga.code_dga || "")}
          >
            <Flex direction="column" style={{ width: "100%", minWidth: 0 }}>
              <Flex
                gap="small"
                align="center"
                style={{ width: "100%", minWidth: 0, overflow: "hidden" }}
              >
                <Badge
                  status={
                    e.config_data.is_telemetry
                      ? e.profile_ikolu.entry_by_form
                        ? "success"
                        : "processing"
                      : "warning"
                  }
                />
                <span
                  style={{
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: 1,
                  }}
                >
                  {e.title || `Perfil ${e.id}`}
                </span>
              </Flex>
              <Tag
                color="green-inverse"
                style={{
                  margin: "6px 0 0 24px",
                  fontSize: 10,
                  padding: "0 6px",
                  height: 18,
                  lineHeight: "16px",
                  display: "inline-block",
                }}
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
          <Select.Option
            key="admin"
            value="admin"
            label={"Total " + (firstProfile.code_dga_site || "")}
          >
            <Flex direction="column" style={{ width: "100%", minWidth: 0 }}>
              <Flex
                gap="small"
                align="center"
                style={{ width: "100%", minWidth: 0, overflow: "hidden" }}
              >
                <Badge status="success" />
                <span
                  style={{
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: 1,
                  }}
                >
                  Total
                </span>
              </Flex>
              <Tag
                color="green-inverse"
                style={{
                  margin: "2px 0 0 24px",
                  fontSize: 11,
                  padding: "0 6px",
                  height: 18,
                  lineHeight: "16px",
                  display: "inline-block",
                }}
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
  }, [state.profile_client, state.user, hasValidData]);

  // Obtener el valor actual del select de forma segura
  const currentValue = useMemo(() => {
    if (!hasValidData || !state.selected_profile) return undefined;
    return state.selected_profile.id || undefined;
  }, [state.selected_profile, hasValidData]);

  return (
    <Flex align="bottom" justify="end" gap="small" wrap="wrap">
      <Select
        style={{
          ...selectStyle,
          opacity: state.isLoading ? 0.6 : 1,
          pointerEvents: state.isLoading ? "none" : "auto",
        }}
        placeholder={
          state.isLoading
            ? "Cargando datos..."
            : "Seleccione punto de captación"
        }
        value={currentValue}
        onSelect={onSelectWell}
        dropdownStyle={{ zIndex: 1001 }}
        loading={!hasValidData || state.isLoading}
        showSearch
        optionFilterProp="label"
        filterOption={(input, option) => {
          if (!option) return false;
          const label = option.label || "";
          return label.toLowerCase().includes(input.toLowerCase());
        }}
        disabled={state.isLoading}
      >
        {options}
      </Select>
      {state.isLoading && (
        <Tooltip title="Cargando datos del pozo actual...">
          <Button
            type="text"
            loading
            size="small"
            style={{
              color: "#1F3461",
              border: "none",
              boxShadow: "none",
            }}
          />
        </Tooltip>
      )}
    </Flex>
  );
};

export default React.memo(ListWells);
