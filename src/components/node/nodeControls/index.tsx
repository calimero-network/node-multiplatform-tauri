import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import Button from '../../common/button';
import {
  ControlsContainer,
  ButtonGroup,
  TerminalContainer,
  TerminalOutput,
  TerminalForm,
  TerminalInput,
} from './Styled';
import MessagePopup, {
  MessagePopupState,
  MessageType,
} from '../../common/popupMessage';
import useNodeManagement, {
  NodeDetails,
  CommandResponse,
} from '../../../hooks/useNodeManagement';
import { TrayAction } from '../../../pages/dashboard';

interface NodeControlsProps {
  selectedNode: NodeDetails;
  handleNodeSelect: (nodeName: string) => void;
  handleNodeStart: (nodeName: string) => Promise<CommandResponse>;
  handleNodeStop: (nodeName: string) => Promise<CommandResponse>;
  action: string | null;
  setAction: (action: TrayAction | null) => void;
}

type EventPayload = string;
const NodeControls: React.FC<NodeControlsProps> = ({ ...props }) => {
  const [output, setOutput] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(
    props.selectedNode.is_running
  );
  const outputRef = useRef<HTMLPreElement>(null);
  const [messagePopup, setMessagePopup] = useState<MessagePopupState>({
    isOpen: false,
    message: '',
    title: '',
    type: MessageType.INFO,
  });
  const { handleGetNodeOutput } = useNodeManagement();

  useEffect(() => {
    if (props.action) {
      if (props.action === 'start') {
        handleStart();
      } else if (props.action === 'stop') {
        handleStop();
      }
      props.setAction(null);
    }
  }, [props.action]);

  useEffect(() => {
    setIsRunning(props.selectedNode.is_running);
    let unsubscribe: UnlistenFn | null = null;

    const setupTerminalListener = async () => {
      // Clean up previous listener if it exists
      if (unsubscribe) {
        unsubscribe();
      }

      // Set up new listener
      unsubscribe = await listen(
        `node-output-${props.selectedNode.name}`,
        (event: { payload: EventPayload }) => {
          const eventData = event.payload;
          setOutput((prevOutput) => prevOutput + eventData);
        }
      );
    };

    setupTerminalListener();

    // Fetch current node status and output
    const fetchNodeStatus = async () => {
      try {
        const currentOutput: CommandResponse = await handleGetNodeOutput(
          props.selectedNode.name
        );
        if (currentOutput.success) {
          setOutput(currentOutput.data as string);
        } else {
          setOutput(currentOutput.message);
        }
      } catch (error) {
        console.error('Error fetching node status:', error);
      }
    };

    fetchNodeStatus();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [props.selectedNode]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleStart = async () => {
    if (!isRunning) {
      try {
        setOutput('Starting node...\n');
        const result = await props.handleNodeStart(props.selectedNode.name);
        setOutput((prevOutput) => prevOutput + `${result.message}\n`);
        if (result.success) {
          setIsRunning(true);
        } else {
          setIsRunning(false);
        }
        props.handleNodeSelect(props.selectedNode.name);
      } catch (error) {
        console.error('Error starting node:', error);
        setOutput(
          (prevOutput) =>
            prevOutput +
            `Failed to start node: ${
              error && typeof error === 'object' && 'message' in error
                ? error.message
                : 'Unknown error'
            }\n`
        );
        setIsRunning(false);
      }
    } else {
      setMessagePopup({
        isOpen: true,
        message: 'Node is already running.',
        title: 'Node Status',
        type: MessageType.INFO,
      });
      setOutput((prevOutput) => prevOutput + 'Node is already running.\n');
    }
  };

  const handleStop = async () => {
    if (isRunning) {
      setOutput((prevOutput) => prevOutput + 'Stopping node...\n');
      const result = await props.handleNodeStop(props.selectedNode.name);
      if (result.success) {
        setOutput(
          (prevOutput) => prevOutput + `Node stopped: ${result.message}\n`
        );
        setIsRunning(false);
      } else {
        setOutput(
          (prevOutput) =>
            prevOutput + `Failed to stop node: ${result.message}\n`
        );
      }
      props.handleNodeSelect(props.selectedNode.name);
    } else {
      setMessagePopup({
        isOpen: true,
        message: 'Node is not running.',
        title: 'Node Status',
        type: MessageType.INFO,
      });
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInput();
  };

  const sendInput = async () => {
    if (input.trim()) {
      setOutput((prevOutput) => prevOutput + `> ${input}\n`);
      try {
        await invoke('send_input', {
          nodeName: props.selectedNode.name,
          input,
        });
        setInput('');
      } catch (error) {
        setOutput(
          (prevOutput) =>
            prevOutput +
            `Error sending input: ${
              error && typeof error === 'object' && 'message' in error
                ? error.message
                : 'Unknown error'
            }\n`
        );
      }
    }
  };

  return (
    <ControlsContainer>
      <ButtonGroup>
        <Button variant="warning" onClick={handleStop}>
          Stop Node
        </Button>
        <Button variant="primary" onClick={handleStart}>
          Start Node
        </Button>
      </ButtonGroup>
      <TerminalContainer>
        <TerminalOutput ref={outputRef}>{output}</TerminalOutput>
        <TerminalForm onSubmit={handleInputSubmit}>
          <TerminalInput
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command..."
            disabled={!isRunning}
          />
        </TerminalForm>
      </TerminalContainer>
      <MessagePopup
        isOpen={messagePopup.isOpen}
        onClose={() => setMessagePopup((prev) => ({ ...prev, isOpen: false }))}
        message={messagePopup.message}
        title={messagePopup.title}
        type={messagePopup.type}
      />
    </ControlsContainer>
  );
};

export default NodeControls;
