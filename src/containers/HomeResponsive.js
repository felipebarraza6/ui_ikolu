import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AppContext } from "../App";
import ResponsiveLayout from "../components/layout/ResponsiveLayout";

// Importar componentes
import MyWell from "../components/mywell/MyWell";
import GraphisNav from "../components/smart_data/GraphisNav";
import Dga from "../components/dga/Dga";
import Sma from "../components/Sma";
import PrototypeUmi from "../components/prototype_umi/PrototypeUmi";
import DataTable from "../components/prototype_umi/DataTable";
import Reports from "../components/reports/Reports";
import Dash from "../components/support/Dash";
import Well from "../components/mywell/Well";
import GraphisNavDga from "../components/smart_data/GraphisNavDga";
import DocRes from "../components/docres/DocRes";
import Alerts from "../components/alerts/Alerts";
import FormMultiData from "../containers/FormMultiData";
import TableStandarVerySmall from "../components/mywell/TableStandarVerySmall";
import MyGraphics from "../components/graphics/MyGraphics";
import Supp from "../components/home/Supp";

const HomeResponsive = () => {
  const { state } = useContext(AppContext);

  // Componente para la ruta principal con lógica condicional
  const MainRoute = () => {
    if (state.selected_profile.dga.type_dga === "SUBTERRANEO") {
      if (state.selected_profile.dga.standard === "CAUDALES_MUY_PEQUENOS") {
        return <TableStandarVerySmall data={state.selected_profile} />;
      } else {
        return <MyWell />;
      }
    } else if (state.user.username === "arrocerospti") {
      return <PrototypeUmi />;
    } else {
      return <Sma />;
    }
  };

  return (
    <ResponsiveLayout>
      <Routes>
        {/* Ruta principal con lógica condicional */}
        <Route path="/" element={<MainRoute />} />

        {/* Smart Análisis */}
        <Route path="/sys_data" element={<GraphisNav />} />
        <Route path="/analisis" element={<GraphisNav />} />

        {/* DGA - MEE */}
        <Route path="/dga" element={<Dga />} />

        {/* DGA Análisis */}
        <Route path="/sys_data_dga" element={<GraphisNavDga />} />
        <Route path="/dga-analisis" element={<GraphisNavDga />} />

        {/* Descarga */}
        <Route path="/extraction_data" element={<Reports />} />
        <Route path="/descarga" element={<Reports />} />

        {/* Documentos */}
        <Route path="/sys_docs" element={<DocRes />} />
        <Route path="/documentos" element={<DocRes />} />

        {/* Alertas */}
        <Route path="/sys_alerts" element={<Alerts />} />
        <Route path="/alertas" element={<Alerts />} />

        {/* Soporte */}
        <Route path="/sys_support" element={<Dash />} />
        <Route path="/soporte" element={<Dash />} />

        {/* Rutas adicionales existentes */}
        <Route path="/registers_pti" element={<DataTable />} />
        <Route path="/well" element={<Well />} />
        <Route path="/graficos" element={<MyGraphics />} />
        <Route path="/formmultidata" element={<FormMultiData />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/supp" element={<Supp />} />

        {/* Ruta por defecto */}
        <Route path="*" element={<MainRoute />} />
      </Routes>
    </ResponsiveLayout>
  );
};

export default HomeResponsive;
