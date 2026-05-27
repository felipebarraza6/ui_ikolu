import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { SkeletonFlow } from "../common/skeletons";
import { ExperimentOutlined, CheckOutlined, LoadingOutlined, MinusOutlined } from "@ant-design/icons";

const PanelContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const PanelTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
`;

const FlowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

const FlowCard = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.2s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.corporateBlue};
  }
`;

const FlowIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  margin-bottom: 10px;
`;

const FlowTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0 0 6px;
  font-weight: 500;
`;

const FlowDescription = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.greyText};
  margin: 0 0 12px;
  line-height: 1.4;
`;

const FlowSteps = styled.div`
  display: flex;
  gap: 3px;
  margin-bottom: 10px;
`;

const FlowStep = styled.div`
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: ${({ completed, theme }) =>
    completed ? theme.colors.corporateBlue : theme.token.colorBorderSecondary};
`;

const RunButton = styled.button`
  padding: 6px 12px;
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.small};
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(31, 52, 97, 0.25);
  }
`;

const FlowRunContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 16px;
  margin-bottom: 16px;
`;

const FlowRunHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const FlowRunStatus = styled.span`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  background: ${({ status, theme }) => {
    if (status === "completed") return "#e8f5e9";
    if (status === "running") return theme.colors.blueBg;
    return theme.colors.redBg;
  }};
  color: ${({ status, theme }) => {
    if (status === "completed") return theme.colors.greenText;
    if (status === "running") return theme.colors.corporateBlue;
    return theme.colors.error;
  }};
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};

  &:last-child {
    border-bottom: none;
  }
`;

const StepIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: ${({ status, theme }) => {
    if (status === "completed") return "#e8f5e9";
    if (status === "running") return theme.colors.blueBg;
    return theme.token.colorBgLayout;
  }};
  color: ${({ status, theme }) => {
    if (status === "completed") return theme.colors.greenText;
    if (status === "running") return theme.colors.corporateBlue;
    return theme.colors.greyText;
  }};
`;

const StepName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.token.colorText};
`;

const mockFlows = [
  {
    id: "audit_extraction",
    title: "Auditoría de Extracción Sustentable",
    description: "Analiza si tu extracción está dentro de los límites sustentables.",
    steps: ["Recopilar datos", "Comparar límites DGA", "Evaluar caudal", "Generar informe"],
  },
  {
    id: "trend_analysis",
    title: "Análisis de Tendencias de Nivel Freático",
    description: "Identifica patrones y tendencias en los niveles freáticos.",
    steps: ["Cargar datos", "Calcular tendencias", "Identificar anomalías", "Generar gráfico"],
  },
  {
    id: "dga_validation",
    title: "Validación Normativa DGA",
    description: "Verifica el cumplimiento según normativa vigente.",
    steps: ["Revisar registros", "Validar frecuencias", "Verificar formatos", "Certificado"],
  },
  {
    id: "consumption_report",
    title: "Reporte de Consumo Mensual",
    description: "Informe detallado de consumo con comparativas.",
    steps: ["Recopilar consumo", "Comparar período", "Calcular KPIs", "Generar PDF"],
  },
];

const WaterIKFlowPanel = ({ flows, activeFlowRun, onRunFlow, isLoading }) => {
  const availableFlows = flows.length > 0 ? flows : mockFlows;

  if (activeFlowRun) {
    return (
      <PanelContainer>
        <PanelTitle>
          <ExperimentOutlined />
          <span>Ejecutando Flujo</span>
        </PanelTitle>

        <FlowRunContainer>
          <FlowRunHeader>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{activeFlowRun.flowId}</h3>
            <FlowRunStatus status={activeFlowRun.status}>
              {activeFlowRun.status === "completed" ? "Completado" : activeFlowRun.status === "running" ? "En ejecución..." : "Error"}
            </FlowRunStatus>
          </FlowRunHeader>

          {activeFlowRun.steps.map((step, i) => (
            <StepItem key={i}>
              <StepIcon status={step.status}>
                {step.status === "completed" ? <CheckOutlined /> : step.status === "running" ? <LoadingOutlined /> : <MinusOutlined />}
              </StepIcon>
              <StepName>{step.name}</StepName>
            </StepItem>
          ))}

          {activeFlowRun.status === "completed" && activeFlowRun.results && (
            <div style={{ marginTop: 14, padding: 12, background: "#f0f5ff", borderRadius: 8 }}>
              <h4 style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "#1F3461" }}>Resultados</h4>
              <p style={{ margin: "0 0 6px", fontSize: 12 }}>{activeFlowRun.results.summary}</p>
              {activeFlowRun.results.findings && (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {activeFlowRun.results.findings.map((f, i) => (
                    <li key={i} style={{ fontSize: 12 }}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </FlowRunContainer>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <PanelTitle>
        <ExperimentOutlined />
        <span>Flujos de Investigación</span>
      </PanelTitle>

      {isLoading ? (
        <FlowGrid>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonFlow key={i} />
          ))}
        </FlowGrid>
      ) : (
        <FlowGrid>
          {availableFlows.map((flow) => (
            <FlowCard key={flow.id} onClick={() => onRunFlow(flow.id)}>
              <FlowIcon><ExperimentOutlined /></FlowIcon>
              <FlowTitle>{flow.title}</FlowTitle>
              <FlowDescription>{flow.description}</FlowDescription>
              <FlowSteps>
                {(flow.steps || []).map((_, i) => (
                  <FlowStep key={i} completed={false} />
                ))}
              </FlowSteps>
              <RunButton>Ejecutar</RunButton>
            </FlowCard>
          ))}
        </FlowGrid>
      )}
    </PanelContainer>
  );
};

export default WaterIKFlowPanel;
