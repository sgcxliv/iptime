import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card } from '../components/UI/Card';
import { DocumentGrid } from '../components/Documents/DocumentGrid';
import { useDocuments } from '../api/documents';
import { useGroups } from '../api/groups';
import { Button } from '../components/UI/Button';
import { Spinner } from '../components/UI/Spinner';
import { Filter, Plus, RefreshCw, Search } from 'lucide-react';
import { useCreateJobModal } from '../store/modalStore';
import { DocumentType } from '../types/document';

export const Route = createFileRoute('/documents')({
  component: DocumentsPage,
});

function DocumentsPage() {
  const { open: openCreateJobModal } = useCreateJobModal();
  const [filters, setFilters] = useState({
    type: '',
    group: '',
    search: ''
  });
  
  const { 
    data: documentsData,
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments
  } = useDocuments({
    type: filters.type as DocumentType | undefined,
    group: filters.group,
    search: filters.search
  });
  
  const documents = documentsData?.documents || [];
  
  const { data: groups = [] } = useGroups();
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold font-nunitoSans text-gray-900">Documents</h2>
        <div className="flex space-x-3">
          <Button
            onClick={() => refetchDocuments()}
            variant="outline"
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button
            onClick={openCreateJobModal}
            icon={<Plus size={16} />}
          >
            Add Document
          </Button>
        </div>
      </div>
      
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-100 focus:border-primary-100"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-40">
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary-100 focus:border-primary-100"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="html">HTML</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            
            <div className="w-48">
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary-100 focus:border-primary-100"
                value={filters.group}
                onChange={(e) => handleFilterChange('group', e.target.value)}
              >
                <option value="">All Groups</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>
      
      <DocumentGrid
        documents={documents}
        isLoading={isLoadingDocuments}
        error={documentsError}
      />
      
      {documentsData?.pagination && documentsData.pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            {Array.from({ length: documentsData.pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  page === documentsData.pagination.page
                    ? 'bg-primary-100 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  // Handle pagination
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}