import React, { useEffect, useState } from 'react';
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
import { listen } from '@tauri-apps/api/event';

interface TriggerActionPayload {
  nodeName: string;
  section: SectionTypes;
  action: string;
}

export interface TrayAction {
  section: SectionTypes;
  action: string | null;
}

export type SectionTypes = 'config' | 'controls' | 'logs' | 'delete';

const Dashboard: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [trayAction, setTrayAction] = useState<TrayAction | null>(null);

  const {
    nodesRef,
    selectedNode,
    handleNodeSelect,
    handleNodeInitialize,
    handleNodeConfigUpdate,
    handleNodeStart,
    handleNodeStop,
    handleNodeDelete,
    handleOpenAdminDashboard,
    refreshNodesList,
  } = useNodeManagement();

  const nodes = nodesRef.current;

  useEffect(() => {
    const listeners: (() => void)[] = [];

    const setupListeners = async () => {
      listeners.push(
        await listen('trigger-action', (event) => {
          const { nodeName, section, action } =
            event.payload as TriggerActionPayload;
          handleNodeSelect(nodeName);
          if (action !== 'show') {
            setTrayAction({
              section: section,
              action: action,
            });
          }
        })
      );
    };

    setupListeners();

    return () => {
      listeners.forEach((unlisten) => unlisten());
    };
  }, []);

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
              handleNodeStart={handleNodeStart}
              handleNodeStop={handleNodeStop}
              handleOpenAdminDashboard={handleOpenAdminDashboard}
              handleNodeDelete={handleNodeDelete}
              handleNodeSelect={handleNodeSelect}
              trayAction={trayAction}
              setTrayAction={setTrayAction}
              refreshNodesList={refreshNodesList}
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
