import React from 'react';
import Button from '../button';
import PopupWrapper from '../popup';
import {
  MessageContent,
  MessagePopupButtons,
  ButtonWrapper,
  MessageText,
  MessageTitle,
} from './Styled';

interface MessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title: string;
  type: MessageType;
  isExternalNode?: boolean;
  setSelectedNode?: () => void;
  refreshNodesList?: () => void;
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

  const closePopup = () => {
    props.onClose();
    // If node is external, we need to disable the selected node operations
    if (props.isExternalNode && props.setSelectedNode) {
      props.setSelectedNode();
    }
  };

  const handleRefreshNodesList = () => {
    if (props.refreshNodesList) {
      props.refreshNodesList();
      closePopup();
    }
  };

  return (
    <PopupWrapper isOpen={props.isOpen} onClose={closePopup}>
      <MessageContent>
        <MessageTitle>{props.title}</MessageTitle>
        <MessageText>{props.message}</MessageText>
        <MessagePopupButtons>
          <ButtonWrapper>
            <Button
              onClick={() => closePopup()}
              variant={props.type === MessageType.ERROR ? 'stop' : 'start'}
            >
              {props.type === MessageType.ERROR ? 'Close' : 'OK'}
            </Button>
          </ButtonWrapper>
          {props.isExternalNode && (
            <ButtonWrapper>
              <Button
                onClick={() => handleRefreshNodesList()}
                variant={'start'}
              >
                Refresh
              </Button>
            </ButtonWrapper>
          )}
        </MessagePopupButtons>
      </MessageContent>
    </PopupWrapper>
  );
};

export default MessagePopup;
