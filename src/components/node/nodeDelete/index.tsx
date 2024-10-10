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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
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
    setIsLoading(false);
  };

  return (
    <DeleteNodeContainer>
      <DeleteNodeText>
        Are you sure you want to delete this node?
      </DeleteNodeText>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <Button onClick={onCancel} variant="primary">
        Cancel
      </Button>
      <Button onClick={handleDelete} variant="warning" disabled={isLoading}>
        Confirm Delete
      </Button>
    </DeleteNodeContainer>
  );
};

export default DeleteNode;
