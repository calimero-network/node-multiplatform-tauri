import React, { useState } from 'react';
import NodeList from '../components/node/NodeList';
import useNodeManagement from '../hooks/useNodeManagement';
import Button from '../components/common/Button';
import Header from '../components/layout/Header';
import PopupWrapper from '../components/common/PopupWrapper';
import NodeInitializationPopup from '../components/node/NodeInitializationPopup';
import { DashboardContainer, MainContent, Sidebar, ContentArea } from '../styles/DashboardStyles';
import SelectedNodeOperations from '../components/node/SelectedNodeOperations';

const Dashboard: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const {
    nodes,
    selectedNode,
    handleNodeSelect,
    handleNodeInitialize,
    handleNodeConfigUpdate,
    handleNodeStart,
    handleNodeStop,
  } = useNodeManagement();

  return (
    <DashboardContainer>
      <Header />
      <MainContent>
        <Sidebar>
          <NodeList 
            nodes={nodes} 
            selectedNode={selectedNode} 
            handleNodeSelect={handleNodeSelect}
          />
          <Button 
            onClick={() => setShowPopup(true)}
            variant='start'
          >
            Initialize Node
          </Button>
        </Sidebar>
        <ContentArea>
          {
            selectedNode && 
              <SelectedNodeOperations
                selectedNode={selectedNode}
                handleNodeConfigUpdate={handleNodeConfigUpdate}
                handleNodeStart={handleNodeStart}
                handleNodeStop={handleNodeStop}
              />
          }   
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