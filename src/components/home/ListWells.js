import React, { useContext, useCallback, useMemo, useEffect } from "react";
import { AppContext } from "../../App";
import { Badge, Select, Flex, Button, Tooltip, Tag } from "antd";
import { useNavigate, useLocation } from "react-router";
import sh from "../../api/sh/endpoints";
import { FaEye } from "react-icons/fa";
import { MdSensorOccupied } from "react-icons/md";

const ListWells = () => {
  const { state, dispatch } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 🆕 Usar points_list como fuente principal, fallback a profile_client
  const pointsSource = useMemo(() => {
    return state.points_list || state.profile_client || [];
  }, [state.points_list, state.profile_client]);

  // Validar que tengamos los datos necesarios
  const hasValidData = useMemo(() => {
    return (
      pointsSource &&
      Array.isArray(pointsSource) &&
      pointsSource.length > 0
    );
  }, [pointsSource]);

  // Función para cargar detalle del punto seleccionado
  const loadPointDetail = useCallback(async (pointId) => {
    try {
      dispatch({ type: "SET_LOADING", payload: { isLoading: true } });
      const detail = await sh.getPointDetail(pointId);

      if (detail) {
        dispatch({
          type: "SET_SELECTED_PROFILE_DETAIL",
          payload: { selected_profile: detail },
        });
      }
      dispatch({ type: "SET_LOADING", payload: { isLoading: false } });
      return detail;
    } catch (err) {
      console.error("Error cargando detalle del punto:", err);
      dispatch({ type: "SET_LOADING", payload: { isLoading: false } });
      return null;
    }
  }, [dispatch]);

  // Función para sincronizar el perfil seleccionado si está desincronizado
  useEffect(() => {
    if (hasValidData && state.selected_profile && !state.selected_profile.id) {
      const firstProfile = pointsSource[0];
      if (firstProfile) {
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: {
            selected_profile: { ...firstProfile, key: firstProfile.id },
          },
        });
      }
    }
  }, [hasValidData, state.selected_profile, pointsSource, dispatch]);

  const disabledWell = useCallback((well) => {
    if (!well) return true;
    // 🆕 Soportar datos simples de my_points (is_telemetry directo) y datos completos (config_data)
    const hasTelemetry = well.is_telemetry ?? well.config_data?.is_telemetry ?? false;
    if (hasTelemetry) return false;
    if (!well.config_data) return false; // Datos simples sin config_data = permitido
    return !(
      well.standard === "CAUDALES_MUY_PEQUENOS" ||
      well.standard === "MENOR"
    );
  }, []);

  const onSelectWell = useCallback(
    async (key) => {
      // Bloquear cambio si está cargando datos
      if (state.isLoading) {
        console.warn("No se puede cambiar de pozo mientras se cargan datos");
        return;
      }

      if (key === "clear") {
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: { selected_profile: null },
        });
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

      const selectedProfile = pointsSource.find(
        (profile) => profile.id === key
      );

      if (selectedProfile) {
        // Actualizar el seleccionado con la data mínima
        dispatch({
          type: "CHANGE_SELECTED_PROFILE",
          payload: {
            selected_profile: { ...selectedProfile, key },
          },
        });

        // Cargar el detalle completo del punto
        await loadPointDetail(key);

        // 🆕 Navegar a telemetría automáticamente si no está ya ahí
        if (location.pathname !== "/telemetry") {
          navigate("/telemetry");
        }
      }
    },
    [navigate, pointsSource, dispatch, hasValidData, state.isLoading, loadPointDetail]
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

    // 🆕 Agrupar puntos por project_name para usar OptGroup
    const grouped = pointsSource.reduce((acc, point) => {
      if (!point || !point.id) {
        console.warn("Perfil con datos incompletos:", point);
        return acc;
      }
      const project = point.project_name || "Sin proyecto";
      if (!acc[project]) acc[project] = [];
      acc[project].push(point);
      return acc;
    }, {});

    const clearOption = (
      <Select.Option key="clear" value="clear" label="— Sin selección —">
        <Flex
          align="center"
          gap="small"
          style={{ width: "100%", minWidth: 0, padding: "6px 0" }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#d9d9d9",
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 500, fontSize: 13, color: "#8c8c8c" }}>
            — Sin selección —
          </span>
        </Flex>
      </Select.Option>
    );

    const renderOption = (e) => {
      const isTelemetry = e.is_telemetry ?? e.config_data?.is_telemetry ?? false;
      const isOwner = e.is_owner ?? false;
      const isViewer = e.is_viewer ?? false;
      const isDgaCompliance = e.is_dga_compliance ?? (e.dga?.send_dga ?? false);
      const codeDga = e.code_dga || e.dga?.code_dga || "";
      const title = e.title || `Perfil ${e.id}`;

      return (
        <Select.Option
          key={e.id}
          value={e.id}
          label={title + (codeDga ? " " + codeDga : "")}
        >
          <Flex
            align="center"
            gap="small"
            style={{
              width: "100%",
              minWidth: 0,
              padding: "6px 0",
            }}
          >
            {/* Telemetría: puntito */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isTelemetry ? "#1F3461" : "#bfbfbf",
                flexShrink: 0,
              }}
            />

            {/* Título */}
            <span
              style={{
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
                fontSize: 13,
                color: "#1a1a1a",
              }}
            >
              {title}
            </span>

            {/* Código DGA: tag sutil con estado integrado */}
            {codeDga && (
              <Tooltip title={isDgaCompliance ? "Enviando datos DGA" : "Sin envío DGA"}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isDgaCompliance ? 600 : 400,
                    color: isDgaCompliance ? "#1a1a1a" : "#8c8c8c",
                    background: isDgaCompliance ? "rgba(189, 192, 12, 0.15)" : "#f5f5f5",
                    border: `1px solid ${isDgaCompliance ? "rgba(189, 192, 12, 0.5)" : "#d9d9d9"}`,
                    borderRadius: 4,
                    padding: "1px 6px",
                    lineHeight: "14px",
                    flexShrink: 0,
                    letterSpacing: 0.3,
                  }}
                >
                  {codeDga}
                </span>
              </Tooltip>
            )}

            {/* Owner / Viewer */}
            {isOwner && (
              <Tooltip title="Propietario">
                <MdSensorOccupied style={{ color: "#1F3461", fontSize: 15, flexShrink: 0 }} />
              </Tooltip>
            )}
            {isViewer && (
              <Tooltip title="Observador">
                <FaEye style={{ color: "#d46b08", fontSize: 13, flexShrink: 0 }} />
              </Tooltip>
            )}
          </Flex>
        </Select.Option>
      );
    };

    // 🆕 Construir OptGroups por proyecto
    const groups = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([project, points]) => (
        <Select.OptGroup key={project} label={project}>
          {points.map(renderOption)}
        </Select.OptGroup>
      ));

    // Opción admin (solo si aplica)
    if (state.user?.is_admin_view) {
      const firstProfile = pointsSource[0];
      if (firstProfile?.code_dga_site) {
        groups.push(
          <Select.OptGroup key="admin-group" label="Administración">
            <Select.Option key="admin" value="admin" label="Total">
              <Flex align="center" gap="small">
                <Badge status="success" />
                <span style={{ fontWeight: 500 }}>Total</span>
                <Tag size="small" color="green-inverse">{firstProfile.code_dga_site}</Tag>
              </Flex>
            </Select.Option>
          </Select.OptGroup>
        );
      }
    }

    if (groups.length === 0) {
      return [
        <Select.Option disabled value="no-data" key="no-data">
          No hay puntos de captación disponibles
        </Select.Option>,
      ];
    }

    return [clearOption, ...groups];
  }, [pointsSource, state.user, hasValidData]);

  // Obtener el valor actual del select de forma segura
  const currentValue = useMemo(() => {
    if (!hasValidData || !state.selected_profile) return undefined;
    return state.selected_profile.id || undefined;
  }, [state.selected_profile, hasValidData]);

  return (
    <Flex align="bottom" justify="end" gap="small" wrap="wrap">
      {/* 🎨 Estilos forzados para el Select */}
      <style>{`
        .yellow-select .ant-select-selector {
          background-color: #BDC00C !important;
          border-color: #a3a60a !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
        }
        .yellow-select .ant-select-selection-item {
          color: #1a1a1a !important;
          font-weight: 600 !important;
        }
        .yellow-select .ant-select-selection-placeholder {
          color: #595959 !important;
        }
        .yellow-select .ant-select-arrow {
          color: #1a1a1a !important;
        }
        .yellow-select.ant-select-focused .ant-select-selector {
          border-color: #1F3461 !important;
          box-shadow: 0 0 0 2px rgba(31, 52, 97, 0.15) !important;
        }
        /* Dropdown limpio: blanco con hover amarillo suave */
        .yellow-select-dropdown .ant-select-item {
          border-radius: 4px !important;
          margin: 2px 6px !important;
          padding: 6px 10px !important;
        }
        .yellow-select-dropdown .ant-select-item-option-active {
          background-color: #f0f2b3 !important;
        }
        .yellow-select-dropdown .ant-select-item-option-selected {
          background-color: #BDC00C !important;
          font-weight: 600 !important;
        }
        .yellow-select-dropdown .ant-select-item-option-selected .ant-select-item-option-state {
          color: #1a1a1a !important;
        }
      `}</style>
      <Select
        className="yellow-select"
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
        dropdownClassName="yellow-select-dropdown"
        dropdownStyle={{ zIndex: 1001, background: "#fff" }}
        listHeight={280}
        getPopupContainer={() => document.body}
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
