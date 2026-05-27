import React from "react";
import { useResponsive } from "../../hooks/useResponsive";
import "../../styles/mobile.css";

const MobileFullscreenFix = ({ children, ...props }) => {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return children;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "auto",
        zIndex: 1000,
        background: "#fff",
        marginLeft: "0 !important",
        paddingLeft: "0 !important",
        transform: "translateX(0) !important",
      }}
      {...props}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: 0,
          margin: 0,
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const withFullscreenMobile = (Component, displayName) => {
  const FullscreenComponent = (props) => (
    <MobileFullscreenFix>
      <Component {...props} />
    </MobileFullscreenFix>
  );

  FullscreenComponent.displayName =
    displayName ||
    `FullscreenMobile(${Component.displayName || Component.name})`;

  return FullscreenComponent;
};

export const FixPageLayout = ({ children }) => {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return children;
  }

  return <MobileFullscreenFix>{children}</MobileFullscreenFix>;
};

export const FixSidebarProblem = ({ children }) => {
  const { isMobile } = useResponsive();

  React.useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "relative";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.documentElement.style.overflow = "";
      };
    }
  }, [isMobile]);

  if (!isMobile) {
    return children;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        background: "#f0f2f5",
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
};

export default MobileFullscreenFix;
