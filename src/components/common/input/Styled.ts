import styled, { css } from 'styled-components';

export const InputGroup = styled.div`
  width: 100%;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #ffffff;
`;

interface InputProps {
  error?: boolean;
}

export const StyledInput = styled.input<InputProps>`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  line-height: 40px;
  color: #ffffff;
  background-color: rgb(18, 18, 18);
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-sizing: border-box;
  margin-bottom: 0.5rem;

  &:focus {
    color: #2c3e50;
    background-color: #fff;
    border-color: #3498db;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
  }

  &::placeholder {
    color: #95a5a6;
    opacity: 1;
  }

  &:disabled,
  &[readonly] {
    background-color: #ecf0f1;
    opacity: 1;
  }

  ${(props) =>
    props.error &&
    css`
      border-color: #e74c3c;

      &:focus {
        box-shadow: 0 0 0 0.2rem rgba(231, 76, 60, 0.25);
      }
    `}
`;

export const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 0.25rem;
`;
