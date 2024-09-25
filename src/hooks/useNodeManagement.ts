import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface NodeStatus {
  name: string;
  is_running: boolean;
  node_ports: {
    server_port: number;
    swarm_port: number;
  }
}

export interface NodeInitializationResult {
  success: boolean;
  message: string;
}

const useNodeManagement = () => {
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const refreshNodesList = async () => {
    try {
      const nodesStatus = await invoke<NodeStatus[]>('fetch_nodes');
      setNodes(nodesStatus);
    } catch (error) {
      console.error('Error fetching nodes status:', error);
    }
  };

  useEffect(() => {
    refreshNodesList();
  }, []);

  const handleNodeSelect = (nodeName: string) => {
    setSelectedNode(nodeName);
  };

  const handleNodeInitialize = async (nodeName: string, serverPort: number, swarmPort: number, runOnStartup: boolean): Promise<NodeInitializationResult> => {
    try {
      const result = await invoke<{ success: boolean; message: string }>('initialize_node', {
        nodeName,
        serverPort,
        swarmPort,
        runOnStartup
      });
      if (result.success) {
        await refreshNodesList(); // Refresh the node list and status 
      }
      return result;
    } catch (error: any) {
      console.error('Failed to initialize node:', error);
      return error;
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