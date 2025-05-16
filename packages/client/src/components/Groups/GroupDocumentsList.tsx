import React from 'react';
import { DocumentCard } from '../Documents/DocumentCard';
import { Spinner } from '../UI/Spinner';
import { ProcessedDocument } from '../../types/document';

interface GroupDocumentsListProps {
  documents: ProcessedDocument[];
  isLoading: boolean;
  error: Error | null;
}

export function GroupDocumentsList({ documents, isLoading, error }: GroupDocumentsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" className="text-primary-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>Error loading documents: {error.message}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <p>No documents in this group</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          id={doc.id}
          title={doc.title}
          url={doc.url}
          type={doc.documentType}
          createdAt={doc.createdAt}
          groups={doc.groups}
        />
      ))}
    </div>
  );
}
