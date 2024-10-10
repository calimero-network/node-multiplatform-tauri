import React from 'react';
import { CloseButton, FullPageIframe } from './Styled';

interface DocumentationProps {
  onClose: () => void;
}

const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  return (
    <>
      <CloseButton
        onClick={() => {
          onClose();
        }}
      >
        Close
      </CloseButton>
      <FullPageIframe
        src="https://calimero-network.github.io/"
        title="Documentation"
      />
    </>
  );
};

export default Documentation;
