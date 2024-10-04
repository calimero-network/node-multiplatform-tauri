import React, { useState } from 'react';
import NodeList from '../../components/nodeList';
import useNodeManagement from '../../hooks/useNodeManagement';
import Button from '../../components/common/button';
import Header from '../../components/layout/header';
import PopupWrapper from '../../components/common/popup';
import NodeInitializationPopup from '../../components/nodeInitPopup/NodeInitializationPopup';
import {
  DashboardContainer,
  MainContent,
  Sidebar,
  ContentArea,
} from './Styled';

const Dashboard: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { nodes, selectedNode, handleNodeSelect, handleNodeInitialize } =
    useNodeManagement();

  return (
    <DashboardContainer>
      <Header />
      <MainContent>
        <Sidebar>
          <NodeList
            nodes={nodes}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
          />
          <Button onClick={() => setShowPopup(true)} variant="start">
            Initialize Node
          </Button>
        </Sidebar>
        <ContentArea></ContentArea>
      </MainContent>

      <PopupWrapper isOpen={showPopup} onClose={() => setShowPopup(false)}>
        <NodeInitializationPopup
          onInitialize={handleNodeInitialize}
          onClose={() => setShowPopup(false)}
        />
      </PopupWrapper>
    </DashboardContainer>
  );
};

export default Dashboard;
