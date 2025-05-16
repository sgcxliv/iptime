import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { IPage } from '../../types/document';

interface PdfViewerProps {
  pages: IPage[];
}

export function PdfViewer({ pages }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  
  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  if (pages.length === 0) {
    return <div className="text-center py-8">No pages available</div>;
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-100 rounded-md p-4 mb-4 max-w-full overflow-hidden">
        {pages[currentPage]?.imageUrl ? (
          <img
            src={pages[currentPage].imageUrl}
            alt={`Page ${currentPage + 1}`}
            className="max-w-full h-auto"
          />
        ) : (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">Image not available</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={prevPage}
          disabled={currentPage === 0}
          icon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>
        
        <span className="px-4 text-sm">
          Page {currentPage + 1} of {pages.length}
        </span>
        
        <Button
          variant="outline"
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          icon={<ChevronRight size={16} />}
        >
          Next
        </Button>
      </div>
      
      <div className="mt-4 w-full">
        <h3 className="text-lg font-semibold mb-2">Extracted Text</h3>
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {pages[currentPage]?.text || 'No text available'}
          </pre>
        </div>
      </div>
    </div>
  );
}