import React, { useEffect } from "react";
import { Flex } from "antd";
import QueueAnim from "rc-queue-anim";
import Registers from "./Registers";
import { useUserProfilesContext } from "../../contexts/UserProfilesContext";
import CodeQR from "./CodeQR";

const Dga = () => {
  const { selectedProfile } = useUserProfilesContext();

  // useEffect DEBE ir ANTES de cualquier return condicional
  useEffect(() => {
    // Aquí puedes agregar lógica si es necesaria
  }, []);

  // Verificar que el perfil tenga los datos necesarios
  if (!selectedProfile) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div>Cargando perfil...</div>
      </div>
    );
  }

  const dataDga = selectedProfile.modules?.m2 || {};
  const profileDga = selectedProfile.dga || {};

  return (
    <QueueAnim delay={300} type={["top", "left"]}>
      <div key={"dga"}>
        <Flex align="top" justify="space-between">
          <Flex style={{ width: "100%" }}>
            <Registers dataDga={dataDga} />
          </Flex>
          <Flex
            style={{
              width: "30%",
              backgroundColor: "rgb(0, 111, 179)",
              borderRadius: "0px 10px 10px 0px",
            }}
          >
            <CodeQR dataProfile={profileDga} />
          </Flex>
        </Flex>
      </div>
    </QueueAnim>
  );
};

export default Dga;
