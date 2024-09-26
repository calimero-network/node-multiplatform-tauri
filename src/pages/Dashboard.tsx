import React, { useEffect, useState } from 'react';
import NodeList from '../components/node/NodeList';
import useNodeManagement from '../hooks/useNodeManagement';
import Button from '../components/common/Button';
import Header from '../components/layout/Header';
import PopupWrapper from '../components/common/PopupWrapper';
import NodeInitializationPopup from '../components/node/NodeInitializationPopup';
import { DashboardContainer, MainContent, Sidebar, ContentArea } from '../styles/DashboardStyles';
import SelectedNodeOperations from '../components/node/SelectedNodeOperations';
import { listen } from '@tauri-apps/api/event';

interface TriggerActionPayload {
  nodeName: string;
  section: 'config' | 'logs' | 'controls';
  action: string;
}

export interface TrayAction {
  section: 'config' | 'logs' | 'controls';
  action: string;
}

const Dashboard: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [trayAction, setTrayAction] = useState<TrayAction | null>(null);
  const {
    nodes,
    selectedNode,
    handleNodeSelect,
    handleNodeInitialize,
    handleNodeConfigUpdate,
    handleNodeStart,
    handleNodeStop,
  } = useNodeManagement();

  useEffect(() => {
    const listeners: (() => void)[] = [];

    const setupListeners = async () => {
      listeners.push(
        await listen('trigger-action', (event) => {
          console.log('trigger-action event received', event);
          const { nodeName, section, action } = event.payload as TriggerActionPayload;
          handleNodeSelect(nodeName);
          if(action !== 'show') {
            setTrayAction({
              section: section,
              action: action,
            })
          }
        }),
      );
    };

    setupListeners();

    return () => {
      listeners.forEach(unlisten => unlisten());
    };
  }, []);

  console.log('Dashboard rendered', selectedNode);
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
                trayAction={trayAction}
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