import styled from 'styled-components';

export const NodeListContainer = styled.div`
  margin-bottom: 1rem;
`;

export const NodeListTitle = styled.h2`
  color: #ecf0f1;
  margin-bottom: 1rem;
`;

export const NodeListUl = styled.ul`
  list-style-type: none;
  padding: 0;
`;

interface NodeListItemProps {
  selected?: boolean;
}

export const NodeListItem = styled.li<NodeListItemProps>`
  cursor: pointer;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: ${(props) => (props.selected ? '#3498db' : '#2c3e50')};
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3498db;
  }
`;

export const Notice = styled.p`
  color: #bdc3c7;
  font-style: italic;
`;

export const StatusIcon = styled.span<{ $isRunning: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${(props) => (props.$isRunning ? '#4CAF50' : '#F44336')};
`;
