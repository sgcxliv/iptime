import React from 'react';
import { Document } from '../../store/documentStore';
import { Card } from '../UI/Card';

interface DocumentMetadataProps {
  document: Document;
}

export function DocumentMetadata({ document }: DocumentMetadataProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderMetadataValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">None</span>;
    }

    if (typeof value === 'object') {
      return <pre className="bg-gray-50 p-2 rounded text-xs">{JSON.stringify(value, null, 2)}</pre>;
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value.toString();
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Document Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Title</span>
            <p>{document.title}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Type</span>
            <p>{document.type.toUpperCase()}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Created</span>
            <p>{formatDate(document.createdAt)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Last Updated</span>
            <p>{formatDate(document.updatedAt)}</p>
          </div>
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-500">URL</span>
            <p className="truncate">
              <a 
                href={document.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {document.url}
              </a>
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Extracted Metadata</h3>
        {Object.keys(document.metadata).length === 0 ? (
          <p className="text-gray-500">No metadata available for this document.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(document.metadata).map(([key, value]) => (
              <div key={key}>
                <span className="text-sm font-medium text-gray-500">{key}</span>
                <div className="mt-1">{renderMetadataValue(value)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Document Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Content Length</span>
            <p>{document.content.length} characters</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Chunks</span>
            <p>{document.chunks.length} chunks</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Words (Approx.)</span>
            <p>{document.content.split(/\s+/).length} words</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
