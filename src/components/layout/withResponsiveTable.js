import React from "react";
import { Table } from "antd";
import { useResponsive } from "../../hooks/useResponsive";
import MobileOptimizedTable from "./MobileOptimizedTable";

/**
 * HOC que mejora automáticamente las tablas para móvil
 * Usa MobileOptimizedTable en móvil, Table normal en desktop
 */
const withResponsiveTable = (OriginalComponent) => {
  const ResponsiveTableComponent = (props) => {
    const { isMobile } = useResponsive();

    // Interceptar props de Table y mejorarlas para móvil
    const enhanceTableProps = (children) => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Table) {
          // En móvil, usar nuestra tabla optimizada
          if (isMobile) {
            return (
              <MobileOptimizedTable
                {...child.props}
                scroll={{ x: 350, y: 300 }}
                pagination={{
                  ...child.props.pagination,
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                  simple: true,
                }}
              />
            );
          }

          // En desktop, mejorar props existentes
          return React.cloneElement(child, {
            ...child.props,
            scroll: { x: true, ...child.props.scroll },
            size: "small",
          });
        }

        // Recursivamente procesar children anidados
        if (React.isValidElement(child) && child.props.children) {
          return React.cloneElement(child, {
            ...child.props,
            children: enhanceTableProps(child.props.children),
          });
        }

        return child;
      });
    };

    // Renderizar el componente original con tablas mejoradas
    return (
      <OriginalComponent
        {...props}
        children={enhanceTableProps(props.children)}
      />
    );
  };

  ResponsiveTableComponent.displayName = `withResponsiveTable(${
    OriginalComponent.displayName || OriginalComponent.name || "Component"
  })`;

  return ResponsiveTableComponent;
};

export default withResponsiveTable;
