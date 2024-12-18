import React, { useEffect, useState } from 'react';
import Input from '../../common/input';
import Checkbox from '../../common/checkbox';
import {
  NodeConfigContainer,
  NodeConfigTitle,
  NodeConfigButton,
  ErrorText,
  SuccessText,
} from './Styled';
import {
  UpdateNodeConfigParams,
  CommandResponse,
  NodeDetails,
} from '../../../hooks/useNodeManagement';

interface NodeConfigProps {
  selectedNode: NodeDetails;
  onConfigUpdate: (config: UpdateNodeConfigParams) => Promise<CommandResponse>;
  onClose: () => void;
  handleNodeSelect: (nodeName: string) => void;
}

const NodeConfig: React.FC<NodeConfigProps> = ({ ...props }) => {
  const [serverPort, setServerPort] = useState<number>(
    props.selectedNode.node_ports.server_port
  );
  const [swarmPort, setSwarmPort] = useState<number>(
    props.selectedNode.node_ports.swarm_port
  );
  const [nodeName, setNodeName] = useState<string>(props.selectedNode.name);
  const [runOnStartup, setRunOnStartup] = useState<boolean>(
    props.selectedNode.run_on_startup
  );
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    setServerPort(props.selectedNode.node_ports.server_port);
    setSwarmPort(props.selectedNode.node_ports.swarm_port);
    setNodeName(props.selectedNode.name);
    setRunOnStartup(props.selectedNode.run_on_startup);
    setError('');
    setSuccessMessage('');
  }, [props.selectedNode]);

  const handleUpdateConfig = async () => {
    setError('');
    setSuccessMessage('');
    try {
      const result: CommandResponse = await props.onConfigUpdate({
        originalNodeName: props.selectedNode.name,
        nodeName: nodeName,
        serverPort: serverPort,
        swarmPort: swarmPort,
        runOnStartup: runOnStartup,
      });

      if (result.success) {
        setSuccessMessage('Node configuration updated successfully');
        setTimeout(() => {
          setSuccessMessage('');
          props.handleNodeSelect(nodeName);
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error updating node config:', error);
      setError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleUpdateConfig();
    }
  };

  if (!props.selectedNode) {
    return (
      <NodeConfigContainer>Select a node to configure</NodeConfigContainer>
    );
  }

  return (
    <NodeConfigContainer onKeyDown={handleKeyDown}>
      <NodeConfigTitle>Node Configuration</NodeConfigTitle>
      <Input
        label="Node Name"
        type="text"
        value={nodeName}
        onChange={(e) => setNodeName(e.target.value)}
      />
      <Input
        label="Server Port"
        type="number"
        value={serverPort}
        onChange={(e) => setServerPort(parseInt(e.target.value))}
      />
      <Input
        label="Swarm Port"
        type="number"
        value={swarmPort}
        onChange={(e) => setSwarmPort(parseInt(e.target.value))}
      />
      <Checkbox
        label="Run on Startup"
        checked={runOnStartup}
        onChange={(e) => setRunOnStartup(e.target.checked)}
      />
      <NodeConfigButton onClick={handleUpdateConfig}>
        Update Configuration
      </NodeConfigButton>
      {error && <ErrorText>{error}</ErrorText>}
      {successMessage && <SuccessText>{successMessage}</SuccessText>}
    </NodeConfigContainer>
  );
};

export default NodeConfig;
