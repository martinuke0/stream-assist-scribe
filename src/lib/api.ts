
/**
 * API service for sending requests to the OpenAI-compatible endpoint
 */

export type ActionType = 'explain' | 'correct' | 'translate' | 'summarize' | 'rewrite' | 'shorten';

export interface StreamRequest {
  input: string;
  action: ActionType;
}

/**
 * Sends a request to the OpenAI-compatible endpoint and returns a ReadableStream
 */
export async function streamResponse({ input, action }: StreamRequest): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch('http://localhost:8765/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // This can be any model, as your endpoint likely ignores it
      messages: [
        {
          role: 'user',
          content: input,
        },
      ],
      stream: true,
      // Add the action as metadata to your request
      metadata: {
        action,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  // The response should be a stream
  return response.body as ReadableStream<Uint8Array>;
}

/**
 * Process the streaming response from the API
 */
export function processStream(
  stream: ReadableStream<Uint8Array>,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): void {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  
  function read() {
    reader.read().then(({ done, value }) => {
      if (done) {
        onDone();
        return;
      }
      
      try {
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Process the chunk - handle the OpenAI streaming format
        const lines = chunk
          .split('\n')
          .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
          
        for (const line of lines) {
          try {
            // Remove the "data: " prefix that OpenAI adds
            const cleanedLine = line.replace(/^data: /, '');
            if (cleanedLine) {
              const parsedLine = JSON.parse(cleanedLine);
              const content = parsedLine.choices?.[0]?.delta?.content || '';
              if (content) {
                onChunk(content);
              }
            }
          } catch (parseError) {
            console.warn('Could not parse line:', line, parseError);
          }
        }
        
        // Continue reading
        read();
      } catch (error) {
        onError(error as Error);
        reader.cancel();
      }
    }).catch(error => {
      onError(error);
      reader.cancel();
    });
  }
  
  read();
}
