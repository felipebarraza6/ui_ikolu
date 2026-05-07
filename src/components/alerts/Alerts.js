import React, { useState, useEffect, useContext } from "react";
import { Layout, Flex, Card, Tag, Button, Drawer } from "antd";
import { PlusOutlined, AlertOutlined } from "@ant-design/icons";
import FormAlert from "./FormAlert";
import TableAlerts from "./TableAlerts";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";

const { Content } = Layout;

const Alerts = () => {
  const { state } = useContext(AppContext);
  const [update, setUpdate] = useState(false);
  const selected_id = state.selected_profile.id;
  const [pageActive, setPageActve] = useState(1);
  const [pageOld, setPageOld] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [ticketsActives, setTicketsActives] = useState([]);

  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);

  const getTickets = async () => {
    await sh.notifications.get(selected_id, pageOld, "ALERT").then((res) => {
      setTickets(res.results || []);
    });
  };

  const getActiveTickets = async () => {
    await sh.notifications.actives(selected_id, pageActive, "ALERT").then((res) => {
      setTicketsActives(res.results || []);
    });
  };

  useEffect(() => {
    if (selected_id) {
      getActiveTickets();
      getTickets();
    }
  }, [update, selected_id]);

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditDrawerVisible(true);
  };

  const handleCloseEdit = () => {
    setEditDrawerVisible(false);
    setEditingRecord(null);
  };

  return (
    <Layout className="layout" style={{ borderRadius: "10px" }}>
      <Content
        style={{
          borderRadius: "10px 10px 10px 10px",
          background:
            "linear-gradient(39deg, rgba(222,222,222,1) 0%, rgba(217,221,230,1) 77%)",
          padding: "20px",
        }}
      >
        <Flex gap="large" align="top" style={{ minHeight: "90vh" }}>
          <Card
            title={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertOutlined style={{ color: "#1f3461" }} />
                Mis Alertas
              </span>
            }
            size="small"
            style={{ width: "100%" }}
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Tag color="#BDC00C">{tickets.length} alertas en historial</Tag>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateDrawerVisible(true)}
                  style={{
                    backgroundColor: "#1f3461",
                    borderColor: "#1f3461",
                  }}
                >
                  Crear alerta
                </Button>
              </div>
            }
          >
            <TableAlerts
              data={tickets}
              update={update}
              setUpdate={setUpdate}
              onEdit={handleEdit}
            />
          </Card>
        </Flex>

        {/* Drawer Crear */}
        <Drawer
          title={
            <span
              style={{
                color: "white",
                fontWeight: 600,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <AlertOutlined />
              Crear
            </span>
          }
          width={550}
          onClose={() => setCreateDrawerVisible(false)}
          open={createDrawerVisible}
          styles={{
            body: { background: "#1F3461", padding: "32px 28px" },
            header: {
              background: "#1F3461",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
            },
            mask: { background: "rgba(0,0,0,0.65)" },
          }}
          closeIcon={<span style={{ color: "white", fontSize: 18 }}>✕</span>}
        >
          <FormAlert
            update={update}
            setUpdate={setUpdate}
            onSuccess={() => setCreateDrawerVisible(false)}
          />
        </Drawer>

        {/* Drawer Editar */}
        <Drawer
          title={
            <span
              style={{
                color: "white",
                fontWeight: 600,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <AlertOutlined />
              Editar
            </span>
          }
          width={550}
          onClose={handleCloseEdit}
          open={editDrawerVisible}
          styles={{
            body: { background: "#1F3461", padding: "32px 28px" },
            header: {
              background: "#1F3461",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
            },
            mask: { background: "rgba(0,0,0,0.65)" },
          }}
          closeIcon={<span style={{ color: "white", fontSize: 18 }}>✕</span>}
        >
          <FormAlert
            record={editingRecord}
            update={update}
            setUpdate={setUpdate}
            onSuccess={handleCloseEdit}
          />
        </Drawer>
      </Content>
    </Layout>
  );
};

export default Alerts;
