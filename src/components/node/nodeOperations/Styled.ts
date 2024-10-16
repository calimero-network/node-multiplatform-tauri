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

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
`;

export const Tab = styled.div<{ active: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  // border: 1px solid #ccc;
  border-bottom: none;
  background-color: ${props => props.active ? '#000000' : '#2c2c2c'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  border-radius: 5px 5px 0 0;
  margin-right: 5px;

  &:hover {
    background-color: #000000;
  }
`;