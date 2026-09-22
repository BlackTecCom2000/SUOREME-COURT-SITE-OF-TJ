import { Router } from 'express';
import { ragPipeline } from '../services/ragPipeline';
import { ChatMessage } from '../services/aiGateway';
import { db } from '../index';
import { aiChatLimiter, indexLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/chat', aiChatLimiter(), async (req, res) => {
  try {
    const { message, history = [], conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // In a real app, validate history array structure
    const validHistory: ChatMessage[] = history.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const { stream, citations } = await ragPipeline.generateResponse(message, validHistory);
    
    // 1. Send Citations immediately so UI can display them while generating
    res.write(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`);

    // 2. Stream tokens
    let fullContent = '';
    for await (const chunk of stream) {
      fullContent += chunk;
      // Send token to client
      res.write(`data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`);
    }

    // 3. Save to Database (background)
    try {
      const convId = conversationId || 'new-' + Date.now();
      // Only insert if it doesn't exist
      db.prepare(`INSERT OR IGNORE INTO ai_conversations (id, title) VALUES (?, ?)`).run(convId, 'Chat ' + new Date().toISOString());
      
      const insertMsg = db.prepare(`INSERT INTO ai_messages (conversation_id, role, content, citations) VALUES (?, ?, ?, ?)`);
      // Save User Message
      insertMsg.run(convId, 'user', message, null);
      // Save AI Message
      insertMsg.run(convId, 'assistant', fullContent, JSON.stringify(citations));
      
      res.write(`data: ${JSON.stringify({ type: 'done', conversationId: convId })}\n\n`);
    } catch (dbErr) {
      console.error('Error saving message to DB:', dbErr);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    }
    
    res.end();
  } catch (error) {
    console.error('AI Chat Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Internal Server Error' })}\n\n`);
      res.end();
    }
  }
});

// Admin endpoint to index knowledge
router.post('/index-knowledge', indexLimiter(), async (req, res) => {
  const { title, content, type = 'info', url = '' } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });

  try {
    const insertSource = db.prepare(`INSERT INTO knowledge_sources (title, type, url) VALUES (?, ?, ?)`);
    const sourceResult = insertSource.run(title, type, url);
    const sourceId = sourceResult.lastInsertRowid;

    // Very naive chunking by paragraphs
    const chunks = content.split('\n\n').filter((c: string) => c.trim().length > 20);
    
    const insertChunk = db.prepare(`INSERT INTO knowledge_chunks (source_id, content, chunk_index) VALUES (?, ?, ?)`);
    const insertEmbedding = db.prepare(`INSERT INTO chunk_embeddings (chunk_id, embedding) VALUES (?, ?)`);

    // Process chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const chunkRes = insertChunk.run(sourceId, chunkText, i);
      const chunkId = chunkRes.lastInsertRowid;
      
      // Get embedding from AI Gateway
      const { aiGateway } = await import('../services/aiGateway');
      const vector = await aiGateway.getEmbeddings(chunkText);
      
      insertEmbedding.run(chunkId, JSON.stringify(vector));
    }

    res.json({ success: true, sourceId, chunks: chunks.length });
  } catch (err) {
    console.error('Index Error:', err);
    res.status(500).json({ error: 'Failed to index' });
  }
});

export { router as aiRouter };
