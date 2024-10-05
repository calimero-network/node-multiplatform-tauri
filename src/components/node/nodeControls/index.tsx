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
import useNodeManagement, {
  NodeDetails,
  CommandResponse,
} from '../../../hooks/useNodeManagement';
import { TrayAction } from '../../../pages/dashboard';

interface NodeControlsProps {
  selectedNode: NodeDetails;
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
      setOutput((prevOutput) => prevOutput + 'Node is already running.\n');
    }
  };

  const handleStop = async () => {
    setOutput((prevOutput) => prevOutput + 'Stopping node...\n');
    const result = await props.handleNodeStop(props.selectedNode.name);
    if (result.success) {
      setOutput(
        (prevOutput) => prevOutput + `Node stopped: ${result.message}\n`
      );
      setIsRunning(false);
    } else {
      setOutput(
        (prevOutput) => prevOutput + `Failed to stop node: ${result.message}\n`
      );
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInput();
  };

  const sendInput = async () => {
    if (input.trim()) {
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
        <Button variant="start" onClick={handleStart} disabled={isRunning}>
          Start Node
        </Button>
        <Button variant="stop" onClick={handleStop} disabled={!isRunning}>
          Stop Node
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
    </ControlsContainer>
  );
};

export default NodeControls;
