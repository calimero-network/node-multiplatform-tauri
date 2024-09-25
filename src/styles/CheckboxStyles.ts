import styled from 'styled-components';

export const CheckboxGroup = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #FFFFFF;
  cursor: pointer;
`;

export const StyledCheckbox = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-right: 8px;
  background-color: rgb(18, 18, 18);
  cursor: pointer;

  &:checked {
    background-color: #3498db;
    border-color: #3498db;
    position: relative;
    
    &:after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #FFFFFF;
      font-size: 14px;
    }
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
  }
`;

export const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 0.25rem;
`;
