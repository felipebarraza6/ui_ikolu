import React, { useState, useEffect, useContext } from "react";
import { Layout, Menu, Flex, Card, Tag, Alert } from "antd";
import FormSupport from "./FormSupport";
import TableSupport from "./TableSupport";
import { PlusCircleFilled, OrderedListOutlined } from "@ant-design/icons";
import ActiveTickets from "./ActiveTickets";
import sh from "../../api/sh/endpoints";
import { AppContext } from "../../App";

const { Header, Content, Footer } = Layout;

const Dash = () => {
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
      .get(selected_id, pageOld, "SUPPORT")
      .then((res) => {
        setTickets(res.results);
      });
  };

  const getActiveTickets = async () => {
    const rq = await sh.notifications
      .actives(selected_id, pageActive, "SUPPORT")
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
      <Header
        style={{
          borderRadius: "10px 10px 0px 0px",
          background:
            "linear-gradient(39deg, rgba(31,52,97,1) 0%, rgba(217,221,230,1) 77%)",
        }}
      >
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          style={{
            background: "transparent",
          }}
          onClick={handleMenuClick}
        >
          <Menu.Item icon={<PlusCircleFilled />} key="1">
            Nuevo Ticket
          </Menu.Item>
          <Menu.Item key="2" icon={<OrderedListOutlined />}>
            Tickets
          </Menu.Item>
        </Menu>
      </Header>
      <Content
        style={{
          borderRadius: "0px 0px 10px 10px",
          background:
            "linear-gradient(39deg, rgba(222,222,222,1) 0%, rgba(217,221,230,1) 77%)",
        }}
      >
        {selectedMenu === "1" ? (
          <Flex
            gap="large"
            align="top"
            style={{
              minHeight: "72vh",
              padding: "10px",
            }}
            justify="space-evenly"
          >
            <Card
              hoverable
              style={{ width: "400px" }}
              title="Crear Ticket"
              extra="soporte@smarthydro.cl"
            >
              <Alert
                description="Nuestro equipo evaluara su caso en menos de 24 horas para planificar una solución."
                type="warning"
                closable
                style={{ marginBottom: "10px", padding: "10px" }}
                showIcon
              />
              <FormSupport update={update} setUpdate={setUpdate} />
            </Card>
            <Card
              title="Tickets"
              size="small"
              style={{ width: "80%" }}
              extra={<Tag color="#1f3461">activos</Tag>}
            >
              <ActiveTickets data={ticketsActives} />
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
            >
              <TableSupport data={tickets} />
            </Card>
          </Flex>
        )}
      </Content>
      <Footer
        style={{
          textAlign: "center",
          backgroundColor: "white",
          borderRadius: "0px 0px 10px 10px",
        }}
      >
        Canal Oficial de soporte 2024 - Ikolu / Smart Hydro
      </Footer>
    </Layout>
  );
};

export default Dash;
