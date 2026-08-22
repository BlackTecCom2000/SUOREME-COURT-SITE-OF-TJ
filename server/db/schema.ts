import Database from 'better-sqlite3';

export function initSchema(db: Database.Database) {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    -- ─────────────────────────────────────────
    -- USERS & ROLES
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY,
      email        TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name         TEXT NOT NULL,
      role         TEXT NOT NULL DEFAULT 'editor',
      avatar_url   TEXT,
      disabled     INTEGER NOT NULL DEFAULT 0,
      last_login   TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- REGIONS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS regions (
      id           INTEGER PRIMARY KEY,
      slug         TEXT UNIQUE NOT NULL,
      name_ru      TEXT NOT NULL,
      name_tj      TEXT NOT NULL,
      name_en      TEXT,
      short_ru     TEXT,
      short_tj     TEXT,
      short_en     TEXT,
      color_hex    TEXT NOT NULL DEFAULT '#b8966a',
      color_glow   TEXT NOT NULL DEFAULT 'rgba(184,150,106,0.3)',
      description_ru TEXT,
      description_tj TEXT,
      description_en TEXT,
      sort_order   INTEGER DEFAULT 0,
      active       INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- COURTS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS courts (
      id           INTEGER PRIMARY KEY,
      slug         TEXT UNIQUE NOT NULL,
      name_ru      TEXT NOT NULL,
      name_tj      TEXT NOT NULL,
      name_en      TEXT,
      short_ru     TEXT,
      short_tj     TEXT,
      short_en     TEXT,
      region_id    INTEGER REFERENCES regions(id),
      court_type   TEXT NOT NULL DEFAULT 'district',
      city_ru      TEXT,
      city_tj      TEXT,
      address_ru   TEXT,
      address_tj   TEXT,
      address_en   TEXT,
      phone        TEXT,
      email        TEXT,
      website      TEXT,
      domain       TEXT,
      latitude     REAL,
      longitude    REAL,
      status       TEXT NOT NULL DEFAULT 'normal',
      is_military  INTEGER NOT NULL DEFAULT 0,
      active       INTEGER NOT NULL DEFAULT 1,
      latest_news_ru TEXT,
      latest_news_tj TEXT,
      latest_news_en TEXT,
      latest_news_date TEXT,
      svg_x        REAL,
      svg_y        REAL,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- CONTENT (news, pages, articles, etc.)
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS content (
      id           INTEGER PRIMARY KEY,
      type         TEXT NOT NULL,
      slug         TEXT NOT NULL,
      title_ru     TEXT NOT NULL,
      title_tj     TEXT,
      title_en     TEXT,
      excerpt_ru   TEXT,
      excerpt_tj   TEXT,
      excerpt_en   TEXT,
      body_ru      TEXT,
      body_tj      TEXT,
      body_en      TEXT,
      seo_title    TEXT,
      seo_desc     TEXT,
      og_image     TEXT,
      cover_image  TEXT,
      category     TEXT,
      region_id    INTEGER REFERENCES regions(id),
      author_id    INTEGER REFERENCES users(id),
      featured     INTEGER NOT NULL DEFAULT 0,
      status       TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      scheduled_at TEXT,
      deleted_at   TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type, slug)
    );

    -- ─────────────────────────────────────────
    -- JUDICIAL ACTS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS judicial_acts (
      id           INTEGER PRIMARY KEY,
      doc_number   TEXT,
      doc_type     TEXT NOT NULL DEFAULT 'resolution',
      title_ru     TEXT NOT NULL,
      title_tj     TEXT,
      title_en     TEXT,
      collegium    TEXT,
      court_id     INTEGER REFERENCES courts(id),
      case_number  TEXT,
      act_date     TEXT,
      category     TEXT,
      file_path    TEXT,
      file_name    TEXT,
      file_size    INTEGER,
      tags         TEXT,
      keywords     TEXT,
      status       TEXT NOT NULL DEFAULT 'published',
      published_at TEXT DEFAULT CURRENT_TIMESTAMP,
      author_id    INTEGER REFERENCES users(id),
      deleted_at   TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- ANNOUNCEMENTS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS announcements (
      id           INTEGER PRIMARY KEY,
      title_ru     TEXT NOT NULL,
      title_tj     TEXT,
      title_en     TEXT,
      body_ru      TEXT,
      body_tj      TEXT,
      body_en      TEXT,
      attachment   TEXT,
      priority     INTEGER NOT NULL DEFAULT 0,
      important    INTEGER NOT NULL DEFAULT 0,
      active       INTEGER NOT NULL DEFAULT 1,
      expires_at   TEXT,
      author_id    INTEGER REFERENCES users(id),
      deleted_at   TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- HOMEPAGE SECTIONS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS homepage_sections (
      id           INTEGER PRIMARY KEY,
      section_key  TEXT UNIQUE NOT NULL,
      title_ru     TEXT,
      title_tj     TEXT,
      title_en     TEXT,
      content_json TEXT,
      visible      INTEGER NOT NULL DEFAULT 1,
      sort_order   INTEGER NOT NULL DEFAULT 0,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- MENUS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS menus (
      id           INTEGER PRIMARY KEY,
      slug         TEXT UNIQUE NOT NULL,
      name         TEXT NOT NULL,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id           INTEGER PRIMARY KEY,
      menu_id      INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
      parent_id    INTEGER REFERENCES menu_items(id),
      label_ru     TEXT NOT NULL,
      label_tj     TEXT,
      label_en     TEXT,
      url          TEXT,
      page_slug    TEXT,
      target       TEXT DEFAULT '_self',
      visible      INTEGER NOT NULL DEFAULT 1,
      sort_order   INTEGER NOT NULL DEFAULT 0
    );

    -- ─────────────────────────────────────────
    -- MEDIA
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS media (
      id           INTEGER PRIMARY KEY,
      file_name    TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path    TEXT NOT NULL,
      file_url     TEXT NOT NULL,
      mime_type    TEXT NOT NULL,
      file_size    INTEGER NOT NULL,
      width        INTEGER,
      height       INTEGER,
      alt_text     TEXT,
      caption      TEXT,
      title        TEXT,
      description  TEXT,
      category     TEXT,
      uploader_id  INTEGER REFERENCES users(id),
      deleted_at   TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- APPEALS (citizen requests)
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS appeals (
      id           INTEGER PRIMARY KEY,
      ref_number   TEXT UNIQUE,
      full_name    TEXT NOT NULL,
      phone        TEXT NOT NULL,
      email        TEXT,
      subject      TEXT,
      message      TEXT NOT NULL,
      attachment   TEXT,
      status       TEXT NOT NULL DEFAULT 'new',
      assigned_to  INTEGER REFERENCES users(id),
      internal_note TEXT,
      answered_at  TEXT,
      closed_at    TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- CONTACT INFO
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS contact_info (
      id           INTEGER PRIMARY KEY,
      key          TEXT UNIQUE NOT NULL,
      value_ru     TEXT,
      value_tj     TEXT,
      value_en     TEXT,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- RECEPTION SCHEDULE
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS reception_schedule (
      id           INTEGER PRIMARY KEY,
      official_ru  TEXT NOT NULL,
      official_tj  TEXT,
      official_en  TEXT,
      position_ru  TEXT,
      position_tj  TEXT,
      position_en  TEXT,
      days_ru      TEXT,
      days_tj      TEXT,
      time_range   TEXT,
      method_ru    TEXT,
      method_tj    TEXT,
      active       INTEGER NOT NULL DEFAULT 1,
      sort_order   INTEGER NOT NULL DEFAULT 0,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- SITE SETTINGS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS site_settings (
      id           INTEGER PRIMARY KEY,
      key          TEXT UNIQUE NOT NULL,
      value        TEXT,
      label        TEXT,
      type         TEXT DEFAULT 'text',
      group_name   TEXT DEFAULT 'general',
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- REVISIONS
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS revisions (
      id           INTEGER PRIMARY KEY,
      object_type  TEXT NOT NULL,
      object_id    INTEGER NOT NULL,
      data_json    TEXT NOT NULL,
      author_id    INTEGER REFERENCES users(id),
      summary      TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- AUDIT LOG
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS audit_log (
      id           INTEGER PRIMARY KEY,
      user_id      INTEGER REFERENCES users(id),
      user_name    TEXT,
      action       TEXT NOT NULL,
      object_type  TEXT NOT NULL,
      object_id    INTEGER,
      object_title TEXT,
      old_status   TEXT,
      new_status   TEXT,
      ip_address   TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- PUBLICATION SCHEDULE
    -- ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS publication_schedule (
      id           INTEGER PRIMARY KEY,
      object_type  TEXT NOT NULL,
      object_id    INTEGER NOT NULL,
      scheduled_at TEXT NOT NULL,
      processed    INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ─────────────────────────────────────────
    -- INDEXES
    -- ─────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_content_type_status ON content(type, status);
    CREATE INDEX IF NOT EXISTS idx_content_slug ON content(type, slug);
    CREATE INDEX IF NOT EXISTS idx_courts_region ON courts(region_id);
    CREATE INDEX IF NOT EXISTS idx_acts_status ON judicial_acts(status);
    CREATE INDEX IF NOT EXISTS idx_appeals_status ON appeals(status);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_revisions_object ON revisions(object_type, object_id);
  `);
}
