import React from "react";
import { Tabs, Button, Modal } from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import NewRecordModal from "./NewRecordModal";
import MonthlyConsumptionTable from "./MonthlyConsumptionTable";
import ConsumptionChart from "./ConsumptionChart";

const WaterConsumptionTabs = ({
  records,
  setRecords,
  activeKey,
  setActiveKey,
}) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleNewRecord = (name, year) => {
    const newKey = (records.length + 1).toString();
    setRecords([
      ...records,
      {
        key: newKey,
        name,
        year,
        monthly: Array(12).fill(0),
      },
    ]);
    setActiveKey(newKey);
    setModalVisible(false);
  };

  const handleMonthlyChange = (key, monthIdx, value) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.key === key
          ? {
              ...rec,
              monthly: rec.monthly.map((v, i) => (i === monthIdx ? value : v)),
            }
          : rec
      )
    );
  };

  const handleRemove = (targetKey) => {
    Modal.confirm({
      title: t(
        "waterModule.confirmDeleteTitle",
        "¿Está seguro de eliminar este año?"
      ),
      okText: t("waterModule.delete", "Eliminar"),
      cancelText: t("waterModule.cancel", "Cancelar"),
      okType: "danger",
      centered: true,
      onOk: () => {
        setRecords((prev) => prev.filter((rec) => rec.key !== targetKey));
        if (activeKey === targetKey && records.length > 1) {
          const idx = records.findIndex((rec) => rec.key === targetKey);
          const next = records[idx === 0 ? 1 : idx - 1];
          setActiveKey(next.key);
        }
      },
    });
  };

  // Formateador de números con separador de miles
  const formatNumber = (num) =>
    num.toLocaleString("es-CL", { maximumFractionDigits: 0 });

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px #1677ff22",
        padding: 12,
      }}
    >
      <Tabs
        type="card"
        activeKey={activeKey}
        onChange={setActiveKey}
        tabBarExtraContent={
          <Button
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            type="primary"
            style={{ background: "#1F3461", borderColor: "#1F3461" }}
          >
            {t("waterModule.newRecord")}
          </Button>
        }
        items={records.map((record) => {
          const total = record.monthly.reduce(
            (sum, v) => sum + (Number(v) || 0),
            0
          );
          return {
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {`${record.name} (${record.year})`}
                {records.length > 1 && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined style={{ fontSize: 12 }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(record.key);
                    }}
                    style={{ marginLeft: 4, color: "#b22234" }}
                    aria-label={t("waterModule.delete", "Eliminar")}
                  />
                )}
              </span>
            ),
            key: record.key,
            children: (
              <>
                <MonthlyConsumptionTable
                  monthly={record.monthly}
                  onChange={(monthIdx, value) =>
                    handleMonthlyChange(record.key, monthIdx, value)
                  }
                />
                {/* Total anual antes del gráfico, alineado a la derecha, sin título extra */}
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    color: "#1F3461",
                    textAlign: "center",
                  }}
                >
                  {t("waterModule.total", "Total")}: {formatNumber(total)} m³
                </div>
                <ConsumptionChart monthly={record.monthly} year={record.year} />
              </>
            ),
          };
        })}
      />
      <NewRecordModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onCreate={handleNewRecord}
      />
    </div>
  );
};

export default WaterConsumptionTabs;
