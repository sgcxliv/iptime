import React from 'react';
import { Link } from '@tanstack/react-router';
import { Clock, CheckCircle, XCircle, RefreshCw, FileText, File } from 'lucide-react';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { Spinner } from '../UI/Spinner';
import { Job, JobStatus, DocumentType } from '../../types/job';
import { formatDistanceToNow } from 'date-fns';

interface JobsListProps {
  jobs: Job[];
  isLoading: boolean;
  error: Error | null;
}

export function JobsList({ jobs, isLoading, error }: JobsListProps) {
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
        <p>Error loading jobs: {error.message}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <p>No jobs found</p>
      </div>
    );
  }

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return <CheckCircle className="text-green-500" size={16} />;
      case JobStatus.FAILED:
        return <XCircle className="text-red-500" size={16} />;
      case JobStatus.QUEUED:
        return <Clock className="text-gray-500" size={16} />;
      default:
        return <RefreshCw className="text-blue-500 animate-spin" size={16} />;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>;
      case JobStatus.FAILED:
        return <Badge variant="error">Failed</Badge>;
      case JobStatus.QUEUED:
        return <Badge variant="default">Queued</Badge>;
      case JobStatus.FETCHING:
        return <Badge variant="info">Fetching</Badge>;
      case JobStatus.PROCESSING:
        return <Badge variant="info">Processing</Badge>;
      case JobStatus.CHUNKING:
        return <Badge variant="info">Chunking</Badge>;
      case JobStatus.EMBEDDING:
        return <Badge variant="info">Embedding</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getDocumentTypeIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.HTML:
        return <FileText className="text-blue-500" size={16} />;
      case DocumentType.PDF:
        return <File className="text-red-500" size={16} />;
      default:
        return <File className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3">{getStatusIcon(job.status)}</div>
              <div>
                <div className="flex items-center">
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-semibold font-nunitoSans text-gray-900 hover:text-primary-100 mr-2"
                  >
                    {new URL(job.url).hostname}
                  </a>
                  {job.documentType !== DocumentType.UNKNOWN && (
                    <div className="flex items-center">
                      {getDocumentTypeIcon(job.documentType)}
                      <span className="ml-1 text-sm text-gray-500">
                        {job.documentType}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  <span className="mx-2">•</span>
                  {getStatusBadge(job.status)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {job.status === 'completed' && job.document && (
                <Link
                  to="/documents/$documentId"
                  params={{ documentId: job.document.toString() }}
                  className="text-primary-100 hover:text-primary-120"
                >
                  View Document
                </Link>
              )}
              
              {['queued', 'fetching', 'processing', 'chunking', 'embedding'].includes(job.status) && (
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-full bg-primary-100 rounded-full" 
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">{job.progress}%</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
