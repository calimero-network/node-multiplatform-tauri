import styled from 'styled-components';

export const ControlsContainer = styled.div`
  // Styles for the container
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

export const TerminalContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
`;

export const TerminalOutput = styled.pre`
  color: #ffffff;
  font-family: monospace;
  flex-grow: 1;
  overflow-y: auto;
  margin: 0;
  padding: 5px;
  font-size: 12px;
  max-height: 500px;
`;

export const TerminalForm = styled.form`
  margin-top: 1rem;
`;

export const TerminalInput = styled.input`
  background-color: #2d2d2d;
  color: #ffffff;
  border: none;
  padding: 10px;
  font-family: monospace;
  width: 100%;
`;

export const TerminalButton = styled.button`
  background-color: #2d2d2d;
  color: #ffffff;
  border: none;
  padding: 10px;
  font-family: monospace;
  width: 100%;
`;
