import styled from 'styled-components';

export const HeaderStyled = styled.header`
  background-color: #1e1e1e;
  color: white;
  padding: 1rem;
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const LogoContainer = styled.div`
  position: relative;
  width: 160px;
  justify-content: center;

  img {
    width: 160px;
    height: 43.3px;
  }

  @media (max-width: 480px) {
    width: 120px;

    img {
      width: 120px;
      height: auto;
    }
  }
`;

export const DashboardText = styled.h4`
  position: absolute;
  left: 3.2rem;
  top: 2rem;
  width: max-content;
  font-size: 12px;
  color: #fff;

  @media (max-width: 480px) {
    left: 2.4rem;
    top: 1.5rem;
    font-size: 10px;
  }
`;

export const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;

  @media (max-width: 768px) {
    margin-top: 1rem;
    font-size: 1.2rem;
  }
`;

export const Placeholder = styled.div`
  width: 160px;

  @media (max-width: 768px) {
    display: none;
  }
`;
