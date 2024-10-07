import styled from 'styled-components';

export const LogsContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 5px;
  padding: 15px;
  margin-top: 15px;
`;

export const LogsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  margin-bottom: 10px;
`;

export const LogsOutput = styled.pre`
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  font-family: monospace;
  height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
`;
