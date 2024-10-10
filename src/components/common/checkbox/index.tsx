import React from 'react';
import { CheckboxGroup, Label, StyledCheckbox, ErrorMessage } from './Styled';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, error, ...props }) => {
  return (
    <CheckboxGroup>
      <Label>
        <StyledCheckbox type="checkbox" {...props} />
        {label}
      </Label>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </CheckboxGroup>
  );
};

export default Checkbox;
