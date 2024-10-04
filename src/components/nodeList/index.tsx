import React from 'react';
import {
  NodeListContainer,
  NodeListTitle,
  NodeListUl,
  NodeListItem,
  Notice,
  StatusIcon
} from './Styled';

interface NodeStatus {
  name: string;
  is_running: boolean;
  node_ports: {
    server_port: number;
    swarm_port: number;
  }
}

interface NodeListProps {
  nodes: NodeStatus[] | null;
  selectedNode: string | null;
  onNodeSelect: (nodeName: string) => void;
}

const NodeList: React.FC<NodeListProps> = ({ nodes, selectedNode, onNodeSelect }) => {
  return (
    <NodeListContainer>
      <NodeListTitle>Nodes</NodeListTitle>
      {nodes && nodes.length > 0 ? (
        <>
          <Notice>Select a node:</Notice>
          <NodeListUl>
            {nodes.map((node) => (
              <NodeListItem 
                key={node.name} 
                selected={node.name === selectedNode}
                onClick={() => onNodeSelect(node.name)}
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
