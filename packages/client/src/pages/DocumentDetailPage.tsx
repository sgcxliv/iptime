import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '../components/UI/Button';
import { Spinner } from '../components/UI/Spinner';
import { DocumentViewer } from '../components/Documents/DocumentViewer';
import { useDocument, useUpdateDocumentGroups } from '../api/documents';
import { ChevronLeft, Tag, Trash, ExternalLink } from 'lucide-react';
import { useAddToGroupModal } from '../store/modalStore';

export const Route = createFileRoute('/documents/$documentId')({
  component: DocumentDetailPage,
});

function DocumentDetailPage() {
  const { documentId } = Route.useParams();
  const navigate = useNavigate();
  const { open: openAddToGroupModal } = useAddToGroupModal();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: document, isLoading, error } = useDocument(documentId);
  const updateGroups = useUpdateDocumentGroups();
  
  const handleDelete = async () => {
    if (!document) return;
    
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Call delete API
      await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      navigate({ to: '/documents' });
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleOpenAddToGroupModal = () => {
    if (!document) return;
    
    openAddToGroupModal({
      documentId,
      currentGroups: document.groups.map(g => typeof g === 'string' ? g : g.id)
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" className="text-primary-100" />
      </div>
    );
  }
  
  if (error || !document) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-700">Document Not Found</h2>
        <p className="text-gray-500 mt-2">The document you're looking for doesn't exist or you don't have access.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate({ to: '/documents' })}
        >
          Back to Documents
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ChevronLeft size={16} />}
            onClick={() => navigate({ to: '/documents' })}
          >
            Back
          </Button>
          <h1 className="text-2xl font-semibold font-nunitoSans text-gray-900">
            {document.title}
          </h1>
        </div>
        
        <div className="flex gap-3">
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            <ExternalLink size={14} className="mr-1" />
            Original URL
          </a>
          
          <Button
            variant="outline"
            size="sm"
            icon={<Tag size={16} />}
            onClick={handleOpenAddToGroupModal}
          >
            Manage Groups
          </Button>
          
          <Button
            variant="danger"
            size="sm"
            icon={<Trash size={16} />}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
      
      {document.groups.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Groups:</span>
          <div className="flex flex-wrap gap-2">
            {document.groups.map(group => {
              const groupName = typeof group === 'string' ? group : group.name;
              const groupId = typeof group === 'string' ? group : group.id;
              return (
                <div key={groupId} className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                  <Tag size={12} className="mr-1 text-gray-500" />
                  {groupName}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <DocumentViewer document={document} />
    </div>
  );
}
