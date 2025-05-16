import React from 'react';
import { Link } from '@tanstack/react-router';
import { FileText, ExternalLink } from 'lucide-react';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { EmptyState } from '../UI/EmptyState';
import { SearchResult } from '../../store/searchStore';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
}

export function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="No results found"
        description={`We couldn't find any documents matching "${query}". Try using different keywords or filters.`}
        icon={<FileText size={24} className="text-gray-400" />}
      />
    );
  }

  const highlightMatch = (text: string, matchTerms: string[]) => {
    let highlightedText = text;
    matchTerms.forEach((term) => {
      const regex = new RegExp(term, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        (match) => `<mark class="bg-yellow-200 px-1 rounded">${match}</mark>`
      );
    });
    return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        Found {results.length} results for "{query}"
      </div>

      {results.map((result) => (
        <Card key={result.chunkId} className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FileText size={18} className="text-gray-400" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <Link
                  to={`/documents/${result.documentId}`}
                  className="text-lg font-medium text-blue-600 hover:underline"
                >
                  {result.documentTitle}
                </Link>
                <Badge className="ml-2" variant="secondary">
                  Score: {Math.round(result.score * 100)}%
                </Badge>
              </div>

              <div className="mt-1 text-sm text-gray-500 flex items-center">
                <a
                  href={result.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center"
                >
                  {result.documentUrl.substring(0, 50)}
                  {result.documentUrl.length > 50 ? '...' : ''}
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </div>

              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {result.highlights && result.highlights.length > 0 ? (
                  result.highlights.map((highlight, idx) => (
                    <div key={idx} className="mb-1">
                      {highlight.texts.map((text, i) => (
                        <span
                          key={i}
                          className={
                            text.type === 'hit' ? 'bg-yellow-200 px-1 rounded' : ''
                          }
                        >
                          {text.value}
                        </span>
                      ))}
                    </div>
                  ))
                ) : (
                  highlightMatch(
                    result.content.substring(0, 200) +
                      (result.content.length > 200 ? '...' : ''),
                    query.split(' ')
                  )
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
