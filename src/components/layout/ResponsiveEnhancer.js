import React from "react";
import { Button, Table, Form } from "antd";
import { useResponsive } from "../../hooks/useResponsive";
import MobileOptimizedTable from "./MobileOptimizedTable";

const ResponsiveEnhancer = ({ children, enabled = true }) => {
  const { isMobile } = useResponsive();

  if (!enabled) {
    return children;
  }

  const enhanceComponent = (element) => {
    if (!React.isValidElement(element)) {
      return element;
    }

    if (element.type === Table && isMobile) {
      return (
        <MobileOptimizedTable
          {...element.props}
          size="small"
          scroll={{ x: 350, y: 300 }}
          pagination={{
            ...element.props.pagination,
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            simple: true,
          }}
        />
      );
    }

    if (element.type === Form && isMobile) {
      return React.cloneElement(element, {
        ...element.props,
        layout: "vertical",
        size: "large",
        scrollToFirstError: true,
      });
    }

    if (element.type === Button && isMobile) {
      return React.cloneElement(element, {
        ...element.props,
        size: "large",
        style: {
          height: 44,
          borderRadius: 8,
          ...element.props.style,
        },
      });
    }

    if (element.props && element.props.children) {
      const enhancedChildren = React.Children.map(
        element.props.children,
        enhanceComponent
      );

      return React.cloneElement(element, {
        ...element.props,
        children: enhancedChildren,
      });
    }

    return element;
  };

  return (
    <div
      style={{
        ...(isMobile && {
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
          zIndex: 1,
        }),
        ...(!isMobile && {
          width: "100%",
          minHeight: "100vh",
        }),
        background: isMobile ? "#f0f2f5" : undefined,
      }}
    >
      <div
        style={{
          padding: isMobile ? "0" : "16px",
          maxWidth: "100%",
          margin: "0 auto",
          width: "100%",
          minHeight: isMobile ? "100vh" : "auto",
        }}
      >
        {React.Children.map(children, enhanceComponent)}
      </div>
    </div>
  );
};

export default ResponsiveEnhancer;
