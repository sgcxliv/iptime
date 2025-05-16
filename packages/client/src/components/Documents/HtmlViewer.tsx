import React from 'react';

interface HtmlViewerProps {
  htmlContent: string;
}

export function HtmlViewer({ htmlContent }: HtmlViewerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="mx-auto text-sm text-gray-500">HTML Preview</div>
      </div>
      <div className="p-4 h-[600px] overflow-y-auto">
        <iframe
          srcDoc={htmlContent}
          title="HTML Preview"
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}