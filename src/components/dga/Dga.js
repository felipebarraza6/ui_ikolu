import React, { useEffect, useContext } from "react";
import { Flex } from "antd";
import QueueAnim from "rc-queue-anim";
import Registers from "./Registers";
import { AppContext } from "../../App";
import CodeQR from "./CodeQR";

const Dga = () => {
  const { state } = useContext(AppContext);

  const dataDga = state.selected_profile.modules.m2;
  const profileDga = state.selected_profile.dga;
  useEffect(() => {}, []);

  return (
    <QueueAnim delay={300} type={["top", "left"]}>
      <div key={"dga"}>
        <Flex align="top" justify="space-between">
          <Flex style={{ width: "100%" }}>
            <Registers dataDga={dataDga} />
          </Flex>
          <Flex
            style={{
              width: "40%",
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
