import React from 'react';
import { Link } from '@tanstack/react-router';
import { FileText, File, ExternalLink, Tag } from 'lucide-react';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { DocumentType } from '../../types/document';

interface DocumentCardProps {
  id: string;
  title: string;
  url: string;
  type: DocumentType;
  createdAt: string;
  groups: { id: string; name: string }[];
}

export function DocumentCard({ id, title, url, type, createdAt, groups }: DocumentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = () => {
    switch (type) {
      case DocumentType.HTML:
        return <FileText className="text-blue-500" />;
      case DocumentType.PDF:
        return <File className="text-red-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="mr-3">{getTypeIcon()}</div>
            <div>
              <Link
                to="/documents/$documentId"
                params={{ documentId: id }}
                className="text-lg font-semibold font-nunitoSans text-gray-900 hover:text-primary-100 line-clamp-1"
              >
                {title}
              </Link>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <span>{formatDate(createdAt)}</span>
                <span className="mx-2">•</span>
                <Badge variant={type === DocumentType.HTML ? 'info' : 'warning'}>
                  {type.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600"
            title="Open original URL"
          >
            <ExternalLink size={18} />
          </a>
        </div>
        
        {groups.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {groups.map(group => (
              <div key={group.id} className="flex items-center text-xs bg-gray-100 rounded-full px-2 py-1">
                <Tag size={12} className="mr-1 text-gray-500" />
                <span>{group.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}