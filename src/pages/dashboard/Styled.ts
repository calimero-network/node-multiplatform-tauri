import styled from 'styled-components';

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  color: #ffffff;
`;

export const MainContent = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Sidebar = styled.aside`
  width: 250px;
  background-color: #1e1e1e;
  color: white;
  padding: 2rem 1rem;
  overflow-y: auto;

  button {
    width: 100%;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

export const ContentArea = styled.section`
  flex: 1;
  padding: 2rem 1rem;
  overflow-y: auto;
  background-color: #2c2c2c;
  border-radius: 8px;

  h2 {
    margin-bottom: 15px;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const NodeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #3c3c3c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;

  div {
    display: flex;
    flex-direction: column;
  }

  strong {
    font-size: 0.8rem;
    color: #888;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;

    div {
      margin-bottom: 0.5rem;
    }
  }
`;

export const NodeActions = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const DeleteConfirmation = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;

  p {
    margin-bottom: 15px;
    color: #721c24;
  }

  button {
    margin-right: 10px;
    margin-bottom: 10px;
  }
`;
