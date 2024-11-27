import React, { useEffect, useState } from 'react';
import {
  UpdateNodeConfigParams,
  CommandResponse,
  NodeDetails,
} from '../../../hooks/useNodeManagement';
import {
  OperationsContainer,
  NodeTitle,
  TabContainer,
  Tab,
  MainContent,
} from './Styled';
import NodeControls from '../nodeControls';
import NodeConfig from '../nodeConfig';
import NodeLogs from '../nodeLogs';
import DeleteNode from '../nodeDelete';
import { SectionTypes, TrayAction } from '../../../pages/dashboard';
import MessagePopup, {
  MessagePopupState,
  MessageType,
} from '../../common/popupMessage';

interface NodeOperationsProps {
  selectedNode: NodeDetails;
  handleNodeConfigUpdate: (
    config: UpdateNodeConfigParams
  ) => Promise<CommandResponse>;
  handleNodeStart: (nodeName: string) => Promise<CommandResponse>;
  handleNodeStop: (nodeName: string) => Promise<CommandResponse>;
  handleNodeSelect: (nodeName: string) => void;
  handleOpenAdminDashboard: (nodeName: string) => Promise<CommandResponse>;
  handleNodeDelete: (nodeName: string) => Promise<CommandResponse>;
  trayAction: TrayAction | null;
  setTrayAction: (action: TrayAction | null) => void;
  refreshNodesList: () => void;
}

const NodeOperations: React.FC<NodeOperationsProps> = ({ ...props }) => {
  const [activeSection, setActiveSection] = useState<SectionTypes>('controls');
  const [messagePopup, setMessagePopup] = useState<MessagePopupState>({
    isOpen: false,
    message: '',
    title: '',
    type: MessageType.INFO,
  });

  useEffect(() => {
    if (props.trayAction) {
      setActiveSection(props.trayAction.section);
    }
  }, [props.trayAction]);

  useEffect(() => {
    if (props.selectedNode.external_node) {
      setMessagePopup({
        isOpen: true,
        message: `Node with name ${props.selectedNode.name} is currently running outside of the application. Please stop the node before continuing.`,
        title: 'External Node',
        type: MessageType.ERROR,
      });
    }
  }, [props.selectedNode]);

  const openAdminDashboard = async () => {
    if (props.selectedNode.is_running) {
      await props.handleOpenAdminDashboard(props.selectedNode.name);
    } else {
      setMessagePopup({
        isOpen: true,
        message: 'Node is not running',
        title: 'Error',
        type: MessageType.ERROR,
      });
    }
  };

  return (
    <OperationsContainer>
      <NodeTitle>Currently selected node: {props.selectedNode.name}</NodeTitle>
      <TabContainer>
        <Tab
          active={activeSection === 'controls'}
          onClick={() => setActiveSection('controls')}
        >
          Node Controls
        </Tab>
        <Tab
          active={activeSection === 'config'}
          onClick={() => setActiveSection('config')}
        >
          Configure Node
        </Tab>
        <Tab
          active={activeSection === 'logs'}
          onClick={() => setActiveSection('logs')}
        >
          Node Logs
        </Tab>
        <Tab active={false} onClick={openAdminDashboard}>
          Admin Dashboard
        </Tab>
        <Tab
          active={activeSection === 'delete'}
          onClick={() => setActiveSection('delete')}
        >
          Delete Node
        </Tab>
      </TabContainer>
      <MainContent>
        {activeSection === 'config' && (
          <NodeConfig
            selectedNode={props.selectedNode}
            onConfigUpdate={props.handleNodeConfigUpdate}
            onClose={() => setActiveSection('controls')}
            handleNodeSelect={props.handleNodeSelect}
          />
        )}
        {activeSection === 'controls' && (
          <NodeControls
            selectedNode={props.selectedNode}
            handleNodeSelect={props.handleNodeSelect}
            handleNodeStart={props.handleNodeStart}
            handleNodeStop={props.handleNodeStop}
            action={props.trayAction?.action ?? null}
            setAction={props.setTrayAction}
          />
        )}
        {activeSection === 'logs' && (
          <NodeLogs
            selectedNode={props.selectedNode}
            onClose={() => setActiveSection('controls')}
          />
        )}
        {activeSection === 'delete' && (
          <DeleteNode
            handleDeleteNode={() =>
              props.handleNodeDelete(props.selectedNode.name)
            }
            onCancel={() => setActiveSection('controls')}
            onDeleteSuccess={() => {
              props.handleNodeSelect('');
            }}
          />
        )}
      </MainContent>
      <MessagePopup
        isOpen={messagePopup.isOpen}
        onClose={() => setMessagePopup((prev) => ({ ...prev, isOpen: false }))}
        setSelectedNode={() => props.handleNodeSelect('')}
        isExternalNode={props.selectedNode.external_node}
        refreshNodesList={props.refreshNodesList}
        message={messagePopup.message}
        title={messagePopup.title}
        type={messagePopup.type}
      />
    </OperationsContainer>
  );
};

export default NodeOperations;
