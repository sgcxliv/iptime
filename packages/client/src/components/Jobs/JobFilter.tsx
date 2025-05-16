import React from 'react';
import { Filter } from 'lucide-react';
import { Select } from '../UI/Select';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';

interface JobFilterProps {
  filters: {
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  onFilterChange: (filters: any) => void;
}

export function JobFilter({ filters, onFilterChange }: JobFilterProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value === 'all' ? undefined : value });
  };

  const handleReset = () => {
    onFilterChange({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Filter size={18} className="text-gray-500 mr-2" />
          <span className="font-medium">Filters</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {showFilters && (
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Status"
              name="status"
              value={filters.status || 'all'}
              onChange={handleChange}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'queued', label: 'Queued' },
                { value: 'fetching', label: 'Fetching' },
                { value: 'processing', label: 'Processing' },
                { value: 'chunking', label: 'Chunking' },
                { value: 'embedding', label: 'Embedding' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
              ]}
            />

            <Input
              label="Search URL"
              name="search"
              value={filters.search || ''}
              onChange={handleChange}
              placeholder="Enter URL to search"
            />

            <Select
              label="Sort By"
              name="sortBy"
              value={filters.sortBy || 'createdAt'}
              onChange={handleChange}
              options={[
                { value: 'createdAt', label: 'Created Date' },
                { value: 'updatedAt', label: 'Updated Date' },
                { value: 'status', label: 'Status' },
              ]}
            />
          </div>

          <div className="mt-4 flex justify-between">
            <Select
              name="sortOrder"
              value={filters.sortOrder || 'desc'}
              onChange={handleChange}
              options={[
                { value: 'desc', label: 'Descending' },
                { value: 'asc', label: 'Ascending' },
              ]}
              className="w-40"
            />

            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
