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
  background-color: #cbcfd2;
  border-radius: 4px;
  color: #000;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #4CA1FC;
    color: #FFF;
  }
`;

export const Notice = styled.p`
  color: #bdc3c7;
  font-style: italic;
`;

export const StatusIcon = styled.span<{ $isRunning: boolean; $isExternal: boolean }>`
  display: inline-block;
  width: 20px;
  height: 10px;
  margin-right: 8px;
  position: relative;

  &:before {
    content: '${(props) => {
      if (props.$isExternal) {
        return '⚠️';
      }
      return props.$isRunning ? '🟢' : '🔴';
    }}';
    position: absolute;
    top: -7px;
    left: 0;
  }
`;
