import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { TextInput } from '../UI/TextInput';
import { Modal } from '../UI/Modal';
import { useCreateJob } from '../../api/jobs';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const createJob = useCreateJob();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    try {
      new URL(url);
      setUrlError('');
    } catch (error) {
      setUrlError('Please enter a valid URL');
      return;
    }
    
    try {
      await createJob.mutateAsync({ url });
      setUrl('');
      onClose();
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Document">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
            Document URL
          </label>
          <TextInput
            id="url"
            type="text"
            placeholder="https://example.com/document"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={urlError}
            icon={<LinkIcon size={18} className="text-gray-400" />}
            required
          />
          {urlError && (
            <p className="text-red-500 text-xs italic mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {urlError}
            </p>
          )}
          
          <p className="text-gray-500 text-sm mt-2">
            Enter the URL of an HTML page or PDF document you want to process.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createJob.isPending} 
            icon={createJob.isPending ? <Spinner size="sm" /> : <Upload size={18} />}
          >
            {createJob.isPending ? 'Processing...' : 'Process Document'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
