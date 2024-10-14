import React from 'react';
import { InputContainer, StyledInput, Label } from './Styled';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  noMargin?: boolean;
  showingCharCount?: boolean;
}

const Input: React.FC<InputProps> = ({ label, noMargin, showingCharCount, ...props }) => {
  return (
    <InputContainer noMargin={noMargin} showingCharCount={showingCharCount}>
      <Label>{label}</Label>
      <StyledInput $noMargin={noMargin} $showingCharCount={showingCharCount} {...props} />
    </InputContainer>
  );
};

export default Input;
