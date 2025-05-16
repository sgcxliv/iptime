import React, { useState, useEffect } from 'react';
import { useSearchStore } from '../store/searchStore';
import { SearchBar } from '../components/Search/SearchBar';
import { SearchResults } from '../components/Search/SearchResults';
import { SearchFilter } from '../components/Search/SearchFilter';

export function SearchPage() {
  const { searchQuery, searchResults, isSearching, performSearch, filters, setFilters } = useSearchStore();
  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery, filters, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Search Documents</h1>
      
      <form onSubmit={handleSearch}>
        <SearchBar 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          isSearching={isSearching}
        />
      </form>

      {searchQuery && (
        <>
          <SearchFilter 
            filters={filters}
            onFilterChange={setFilters}
          />
          
          <div className="mt-4">
            <SearchResults 
              results={searchResults}
              isLoading={isSearching}
              query={searchQuery}
            />
          </div>
        </>
      )}
    </div>
  );
}