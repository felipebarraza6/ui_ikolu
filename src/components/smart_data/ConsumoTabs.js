import React, { useState } from "react";
import { Tabs, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ModalNuevoRegistro from "./ModalNuevoRegistro";
import ConsumoMensualTable from "./ConsumoMensualTable";

const ConsumoTabs = () => {
  const [registros, setRegistros] = useState([
    {
      key: "1",
      nombre: "Registro Inicial",
      anio: new Date().getFullYear(),
      consumoMensual: Array(12).fill(0),
    },
  ]);
  const [activeKey, setActiveKey] = useState("1");
  const [modalVisible, setModalVisible] = useState(false);

  const handleNuevoRegistro = (nombre, anio) => {
    const newKey = (registros.length + 1).toString();
    setRegistros([
      ...registros,
      {
        key: newKey,
        nombre,
        anio,
        consumoMensual: Array(12).fill(0),
      },
    ]);
    setActiveKey(newKey);
    setModalVisible(false);
  };

  const handleConsumoChange = (key, mesIndex, value) => {
    setRegistros((prev) =>
      prev.map((reg) =>
        reg.key === key
          ? {
              ...reg,
              consumoMensual: reg.consumoMensual.map((v, i) =>
                i === mesIndex ? value : v
              ),
            }
          : reg
      )
    );
  };

  return (
    <div>
      <Tabs
        type="card"
        activeKey={activeKey}
        onChange={setActiveKey}
        tabBarExtraContent={
          <Button
            icon={<PlusOutlined />}
            style={{ background: "#1F3461", borderColor: "#1F3461" }}
            onClick={() => setModalVisible(true)}
            type="primary"
          >
            Nuevo
          </Button>
        }
        items={registros.map((registro) => ({
          label: `${registro.nombre} (${registro.anio})`,
          key: registro.key,
          children: (
            <ConsumoMensualTable
              consumoMensual={registro.consumoMensual}
              onChange={(mesIndex, value) =>
                handleConsumoChange(registro.key, mesIndex, value)
              }
            />
          ),
        }))}
      />
      <ModalNuevoRegistro
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onCreate={handleNuevoRegistro}
      />
    </div>
  );
};

export default ConsumoTabs;
