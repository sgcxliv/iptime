import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { useDocumentStore } from '../../store/documentStore';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDocumentModal({ isOpen, onClose }: AddDocumentModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { createDocument, isLoading } = useDocumentStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      // Validate URL
      new URL(url);
      
      await createDocument(url);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Invalid URL');
      } else {
        setError('Failed to add document');
      }
    }
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="add-document-form"
        isLoading={isLoading}
      >
        Add Document
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Document"
      footer={footer}
    >
      <form id="add-document-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Document URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/document.html"
            error={error}
            required
          />
          
          <p className="text-sm text-gray-500">
            Enter the URL of the HTML or PDF document you want to process.
            The document will be fetched, processed, and indexed.
          </p>
        </div>
      </form>
    </Modal>
  );