import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Group } from '../../types/group';
import { Link } from '@tanstack/react-router';

interface GroupTreeProps {
  groups: Group[];
  selectedGroupId?: string;
}

interface GroupNodeProps {
  group: Group;
  level: number;
  selectedGroupId?: string;
  groups: Group[];
}

function GroupNode({ group, level, selectedGroupId, groups }: GroupNodeProps) {
  const [expanded, setExpanded] = useState(false);
  
  const childGroups = group.childGroups
    ? group.childGroups.map(childId => {
        const id = typeof childId === 'string' ? childId : childId.id;
        return groups.find(g => g.id === id);
      }).filter(Boolean) as Group[]
    : [];
  
  const hasChildren = childGroups.length > 0;
  const isSelected = group.id === selectedGroupId;
  
  return (
    <div>
      <div 
        className={`
          flex items-center p-2 rounded-md cursor-pointer
          ${isSelected ? 'bg-primary-50 text-primary-100' : 'hover:bg-gray-50'}
        `}
        style={{ paddingLeft: `${(level * 16) + 8}px` }}
      >
        {hasChildren ? (
          <div 
            className="mr-1 text-gray-400"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        ) : (
          <div className="w-4 mr-1"></div>
        )}
        
        <Link
          to="/groups/$groupId"
          params={{ groupId: group.id }}
          className="flex items-center flex-1"
        >
          <div className={`mr-2 ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
            {isSelected ? <FolderOpen size={18} /> : <Folder size={18} />}
          </div>
          <span className="font-nunitoSans">
            {group.name}
          </span>
        </Link>
      </div>
      
      {expanded && hasChildren && (
        <div>
          {childGroups.map((childGroup) => (
            <GroupNode
              key={childGroup.id}
              group={childGroup}
              level={level + 1}
              selectedGroupId={selectedGroupId}
              groups={groups}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupTree({ groups, selectedGroupId }: GroupTreeProps) {
  // Get top-level groups (those without a parent)
  const rootGroups = groups.filter(group => !group.parentGroup);
  
  return (
    <div className="border rounded-md bg-white p-2">
      <div className="mb-2 px-2 py-1 text-sm font-semibold text-gray-500">
        Document Groups
      </div>
      <div>
        {rootGroups.map((group) => (
          <GroupNode
            key={group.id}
            group={group}
            level={0}
            selectedGroupId={selectedGroupId}
            groups={groups}
          />
        ))}
      </div>
    </div>
  );
}
