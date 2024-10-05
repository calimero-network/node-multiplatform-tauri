import React from 'react';
import Button from '../button';
import styled from 'styled-components';
import PopupWrapper from '../popup';

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

const MessagePopup: React.FC<MessagePopupProps> = ({ ...props }) => {
  return (
    <PopupWrapper isOpen={props.isOpen} onClose={props.onClose}>
      <MessageContent>
        <MessageTitle>{props.title}</MessageTitle>
        <MessageText>{props.message}</MessageText>
        <MessagePopupButtons>
          <Button
            onClick={props.onClose}
            variant={props.type === 'error' ? 'stop' : 'start'}
          >
            OK
          </Button>
        </MessagePopupButtons>
      </MessageContent>
    </PopupWrapper>
  );
};

export default MessagePopup;
