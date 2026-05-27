import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { SkeletonValidation } from "../common/skeletons";

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

const ScoreContainer = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.3s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
`;

const ScoreCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    ${({ score, theme }) => {
      if (score >= 0.8) return theme.colors.success;
      if (score >= 0.6) return theme.colors.warning;
      return theme.colors.error;
    }}
    ${({ score }) => score * 360}deg,
    #f0f0f0 0deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  position: relative;
`;

const ScoreInner = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: ${({ score, theme }) => {
    if (score >= 0.8) return theme.colors.success;
    if (score >= 0.6) return theme.colors.warning;
    return theme.colors.error;
  }};
`;

const ScoreLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.greyText};
  margin-bottom: 8px;
`;

const ModuleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ModuleCard = styled.div`
  ${animations.slideInLeft}
  animation: slideInLeft 0.2s ease-out;
  animation-delay: ${({ delay }) => delay || "0s"};
  animation-fill-mode: both;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  padding: 20px;
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ModuleName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0;
`;

const ModuleStatus = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 500;
  background: ${({ status, theme }) => {
    if (status === "ok") return "#e8f5e9";
    if (status === "warning") return "#fff3e0";
    return theme.colors.redBg;
  }};
  color: ${({ status, theme }) => {
    if (status === "ok") return theme.colors.greenText;
    if (status === "warning") return theme.colors.warning;
    return theme.colors.error;
  }};
`;

const ModuleScore = styled.div`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: 600;
  color: ${({ score, theme }) => {
    if (score >= 0.8) return theme.colors.success;
    if (score >= 0.6) return theme.colors.warning;
    return theme.colors.error;
  }};
  margin-bottom: 8px;
`;

const ModuleIssues = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.greyText};
`;

const RecommendationsContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  background: ${({ theme }) => theme.colors.blueBg};
  border: 1px solid ${({ theme }) => theme.colors.blueTint};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  padding: 20px;
`;

const RecommendationsTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin: 0 0 12px;
`;

const RecommendationItem = styled.li`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.token.colorText};
  margin-bottom: 8px;
  line-height: 1.5;
`;

const WaterIKValidationPanel = ({ validation, isLoading }) => {
  if (isLoading) {
    return (
      <PanelContainer>
        <PanelTitle>
          <span>✅</span>
          <span>Validación de Módulos</span>
        </PanelTitle>
        <SkeletonValidation />
      </PanelContainer>
    );
  }

  if (!validation) {
    return (
      <PanelContainer>
        <PanelTitle>
          <span>✅</span>
          <span>Validación de Módulos</span>
        </PanelTitle>
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3>Sin validación disponible</h3>
          <p>La validación se ejecuta automáticamente una vez al día.</p>
        </div>
      </PanelContainer>
    );
  }

  const modules = validation.modules || {};

  return (
    <PanelContainer>
      <PanelTitle>
        <span>✅</span>
        <span>Validación de Módulos</span>
      </PanelTitle>

      <ScoreContainer>
        <ScoreCircle score={validation.score}>
          <ScoreInner score={validation.score}>
            {Math.round(validation.score * 100)}%
          </ScoreInner>
        </ScoreCircle>
        <ScoreLabel>Score General de Validación</ScoreLabel>
        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
          Última validación: {new Date(validation.date).toLocaleDateString("es-CL")}
        </div>
      </ScoreContainer>

      <ModuleGrid>
        {Object.entries(modules).map(([key, mod], i) => (
          <ModuleCard key={key} delay={`${i * 0.1}s`}>
            <ModuleHeader>
              <ModuleName>{key.charAt(0).toUpperCase() + key.slice(1)}</ModuleName>
              <ModuleStatus status={mod.status}>
                {mod.status === "ok" ? "OK" : mod.status === "warning" ? "Advertencia" : "Error"}
              </ModuleStatus>
            </ModuleHeader>
            <ModuleScore score={mod.score}>{Math.round(mod.score * 100)}%</ModuleScore>
            {mod.issues && mod.issues.length > 0 && (
              <ModuleIssues>
                {mod.issues.map((issue, j) => (
                  <li key={j}>{issue}</li>
                ))}
              </ModuleIssues>
            )}
          </ModuleCard>
        ))}
      </ModuleGrid>

      {validation.recommendations && validation.recommendations.length > 0 && (
        <RecommendationsContainer>
          <RecommendationsTitle>💡 Recomendaciones</RecommendationsTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validation.recommendations.map((rec, i) => (
              <RecommendationItem key={i}>{rec}</RecommendationItem>
            ))}
          </ul>
        </RecommendationsContainer>
      )}
    </PanelContainer>
  );
};

export default WaterIKValidationPanel;
