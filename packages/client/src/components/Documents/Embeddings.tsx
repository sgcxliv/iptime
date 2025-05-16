import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { IChunk } from '../../types/document';

interface EmbeddingsProps {
  chunks: IChunk[];
}

export function Embeddings({ chunks }: EmbeddingsProps) {
  const [expandedChunk, setExpandedChunk] = useState<number | null>(null);
  
  const toggleChunk = (index: number) => {
    setExpandedChunk(expandedChunk === index ? null : index);
  };
  
  return (
    <div className="space-y-4">
      {chunks.map((chunk, index) => (
        <Card key={index} className="bg-white">
          <div className="flex flex-col">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleChunk(index)}
            >
              <h4 className="font-semibold">Chunk {index + 1}</h4>
              <span className="text-sm text-gray-500">
                {expandedChunk === index ? 'Hide' : 'Show'} Embedding
              </span>
            </div>
            
            <p className="text-gray-700 mt-2 mb-3 whitespace-pre-wrap">{chunk.text}</p>
            
            {expandedChunk === index && chunk.embedding && (
              <div className="mt-2 border-t pt-3">
                <h5 className="text-sm font-semibold mb-2">Embedding Vector</h5>
                <div className="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto">
                  <div className="flex flex-wrap gap-1">
                    {chunk.embedding.slice(0, 20).map((value, i) => (
                      <span key={i} className="whitespace-nowrap">
                        {value.toFixed(4)}{i < 19 ? ',' : '...'}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-gray-500">
                    {chunk.embedding.length} dimensions
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
