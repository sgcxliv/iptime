import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { TextInput } from '../UI/TextInput';
import { Group } from '../../types/group';
import { useGroups } from '../../api/groups';

interface GroupFormProps {
  initialData?: Partial<Group>;
  onSubmit: (data: Partial<Group>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function GroupForm({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting
}: GroupFormProps) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [parentGroupId, setParentGroupId] = useState<string | undefined>(
    initialData.parentGroup ? 
      typeof initialData.parentGroup === 'string' ? 
        initialData.parentGroup : 
        initialData.parentGroup.id
      : undefined
  );
  
  const { data: groups = [] } = useGroups();
  
  // Filter out the current group and its children from possible parent groups to prevent circular references
  const availableParentGroups = initialData.id
    ? groups.filter(group => 
        group.id !== initialData.id && 
        !isDescendant(group, initialData.id as string)
      )
    : groups;
  
  function isDescendant(group: Group, targetId: string): boolean {
    if (!group.childGroups || group.childGroups.length === 0) return false;
    
    for (const child of group.childGroups) {
      const childId = typeof child === 'string' ? child : child.id;
      if (childId === targetId) return true;
      
      const childGroup = groups.find(g => g.id === childId);
      if (childGroup && isDescendant(childGroup, targetId)) return true;
    }
    
    return false;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      name,
      description,
      parentGroup: parentGroupId
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <TextInput
          label="Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          required
        />
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description (optional)"
            className="w-full rounded-md shadow-sm border-gray-300 focus:border-primary-100 focus:ring focus:ring-primary-100 focus:ring-opacity-50"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="parentGroup">
            Parent Group
          </label>
          <select
            id="parentGroup"
            value={parentGroupId || ''}
            onChange={(e) => setParentGroupId(e.target.value || undefined)}
            className="w-full rounded-md shadow-sm border-gray-300 focus:border-primary-100 focus:ring focus:ring-primary-100 focus:ring-opacity-50"
          >
            <option value="">None</option>
            {availableParentGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : initialData.id
            ? 'Update Group'
            : 'Create Group'
          }
        </Button>
      </div>
    </form>
  );
}