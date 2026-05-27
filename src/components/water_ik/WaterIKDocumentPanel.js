import React from "react";
import styled from "@emotion/styled";
import { animations } from "../../styles/animations";
import { SkeletonDocument } from "../common/skeletons";
import { BarChartOutlined, FileTextOutlined, FileProtectOutlined, FileOutlined } from "@ant-design/icons";

const PanelContainer = styled.div`
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out;
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
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

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
`;

const DocumentCard = styled.div`
  ${animations.scaleIn}
  animation: scaleIn 0.2s ease-out;
  background: ${({ theme }) => theme.token.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.token.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.token.borderRadius};
  padding: 14px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
`;

const DocumentIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ type, theme }) => {
    if (type === "report") return theme.colors.blueTint;
    if (type === "certificate") return "#e8f5e9";
    return theme.colors.backgroundLight;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${({ type, theme }) => {
    if (type === "report") return theme.colors.corporateBlue;
    if (type === "certificate") return theme.colors.greenText;
    return theme.colors.greyText;
  }};
  margin-bottom: 10px;
`;

const DocumentTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.token.colorText};
  margin: 0 0 6px;
  font-weight: 500;
`;

const DocumentMeta = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.greyText};
  margin-bottom: 10px;
`;

const DocumentStatus = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
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
  margin-top: 10px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: ${({ theme }) => theme.colors.greyText};
`;

const EmptyIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.greyTextLight};
`;

const WaterIKDocumentPanel = ({ documents, isLoading, onGenerateDocument }) => {
  const getIcon = (type) => {
    if (type === "report") return <BarChartOutlined />;
    if (type === "certificate") return <FileProtectOutlined />;
    if (type === "presentation") return <FileTextOutlined />;
    return <FileOutlined />;
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
        <FileTextOutlined />
        <span>Documentos</span>
      </PanelTitle>

      {isLoading ? (
        <DocumentGrid>
          {[1, 2, 3].map((i) => (
            <SkeletonDocument key={i} />
          ))}
        </DocumentGrid>
      ) : documents.length === 0 ? (
        <EmptyState>
          <EmptyIcon><FileOutlined /></EmptyIcon>
          <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 500 }}>Sin documentos</h3>
          <p style={{ margin: 0, fontSize: 12 }}>Pide un informe o certificado desde el chat.</p>
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
