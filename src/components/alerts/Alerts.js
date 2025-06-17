import React, { useState, useEffect, useContext } from "react";
import { Layout, Menu, Flex, Card, Tag, Alert } from "antd";
import FormAlert from "./FormAlert";
import TableAlerts from "./TableAlerts";
import { PlusCircleFilled, OrderedListOutlined } from "@ant-design/icons";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";

const { Header, Content, Footer } = Layout;

const Alerts = () => {
  const { state } = useContext(AppContext);
  const [update, setUpdate] = useState(false);
  const selected_id = state.selected_profile.id;
  const [selectedMenu, setSelectedMenu] = useState("1");
  const [pageActive, setPageActve] = useState(1);
  const [pageOld, setPageOld] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [ticketsActives, setTicketsActives] = useState([]);

  const getTickets = async () => {
    const rq = await sh.notifications
      .get(selected_id, pageOld, "ALERT")
      .then((res) => {
        setTickets(res.results);
      });
  };

  const getActiveTickets = async () => {
    const rq = await sh.notifications
      .actives(selected_id, pageActive, "ALERT")
      .then((res) => {
        setTicketsActives(res.results);
      });
  };

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };
  console.log(tickets);

  useEffect(() => {
    getActiveTickets();
    getTickets();
  }, [update]);

  return (
    <Layout className="layout" style={{ borderRadius: "10px" }}>
      <Content
        style={{
          borderRadius: "10px 10px 10px 10px",
          background:
            "linear-gradient(39deg, rgba(222,222,222,1) 0%, rgba(217,221,230,1) 77%)",
        }}
      >
        {selectedMenu === "1" ? (
          <Flex
            gap="large"
            align="top"
            style={{
              minHeight: "90vh",
              padding: "10px",
            }}
            justify="space-evenly"
          >
            <Card
              hoverable
              style={{ width: "400px" }}
              title="Crear Alerta"
              extra={
                <PlusCircleFilled
                  style={{ fontSize: "15px", color: "#1f3461" }}
                />
              }
            >
              <Alert
                description="Las alertas operan bajo el último dato almacenado."
                type="info"
                closable
                style={{ marginBottom: "10px", padding: "10px" }}
                showIcon
              />
              <FormAlert update={update} setUpdate={setUpdate} />
            </Card>
            <Card
              title="Alertas"
              size="small"
              style={{ width: "80%" }}
              extra={<Tag color="#1f3461">tus alertas</Tag>}
            >
              {" "}
              <TableAlerts data={tickets} />
            </Card>
          </Flex>
        ) : (
          <Flex
            gap="large"
            align="top"
            style={{ minHeight: "72vh" }}
            justify="space-evenly"
          >
            <Card
              style={{ width: "100%" }}
              title="En está sección visualizara los tickets completados y su historial. "
              size="small"
            ></Card>
          </Flex>
        )}
      </Content>
    </Layout>
  );
};

export default Alerts;
