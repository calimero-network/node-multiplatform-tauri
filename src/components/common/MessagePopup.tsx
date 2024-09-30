import React from 'react';
import PopupWrapper from './PopupWrapper';
import Button from './Button';
import styled from 'styled-components';

interface MessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title: string;
  type?: 'info' | 'warning' | 'error';
}

const MessageContent = styled.div`
  text-align: center;
`;

const MessageTitle = styled.h2`
  margin-bottom: 1rem;
`;

const MessageText = styled.p`
  margin-bottom: 1rem;
`;

const MessagePopupButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const MessagePopup: React.FC<MessagePopupProps> = ({ isOpen, onClose, message, title, type = 'info' }) => {
  return (
    <PopupWrapper isOpen={isOpen} onClose={onClose}>
      <MessageContent>
        <MessageTitle>{title}</MessageTitle>
        <MessageText>{message}</MessageText>
        <MessagePopupButtons>
          <Button onClick={onClose} variant={type === 'error' ? 'stop' : 'start'}>
            OK
          </Button>
        </MessagePopupButtons>
      </MessageContent>
    </PopupWrapper>
  );
};

export default MessagePopup;
