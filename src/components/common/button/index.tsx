import React from 'react';
import { StyledButton } from './Styled';

type ButtonVariant = 'start' | 'stop' | 'configure' | 'delete' | 'logs' | 'controls';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
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
