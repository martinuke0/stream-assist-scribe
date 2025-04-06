
import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import ActionButtons from '@/components/ActionButtons';
import StreamingResponse from '@/components/StreamingResponse';
import { ActionType, StreamRequest, processStream, streamResponse } from '@/lib/api';

const Index = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const { toast } = useToast();

  const handleAction = useCallback(async (action: ActionType) => {
    if (!input.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter some text to process.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsStreaming(true);
      setActiveAction(action);
      setResponse(''); // Clear previous response

      const request: StreamRequest = {
        input: input.trim(),
        action,
      };

      const stream = await streamResponse(request);

      processStream(
        stream,
        (chunk) => {
          setResponse((prev) => prev + chunk);
        },
        () => {
          setIsStreaming(false);
          setActiveAction(null);
        },
        (error) => {
          console.error('Streaming error:', error);
          toast({
            title: 'Error',
            description: `Failed to process stream: ${error.message}`,
            variant: 'destructive',
          });
          setIsStreaming(false);
          setActiveAction(null);
        }
      );
    } catch (error) {
      console.error('API error:', error);
      toast({
        title: 'API Error',
        description: `Failed to connect to the API: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive',
      });
      setIsStreaming(false);
      setActiveAction(null);
    }
  }, [input, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">AI Text Processor</h1>
          <p className="text-muted-foreground">
            Enter your text and select an action to process it
          </p>
        </header>

        <main className="space-y-6">
          <div>
            <Textarea
              placeholder="Enter your text here..."
              className="min-h-[150px] bg-white/80 backdrop-blur-sm dark:bg-gray-800/80"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Select an Action</h2>
            <ActionButtons onActionClick={handleAction} isLoading={isStreaming} />
          </div>

          {activeAction && (
            <div className="py-2 px-3 bg-muted inline-block rounded-full text-sm">
              Processing: <span className="font-medium capitalize">{activeAction}</span>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-3">Response</h2>
            <StreamingResponse text={response} isStreaming={isStreaming} />
          </div>
        </main>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Connecting to: http://localhost:8765/chat/completions</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
