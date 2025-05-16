import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGroupStore } from '../store/groupStore';
import { useDocumentStore } from '../store/documentStore';
import { GroupDocuments } from '../components/Groups/GroupDocuments';
import { GroupMetadata } from '../components/Groups/GroupMetadata';
import { ArrowLeft, Edit, Trash, PlusIcon } from 'lucide-react';
import { EditGroupModal } from '../components/Groups/EditGroupModal';
import { AddDocumentToGroupModal } from '../components/Groups/AddDocumentToGroupModal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { TabGroup, Tab } from '../components/UI/Tabs';

export function GroupDetailPage() {
  const { groupId } = useParams({ from: '/groups/$groupId' });
  const navigate = useNavigate();
  const { currentGroup, fetchGroupById, deleteGroup } = useGroupStore();
  const { fetchDocuments } = useDocumentStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');

  useEffect(() => {
    if (groupId) {
      fetchGroupById(groupId);
      fetchDocuments();
    }
  }, [groupId, fetchGroupById, fetchDocuments]);

  const handleDelete = async () => {
    if (currentGroup) {
      await deleteGroup(currentGroup._id);
      navigate({ to: '/groups' });
    }
  };

  if (!currentGroup) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: '/groups' })}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{currentGroup.name}</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-gray-500">
          {currentGroup.documents.length} documents
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddDocModal(true)}
            className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-md flex items-center gap-1"
          >
            <PlusIcon size={16} />
            <span>Add Document</span>
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-md"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      <TabGroup activeTab={activeTab} onChange={setActiveTab}>
        <Tab id="documents" label="Documents" />
        <Tab id="metadata" label="Metadata" />
      </TabGroup>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'documents' && <GroupDocuments group={currentGroup} />}
        {activeTab === 'metadata' && <GroupMetadata group={currentGroup} />}
      </div>

      {showEditModal && (
        <EditGroupModal
          group={currentGroup}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showAddDocModal && (
        <AddDocumentToGroupModal
          groupId={currentGroup._id}
          isOpen={showAddDocModal}
          onClose={() => setShowAddDocModal(false)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Group"
        message="Are you sure you want to delete this group? Documents in this group will not be deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
