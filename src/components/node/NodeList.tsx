import React from 'react';
import {
  NodeListContainer,
  NodeListTitle,
  NodeListUl,
  NodeListItem,
  Notice,
  StatusIcon
} from '../../styles/NodeListStyles';

interface NodeStatus {
  name: string;
  is_running: boolean;
  node_ports: {
    server_port: number;
    swarm_port: number;
  }
}

interface NodeListProps {
  nodes: NodeStatus[];
  selectedNode: NodeStatus | null;
  handleNodeSelect: (nodeName: string) => void;
}

const NodeList: React.FC<NodeListProps> = ({ nodes, selectedNode, handleNodeSelect }) => {
  return (
    <NodeListContainer>
      <NodeListTitle>Nodes</NodeListTitle>
      {nodes.length > 0 ? (
        <>
          <Notice>Select a node:</Notice>
          <NodeListUl>
            {nodes.map((node) => (
              <NodeListItem 
                key={node.name} 
                selected={node.name === selectedNode?.name}
                onClick={() => handleNodeSelect(node.name)}
              >
                <StatusIcon $isRunning={node.is_running} />
                {node.name}
              </NodeListItem>
            ))}
          </NodeListUl>
        </>
      ) : (
        <Notice>There are no initialized nodes</Notice>
      )}
    </NodeListContainer>
  );
};

export default NodeList;
