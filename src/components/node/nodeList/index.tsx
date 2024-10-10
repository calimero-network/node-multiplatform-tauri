import React from 'react';
import {
  NodeListContainer,
  NodeListTitle,
  NodeListUl,
  NodeListItem,
  Notice,
  StatusIcon,
} from './Styled';
import { NodeDetails } from '../../../hooks/useNodeManagement';

interface NodeListProps {
  nodes: NodeDetails[];
  selectedNode: NodeDetails | null;
  handleNodeSelect: (nodeName: string) => void;
}

const NodeList: React.FC<NodeListProps> = ({
  nodes,
  selectedNode,
  handleNodeSelect,
}) => {
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
                selected={node.name === selectedNode?.name}
                onClick={() => handleNodeSelect(node.name)}
              >
                <StatusIcon
                  $isRunning={node.is_running}
                  $isExternal={node.external_node}
                />
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
