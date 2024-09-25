import React, { useState } from 'react';
import NodeList from '../components/node/NodeList';
import useNodeManagement from '../hooks/useNodeManagement';
import Button from '../components/common/Button';
import Header from '../components/layout/Header';
import PopupWrapper from '../components/common/PopupWrapper';
import NodeInitializationPopup from '../components/node/NodeInitializationPopup';
import { DashboardContainer, MainContent, Sidebar, ContentArea } from '../styles/DashboardStyles';

const Dashboard: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const {
    nodes,
    selectedNode,
    handleNodeSelect,
    handleNodeInitialize,
  } = useNodeManagement();

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
          <Button 
            onClick={() => setShowPopup(true)}
            variant='start'
          >
            Initialize Node
          </Button>
        </Sidebar>
        <ContentArea>
        
        </ContentArea>
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