import React from 'react';
import { Filter } from 'lucide-react';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { useGroupStore } from '../../store/groupStore';

interface SearchFilterProps {
  filters: {
    documentType?: string;
    groupId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (filters: any) => void;
}

export function SearchFilter({ filters, onFilterChange }: SearchFilterProps) {
  const { groups } = useGroupStore();
  const [showFilters, setShowFilters] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value === 'all' ? undefined : value });
  };

  const handleReset = () => {
    onFilterChange({});
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Document Type"
              name="documentType"
              value={filters.documentType || 'all'}
              onChange={handleChange}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'html', label: 'HTML' },
                { value: 'pdf', label: 'PDF' },
              ]}
            />

            <Select
              label="Group"
              name="groupId"
              value={filters.groupId || 'all'}
              onChange={handleChange}
              options={[
                { value: 'all', label: 'All Groups' },
                ...groups.map((group) => ({
                  value: group._id,
                  label: group.name,
                })),
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}