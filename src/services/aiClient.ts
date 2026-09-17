export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Citation {
  title: string;
  url?: string;
}

export class AiClient {
  private baseUrl = '/api/ai';

  async streamChat(
    message: string,
    history: ChatMessage[],
    onToken: (token: string) => void,
    onCitations: (citations: Citation[]) => void,
    onError: (error: string) => void,
    onComplete: (conversationId?: string) => void,
    conversationId?: string
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history, conversationId })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      if (!reader) {
        throw new Error("No reader available");
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.type === 'token') {
                onToken(data.content);
              } else if (data.type === 'citations') {
                onCitations(data.citations);
              } else if (data.type === 'done') {
                onComplete(data.conversationId);
              } else if (data.type === 'error') {
                onError(data.error);
              }
            } catch (e) {
              console.error("Error parsing SSE data", e, dataStr);
            }
          }
        }
      }
    } catch (err: any) {
      onError(err.message || 'Connection failed');
      onComplete();
    }
  }
}

export const aiClient = new AiClient();
