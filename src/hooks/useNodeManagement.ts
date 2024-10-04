import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface NodeStatus {
  name: string;
  is_running: boolean;
  node_ports: {
    server_port: number;
    swarm_port: number;
  };
}

export interface NodeInitializationResult {
  success: boolean;
  message: string;
  data: NodeStatus[] | null;
}

const useNodeManagement = () => {
  const [nodes, setNodes] = useState<NodeStatus[] | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const refreshNodesList = async () => {
    try {
      const nodesStatus = await invoke<NodeInitializationResult>('fetch_nodes');
      if (nodesStatus.success) {
        setNodes(nodesStatus.data);
      } else {
        console.error('Error fetching nodes status:', nodesStatus.message);
        alert(nodesStatus.message);
      }
    } catch (error) {
      console.error('Error fetching nodes status:', error);
      alert(error);
    }
  };

  useEffect(() => {
    refreshNodesList();
  }, []);

  const handleNodeSelect = (nodeName: string) => {
    setSelectedNode(nodeName);
  };

  const handleNodeInitialize = async (
    nodeName: string,
    serverPort: number,
    swarmPort: number,
    runOnStartup: boolean
  ): Promise<NodeInitializationResult> => {
    try {
      const result = await invoke<{ success: boolean; message: string }>(
        'initialize_node',
        {
          nodeName,
          serverPort,
          swarmPort,
          runOnStartup,
        }
      );
      if (result.success) {
        await refreshNodesList(); // Refresh the node list and status
      }
      return {
        success: result.success,
        message: result.message,
        data: null,
      };
    } catch (error: unknown) {
      console.error('Failed to initialize node:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null,
      };
    }
  };

  return {
    nodes,
    selectedNode,
    setSelectedNode,
    handleNodeSelect,
    handleNodeInitialize,
    refreshNodesList,
  };
};

export default useNodeManagement;
