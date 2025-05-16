import React, { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  isSearching?: boolean;
}

export function SearchBar({ isSearching = false, ...props }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="search"
        className="block w-full p-4 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search documents, content, metadata..."
        {...props}
      />
      {isSearching && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}