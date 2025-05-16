import React from 'react';
import { Card } from '../UI/Card';

interface TextChunksProps {
  chunks: string[];
}

export function TextChunks({ chunks }: TextChunksProps) {
  return (
    <div className="space-y-4">
      {chunks.map((chunk, index) => (
        <Card key={index} className="bg-white">
          <h4 className="font-semibold mb-2">Chunk {index + 1}</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{chunk}</p>
        </Card>
      ))}
    </div>
  );
}