import React, { useState } from 'react';
import Button from '../common/Button';
import NodeConfig from './NodeConfig';
import { UpdateNodeConfigParams, CommandResponse, NodeDetails } from '../../hooks/useNodeManagement';
import { OperationsContainer, NodeTitle, NodeActions, MainContent } from '../../styles/SelectedNodeOperationsStyles';

interface SelectedNodeOperationsProps {
  selectedNode: NodeDetails;
  handleNodeConfigUpdate: ( config: UpdateNodeConfigParams ) => Promise<CommandResponse>;
}

const SelectedNodeOperations: React.FC<SelectedNodeOperationsProps> = ({ selectedNode, handleNodeConfigUpdate }) => {
  const [activeSection, setActiveSection] = useState<'config' | null>('config');

  return (
    <OperationsContainer>
      <NodeTitle>Currently selected node: {selectedNode.name}</NodeTitle>
      <NodeActions>
        <Button onClick={() => setActiveSection('config')} variant='configure'>
          Configure Node
        </Button>
      </NodeActions>
      <MainContent>
        {activeSection === 'config' && (
          <NodeConfig 
            selectedNode={selectedNode}
            onConfigUpdate={handleNodeConfigUpdate}
            onClose={() => setActiveSection(null)}
          />
        )}
      </MainContent>
    </OperationsContainer>
  );
};

export default SelectedNodeOperations;

