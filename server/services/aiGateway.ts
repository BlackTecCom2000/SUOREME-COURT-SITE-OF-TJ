type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface AiGatewayOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// A generic interface for LLM Providers
export interface LLMProvider {
  name: string;
  generateStream(messages: ChatMessage[], options?: AiGatewayOptions): AsyncGenerator<string, void, unknown>;
  generateEmbeddings(text: string): Promise<number[]>;
}

// Fallback Mock Provider for local dev without keys
class MockProvider implements LLMProvider {
  name = 'mock-local';
  
  async *generateStream(messages: ChatMessage[], options?: AiGatewayOptions) {
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    let response = "Это ответ от локальной fallback модели. ";
    
    if (lastMessage.includes('пошлин') || lastMessage.includes('боҷ')) {
      response += "Госпошлина составляет 2% от цены иска (минимум 80 сомони). ";
    } else if (lastMessage.includes('срок') || lastMessage.includes('мӯҳлат')) {
      response += "Срок подачи апелляции составляет 1 месяц со дня вынесения решения в окончательной форме. ";
    } else {
      response += "Я получил ваш запрос и готов предоставить информацию из базы знаний.";
    }

    const words = response.split(' ');
    for (const word of words) {
      await new Promise(r => setTimeout(r, 50));
      yield word + ' ';
    }
  }

  async generateEmbeddings(text: string) {
    // Return a dummy vector of 128 dims
    return Array(128).fill(0).map(() => Math.random() * 2 - 1);
  }
}

// Basic OpenAI implementation (requires API Key)
class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private apiKey = process.env.OPENAI_API_KEY;

  async *generateStream(messages: ChatMessage[], options?: AiGatewayOptions) {
    if (!this.apiKey) throw new Error("OPENAI_API_KEY is not set");
    
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature ?? 0.3,
        stream: true
      })
    });

    if (!res.ok) throw new Error(`OpenAI Error: ${res.statusText}`);
    
    const reader = res.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) return;

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.choices[0].delta?.content) {
              yield parsed.choices[0].delta.content;
            }
          } catch (e) {
            // ignore parse errors for partial chunks
          }
        }
      }
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.apiKey) throw new Error("OPENAI_API_KEY is not set");
    
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });
    
    const data = await res.json();
    return data.data[0].embedding;
  }
}

// Ollama local provider for Qwen and other models
class OllamaProvider implements LLMProvider {
  name = 'ollama';
  private baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  private chatModel = process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:3b';
  private embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

  async *generateStream(messages: ChatMessage[], options?: AiGatewayOptions) {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || this.chatModel,
        messages,
        options: {
          temperature: options?.temperature ?? 0.3,
          num_predict: options?.maxTokens ?? 512,
        },
        stream: true
      })
    });

    if (!res.ok) throw new Error(`Ollama Error: ${res.statusText}`);
    
    const reader = res.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) return;

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            yield parsed.message.content;
          }
        } catch (e) {
          // ignore parse errors for partial chunks
        }
      }
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: text,
        model: this.embedModel
      })
    });
    
    if (!res.ok) throw new Error(`Ollama Embedding Error: ${res.statusText}`);
    const data = await res.json();
    return data.embedding;
  }
}

class AiGateway {
  private providers: Map<string, LLMProvider> = new Map();
  private primaryProvider: string;
  private fallbackProvider: string;

  constructor() {
    this.providers.set('mock', new MockProvider());
    this.providers.set('ollama', new OllamaProvider());
    
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider());
      // We will prefer Ollama as primary if available, otherwise fallback to OpenAI or mock
    }
    
    this.primaryProvider = 'ollama';
    this.fallbackProvider = 'mock';
  }

  // Model Routing logic
  private getProviderForQuery(complexity: 'simple' | 'complex' | 'legal'): LLMProvider {
    // In a real scenario, we might route to a specific model based on complexity
    const provider = this.providers.get(this.primaryProvider);
    return provider || this.providers.get(this.fallbackProvider)!;
  }

  async *streamResponse(messages: ChatMessage[], options?: AiGatewayOptions) {
    const provider = this.getProviderForQuery('legal');
    try {
      yield* provider.generateStream(messages, options);
    } catch (err) {
      console.error(`Provider ${provider.name} failed, falling back to ${this.fallbackProvider}`);
      const fallback = this.providers.get(this.fallbackProvider)!;
      yield* fallback.generateStream(messages, options);
    }
  }

  async getEmbeddings(text: string): Promise<number[]> {
    const provider = this.getProviderForQuery('simple');
    try {
      return await provider.generateEmbeddings(text);
    } catch (err) {
      return await this.providers.get(this.fallbackProvider)!.generateEmbeddings(text);
    }
  }
}

export const aiGateway = new AiGateway();
