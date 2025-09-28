// Knowledge Graph System
// Manages entity relationships, context search, and semantic embeddings

import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import EntityParser from './entity-parser.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class KnowledgeGraph {
  constructor(dbPath = path.join(__dirname, "knowledge.db")) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("❌ Failed to open database:", err);
      } else {
        console.log("📚 KnowledgeGraph connected at", dbPath);
      }
    });
    this.entityParser = new EntityParser();
  }

  /**
   * Create tables from schema.sql
   */
  async createTables() {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    return new Promise((resolve, reject) => {
      this.db.exec(schema, (err) => {
        if (err) {
          console.error("Failed to create Story IDE tables:", err);
          reject(err);
        } else {
          console.log("✅ Story IDE tables created");
          resolve();
        }
      });
    });
  }

  /**
   * Insert or update a story chunk.
   * Detects conflicts if content changed since last save.
   */
  async insertChunk(storyId, chunk) {
    return new Promise((resolve, reject) => {
      // ✅ Validate required fields
      if (!chunk.id || !chunk.type || !chunk.content) {
        return reject(new Error("❌ insertChunk: Missing required fields (id, type, content)"));
      }

      const stmt = this.db.prepare(`
        INSERT INTO chunks (id, story_id, type, content, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            story_id = excluded.story_id,
            type = excluded.type,
            content = excluded.content,
            metadata = excluded.metadata,
            updated_at = CURRENT_TIMESTAMP
      `);

      stmt.run(
        chunk.id,
        storyId,
        chunk.type,
        JSON.stringify(chunk.content), // ✅ store structured JSON safely
        JSON.stringify(chunk.metadata || {}),
        (err) => {
          if (err) {
            console.error("❌ insertChunk failed:", err);
            reject(err);
          } else {
            console.log(`✅ Chunk saved: ${chunk.id} (${chunk.type})`);
            resolve(chunk);
          }
        }
      );
    });
  }

  /**
   * Fetch chunks for a story
   */
  async getChunks(storyId) {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM chunks WHERE story_id = ?`, [storyId], (err, rows) => {
        if (err) {
          console.error("❌ Query error:", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get chunk by ID for conflict detection
   */
  async getChunkById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM chunks WHERE id = ?';
      
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  // Create or update a story project
  async createProject(brewId, title, description = '') {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO story_projects (brew_id, title, description, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      this.db.run(sql, [brewId, title, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Process document and extract entities/relationships
  async processDocument(projectId, documentText) {
    console.log(`📊 Processing document for project ${projectId}...`);
    
    // Parse entities and relationships
    const parsed = this.entityParser.parseDocument(documentText, projectId);
    
    // Clear existing data for this project
    await this.clearProjectData(projectId);
    
    // Insert entities
    for (const entity of parsed.entities) {
      await this.insertEntity(projectId, entity);
    }
    
    // Insert relationships
    for (const relationship of parsed.relationships) {
      await this.insertRelationship(projectId, relationship);
    }
    
    // Insert chunks
    for (const chunk of parsed.chunks) {
      await this.insertChunk(projectId, chunk);
    }
    
    console.log(`✅ Processed ${parsed.entities.length} entities, ${parsed.relationships.length} relationships, ${parsed.chunks.length} chunks`);
    
    return {
      entities: parsed.entities.length,
      relationships: parsed.relationships.length,
      chunks: parsed.chunks.length
    };
  }

  async clearProjectData(projectId) {
    const tables = ['story_entities', 'story_relationships', 'chunks', 'story_terminology', 'story_edits'];
    
    for (const table of tables) {
      await new Promise((resolve, reject) => {
        this.db.run(`DELETE FROM ${table} WHERE project_id = ?`, [projectId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  async insertEntity(projectId, entity) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO story_entities (project_id, name, type, description, properties, first_mentioned_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const properties = JSON.stringify({
        mentions: entity.mentions,
        context: entity.context
      });
      
      this.db.run(sql, [
        projectId,
        entity.name,
        entity.type,
        entity.context,
        properties,
        entity.firstPosition.toString()
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async insertRelationship(projectId, relationship) {
    // First, get entity IDs
    const entity1Id = await this.getEntityIdByName(projectId, relationship.entity1);
    const entity2Id = await this.getEntityIdByName(projectId, relationship.entity2);
    
    if (!entity1Id || !entity2Id) return; // Skip if entities not found
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO story_relationships (project_id, entity1_id, entity2_id, relationship_type, strength, context)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        projectId,
        entity1Id,
        entity2Id,
        relationship.type,
        relationship.strength,
        relationship.context
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async getEntityIdByName(projectId, name) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id FROM story_entities WHERE project_id = ? AND name = ?`;
      
      this.db.get(sql, [projectId, name], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.id : null);
      });
    });
  }

  // Get project knowledge graph
  async getProjectGraph(projectId) {
    const entities = await this.getProjectEntities(projectId);
    const relationships = await this.getProjectRelationships(projectId);
    
    return {
      nodes: entities.map(entity => ({
        id: entity.id,
        name: entity.name,
        type: entity.type,
        description: entity.description,
        properties: JSON.parse(entity.properties || '{}')
      })),
      edges: relationships.map(rel => ({
        source: rel.entity1_id,
        target: rel.entity2_id,
        type: rel.relationship_type,
        strength: rel.strength,
        context: rel.context
      }))
    };
  }

  async getProjectEntities(projectId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM story_entities WHERE project_id = ? ORDER BY type, name`;
      
      this.db.all(sql, [projectId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getProjectRelationships(projectId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM story_relationships WHERE project_id = ? ORDER BY strength DESC`;
      
      this.db.all(sql, [projectId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Context-aware search for GPT
  async getContextForQuery(projectId, query, limit = 5) {
    // Simple text search for now - can be enhanced with vector embeddings later
    const chunks = await this.searchChunks(projectId, query, limit);
    const relatedEntities = await this.getRelatedEntities(projectId, query);
    
    return {
      relevantChunks: chunks,
      relatedEntities: relatedEntities,
      context: this.buildContextString(chunks, relatedEntities)
    };
  }

  async searchChunks(projectId, query, limit) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM chunks 
        WHERE story_id = ? AND content LIKE ? 
        ORDER BY LENGTH(content) ASC 
        LIMIT ?
      `;
      
      this.db.all(sql, [projectId, `%${query}%`, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getRelatedEntities(projectId, query) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM story_entities 
        WHERE project_id = ? AND (name LIKE ? OR description LIKE ?)
        ORDER BY name
        LIMIT 10
      `;
      
      this.db.all(sql, [projectId, `%${query}%`, `%${query}%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  buildContextString(chunks, entities) {
    let context = '';
    
    if (entities.length > 0) {
      context += 'RELATED ENTITIES:\n';
      entities.forEach(entity => {
        context += `- ${entity.name} (${entity.type}): ${entity.description}\n`;
      });
      context += '\n';
    }
    
    if (chunks.length > 0) {
      context += 'RELEVANT CONTENT:\n';
      chunks.forEach((chunk, index) => {
        context += `[${index + 1}] ${chunk.content.substring(0, 200)}...\n\n`;
      });
    }
    
    return context;
  }

  // Get project by brew ID
  async getProjectByBrewId(brewId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM story_projects WHERE brew_id = ?`;
      
      this.db.get(sql, [brewId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export default KnowledgeGraph;