import React, { useContext } from "react";
import { AppContext } from "../../App";
import AdminOverview from "./AdminOverview";
import AdminDashboard from "./AdminDashboard";

/**
 * AdminRoot - Dashboard unificado para Super Admin / Staff
 *
 * Dos vistas:
 * - Operacional: Data, puntos, clientes, registros
 * - Técnico: CPU, RAM, DB, Redis, rendimiento
 *
 * Los botones de cambio de vista están en el HeaderNav (arriba a la izquierda)
 */
const AdminRoot = () => {
  const { state } = useContext(AppContext);
  const view = state.adminView || "operacional";

  return (
    <div>
      {view === "operacional" ? <AdminOverview /> : <AdminDashboard />}
    </div>
  );
};

export default AdminRoot;
