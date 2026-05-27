import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { SkeletonValidation } from "../common/skeletons";
import { CheckCircleOutlined } from "@ant-design/icons";

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

const ScoreContainer = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.3s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
`;

const ScoreCircle = styled.div`
  width: 80px;
  height: 80px;
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
  margin: 0 auto 12px;
`;

const ScoreInner = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: ${({ score, theme }) => {
    if (score >= 0.8) return theme.colors.success;
    if (score >= 0.6) return theme.colors.warning;
    return theme.colors.error;
  }};
`;

const ScoreLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.greyText};
  margin-bottom: 6px;
`;

const ModuleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const ModuleCard = styled.div`
  ${animations.slideInLeft}
  animation: slideInLeft 0.2s ease-out;
  animation-delay: ${({ delay }) => delay || "0s"};
  animation-fill-mode: both;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 14px;
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ModuleName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0;
  font-weight: 500;
`;

const ModuleStatus = styled.span`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
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
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 600;
  color: ${({ score, theme }) => {
    if (score >= 0.8) return theme.colors.success;
    if (score >= 0.6) return theme.colors.warning;
    return theme.colors.error;
  }};
  margin-bottom: 6px;
`;

const ModuleIssues = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.greyText};
`;

const RecommendationsContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  background: ${({ theme }) => theme.colors.blueBg};
  border: 1px solid ${({ theme }) => theme.colors.blueTint};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 14px;
`;

const RecommendationsTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.corporateBlue};
  margin: 0 0 8px;
  font-weight: 500;
`;

const RecommendationItem = styled.li`
  font-size: 12px;
  color: ${({ theme }) => theme.token.colorText};
  margin-bottom: 6px;
  line-height: 1.4;
`;

const WaterIKValidationPanel = ({ validation, isLoading }) => {
  if (isLoading) {
    return (
      <PanelContainer>
        <PanelTitle>
          <CheckCircleOutlined />
          <span>Validación</span>
        </PanelTitle>
        <SkeletonValidation />
      </PanelContainer>
    );
  }

  if (!validation) {
    return (
      <PanelContainer>
        <PanelTitle>
          <CheckCircleOutlined />
          <span>Validación</span>
        </PanelTitle>
        <div style={{ textAlign: "center", padding: 40, color: "#8c8c8c" }}>
          <div style={{ fontSize: 36, marginBottom: 12, color: "#d9d9d9" }}><CheckCircleOutlined /></div>
          <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 500 }}>Sin validación</h3>
          <p style={{ margin: 0, fontSize: 12 }}>Se ejecuta automáticamente una vez al día.</p>
        </div>
      </PanelContainer>
    );
  }

  const modules = validation.modules || {};

  return (
    <PanelContainer>
      <PanelTitle>
        <CheckCircleOutlined />
        <span>Validación</span>
      </PanelTitle>

      <ScoreContainer>
        <ScoreCircle score={validation.score}>
          <ScoreInner score={validation.score}>
            {Math.round(validation.score * 100)}%
          </ScoreInner>
        </ScoreCircle>
        <ScoreLabel>Score General</ScoreLabel>
        <div style={{ fontSize: 10, color: "#8c8c8c" }}>
          {new Date(validation.date).toLocaleDateString("es-CL")}
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
          <RecommendationsTitle>Recomendaciones</RecommendationsTitle>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
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
