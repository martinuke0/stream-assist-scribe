
import React, { useEffect, useRef, useState } from 'react';

interface StreamingResponseProps {
  text: string;
  isStreaming: boolean;
}

const StreamingResponse: React.FC<StreamingResponseProps> = ({ text, isStreaming }) => {
  const responseRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new content comes in
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div className="relative mt-4 w-full">
      <div 
        ref={responseRef}
        className="p-4 bg-white/10 backdrop-blur-sm border border-gray-300 rounded-lg shadow-sm overflow-y-auto min-h-[150px] max-h-[400px]"
      >
        {text ? (
          <div className="whitespace-pre-wrap">{text}</div>
        ) : (
          <div className="text-muted-foreground italic">
            {isStreaming ? 'Receiving response...' : 'Response will appear here'}
          </div>
        )}
      </div>
      {isStreaming && (
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Streaming</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingResponse;
