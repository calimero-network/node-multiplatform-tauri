import React, { useState } from 'react';
import Button from '../../common/button';
import Input from '../../common/input';
import Checkbox from '../../common/checkbox';
import {
  PopupButtons,
  SuccessMessage,
  ErrorMessage,
} from '../../common/popup/Styled';
import { CommandResponse } from '../../../hooks/useNodeManagement';

interface NodeInitializationPopupProps {
  onInitialize: (
    nodeName: string,
    serverPort: number,
    swarmPort: number,
    runOnStartup: boolean
  ) => Promise<CommandResponse>;
  onClose: () => void;
}

const NodeInitializationPopup: React.FC<NodeInitializationPopupProps> = ({
  onInitialize,
  onClose,
}) => {
  const [nodeName, setNodeName] = useState('');
  const [serverPort, setServerPort] = useState('');
  const [swarmPort, setSwarmPort] = useState('');
  const [runOnStartup, setRunOnStartup] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await onInitialize(
      nodeName,
      parseInt(serverPort),
      parseInt(swarmPort),
      runOnStartup
    );
    if (response.success) {
      setMessage(response.message);
    } else {
      setMessage('Error: ' + response.message);
    }
  };

  return (
    <>
      <h2>Initialize Node</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Node Name"
          type="text"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
          placeholder="Enter node name"
          required
        />
        <Input
          label="Server Port"
          type="number"
          value={serverPort}
          onChange={(e) => setServerPort(e.target.value)}
          placeholder="Enter server port"
          required
        />
        <Input
          label="Swarm Port"
          type="number"
          value={swarmPort}
          onChange={(e) => setSwarmPort(e.target.value)}
          placeholder="Enter swarm port"
          required
        />
        <Checkbox
          label="Run on Startup"
          checked={runOnStartup}
          onChange={(e) => setRunOnStartup(e.target.checked)}
        />
        <PopupButtons>
          <Button type="button" variant="stop" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="start">
            Initialize Node
          </Button>
        </PopupButtons>
      </form>
      {message &&
        (message.startsWith('Error') ? (
          <ErrorMessage>{message}</ErrorMessage>
        ) : (
          <SuccessMessage>{message}</SuccessMessage>
        ))}
    </>
  );
};

export default NodeInitializationPopup;
