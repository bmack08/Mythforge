// Mythwright AI Response Caching System - Intelligent Caching for Cost Optimization
import crypto from 'crypto';
import type { AIGenerationRequest, AIGenerationResponse } from './index.js';

// ============================================================================
// CACHE CONFIGURATION & TYPES
// ============================================================================

export interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number; // Time to live
  maxEntries: number; // Maximum cache entries
  compressionEnabled: boolean;
  persistToDisk: boolean;
  diskCachePath?: string;
  cleanupIntervalMs: number;
  hitRateThreshold: number; // Minimum hit rate to keep cache active
}

export interface CacheEntry {
  key: string;
  response: AIGenerationResponse;
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
  size: number; // Size in bytes
  ttl: number; // TTL in seconds
  tags: string[]; // For cache invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  totalSize: number;
  averageResponseSize: number;
  oldestEntry?: Date;
  newestEntry?: Date;
  topHits: Array<{ key: string; hits: number; lastAccessed: Date }>;
  costSavings: number; // Estimated cost savings from cache hits
}

export interface CacheKey {
  contentType: string;
  promptHash: string;
  contextHash?: string;
  modelSettings: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

// ============================================================================
// CACHE MANAGER CLASS
// ============================================================================

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer?: NodeJS.Timeout;
  
  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      enabled: process.env.AI_CACHING_ENABLED === 'true',
      ttlSeconds: parseInt(process.env.AI_CACHE_TTL_SECONDS || '3600'), // 1 hour default
      maxEntries: parseInt(process.env.AI_CACHE_MAX_ENTRIES || '1000'),
      compressionEnabled: process.env.AI_CACHE_COMPRESSION === 'true',
      persistToDisk: process.env.AI_CACHE_PERSIST === 'true',
      diskCachePath: process.env.AI_CACHE_PATH || './cache/ai-responses',
      cleanupIntervalMs: parseInt(process.env.AI_CACHE_CLEANUP_INTERVAL || '300000'), // 5 minutes
      hitRateThreshold: parseFloat(process.env.AI_CACHE_HIT_RATE_THRESHOLD || '0.3'), // 30%
      ...config
    };
    
    this.initializeStats();
    
    if (this.config.enabled) {
      this.startCleanupTimer();
      this.loadFromDisk();
    }
  }
  
  private initializeStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      totalSize: 0,
      averageResponseSize: 0,
      topHits: [],
      costSavings: 0
    };
  }
  
  // ============================================================================
  // CACHE KEY GENERATION
  // ============================================================================
  
  private generateCacheKey(request: AIGenerationRequest): string {
    const keyData: CacheKey = {
      contentType: request.type,
      promptHash: this.hashString(request.prompt),
      contextHash: request.context ? this.hashString(JSON.stringify(request.context)) : undefined,
      modelSettings: {
        model: request.options?.model,
        temperature: request.options?.temperature,
        maxTokens: request.options?.maxTokens
      }
    };
    
    return this.hashString(JSON.stringify(keyData));
  }
  
  private hashString(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
  }
  
  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================
  
  async get(request: AIGenerationRequest): Promise<AIGenerationResponse | null> {
    if (!this.config.enabled) {
      return null;
    }
    
    const key = this.generateCacheKey(request);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Check if entry is expired
    const now = new Date();
    const ageSeconds = (now.getTime() - entry.timestamp.getTime()) / 1000;
    
    if (ageSeconds > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    
    // Update global statistics
    this.stats.hits++;
    this.updateHitRate();
    
    // Estimate cost savings
    const estimatedCost = this.estimateGenerationCost(request, entry.response);
    this.stats.costSavings += estimatedCost;
    
    console.log(`💾 Cache hit for ${request.type} (key: ${key.substring(0, 8)}...)`);
    
    // Return a copy of the cached response with updated metadata
    return {
      ...entry.response,
      metadata: {
        ...entry.response.metadata,
        cached: true,
        cacheKey: key,
        cacheTimestamp: entry.timestamp,
        cacheAccessCount: entry.accessCount
      }
    };
  }
  
  async set(request: AIGenerationRequest, response: AIGenerationResponse): Promise<void> {
    if (!this.config.enabled || !response.success) {
      return;
    }
    
    const key = this.generateCacheKey(request);
    const now = new Date();
    
    // Calculate response size
    const responseSize = this.calculateResponseSize(response);
    
    // Check cache size limits
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldestEntries(Math.floor(this.config.maxEntries * 0.1)); // Remove 10%
    }
    
    // Generate cache tags for invalidation
    const tags = this.generateCacheTags(request, response);
    
    const entry: CacheEntry = {
      key,
      response: { ...response }, // Store a copy
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
      size: responseSize,
      ttl: this.calculateTTL(request, response),
      tags
    };
    
    this.cache.set(key, entry);
    
    // Update statistics
    this.updateCacheStats();
    
    console.log(`💾 Cached ${request.type} response (key: ${key.substring(0, 8)}..., size: ${responseSize} bytes, TTL: ${entry.ttl}s)`);
    
    // Persist to disk if enabled
    if (this.config.persistToDisk) {
      this.saveToDisk();
    }
  }
  
  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================
  
  private calculateTTL(request: AIGenerationRequest, response: AIGenerationResponse): number {
    let ttl = this.config.ttlSeconds;
    
    // Adjust TTL based on content type
    const ttlMultipliers: Record<string, number> = {
      'description': 0.5, // Descriptions change more frequently
      'npc': 1.0,         // NPCs are fairly stable
      'statblock': 1.5,   // Stat blocks are very stable
      'magicitem': 1.2,   // Magic items are stable
      'encounter': 0.8    // Encounters might need adjustments
    };
    
    const multiplier = ttlMultipliers[request.type] || 1.0;
    ttl = Math.floor(ttl * multiplier);
    
    // Adjust based on generation cost (expensive generations cached longer)
    if (response.metadata.cost > 0.01) {
      ttl = Math.floor(ttl * 1.5);
    }
    
    // Adjust based on model complexity
    if (response.metadata.model?.includes('gpt-4')) {
      ttl = Math.floor(ttl * 1.3);
    }
    
    return Math.max(300, Math.min(ttl, 86400)); // Min 5 minutes, max 24 hours
  }
  
  private generateCacheTags(request: AIGenerationRequest, response: AIGenerationResponse): string[] {
    const tags: string[] = [];
    
    // Content type tag
    tags.push(`type:${request.type}`);
    
    // Model tag
    if (response.metadata.model) {
      tags.push(`model:${response.metadata.model}`);
    }
    
    // Complexity tag
    if (response.metadata.modelSelection?.complexity) {
      tags.push(`complexity:${response.metadata.modelSelection.complexity.estimatedComplexity}`);
    }
    
    // Context tags
    if (request.context?.systemBudget) {
      tags.push(`level:${request.context.systemBudget.partyLevel}`);
      tags.push(`difficulty:${request.context.systemBudget.difficulty}`);
    }
    
    return tags;
  }
  
  private calculateResponseSize(response: AIGenerationResponse): number {
    return JSON.stringify(response).length * 2; // Rough estimate (UTF-16)
  }
  
  private estimateGenerationCost(request: AIGenerationRequest, response: AIGenerationResponse): number {
    // Use the actual cost from the cached response
    return response.metadata.cost || 0.01; // Fallback estimate
  }
  
  private evictOldestEntries(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
    
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      console.log(`🗑️ Evicted cache entry: ${key.substring(0, 8)}...`);
    }
  }
  
  private updateCacheStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    this.stats.averageResponseSize = this.stats.totalEntries > 0 
      ? this.stats.totalSize / this.stats.totalEntries 
      : 0;
    
    // Update oldest/newest entries
    const entries = Array.from(this.cache.values());
    if (entries.length > 0) {
      this.stats.oldestEntry = entries.reduce((oldest, entry) => 
        entry.timestamp < oldest ? entry.timestamp : oldest, entries[0].timestamp);
      this.stats.newestEntry = entries.reduce((newest, entry) => 
        entry.timestamp > newest ? entry.timestamp : newest, entries[0].timestamp);
    }
    
    // Update top hits
    this.stats.topHits = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => b.accessCount - a.accessCount)
      .slice(0, 10)
      .map(([key, entry]) => ({
        key: key.substring(0, 8),
        hits: entry.accessCount,
        lastAccessed: entry.lastAccessed
      }));
  }
  
  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
  }
  
  // ============================================================================
  // CACHE INVALIDATION
  // ============================================================================
  
  invalidateByTag(tag: string): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      console.log(`🗑️ Invalidated ${invalidated} cache entries with tag: ${tag}`);
      this.updateCacheStats();
    }
    
    return invalidated;
  }
  
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (pattern.test(key) || entry.tags.some(tag => pattern.test(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      console.log(`🗑️ Invalidated ${invalidated} cache entries matching pattern: ${pattern}`);
      this.updateCacheStats();
    }
    
    return invalidated;
  }
  
  clear(): void {
    const entriesCleared = this.cache.size;
    this.cache.clear();
    this.initializeStats();
    console.log(`🗑️ Cleared ${entriesCleared} cache entries`);
  }
  
  // ============================================================================
  // CLEANUP & MAINTENANCE
  // ============================================================================
  
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupIntervalMs);
  }
  
  private cleanup(): void {
    const now = new Date();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      const ageSeconds = (now.getTime() - entry.timestamp.getTime()) / 1000;
      
      if (ageSeconds > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`🧹 Cleaned up ${expiredCount} expired cache entries`);
      this.updateCacheStats();
    }
    
    // Check hit rate and disable caching if too low
    if (this.stats.hitRate < this.config.hitRateThreshold && this.stats.hits + this.stats.misses > 100) {
      console.warn(`⚠️ Cache hit rate (${(this.stats.hitRate * 100).toFixed(1)}%) below threshold (${(this.config.hitRateThreshold * 100).toFixed(1)}%)`);
    }
  }
  
  // ============================================================================
  // PERSISTENCE
  // ============================================================================
  
  private async saveToDisk(): Promise<void> {
    if (!this.config.persistToDisk || !this.config.diskCachePath) {
      return;
    }
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.config.diskCachePath), { recursive: true });
      
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeFile(this.config.diskCachePath, JSON.stringify(cacheData, null, 2));
      console.log(`💾 Saved ${this.cache.size} cache entries to disk`);
    } catch (error) {
      console.error('Failed to save cache to disk:', error);
    }
  }
  
  private async loadFromDisk(): Promise<void> {
    if (!this.config.persistToDisk || !this.config.diskCachePath) {
      return;
    }
    
    try {
      const fs = await import('fs/promises');
      
      const data = await fs.readFile(this.config.diskCachePath, 'utf-8');
      const cacheData = JSON.parse(data);
      
      // Restore cache entries
      this.cache = new Map(cacheData.entries.map(([key, entry]: [string, any]) => [
        key,
        {
          ...entry,
          timestamp: new Date(entry.timestamp),
          lastAccessed: new Date(entry.lastAccessed)
        }
      ]));
      
      // Restore stats
      this.stats = { ...this.stats, ...cacheData.stats };
      
      console.log(`💾 Loaded ${this.cache.size} cache entries from disk`);
      
      // Clean up expired entries
      this.cleanup();
    } catch (error) {
      console.log('No existing cache file found or failed to load, starting fresh');
    }
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  getStats(): CacheStats {
    this.updateCacheStats();
    return { ...this.stats };
  }
  
  getConfig(): CacheConfig {
    return { ...this.config };
  }
  
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (!this.config.enabled && this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    } else if (this.config.enabled && !this.cleanupTimer) {
      this.startCleanupTimer();
    }
  }
  
  isEnabled(): boolean {
    return this.config.enabled;
  }
  
  getCacheEntry(request: AIGenerationRequest): CacheEntry | null {
    const key = this.generateCacheKey(request);
    return this.cache.get(key) || null;
  }
  
  preWarm(requests: AIGenerationRequest[], responses: AIGenerationResponse[]): Promise<void[]> {
    return Promise.all(
      requests.map((request, index) => {
        const response = responses[index];
        if (response) {
          return this.set(request, response);
        }
        return Promise.resolve();
      })
    );
  }
  
  exportCache(): string {
    return JSON.stringify({
      config: this.config,
      stats: this.stats,
      entries: Array.from(this.cache.entries()),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    if (this.config.persistToDisk) {
      this.saveToDisk();
    }
    
    this.cache.clear();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CacheManager;
