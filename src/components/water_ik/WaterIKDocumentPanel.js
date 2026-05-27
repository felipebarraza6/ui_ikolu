import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { SkeletonDocument } from "../common/skeletons";

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

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const DocumentCard = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.2s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadiusLG};
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const DocumentIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ type, theme }) => {
    if (type === "report") return theme.colors.blueTint;
    if (type === "certificate") return "#e8f5e9";
    return theme.colors.backgroundLight;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 12px;
`;

const DocumentTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0 0 8px;
`;

const DocumentMeta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.greyText};
  margin-bottom: 12px;
`;

const DocumentStatus = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 500;
  background: ${({ status, theme }) => {
    if (status === "ready") return "#e8f5e9";
    if (status === "generating") return theme.colors.blueBg;
    return theme.colors.redBg;
  }};
  color: ${({ status, theme }) => {
    if (status === "ready") return theme.colors.greenText;
    if (status === "generating") return theme.colors.corporateBlue;
    return theme.colors.error;
  }};
`;

const DownloadButton = styled.button`
  margin-top: 12px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.greyText};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const WaterIKDocumentPanel = ({ documents, isLoading, onGenerateDocument }) => {
  const getIcon = (type) => {
    if (type === "report") return "📊";
    if (type === "certificate") return "📜";
    if (type === "presentation") return "📑";
    return "📄";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <PanelContainer>
      <PanelTitle>
        <span>📄</span>
        <span>Documentos Generados</span>
      </PanelTitle>

      {isLoading ? (
        <DocumentGrid>
          {[1, 2, 3].map((i) => (
            <SkeletonDocument key={i} />
          ))}
        </DocumentGrid>
      ) : documents.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📄</EmptyIcon>
          <h3>Sin documentos aún</h3>
          <p>Pide un informe o certificado desde el chat para generarlo.</p>
        </EmptyState>
      ) : (
        <DocumentGrid>
          {documents.map((doc) => (
            <DocumentCard key={doc.id}>
              <DocumentIcon type={doc.type}>{getIcon(doc.type)}</DocumentIcon>
              <DocumentTitle>{doc.title}</DocumentTitle>
              <DocumentMeta>{formatDate(doc.createdAt)}</DocumentMeta>
              <DocumentStatus status={doc.status}>
                {doc.status === "ready" ? "Listo" : doc.status === "generating" ? "Generando..." : "Error"}
              </DocumentStatus>
              {doc.status === "ready" && (
                <DownloadButton>Descargar</DownloadButton>
              )}
            </DocumentCard>
          ))}
        </DocumentGrid>
      )}
    </PanelContainer>
  );
};

export default WaterIKDocumentPanel;
