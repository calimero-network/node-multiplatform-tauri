import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
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

interface NodeControlsProps {
  selectedNode: NodeDetails;
  handleNodeStart: (nodeName: string) => Promise<CommandResponse>;
  handleNodeStop: (nodeName: string) => Promise<CommandResponse>;
}

const NodeControls: React.FC<NodeControlsProps> = ({ selectedNode, handleNodeStart, handleNodeStop }) => {
  const [output, setOutput] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(selectedNode.is_running);
  const outputRef = useRef<HTMLPreElement>(null);



  console.log('NodeControls rendered', selectedNode);
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
        console.log('Received event:', event);
        setOutput(prevOutput => prevOutput + event.payload);
      });
    };

    setupTerminalListener();

    // Fetch current node status and output
    const fetchNodeStatus = async () => {
      try {
        const currentOutput = await invoke<CommandResponse>('get_node_current_output', { nodeName: selectedNode.name });
        console.log('Current output:', currentOutput);
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
        console.log(`Cleaning up listener for ${selectedNode}`);
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
    console.log('Starting node...', isRunning);
    if (!isRunning) {
      try {
        setOutput('Starting node...\n');
        const result = await handleNodeStart(selectedNode.name);
        setOutput(prevOutput => prevOutput + `${result.message}\n`);
        if (result.success) {
          setIsRunning(true);
        } else {
          console.log('Node start failed:', result);
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
      setOutput(prevOutput => prevOutput + 'Node is already running.\n');
    }
  };

  const handleStop = async () => {
    console.log('Stopping node...');
    setOutput(prevOutput => prevOutput + 'Stopping node...\n');
    const result = await handleNodeStop(selectedNode.name);
    if (result.success) {
      setOutput(prevOutput => prevOutput + `Node stopped: ${result.message}\n`);
      setIsRunning(false);
    } else {
      setOutput(prevOutput => prevOutput + `Failed to stop node: ${result.message}\n`);
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

  console.log('NodeControls rendered', isRunning);
  return (
    <ControlsContainer>
      <ButtonGroup>
        <Button variant='start' onClick={handleStart} disabled={isRunning}>Start Node</Button>
        <Button variant='stop' onClick={handleStop} disabled={!isRunning}>Stop Node</Button>
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
