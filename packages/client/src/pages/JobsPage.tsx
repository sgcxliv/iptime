import React, { useEffect } from 'react';
import { useJobStore } from '../store/jobStore';
import { JobsList } from '../components/Jobs/JobsList';
import { JobFilter } from '../components/Jobs/JobFilter';

export function JobsPage() {
  const { fetchJobs, filters, setFilters } = useJobStore();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, filters]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Processing Jobs</h1>
      </div>

      <JobFilter 
        filters={filters}
        onFilterChange={setFilters}
      />

      <JobsList />
    </div>
  );
}