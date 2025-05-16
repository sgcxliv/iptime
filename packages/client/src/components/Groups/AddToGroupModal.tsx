import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { useGroups } from '../../api/groups';
import { Spinner } from '../UI/Spinner';
import { CheckCircle2 } from 'lucide-react';

interface AddToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentGroups: string[];
  onSave: (groupIds: string[]) => Promise<void>;
}

export function AddToGroupModal({
  isOpen,
  onClose,
  documentId,
  currentGroups,
  onSave
}: AddToGroupModalProps) {
  const { data: groups = [], isLoading } = useGroups();
  const [selectedGroups, setSelectedGroups] = useState<string[]>(currentGroups || []);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedGroups);
      onClose();
    } catch (error) {
      console.error('Error saving groups:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Groups"
      size="md"
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" className="text-primary-100" />
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            Select the groups you want to add this document to:
          </p>
          
          <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
            {groups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No groups available
              </div>
            ) : (
              groups.map(group => (
                <div
                  key={group.id}
                  className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                    selectedGroups.includes(group.id) ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => handleToggleGroup(group.id)}
                >
                  <div className={`w-5 h-5 rounded border ${
                    selectedGroups.includes(group.id)
                      ? 'bg-primary-100 border-primary-100 flex items-center justify-center'
                      : 'border-gray-300'
                  }`}>
                    {selectedGroups.includes(group.id) && (
                      <CheckCircle2 size={16} className="text-white" />
                    )}
                  </div>
                  <span className="ml-3 font-nunitoSans">{group.name}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}