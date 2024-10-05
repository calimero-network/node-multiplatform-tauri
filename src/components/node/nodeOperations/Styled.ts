import styled from 'styled-components';

export const OperationsContainer = styled.div`
  padding: 20px;
  background-color: #2c2c2c;
  border-radius: 8px;
`;

export const NodeTitle = styled.h2`
  color: #ffffff;
  margin-bottom: 20px;
`;

export const NodeActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const MainContent = styled.div`
  display: block;
`;
