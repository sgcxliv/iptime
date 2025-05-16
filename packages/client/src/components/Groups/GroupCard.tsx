import React from 'react';
import { Link } from '@tanstack/react-router';
import { Folder, FileText, ChevronRight } from 'lucide-react';
import { Card } from '../UI/Card';
import { Group } from '../../types/group';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <Link
        to="/groups/$groupId"
        params={{ groupId: group.id }}
        className="flex flex-col h-full"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-3 text-primary-100">
              <Folder size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-nunitoSans text-gray-900">
                {group.name}
              </h3>
              {group.description && (
                <p className="text-sm text-gray-500 mt-1">{group.description}</p>
              )}
            </div>
          </div>
          <ChevronRight className="text-gray-400" />
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <FileText size={16} className="mr-2" />
          <span>{group.documents.length} documents</span>
        </div>
        
        {group.parentGroup && (
          <div className="mt-2 text-xs text-gray-400">
            Parent: {group.parentGroup.name}
          </div>
        )}
      </Link>
    </Card>
  );
}