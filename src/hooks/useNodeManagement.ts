import { useState, useEffect, useRef } from 'react';
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
  data: NodeDetails[] | null | string;
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
      const nodesStatus = await invoke<CommandResponse>('fetch_nodes');
      if (nodesStatus.success) {
        setNodes(nodesStatus.data as NodeDetails[]);
        nodesRef.current = nodesStatus.data as NodeDetails[];
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
    setSelectedNode(
      nodesRef.current.find((node) => node.name === nodeName) || null
    );
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
        await refreshNodesList();
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

  const handleNodeStart = async (
    nodeName: string
  ): Promise<CommandResponse> => {
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
      return { success: false, message: `Error: ${error}`, data: null };
    }
  };

  const handleNodeLogs = async (nodeName: string): Promise<CommandResponse> => {
    try {
      const result = await invoke<CommandResponse>('get_node_log', {
        nodeName,
      });
      if (result.success) {
        return result;
      } else {
        return { success: false, message: result.message, data: null };
      }
    } catch (error) {
      console.error('Error getting node logs:', error);
      return { success: false, message: `Error: ${error}`, data: null };
    }
  };

  const handleGetNodeOutput = async (
    nodeName: string
  ): Promise<CommandResponse> => {
    try {
      const result = await invoke<CommandResponse>('get_node_current_output', {
        nodeName,
      });
      return result;
    } catch (error) {
      console.error('Error getting node output:', error);
      return { success: false, message: `Error: ${error}`, data: null };
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
    handleNodeStart,
    handleNodeStop,
    handleNodeLogs,
    handleGetNodeOutput,
  };
};

export default useNodeManagement;
