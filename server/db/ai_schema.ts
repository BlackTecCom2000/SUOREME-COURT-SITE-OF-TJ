import type { Database } from 'better-sqlite3';

export const setupAiSchema = (db: Database) => {
  db.exec(`
    -- Sources (Documents, links, acts)
    CREATE TABLE IF NOT EXISTS knowledge_sources (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- 'act', 'law', 'practice', 'info'
      url TEXT,
      language TEXT NOT NULL DEFAULT 'ru',
      status TEXT NOT NULL DEFAULT 'indexed',
      metadata TEXT, -- JSON
      published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Chunks of text
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
      id INTEGER PRIMARY KEY,
      source_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      metadata TEXT, -- JSON (page, section)
      FOREIGN KEY(source_id) REFERENCES knowledge_sources(id) ON DELETE CASCADE
    );

    -- FTS for Chunks
    CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_chunks_fts USING fts5(
      content,
      content='knowledge_chunks',
      content_rowid='id'
    );

    -- Triggers for FTS
    CREATE TRIGGER IF NOT EXISTS knowledge_chunks_ai AFTER INSERT ON knowledge_chunks BEGIN
      INSERT INTO knowledge_chunks_fts(rowid, content) VALUES (new.id, new.content);
    END;
    CREATE TRIGGER IF NOT EXISTS knowledge_chunks_ad AFTER DELETE ON knowledge_chunks BEGIN
      INSERT INTO knowledge_chunks_fts(knowledge_chunks_fts, rowid, content) VALUES('delete', old.id, old.content);
    END;
    CREATE TRIGGER IF NOT EXISTS knowledge_chunks_au AFTER UPDATE ON knowledge_chunks BEGIN
      INSERT INTO knowledge_chunks_fts(knowledge_chunks_fts, rowid, content) VALUES('delete', old.id, old.content);
      INSERT INTO knowledge_chunks_fts(rowid, content) VALUES (new.id, new.content);
    END;

    -- Embeddings (vector representation stored as JSON for JS-side processing)
    CREATE TABLE IF NOT EXISTS chunk_embeddings (
      id INTEGER PRIMARY KEY,
      chunk_id INTEGER NOT NULL UNIQUE,
      embedding TEXT NOT NULL, -- JSON array of floats
      FOREIGN KEY(chunk_id) REFERENCES knowledge_chunks(id) ON DELETE CASCADE
    );

    -- Conversations & Messages
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY, -- uuid
      user_id INTEGER,
      language TEXT DEFAULT 'ru',
      title TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_messages (
      id INTEGER PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL, -- 'user', 'assistant', 'system'
      content TEXT NOT NULL,
      citations TEXT, -- JSON array of source references
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
    );

    -- Telemetry & Feedback
    CREATE TABLE IF NOT EXISTS ai_logs (
      id INTEGER PRIMARY KEY,
      conversation_id TEXT,
      message_id INTEGER,
      type TEXT NOT NULL, -- 'latency', 'feedback', 'error'
      data TEXT, -- JSON (latency metrics, feedback score, etc)
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
