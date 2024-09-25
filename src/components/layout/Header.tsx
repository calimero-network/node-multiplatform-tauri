import React from 'react';
import {
  HeaderStyled,
  HeaderContent,
  LogoContainer,
  DashboardText,
  HeaderTitle,
  Placeholder
} from '../../styles/HeaderStyles';
import calimeroLogo from '../../assets/calimero-logo.svg';

const Header: React.FC = () => (
  <HeaderStyled>
    <HeaderContent>
      <LogoContainer>
        <img src={calimeroLogo} alt="Calimero Logo" />
        <DashboardText>Calimero Network</DashboardText>
      </LogoContainer>
      <HeaderTitle>Node Management Dashboard</HeaderTitle>
      <Placeholder />
    </HeaderContent>
  </HeaderStyled>
);

export default Header;
