import React, { ReactNode } from 'react';
import { PopupOverlay, PopupContent } from './Styled';

interface PopupWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const PopupWrapper: React.FC<PopupWrapperProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContent onClick={(e) => e.stopPropagation()}>
        {children}
      </PopupContent>
    </PopupOverlay>
  );
};

export default PopupWrapper;
