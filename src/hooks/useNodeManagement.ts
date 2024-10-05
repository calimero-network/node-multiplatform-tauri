import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface NodeDetails {
  name: string;
  is_running: boolean;
  run_on_startup: boolean;
  node_ports: {
    server_port: number;
    swarm_port: number;
  };
}

export interface UpdateNodeConfigParams {
  originalNodeName: string;
  nodeName: string;
  serverPort: number;
  swarmPort: number;
  runOnStartup: boolean;
}

export interface CommandResponse {
  success: boolean;
  message: string;
  data: NodeDetails[] | null;
}

export interface NodePorts {
  server_port: number;
  swarm_port: number;
}

const useNodeManagement = () => {
  const [nodes, setNodes] = useState<NodeDetails[] | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);

  const refreshNodesList = async () => {
    try {
      const nodesStatus = await invoke<CommandResponse>('fetch_nodes');
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
    setSelectedNode(nodes?.find((node) => node.name === nodeName) || null);
  };

  const handleNodeInitialize = async (
    nodeName: string,
    serverPort: number,
    swarmPort: number,
    runOnStartup: boolean
  ): Promise<CommandResponse> => {
    try {
      const result = await invoke<CommandResponse>('initialize_node', {
        nodeName,
        serverPort,
        swarmPort,
        runOnStartup,
      });
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

  const handleNodeConfigUpdate = async (
    config: UpdateNodeConfigParams
  ): Promise<CommandResponse> => {
    try {
      const result = await invoke<CommandResponse>('update_node', {
        originalNodeName: config.originalNodeName,
        nodeName: config.nodeName,
        serverPort: config.serverPort,
        swarmPort: config.swarmPort,
        runOnStartup: config.runOnStartup,
      });
      await refreshNodesList();
      return result;
    } catch (error) {
      console.error('Error updating node config:', error);
      throw error;
    }
  };

  return {
    nodes,
    selectedNode,
    setSelectedNode,
    handleNodeSelect,
    handleNodeInitialize,
    refreshNodesList,
    handleNodeConfigUpdate,
  };
};

export default useNodeManagement;
