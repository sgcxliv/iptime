import React, { useEffect, useState } from 'react';
import { useGroupStore } from '../store/groupStore';
import { GroupsList } from '../components/Groups/GroupsList';
import { GroupFilter } from '../components/Groups/GroupFilter';
import { AddGroupModal } from '../components/Groups/AddGroupModal';
import { PlusIcon } from 'lucide-react';

export function GroupsPage() {
  const { fetchGroups, filters, setFilters } = useGroupStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, filters]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <PlusIcon size={16} />
          <span>Create Group</span>
        </button>
      </div>

      <GroupFilter 
        filters={filters}
        onFilterChange={setFilters}
      />

      <GroupsList />

      {showAddModal && (
        <AddGroupModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}