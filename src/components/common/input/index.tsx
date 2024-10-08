import React from 'react';
import { InputGroup, Label, StyledInput, ErrorMessage } from './Styled';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <InputGroup>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <StyledInput $hasError={!!error} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputGroup>
  );
};

export default Input;
