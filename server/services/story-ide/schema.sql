-- Story IDE Database Schema
-- Comprehensive knowledge graph and entity tracking system

-- Core project/story tracking
CREATE TABLE IF NOT EXISTS story_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brew_id TEXT UNIQUE NOT NULL, -- Links to existing Homebrews table
    title TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata JSON -- Project-level settings, themes, etc.
);

-- Entity types: NPCs, locations, items, events, factions, rules, etc.
CREATE TABLE IF NOT EXISTS story_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'npc', 'location', 'item', 'event', 'faction', 'rule', 'monster', 'spell'
    description TEXT,
    properties JSON, -- Type-specific data (stats, personality, etc.)
    first_mentioned_at TEXT, -- Document position where first introduced
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES story_projects(id) ON DELETE CASCADE
);

-- Relationships between entities
CREATE TABLE IF NOT EXISTS story_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    entity1_id INTEGER NOT NULL,
    entity2_id INTEGER NOT NULL,
    relationship_type TEXT NOT NULL, -- 'allies', 'enemies', 'located_in', 'owns', 'knows', 'part_of'
    strength REAL DEFAULT 1.0, -- Relationship strength (0.0 to 1.0)
    context TEXT, -- Description of the relationship
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES story_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (entity1_id) REFERENCES story_entities(id) ON DELETE CASCADE,
    FOREIGN KEY (entity2_id) REFERENCES story_entities(id) ON DELETE CASCADE
);

-- Document sections/chunks for context search
DROP TABLE IF EXISTS chunks;

CREATE TABLE chunks (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Terminology and consistency tracking
CREATE TABLE IF NOT EXISTS story_terminology (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    term TEXT NOT NULL,
    definition TEXT,
    category TEXT, -- 'name', 'place', 'rule', 'concept'
    canonical_form TEXT, -- Preferred spelling/capitalization
    aliases JSON, -- Alternative spellings/names
    usage_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES story_projects(id) ON DELETE CASCADE
);

-- Edit history and tracked changes
CREATE TABLE IF NOT EXISTS story_edits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    edit_type TEXT NOT NULL, -- 'insert', 'delete', 'replace', 'rewrite'
    position_start INTEGER,
    position_end INTEGER,
    old_content TEXT,
    new_content TEXT,
    suggestion_reason TEXT, -- Why this edit was suggested
    applied BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES story_projects(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_project_type ON story_entities(project_id, type);
CREATE INDEX IF NOT EXISTS idx_entities_name ON story_entities(name);
CREATE INDEX IF NOT EXISTS idx_relationships_entities ON story_relationships(entity1_id, entity2_id);
CREATE INDEX IF NOT EXISTS idx_chunks_project ON story_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_terminology_project ON story_terminology(project_id, term);
