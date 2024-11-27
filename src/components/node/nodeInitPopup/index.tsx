import React, { useState } from 'react';
import Button from '../../common/button';
import Input from '../../common/input';
import Checkbox from '../../common/checkbox';
import {
  PopupButtons,
  SuccessMessage,
  ErrorMessage,
  CharacterCount,
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
  handleNodeSelect: (nodeName: string) => void;
}

const NodeInitializationPopup: React.FC<NodeInitializationPopupProps> = ({
  ...props
}) => {
  const [nodeName, setNodeName] = useState('');
  const [serverPort, setServerPort] = useState('');
  const [swarmPort, setSwarmPort] = useState('');
  const [runOnStartup, setRunOnStartup] = useState(false);
  const [message, setMessage] = useState('');

  const handleNodeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 15) {
      setNodeName(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await props.onInitialize(
      nodeName,
      parseInt(serverPort),
      parseInt(swarmPort),
      runOnStartup
    );
    if (response.success) {
      setMessage(response.message);

      setTimeout(() => {
        props.handleNodeSelect(nodeName);
        props.onClose();
      }, 1500);
    } else {
      setMessage('Error: ' + response.message);
    }
  };

  const isShowingCharCount = nodeName.length >= 10;

  return (
    <>
      <h2>Initialize Node</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Node Name (max 15 chars)"
          type="text"
          value={nodeName}
          onChange={handleNodeNameChange}
          placeholder="e.g. node1"
          required
          maxLength={15}
          noMargin={isShowingCharCount}
          showingCharCount={isShowingCharCount}
        />
        {isShowingCharCount && (
          <CharacterCount warning={nodeName.length >= 13}>
            {nodeName.length}/15 characters
          </CharacterCount>
        )}
        <Input
          label="Server Port"
          type="number"
          value={serverPort}
          onChange={(e) => setServerPort(e.target.value)}
          placeholder="e.g. 2428"
          min="1024"
          max="65535"
          required
        />
        <Input
          label="Swarm Port"
          type="number"
          value={swarmPort}
          onChange={(e) => setSwarmPort(e.target.value)}
          placeholder="e.g.2528"
          min="1024"
          max="65535"
          required
        />
        <Checkbox
          label="Run on Startup"
          checked={runOnStartup}
          onChange={(e) => setRunOnStartup(e.target.checked)}
        />
        <PopupButtons>
          <Button type="button" variant="warning" onClick={props.onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
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
