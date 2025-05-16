import React, { useState } from 'react';
import { Tabs } from '../UI/Tabs';
import { HtmlViewer } from './HtmlViewer';
import { PdfViewer } from './PdfViewer';
import { TextChunks } from './TextChunks';
import { Embeddings } from './Embeddings';
import { ProcessedDocument, DocumentType } from '../../types/document';
import { Card } from '../UI/Card';

interface DocumentViewerProps {
  document: ProcessedDocument;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState('content');
  
  const tabs = [
    { id: 'content', label: 'Content' },
    { id: 'text', label: 'Extracted Text' },
    { id: 'chunks', label: 'Text Chunks' },
    { id: 'embeddings', label: 'Embeddings' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'content':
        return document.documentType === DocumentType.HTML 
          ? <HtmlViewer htmlContent={document.htmlContent || ''} /> 
          : <PdfViewer pages={document.pages} />;
      case 'text':
        return (
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <pre className="whitespace-pre-wrap font-mono text-sm">{document.text}</pre>
          </div>
        );
      case 'chunks':
        return <TextChunks chunks={document.chunks.map(c => c.text)} />;
      case 'embeddings':
        return <Embeddings chunks={document.chunks} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        className="mb-4" 
      />
      {renderContent()}
    </Card>
  );
}