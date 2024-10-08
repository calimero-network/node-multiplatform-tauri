import styled from 'styled-components';

export const MessageContent = styled.div`
  text-align: center;
`;

export const MessageTitle = styled.h2`
  margin-bottom: 1rem;
`;

export const MessageText = styled.p`
  margin-bottom: 1rem;
`;

export const MessagePopupButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  gap: 1rem;
`;

export const ButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  &:only-child {
    flex: 0 1 auto;
  }
`;
