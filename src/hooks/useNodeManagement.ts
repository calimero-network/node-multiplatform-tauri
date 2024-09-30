import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface NodeDetails {
  name: string;
  is_running: boolean;
  run_on_startup: boolean;
  node_ports: {
    server_port: number;
    swarm_port: number;
  }
}

export interface NodeInitializationResult {
  success: boolean;
  message: string;
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
}

export interface NodePorts {
  server_port: number;
  swarm_port: number;
}

const useNodeManagement = () => {
  const [nodes, setNodes] = useState<NodeDetails[]>([]);
  const nodesRef = useRef<NodeDetails[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);

  const refreshNodesList = async () => {
    try {
      const nodesStatus = await invoke<NodeDetails[]>('fetch_nodes');
      setNodes(nodesStatus);
      nodesRef.current = nodesStatus;
      setSelectedNode(nodesStatus.find(node => node.name === selectedNode?.name) || null);
    } catch (error) {
      console.error('Error fetching nodes status:', error);
    }
  };

  useEffect(() => {
    refreshNodesList();
  }, []);

  const handleNodeSelect = (nodeName: string) => {
    setSelectedNode(nodesRef.current.find(node => node.name === nodeName) || null);
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
        await refreshNodesList();
      }
      return result;
    } catch (error: any) {
      console.error('Failed to initialize node:', error);
      return error;
    }
  };

  const handleNodeConfigUpdate = async (config: UpdateNodeConfigParams): Promise<CommandResponse> => {
    try {
      const result = await invoke<CommandResponse>('update_node', {
        originalNodeName: config.originalNodeName,
        nodeName: config.nodeName,
        serverPort: config.serverPort,
        swarmPort: config.swarmPort,
        runOnStartup: config.runOnStartup
      });
      await refreshNodesList();
      return result;
    } catch (error) {
      console.error('Error updating node config:', error);
      throw error;
    }
  };
  
  const handleNodeStart = async (nodeName: string): Promise<CommandResponse> => {
    try {
      const result = await invoke<CommandResponse>('start_node', { nodeName });
      await refreshNodesList();
      return result;
    } catch (error) {
      console.error('Error starting node:', error);
      throw error;
    }
  };

  const handleNodeStop = async (nodeName: string): Promise<CommandResponse> => {
    try {
      const result = await invoke<CommandResponse>('stop_node', { nodeName });
      await refreshNodesList();
      return result;
    } catch (error) {
      console.error('Error stopping node:', error);
      return { success: false, message: `Error: ${error}` };
    }
  };

  const handleNodeDelete = async (nodeName: string): Promise<CommandResponse> => {
    console.log('Deleting node:', nodeName);
    try {
      const result = await invoke<{ success: boolean; message: string }>('delete_node', { nodeName });
      console.log('Delete node result:', result);
      if (result.success) {
        await refreshNodesList();
      }
      return result;
    } catch (error) {
      console.error('Error deleting node:', error);
      return { success: false, message: `Error: ${error}` };
    }
  };

  const handleOpenAdminDashboard = async (nodeName: string): Promise<CommandResponse> => {
    try {
      const result = await invoke<CommandResponse>('open_dashboard', { nodeName });
      return result;
    } catch (error) {
      console.error('Error opening admin dashboard:', error);
      return { success: false, message: `Error: ${error}` };
    }
  };

  return {
    nodesRef,
    selectedNode,
    setSelectedNode,
    handleNodeSelect,
    handleNodeInitialize,
    refreshNodesList,
    handleNodeConfigUpdate,
    handleNodeStart,
    handleNodeStop,
    handleNodeDelete,
    handleOpenAdminDashboard
  };
};

export default useNodeManagement;