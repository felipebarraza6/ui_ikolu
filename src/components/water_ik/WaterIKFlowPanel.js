import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { SkeletonFlow } from "../common/skeletons";

const PanelContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const PanelTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FlowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const FlowCard = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.2s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.corporateBlue};
  }
`;

const FlowIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-bottom: 12px;
`;

const FlowTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0 0 8px;
`;

const FlowDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.greyText};
  margin: 0 0 16px;
  line-height: 1.5;
`;

const FlowSteps = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
`;

const FlowStep = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${({ completed, theme }) =>
    completed ? theme.colors.corporateBlue : theme.token.colorBorderSecondary};
`;

const RunButton = styled.button`
  padding: 8px 16px;
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.default};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(31, 52, 97, 0.3);
  }
`;

const FlowRunContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  padding: 24px;
  margin-bottom: 24px;
`;

const FlowRunHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FlowRunStatus = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: ${({ theme }) => theme.fontSizes.base};
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
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};

  &:last-child {
    border-bottom: none;
  }
`;

const StepIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
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
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.token.colorText};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.greyText};
`;

const mockFlows = [
  {
    id: "audit_extraction",
    title: "Auditoría de Extracción Sustentable",
    description: "Analiza si tu extracción está dentro de los límites sustentables según datos DGA y caudales ecológicos.",
    steps: ["Recopilar datos de extracción", "Comparar con límites DGA", "Evaluar caudal ecológico", "Generar informe"],
  },
  {
    id: "trend_analysis",
    title: "Análisis de Tendencias de Nivel Freático",
    description: "Identifica patrones y tendencias en los niveles freáticos de tus pozos a lo largo del tiempo.",
    steps: ["Cargar datos históricos", "Calcular tendencias", "Identificar anomalías", "Generar gráfico"],
  },
  {
    id: "dga_validation",
    title: "Validación Normativa DGA",
    description: "Verifica el cumplimiento de tus registros y mediciones según la normativa vigente de la DGA.",
    steps: ["Revisar registros DGA", "Validar frecuencias", "Verificar formatos", "Generar certificado"],
  },
  {
    id: "consumption_report",
    title: "Reporte de Consumo Mensual",
    description: "Genera un informe detallado de consumo hídrico con comparativas y recomendaciones.",
    steps: ["Recopilar consumo", "Comparar con período anterior", "Calcular indicadores", "Generar PDF"],
  },
];

const WaterIKFlowPanel = ({ flows, activeFlowRun, onRunFlow, isLoading }) => {
  const availableFlows = flows.length > 0 ? flows : mockFlows;

  if (activeFlowRun) {
    return (
      <PanelContainer>
        <PanelTitle>
          <span>🔬</span>
          <span>Ejecutando Flujo</span>
        </PanelTitle>

        <FlowRunContainer>
          <FlowRunHeader>
            <h3 style={{ margin: 0 }}>{activeFlowRun.flowId}</h3>
            <FlowRunStatus status={activeFlowRun.status}>
              {activeFlowRun.status === "completed" ? "Completado" : activeFlowRun.status === "running" ? "En ejecución..." : "Error"}
            </FlowRunStatus>
          </FlowRunHeader>

          {activeFlowRun.steps.map((step, i) => (
            <StepItem key={i}>
              <StepIcon status={step.status}>
                {step.status === "completed" ? "✓" : step.status === "running" ? "⟳" : "○"}
              </StepIcon>
              <StepName>{step.name}</StepName>
            </StepItem>
          ))}

          {activeFlowRun.status === "completed" && activeFlowRun.results && (
            <div style={{ marginTop: 20, padding: 16, background: "#f0f5ff", borderRadius: 8 }}>
              <h4 style={{ margin: "0 0 8px", color: "#1F3461" }}>Resultados</h4>
              <p style={{ margin: "0 0 8px", fontSize: 14 }}>{activeFlowRun.results.summary}</p>
              {activeFlowRun.results.findings && (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {activeFlowRun.results.findings.map((f, i) => (
                    <li key={i} style={{ fontSize: 14 }}>{f}</li>
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
        <span>🔬</span>
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
              <FlowIcon>🔬</FlowIcon>
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
