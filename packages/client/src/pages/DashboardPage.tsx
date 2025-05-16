import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card } from '../components/UI/Card';
import { Spinner } from '../components/UI/Spinner';
import { Button } from '../components/UI/Button';
import { JobsList } from '../components/Jobs/JobsList';
import { useRecentJobs } from '../api/jobs';
import { useRecentDocuments } from '../api/documents';
import { DocumentGrid } from '../components/Documents/DocumentGrid';
import { Plus, Activity, FileText, RefreshCw } from 'lucide-react';
import { useCreateJobModal } from '../store/modalStore';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { open: openCreateJobModal } = useCreateJobModal();
  const { 
    data: recentJobs = [], 
    isLoading: isLoadingJobs,
    error: jobsError,
    refetch: refetchJobs
  } = useRecentJobs();
  
  const { 
    data: recentDocuments = [], 
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments
  } = useRecentDocuments();

  const processingJobsCount = recentJobs.filter(
    job => ['queued', 'fetching', 'processing', 'chunking', 'embedding'].includes(job.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              {isLoadingJobs ? (
                <Spinner size="sm" className="mt-1" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{processingJobsCount}</p>
              )}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Processed Documents</p>
              {isLoadingDocuments ? (
                <Spinner size="sm" className="mt-1" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{recentDocuments.length}</p>
              )}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-900">Process New Document</div>
            <Button
              onClick={openCreateJobModal}
              icon={<Plus size={16} />}
            >
              Add URL
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Recent Jobs */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-nunitoSans text-gray-900">Recent Jobs</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchJobs()}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
        </div>
        <Card>
          <JobsList 
            jobs={recentJobs.slice(0, 5)}
            isLoading={isLoadingJobs}
            error={jobsError}
          />
          {recentJobs.length > 5 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/jobs'}
              >
                View All Jobs
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {/* Recent Documents */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-nunitoSans text-gray-900">Recent Documents</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchDocuments()}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
        </div>
        <DocumentGrid 
          documents={recentDocuments.slice(0, 6)}
          isLoading={isLoadingDocuments}
          error={documentsError}
        />
        {recentDocuments.length > 6 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/documents'}
            >
              View All Documents
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
