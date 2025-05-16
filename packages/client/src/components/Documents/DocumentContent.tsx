import React from 'react';
import { Document } from '../../store/documentStore';
import { Badge } from '../UI/Badge';

interface DocumentContentProps {
  document: Document;
}

export function DocumentContent({ document }: DocumentContentProps) {
  // Function to determine if the content is HTML
  const isHtml = (content: string) => {
    return /<\/?[a-z][\s\S]*>/i.test(content);
  };

  // For HTML content, use an iframe to display rendered content
  if (document.type === 'html' && isHtml(document.content)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Badge variant="info" className="mr-2">
            HTML Document
          </Badge>
          <span className="text-sm text-gray-500">
            Length: {document.content.length} characters
          </span>
        </div>
        
        <div className="border rounded-md overflow-hidden" style={{ height: '600px' }}>
          <iframe
            srcDoc={document.content}
            title={document.title}
            className="w-full h-full"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    );
  }

  // For PDF content that has been extracted as text
  if (document.type === 'pdf') {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Badge variant="info" className="mr-2">
            PDF Document
          </Badge>
          <span className="text-sm text-gray-500">
            Length: {document.content.length} characters
          </span>
        </div>
        
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{document.content}</pre>
        </div>
      </div>
    );
  }

  // Default case for plain text content
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Badge variant="secondary" className="mr-2">
          Plain Text
        </Badge>
        <span className="text-sm text-gray-500">
          Length: {document.content.length} characters
        </span>
      </div>
      
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{document.content}</pre>
      </div>
    </div>
  );
}
