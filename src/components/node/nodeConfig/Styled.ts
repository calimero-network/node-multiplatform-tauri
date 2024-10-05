import styled from 'styled-components';

export const NodeConfigContainer = styled.div`
  background-color: rgb(23, 25, 27);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
`;

export const NodeConfigTitle = styled.h2`
  color: rgb(107, 114, 128);
  margin-bottom: 1rem;
`;

export const NodeConfigButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

export const ErrorText = styled.p`
  color: red;
  margin-top: 0.5rem;
`;

export const SuccessText = styled.p`
  color: green;
  margin-top: 0.5rem;
`;
