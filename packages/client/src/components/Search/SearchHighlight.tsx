import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchTerms: string[];
  maxLength?: number;
}

export function SearchHighlight({
  text,
  searchTerms,
  maxLength = 200,
}: SearchHighlightProps) {
  // Find the first match position
  const findFirstMatch = () => {
    let firstMatchPos = text.length;
    let matchTerm = '';

    searchTerms.forEach((term) => {
      const pos = text.toLowerCase().indexOf(term.toLowerCase());
      if (pos !== -1 && pos < firstMatchPos) {
        firstMatchPos = pos;
        matchTerm = term;
      }
    });

    return { pos: firstMatchPos, term: matchTerm };
  };

  const { pos, term } = findFirstMatch();
  
  // Calculate start and end positions for the excerpt
  let start = Math.max(0, pos - Math.floor(maxLength / 2));
  let end = Math.min(text.length, start + maxLength);
  
  // Adjust start if we're near the end of the text
  if (end === text.length) {
    start = Math.max(0, end - maxLength);
  }
  
  // Get the excerpt
  let excerpt = text.substring(start, end);
  
  // Add ellipsis if needed
  if (start > 0) {
    excerpt = '...' + excerpt;
  }
  if (end < text.length) {
    excerpt = excerpt + '...';
  }
  
  // Highlight search terms
  const highlightMatches = (text: string) => {
    let result = text;
    searchTerms.forEach((term) => {
      const regex = new RegExp(`(${term})`, 'gi');
      result = result.replace(
        regex,
        '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
      );
    });
    return result;
  };
  
  return (
    <div
      dangerouslySetInnerHTML={{ __html: highlightMatches(excerpt) }}
      className="text-sm text-gray-700"
    />
  );
}
