import styled from 'styled-components';

export const FullPageIframe = styled.iframe`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

export const CloseButton = styled.button`
  position: fixed;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  background-color: #e11e5c;
  &:hover {
    background-color: #c0392b;
  }

  padding: 5px 40px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-weight: normal;
  font-size: 18px;
  line-height: 40px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
`;
