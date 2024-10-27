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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const suggestion = suggestions[selectedSuggestionIndex];
          const parts = suggestion.split(' ');
          if (parts.length > 1 && !parts[1].startsWith('[')) {
            // If it's a subcommand suggestion, preserve the main command
            const mainCommand = input.split(' ')[0];
            setInput(mainCommand + ' ' + parts[0]);
          } else {
            // If it's a main command or has no subcommands, use only the first word
            setInput(parts[0]);
          }
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    const commandStructure = {
      'call': ['<Context ID> <Method> <JSON Payload> <Executor Public Key>'],
      'peers': [],
      'pool': [],
      'gc': [],
      'store': [],
      'context': ['ls', 'join', 'leave', 'invite', 'create', 'delete', 'state', 'identity'],
      'application': ['ls', 'install']
    };

    // Handle both cases: with and without leading '/'
    const parts = value.startsWith('/') ? value.slice(1).split(' ') : value.split(' ');
    const mainCommand = parts[0].toLowerCase();
    
    if (parts.length === 1) {
      // Show main commands
      const commands = Object.keys(commandStructure).map(cmd => {
        const subcommands = commandStructure[cmd];
        return subcommands.length > 0 ? `${cmd} [${subcommands.join('|')}]` : cmd;
      });
      
      const filtered = commands.filter(cmd =>
        cmd.toLowerCase().startsWith(mainCommand)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else if (parts.length === 2) {
      // Get the base command without any parameters
      const baseCommand = mainCommand.split(' ')[0];
      const subcommands = commandStructure[baseCommand] || [];
      if (subcommands.length > 0) {
        const subcommandTerm = parts[1].toLowerCase();
        const filtered = subcommands.filter(cmd =>
          cmd.toLowerCase().startsWith(subcommandTerm)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    }
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const parts = suggestion.split(' ');
    if (parts.length > 1 && !parts[1].startsWith('[')) {
      // If it's a subcommand suggestion, preserve the main command
      const mainCommand = input.split(' ')[0];
      setInput(mainCommand + ' ' + parts[0]);
    } else {
      // If it's a main command or has no subcommands, use only the first word
      setInput(parts[0]);
    }
    setShowSuggestions(false);
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
          <div style={{ position: 'relative', width: '100%' }}>
            <TerminalInput
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter command... (type / for commands)"
              disabled={!isRunning}
            />
            {showSuggestions && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: index === selectedSuggestionIndex ? '#2c2c2c' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#2c2c2c'
                      }
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
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
