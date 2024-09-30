import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
// import { dialog } from '@tauri-apps/api';
import Button from '../common/Button';
import {
  ControlsContainer,
  ButtonGroup,
  TerminalContainer,
  TerminalOutput,
  TerminalForm,
  TerminalInput,
} from '../../styles/NodeControlsStyles';
import { NodeDetails, CommandResponse } from '../../hooks/useNodeManagement';
import MessagePopup from '../common/MessagePopup';

interface NodeControlsProps {
  selectedNode: NodeDetails;
  handleNodeStart: (nodeName: string) => Promise<CommandResponse>;
  handleNodeStop: (nodeName: string) => Promise<CommandResponse>;
  action: string | null;
  setAction: (action: string | null) => void;
}

const NodeControls: React.FC<NodeControlsProps> = ({ selectedNode, handleNodeStart, handleNodeStop, action, setAction }) => {
  const [output, setOutput] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(selectedNode.is_running);
  const outputRef = useRef<HTMLPreElement>(null);
  const [messagePopup, setMessagePopup] = useState({ isOpen: false, message: '', title: '', type: 'info' as const });

  useEffect(() => {
    if (action) {
      if(action === 'start') {
        handleStart();
      } else if (action === 'stop') {
        handleStop();
      }
      setAction(null);
    }
  }, [action]);

  useEffect(() => {

    setIsRunning(selectedNode.is_running);
    let unsubscribe: UnlistenFn | null = null;

    const setupTerminalListener = async () => {

      // Clean up previous listener if it exists
      if (unsubscribe) {
        console.log('Cleaning up previous listener');
        unsubscribe();
      }

      // Set up new listener
      unsubscribe = await listen(`node-output-${selectedNode.name}`, (event: any) => {
        setOutput(prevOutput => prevOutput + event.payload);
      });
    };

    setupTerminalListener();

    // Fetch current node status and output
    const fetchNodeStatus = async () => {
      try {
        const currentOutput = await invoke<CommandResponse>('get_node_current_output', { nodeName: selectedNode.name });
        if(currentOutput.success){
          setOutput(currentOutput.message);
        }else {
          setOutput('');
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
  }, [selectedNode]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleStart = async () => {
    if (!isRunning) {
      try {
        setOutput('Starting node...\n');
        const result = await handleNodeStart(selectedNode.name);
        setOutput(prevOutput => prevOutput + `${result.message}\n`);
        if (result.success) {
          setIsRunning(true);
        } else {
          setIsRunning(false);
        }
      } catch (error) {
        console.error('Error starting node:', error);
        setOutput(prevOutput => prevOutput + `Failed to start node: ${
          error && typeof error === 'object' && 'message' in error
            ? error.message
            : 'Unknown error'
        }\n`);
        setIsRunning(false);
      }
    } else {
      setMessagePopup({
        isOpen: true,
        message: "Node is already running.",
        title: "Node Status",
        type: "info"
      });
    }
  };

  const handleStop = async () => {
    if (isRunning) {
      setOutput(prevOutput => prevOutput + 'Stopping node...\n');
      const result = await handleNodeStop(selectedNode.name);
      if (result.success) {
        setOutput(prevOutput => prevOutput + `Node stopped: ${result.message}\n`);
        setIsRunning(false);
      } else {
        setOutput(prevOutput => prevOutput + `Failed to stop node: ${result.message}\n`);
      }
    } else {
      setMessagePopup({
        isOpen: true,
        message: "Node is not running.",
        title: "Node Status",
        type: "info"
      });
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInput();
  };

  const sendInput = async () => {
    if (input.trim()) {
      try {
        await invoke('send_input', { nodeName: selectedNode.name, input });
        setInput('');
      } catch (error) {
        setOutput(prevOutput => prevOutput + `Error sending input: ${
          error && typeof error === 'object' && 'message' in error
            ? error.message
            : 'Unknown error'
        }\n`);
      }
    }
  };

  return (
    <ControlsContainer>
      <ButtonGroup>
        <Button variant='start' onClick={handleStart}>Start Node</Button>
        <Button variant='stop' onClick={handleStop}>Stop Node</Button>
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
        onClose={() => setMessagePopup(prev => ({ ...prev, isOpen: false }))}
        message={messagePopup.message}
        title={messagePopup.title}
        type={messagePopup.type}
      />
    </ControlsContainer>
  );
};

export default NodeControls;
