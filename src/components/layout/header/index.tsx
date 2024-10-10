import React from 'react';
import {
  HeaderStyled,
  HeaderContent,
  LogoContainer,
  DashboardText,
  HeaderTitle,
} from './Styled';
import calimeroLogo from '../../../assets/calimero-logo.svg';
import Button from '../../common/button';

interface HeaderProps {
  onShowDocumentation: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowDocumentation }) => (
  <HeaderStyled>
    <HeaderContent>
      <LogoContainer>
        <img src={calimeroLogo} alt="Calimero Logo" />
        <DashboardText>Calimero Network</DashboardText>
      </LogoContainer>
      <HeaderTitle>Node Management Dashboard</HeaderTitle>
      <Button variant="primary" onClick={onShowDocumentation}>
        Documentation
      </Button>
    </HeaderContent>
  </HeaderStyled>
);

export default Header;
