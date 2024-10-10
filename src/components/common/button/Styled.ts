import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'warning';
}

const buttonVariants = {
  primary: css`
    background-color: #6b7280;
    &:hover {
      background-color: #858c99;
    }
  `,
  warning: css`
    background-color: #e11e5c;
    &:hover {
      background-color: #c0392b;
    }
  `,
  secondary: css`
    background-color: rgb(76, 250, 252);
    color: black;
    &:hover {
      background-color: #2980b9;
    }
  `,
};

export const StyledButton = styled.button<{ variant: ButtonProps['variant'] }>`
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: normal;
  font-size: 14px;
  line-height: 40px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0 12px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    width: 100%;
    margin-bottom: 5px;
  }

  ${({ variant }) => variant && buttonVariants[variant]}
`;
