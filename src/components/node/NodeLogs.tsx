import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { LogsContainer, LogsOutput, LogsHeader } from '../../styles/NodeLogsStyles';
import { NodeDetails } from '../../hooks/useNodeManagement';

interface NodeLogsProps {
  selectedNode: NodeDetails;
  onClose: () => void;
}

const NodeLogs: React.FC<NodeLogsProps> = ({ selectedNode }) => {
  const [logs, setLogs] = useState<string>('');
  const logsOutputRef = useRef<HTMLPreElement>(null);

  const fetchLogs = async () => {
    try {
      const fullLog = await invoke('get_node_log', { nodeName: selectedNode.name });
      console.log(1);
      setLogs(fullLog as string);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs('Failed to fetch logs. Please try again.');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedNode]);

  useEffect(() => {
    if (logsOutputRef.current) {
      logsOutputRef.current.scrollTop = logsOutputRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <LogsContainer>
      <LogsHeader>
        <h3>Logs for {selectedNode.name}</h3>
      </LogsHeader>
      <LogsOutput ref={logsOutputRef}>{logs}</LogsOutput>
    </LogsContainer>
  );
};

export default NodeLogs;
