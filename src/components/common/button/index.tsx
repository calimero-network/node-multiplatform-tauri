import React from 'react';
import { StyledButton } from './Styled';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'start' | 'stop' | 'configure' | 'delete' | 'logs' | 'controls';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'start',
  ...props
}) => {
  return (
    <StyledButton variant={variant} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;
