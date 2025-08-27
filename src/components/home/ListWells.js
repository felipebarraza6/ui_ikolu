import React from "react";
import { Select, Spin, Tooltip } from "antd";
import { useUserProfilesContext } from "../../contexts/UserProfilesContext";
import { CheckCircleOutlined } from "@ant-design/icons";

/**
 * 🧭 COMPONENTE LISTWELLS REFACTORIZADO
 *
 * Ahora usa el contexto compartido para obtener datos desde la API
 * Evita múltiples peticiones al endpoint
 */
const ListWells = () => {
  const { profiles, selectedProfile, loading, changeSelectedProfile } =
    useUserProfilesContext();

  // Debug logs para perfiles
  console.log("🔍 ListWells - profiles:", profiles);
  console.log("🔍 ListWells - selectedProfile:", selectedProfile);
  console.log("🔍 ListWells - loading:", loading);

  // Función para seleccionar pozo
  const onSelectWell = (key) => {
    if (key === "admin") {
      // Assuming navigate is available from useNavigate or similar
      // For now, we'll just console.log or handle navigation differently
      console.log("Navigate to /supp");
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.warn("No hay perfiles disponibles");
      return;
    }

    const selectedProfile = profiles.find((profile) => profile.id === key);

    if (selectedProfile) {
      changeSelectedProfile(selectedProfile.id);
      // Assuming navigate is available from useNavigate or similar
      // For now, we'll just console.log or handle navigation differently
      console.log("Navigate to /telemetria");
    }
  };

  // Estilos responsivos para el select
  const selectStyle = React.useMemo(
    () => ({
      width: "100%",
      zIndex: 1000,
      minWidth: "200px", // Assuming isMobile is removed or handled differently
      maxWidth: "300px", // Assuming isMobile is removed or handled differently
    }),
    []
  );

  // Generar opciones del select
  const options = React.useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return [
        <Select.Option disabled value="no-data" key="no-data">
          No hay puntos de captación disponibles
        </Select.Option>,
      ];
    }

    // Mostrar TODOS los perfiles disponibles (no filtrar por is_enabled que no existe)
    const availableProfiles = profiles;

    const wellOptions = availableProfiles
      .map((e) => {
        if (!e || !e.id) {
          console.warn("Perfil con datos incompletos:", e);
          return null;
        }

        return (
          <Select.Option
            key={e.id}
            value={e.id}
            label={e.title + " " + (e.dga?.code_dga || "")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Tag con tooltip explicativo */}
              <Tooltip
                title={
                  e.config_data?.is_telemetry
                    ? e.config_data?.is_active
                      ? "M3: Telemetría Activa (Datos automáticos en tiempo real)"
                      : "M2: Telemetría Inactiva (Datos semiautomáticos)"
                    : "M1: Manual (Datos ingresados manualmente)"
                }
                placement="top"
              >
                <span
                  style={{
                    backgroundColor: e.config_data?.is_telemetry
                      ? e.config_data?.is_active
                        ? "#52c41a" // Verde: Telemetría activa
                        : "#faad14" // Naranja: Telemetría inactiva
                      : "#8c8c8c", // Gris: Manual
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "help",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {e.config_data?.is_telemetry
                    ? e.config_data?.is_active
                      ? "M3"
                      : "M2"
                    : "M1"}
                </span>
              </Tooltip>

              {/* Título simple */}
              <span style={{ fontWeight: "500", fontSize: "14px" }}>
                {e.title || `Perfil ${e.id}`}
              </span>

              {/* Código DGA simple */}
              {e.dga?.code_dga && (
                <span
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                >
                  ({e.dga.code_dga})
                </span>
              )}

              {/* Indicador de estado */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: e.config_data?.is_active ? "#52c41a" : "#8c8c8c",
                  fontWeight: "600",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: e.config_data?.is_active
                      ? "#52c41a"
                      : "#8c8c8c",
                  }}
                />
                {e.config_data?.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </Select.Option>
        );
      })
      .filter(Boolean); // Filtrar elementos null

    // Agregar opción de admin si es necesario
    if (availableProfiles.length > 0) {
      const firstProfile = availableProfiles[0];
      if (firstProfile && firstProfile.dga?.code_dga) {
        wellOptions.push(
          <Select.Option
            key="admin"
            value="admin"
            label={"Total " + (firstProfile.dga.code_dga || "")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Tag con tooltip para Total */}
              <Tooltip
                title="Vista general de todos los puntos del sistema"
                placement="top"
              >
                <span
                  style={{
                    backgroundColor: "#1890ff",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "help",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  Total
                </span>
              </Tooltip>

              {/* Título simple */}
              <span style={{ fontWeight: "500", fontSize: "14px" }}>
                Vista General
              </span>

              {/* Código DGA simple */}
              {firstProfile.dga.code_dga && (
                <span
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                >
                  ({firstProfile.dga.code_dga})
                </span>
              )}
            </div>
          </Select.Option>
        );
      }
    }

    return wellOptions;
  }, [profiles]); // Solo profiles como dependencia

  // Obtener el valor actual del select de forma segura
  const currentValue = React.useMemo(() => {
    if (!profiles || profiles.length === 0 || !selectedProfile)
      return undefined;
    return selectedProfile.id || undefined;
  }, [selectedProfile, profiles]);

  // Mostrar error si hay problema con los datos
  // The original code had an 'error' state, but it's not managed by useUserProfilesContext anymore.
  // Assuming 'error' is no longer relevant or will be handled differently.
  // For now, we'll remove the error display as it's not directly tied to the new context.

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px 0",
      }}
    >
      <Select
        style={{
          width: "250px",
          opacity: loading ? 0.6 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
        placeholder={loading ? "Cargando..." : "Seleccione punto"}
        value={currentValue}
        onSelect={onSelectWell}
        loading={!profiles || profiles.length === 0 || loading}
        showSearch
        optionFilterProp="label"
        filterOption={(input, option) => {
          if (!option) return false;
          const label = option.label || "";
          return label.toLowerCase().includes(input.toLowerCase());
        }}
        disabled={loading}
        size="middle"
        popupMatchSelectWidth={false}
        // Mejorar el resaltado del seleccionado
        optionLabelProp="label"
        dropdownStyle={{
          maxHeight: "300px",
          overflow: "auto",
        }}
      >
        {options}
      </Select>

      {/* Indicador de estado */}
      {!loading && profiles && profiles.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#52c41a",
          }}
        >
          <CheckCircleOutlined />
          {profiles.length} punto{profiles.length !== 1 ? "s" : ""} disponible
          {profiles.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default React.memo(ListWells);
