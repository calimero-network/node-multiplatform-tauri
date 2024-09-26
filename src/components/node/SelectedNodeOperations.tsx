import React, { useEffect, useState } from 'react';
import Button from '../common/Button';
import NodeConfig from './NodeConfig';
import { UpdateNodeConfigParams, CommandResponse, NodeDetails } from '../../hooks/useNodeManagement';
import { OperationsContainer, NodeTitle, NodeActions, MainContent } from '../../styles/SelectedNodeOperationsStyles';
import NodeControls from './NodeControls';
import NodeLogs from './NodeLogs';
import { TrayAction } from '../../pages/Dashboard';

interface SelectedNodeOperationsProps {
  selectedNode: NodeDetails;
  handleNodeConfigUpdate: ( config: UpdateNodeConfigParams ) => Promise<CommandResponse>;
  handleNodeStart: (nodeName: string) => Promise<CommandResponse>;
  handleNodeStop: (nodeName: string) => Promise<CommandResponse>;
  trayAction: TrayAction | null;
}

const SelectedNodeOperations: React.FC<SelectedNodeOperationsProps> = ({ selectedNode, handleNodeConfigUpdate, handleNodeStart, handleNodeStop, trayAction }) => {
  const [activeSection, setActiveSection] = useState<'config' | 'controls' | 'logs' | null>('controls');
  const [action, setAction] = useState< string | null>(null);

  useEffect(() => {
    if(trayAction) {
      setActiveSection(trayAction.section);
      setAction(trayAction.action);
    }
  }, [trayAction]);

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
        {activeSection === 'logs' && (
          <NodeLogs
            selectedNode={selectedNode}
            onClose={() => setActiveSection(null)}
          />
        )}
      </MainContent>
    </OperationsContainer>
  );
};

export default SelectedNodeOperations;

