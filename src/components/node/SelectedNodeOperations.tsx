import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import NodeConfig from './NodeConfig';
import { UpdateNodeConfigParams, CommandResponse, NodeDetails } from '../../hooks/useNodeManagement';
import { OperationsContainer, NodeTitle, NodeActions, MainContent } from '../../styles/SelectedNodeOperationsStyles';
import NodeControls from './NodeControls';
import NodeLogs from './NodeLogs';
import { TrayAction } from '../../pages/Dashboard';
import DeleteNode from './DeleteNode';
import MessagePopup from '../common/MessagePopup';

interface SelectedNodeOperationsProps {
  selectedNode: NodeDetails;
  handleNodeConfigUpdate: ( config: UpdateNodeConfigParams ) => Promise<CommandResponse>;
  handleNodeStart: (nodeName: string) => Promise<CommandResponse>;
  handleNodeStop: (nodeName: string) => Promise<CommandResponse>;
  handleNodeDelete: (nodeName: string) => Promise<CommandResponse>;
  handleNodeSelect: (nodeName: string) => void;
  handleOpenAdminDashboard: (nodeName: string) => Promise<CommandResponse>;
  trayAction: TrayAction | null;
}

const SelectedNodeOperations: React.FC<SelectedNodeOperationsProps> = ({ selectedNode, handleNodeConfigUpdate, handleNodeStart, handleNodeStop, handleNodeDelete, handleNodeSelect, handleOpenAdminDashboard, trayAction }) => {
  const [activeSection, setActiveSection] = useState<'config' | 'controls' | 'logs' | 'delete' | null>('controls');
  const [action, setAction] = useState< string | null>(null);
  const [messagePopup, setMessagePopup] = useState({
    isOpen: false,
    message: '',
    title: '',
    type: 'info' as const
  });

  useEffect(() => {
    if(trayAction) {
      setActiveSection(trayAction.section);
      setAction(trayAction.action);
    }
  }, [trayAction]);

  const openAdminDashboard = async () => {
    if(selectedNode.is_running) {
      handleOpenAdminDashboard(selectedNode.name);
    } else {
      setMessagePopup({
        isOpen: true,
        message: "Node is not running.",
        title: "Node Status",
        type: "info"
      });
    }
  };

  return (
    <OperationsContainer>
      <NodeTitle>Currently selected node: {selectedNode.name}</NodeTitle>
      <NodeActions>
        <Button onClick={() => setActiveSection('controls')} variant='controls'>
          Node Controls
        </Button>
        <Button onClick={() => setActiveSection('config')} variant='configure'>
          Configure Node
        </Button>
        <Button onClick={() => setActiveSection('logs')} variant='logs'>
          Node Logs
        </Button>
        <Button onClick={() => setActiveSection('delete')} variant='delete'>
          Delete Node
        </Button>
        <Button onClick={() => openAdminDashboard()} variant='start'>
          Open Admin Dashboard
        </Button>
      </NodeActions>
      <MainContent>
        {activeSection === 'config' && (
          <NodeConfig 
            selectedNode={selectedNode}
            onConfigUpdate={handleNodeConfigUpdate}
            onClose={() => setActiveSection(null)}
          />
        )}
        {activeSection === 'controls' && (
          <NodeControls 
            selectedNode={selectedNode}
            handleNodeStart={handleNodeStart}
            handleNodeStop={handleNodeStop}
            action={action}
            setAction={setAction}
          />
        )}
        {activeSection === 'delete' && (
          <DeleteNode
            handleDeleteNode={() => handleNodeDelete(selectedNode.name)}
            onCancel={() => setActiveSection(null)}
            onDeleteSuccess={() => handleNodeSelect("")}
          />
        )}
        {activeSection === 'logs' && (
          <NodeLogs
            selectedNode={selectedNode}
            onClose={() => setActiveSection(null)}
          />
        )}
      </MainContent>
      <MessagePopup
        isOpen={messagePopup.isOpen}
        onClose={() => setMessagePopup(prev => ({ ...prev, isOpen: false }))}
        message={messagePopup.message}
        title={messagePopup.title}
        type={messagePopup.type}
      />
    </OperationsContainer>
  );
};

export default SelectedNodeOperations;

