import styled from "@emotion/styled";
import { animations } from "../../../styles/animations";

const SkeletonBase = styled.div`
  ${animations.shimmer}
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.borderLight} 25%,
    ${({ theme }) => theme.colors.backgroundLight} 37%,
    ${({ theme }) => theme.colors.borderLight} 63%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: ${({ theme }) => theme.radii.default};
`;

export const SkeletonChat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

export const SkeletonChatBubble = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  ${animations.fadeInUp}
  animation: fadeInUp 0.3s ease-out, skeletonPulse 1.5s ease-in-out infinite;

  &.user {
    flex-direction: row-reverse;
  }
`;

export const SkeletonAvatar = styled(SkeletonBase)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const SkeletonBubbleContent = styled(SkeletonBase)`
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 70%;

  .line {
    height: 12px;
    margin-bottom: 8px;
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    &:nth-of-type(1) {
      width: 100%;
    }

    &:nth-of-type(2) {
      width: 85%;
    }

    &:nth-of-type(3) {
      width: 60%;
    }
  }
`;

export const SkeletonKpi = styled(SkeletonBase)`
  height: 120px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const SkeletonKpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const SkeletonTable = styled(SkeletonBase)`
  padding: 16px;
  height: 300px;
`;

export const SkeletonTableRow = styled(SkeletonBase)`
  height: 40px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SkeletonDocument = styled(SkeletonBase)`
  height: 80px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SkeletonFlow = styled(SkeletonBase)`
  padding: 20px;
  height: 200px;
`;

export const SkeletonValidation = styled(SkeletonBase)`
  height: 160px;
  padding: 20px;
`;

export const SkeletonInput = styled(SkeletonBase)`
  height: 48px;
  border-radius: 24px;
`;

export const SkeletonSidebar = styled(SkeletonBase)`
  height: 100%;
  padding: 16px;
`;

export const SkeletonSidebarItem = styled(SkeletonBase)`
  height: 40px;
  margin-bottom: 8px;
  border-radius: 8px;
`;
