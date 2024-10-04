import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'start' | 'stop' | 'configure' | 'delete' | 'logs' | 'controls';
}

const buttonVariants = {
  start: css`
    background-color: #2ecc71;
    &:hover {
      background-color: #27ae60;
    }
  `,
  stop: css`
    background-color: #e74c3c;
    &:hover {
      background-color: #c0392b;
    }
  `,
  configure: css`
    background-color: #3498db;
    &:hover {
      background-color: #2980b9;
    }
  `,
  delete: css`
    background-color: #95a5a6;
    &:hover {
      background-color: #7f8c8d;
    }
  `,
  logs: css`
    background-color: #f39c12;
    &:hover {
      background-color: #d35400;
    }
  `,
  controls: css`
    background-color: #9b59b6; // Example color, adjust as needed
    &:hover {
      background-color: #8e44ad;
    }
  `,
};

export const StyledButton = styled.button<{ variant: ButtonProps['variant'] }>`
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  font-size: 14px;
  line-height: 40px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
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
