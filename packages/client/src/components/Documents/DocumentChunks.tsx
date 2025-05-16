import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { Spinner } from '../UI/Spinner';
import { EmptyState } from '../UI/EmptyState';
import { FileText } from 'lucide-react';

interface Chunk {
  _id: string;
  content: string;
  metadata: {
    position: number;
    tokens: number;
  };
}

interface DocumentChunksProps {
  documentId: string;
}

export function DocumentChunks({ documentId }: DocumentChunksProps) {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChunks = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/documents/${documentId}/chunks`);
        setChunks(response.data);
      } catch (error) {
        console.error('Error fetching chunks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChunks();
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (chunks.length === 0) {
    return (
      <EmptyState
        title="No chunks found"
        description="This document hasn't been chunked yet or has no content to chunk."
        icon={<FileText size={24} className="text-gray-400" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-2">
        Total Chunks: {chunks.length}
      </div>

      {chunks.map((chunk) => (
        <Card key={chunk._id} className="p-4">
          <div className="flex items-center mb-2">
            <Badge variant="secondary" className="mr-2">
              Chunk {chunk.metadata.position}
            </Badge>
            <span className="text-sm text-gray-500">
              {chunk.metadata.tokens} tokens
            </span>
          </div>
          <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
            {chunk.content}
          </div>
        </Card>
      ))}
    </div>
  );
}