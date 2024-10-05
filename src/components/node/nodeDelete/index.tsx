import React, { useState } from 'react';
import Button from '../../common/button';
import { CommandResponse } from '../../../hooks/useNodeManagement';
import { DeleteNodeContainer, DeleteNodeText, ErrorMessage } from './Styled';

interface DeleteNodeProps {
  handleDeleteNode: () => Promise<CommandResponse>;
  onCancel: () => void;
  onDeleteSuccess: () => void;
}

const DeleteNode: React.FC<DeleteNodeProps> = ({
  handleDeleteNode,
  onCancel,
  onDeleteSuccess,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      const result = await handleDeleteNode();
      if (result.success) {
        onDeleteSuccess();
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      setErrorMessage('An unexpected error occurred while deleting the node.');
    }
  };

  return (
    <DeleteNodeContainer>
      <DeleteNodeText>
        Are you sure you want to delete this node?
      </DeleteNodeText>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <Button onClick={onCancel} variant="stop">
        Cancel
      </Button>
      <Button onClick={handleDelete} variant="delete">
        Confirm Delete
      </Button>
    </DeleteNodeContainer>
  );
};

export default DeleteNode;
