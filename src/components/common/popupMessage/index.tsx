import React from 'react';
import Button from '../button';
import PopupWrapper from '../popup';
import {
  MessageContent,
  MessagePopupButtons,
  MessageText,
  MessageTitle,
} from './Styled';

interface MessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title: string;
  type: MessageType;
}

export enum MessageType {
  INFO,
  WARNING,
  ERROR,
}

export type MessagePopupState = {
  isOpen: boolean;
  message: string;
  title: string;
  type: MessageType;
};

const MessagePopup: React.FC<MessagePopupProps> = ({ ...props }) => {
  return (
    <PopupWrapper isOpen={props.isOpen} onClose={props.onClose}>
      <MessageContent>
        <MessageTitle>{props.title}</MessageTitle>
        <MessageText>{props.message}</MessageText>
        <MessagePopupButtons>
          <Button
            onClick={props.onClose}
            variant={props.type === MessageType.ERROR ? 'stop' : 'start'}
          >
            OK
          </Button>
        </MessagePopupButtons>
      </MessageContent>
    </PopupWrapper>
  );
};

export default MessagePopup;
