import React, { useState } from 'react';
import NodeList from '../../components/node/nodeList';
import useNodeManagement from '../../hooks/useNodeManagement';
import Button from '../../components/common/button';
import Header from '../../components/layout/header';
import PopupWrapper from '../../components/common/popup';
import NodeInitializationPopup from '../../components/node/nodeInitPopup';
import {
  DashboardContainer,
  MainContent,
  Sidebar,
  ContentArea,
} from './Styled';
import NodeOperations from '../../components/node/nodeOperations';

const Dashboard: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const {
    nodes,
    selectedNode,
    handleNodeSelect,
    handleNodeInitialize,
    handleNodeConfigUpdate,
  } = useNodeManagement();

  return (
    <DashboardContainer>
      <Header />
      <MainContent>
        <Sidebar>
          <NodeList
            nodes={nodes || []}
            selectedNode={selectedNode}
            handleNodeSelect={handleNodeSelect}
          />
          <Button onClick={() => setShowPopup(true)} variant="start">
            Initialize Node
          </Button>
        </Sidebar>
        <ContentArea>
          {selectedNode && (
            <NodeOperations
              selectedNode={selectedNode}
              handleNodeConfigUpdate={handleNodeConfigUpdate}
            />
          )}
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
