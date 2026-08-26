import { db } from '../index';
import { aiGateway, ChatMessage } from './aiGateway';

// Math helper for cosine similarity
function cosineSimilarity(A: number[], B: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface RetrievedChunk {
  id: number;
  source_id: number;
  content: string;
  source_title: string;
  source_url?: string;
  score: number;
}

export class RagPipeline {
  
  async search(query: string, topK: number = 3): Promise<RetrievedChunk[]> {
    // 1. Lexical Search (Keyword) using FTS5
    const ftsResults = db.prepare(`
      SELECT 
        c.id, c.source_id, c.content, s.title as source_title, s.url as source_url
      FROM knowledge_chunks_fts f
      JOIN knowledge_chunks c ON c.id = f.rowid
      JOIN knowledge_sources s ON s.id = c.source_id
      WHERE knowledge_chunks_fts MATCH ?
      LIMIT 10
    `).all(query) as Omit<RetrievedChunk, 'score'>[];

    // If FTS fails or is empty, we still want semantic search
    // 2. Semantic Search (Vector)
    const queryEmbedding = await aiGateway.getEmbeddings(query);
    
    // Fetch all embeddings (in a real production app with >10k docs, use a Vector DB like pgvector, LanceDB or Qdrant)
    const allEmbeddings = db.prepare(`
      SELECT e.chunk_id, e.embedding, c.content, c.source_id, s.title as source_title, s.url as source_url
      FROM chunk_embeddings e
      JOIN knowledge_chunks c ON c.id = e.chunk_id
      JOIN knowledge_sources s ON s.id = c.source_id
    `).all() as any[];

    const semanticResults = allEmbeddings.map(row => {
      const vec = JSON.parse(row.embedding) as number[];
      const score = cosineSimilarity(queryEmbedding, vec);
      return {
        id: row.chunk_id,
        source_id: row.source_id,
        content: row.content,
        source_title: row.source_title,
        source_url: row.source_url,
        score
      };
    }).sort((a, b) => b.score - a.score).slice(0, 10);

    // 3. Reranking / Fusion (Simple Reciprocal Rank Fusion)
    const combined = new Map<number, RetrievedChunk>();
    
    ftsResults.forEach((res, rank) => {
      combined.set(res.id, { ...res, score: 1 / (rank + 60) }); // RRF formula
    });

    semanticResults.forEach((res, rank) => {
      if (combined.has(res.id)) {
        const existing = combined.get(res.id)!;
        existing.score += 1 / (rank + 60);
      } else {
        combined.set(res.id, { ...res, score: 1 / (rank + 60) });
      }
    });

    const finalResults = Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return finalResults;
  }

  async generateResponse(query: string, history: ChatMessage[]) {
    // 1. Retrieve knowledge
    const chunks = await this.search(query, 3);
    
    // 2. Build Prompt Context
    let contextStr = chunks.map((c, i) => `[Source ${i+1}: ${c.source_title}]\\n${c.content}`).join('\\n\\n');
    
    if (chunks.length === 0) {
      contextStr = "По данному вопросу в локальной базе знаний судов информации не найдено.";
    }

    const systemPrompt = `
Вы — официальный цифровой ИИ-ассистент Верховного Суда Республики Таджикистан (судебная система).
Ваша задача — предоставлять точные, надежные и исчерпывающие ответы пользователям, опираясь ТОЛЬКО на предоставленный контекст.
Если информации в контексте нет, честно ответьте, что у вас нет точных данных. НЕ выдумывайте (не галлюцинируйте) законы, статьи или сроки.

Контекст из базы знаний:
---
${contextStr}
---
`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: query }
    ];

    // Return both the stream and the citations
    return {
      stream: aiGateway.streamResponse(messages, { temperature: 0.1 }), // Low temp for factual answers
      citations: chunks.map(c => ({ title: c.source_title, url: c.source_url }))
    };
  }
}

export const ragPipeline = new RagPipeline();
