import styled from 'styled-components';

export const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PopupContent = styled.div`
  background-color: rgb(28, 28, 28);
  padding: 2rem;
  border-radius: 8px;
  width: 300px;

  h2 {
    margin-bottom: 1rem;
    margin-top: 0;
  }
`;

export const PopupButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

export const SuccessMessage = styled.p`
  color: green;
  font-weight: bold;
  margin-top: 10px;
`;

export const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  margin-top: 10px;
`;

export const CharacterCount = styled.small<{ warning: boolean }>`
  display: block;
  color: ${(props) => (props.warning ? 'orange' : 'inherit')};
  font-style: italic;
  margin-bottom: 1rem;
`;
