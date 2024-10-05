import React, { useEffect, useState } from 'react';
import Button from '../../common/button';
import NodeConfig from '../nodeConfig';
import {
  UpdateNodeConfigParams,
  CommandResponse,
  NodeDetails,
} from '../../../hooks/useNodeManagement';
import {
  OperationsContainer,
  NodeTitle,
  NodeActions,
  MainContent,
} from './Styled';
import NodeControls from '../nodeControls';
import NodeLogs from '../nodeLogs';
import { TrayAction } from '../../../pages/dashboard';

interface NodeOperationsProps {
  selectedNode: NodeDetails;
  handleNodeConfigUpdate: (
    config: UpdateNodeConfigParams
  ) => Promise<CommandResponse>;
  handleNodeStart: (nodeName: string) => Promise<CommandResponse>;
  handleNodeStop: (nodeName: string) => Promise<CommandResponse>;
  trayAction: TrayAction | null;
  setTrayAction: (action: TrayAction | null) => void;
}

const NodeOperations: React.FC<NodeOperationsProps> = ({ ...props }) => {
  const [activeSection, setActiveSection] = useState<
    'config' | 'controls' | 'logs' | null
  >('controls');

  useEffect(() => {
    if (props.trayAction) {
      setActiveSection(props.trayAction.section);
    }
  }, [props.trayAction]);

  return (
    <OperationsContainer>
      <NodeTitle>Currently selected node: {props.selectedNode.name}</NodeTitle>
      <NodeActions>
        <Button onClick={() => setActiveSection('controls')} variant="controls">
          Node Controls
        </Button>
        <Button onClick={() => setActiveSection('config')} variant="configure">
          Configure Node
        </Button>
        <Button onClick={() => setActiveSection('logs')} variant="logs">
          Node Logs
        </Button>
      </NodeActions>
      <MainContent>
        {activeSection === 'config' && (
          <NodeConfig
            selectedNode={props.selectedNode}
            onConfigUpdate={props.handleNodeConfigUpdate}
            onClose={() => setActiveSection(null)}
          />
        )}
        {activeSection === 'controls' && (
          <NodeControls
            selectedNode={props.selectedNode}
            handleNodeStart={props.handleNodeStart}
            handleNodeStop={props.handleNodeStop}
            action={props.trayAction?.action ?? null}
            setAction={props.setTrayAction}
          />
        )}
        {activeSection === 'logs' && (
          <NodeLogs
            selectedNode={props.selectedNode}
            onClose={() => setActiveSection(null)}
          />
        )}
      </MainContent>
    </OperationsContainer>
  );
};

export default NodeOperations;
