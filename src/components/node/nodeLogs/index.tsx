import React, { useState, useEffect, useRef } from 'react';
import { LogsContainer, LogsOutput, LogsHeader } from './Styled';
import useNodeManagement, {
  CommandResponse,
  NodeDetails,
} from '../../../hooks/useNodeManagement';

interface NodeLogsProps {
  selectedNode: NodeDetails;
  onClose: () => void;
}

const NodeLogs: React.FC<NodeLogsProps> = ({ selectedNode }) => {
  const [logs, setLogs] = useState<string>('');
  const logsOutputRef = useRef<HTMLPreElement>(null);

  const { handleNodeLogs } = useNodeManagement();

  const fetchLogs = async () => {
    try {
      const result: CommandResponse = await handleNodeLogs(selectedNode.name);
      if (result.success) {
        setLogs(result.data as string);
      } else {
        setLogs(result.message);
      }
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
