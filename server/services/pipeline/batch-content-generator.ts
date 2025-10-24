// Mythwright Batch Content Generation System - Task 84
// High-performance batch processing engine for generating multiple D&D content pieces

import { EventEmitter } from 'events';
import type { 
  GenerationTask,
  GenerationPipeline,
  StatBlock,
  NPC,
  MagicItem,
  Encounter,
  GenerationSettings
} from '../../types/content.types.js';
import { AIService } from '../ai/index.js';
import ContentGenerationOrchestrator from './content-generation-orchestrator.js';

// ============================================================================
// BATCH GENERATION TYPES
// ============================================================================

export interface BatchGenerationJob {
  // Job Identity
  jobId: string;
  pipelineId: string;
  jobName: string;
  
  // Batch Configuration
  batchSize: number;
  maxConcurrency: number;
  retryAttempts: number;
  timeout: number; // seconds
  
  // Tasks to Process
  tasks: GenerationTask[];
  completedTasks: GenerationTask[];
  failedTasks: GenerationTask[];
  
  // Processing State
  status: BatchJobStatus;
  currentBatch: GenerationTask[];
  processingStarted: Date;
  processingCompleted?: Date;
  
  // Performance Metrics
  metrics: BatchJobMetrics;
  
  // Error Handling
  errors: BatchJobError[];
  warnings: BatchJobWarning[];
}

export type BatchJobStatus = 
  | 'queued'        // Waiting to start
  | 'processing'    // Currently generating content
  | 'paused'        // Temporarily paused
  | 'completed'     // Successfully completed
  | 'failed'        // Failed with errors
  | 'cancelled';    // Cancelled by user

export interface BatchJobMetrics {
  // Task Statistics
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  skippedTasks: number;
  
  // Performance
  averageTaskDuration: number; // seconds
  totalProcessingTime: number; // seconds
  throughputPerMinute: number;
  
  // Resource Usage
  totalTokensUsed: number;
  totalCostIncurred: number;
  averageCostPerTask: number;
  
  // Quality Metrics
  averageQualityScore: number;
  contentPassRate: number; // % passing validation
  retryRate: number; // % requiring retries
}

export interface BatchJobError {
  errorId: string;
  taskId: string;
  errorType: string;
  message: string;
  timestamp: Date;
  retryCount: number;
  recoverable: boolean;
}

export interface BatchJobWarning {
  warningId: string;
  taskId?: string;
  category: string;
  message: string;
  timestamp: Date;
}

export interface BatchGenerationResult {
  // Result Summary
  jobId: string;
  success: boolean;
  completionRate: number; // 0-100%
  
  // Generated Content
  generatedContent: Map<string, any>;
  
  // Quality Analysis
  qualityAnalysis: BatchQualityAnalysis;
  
  // Performance Report
  performanceReport: BatchPerformanceReport;
  
  // Error Summary
  errorSummary: BatchErrorSummary;
}

export interface BatchQualityAnalysis {
  overallQualityScore: number;
  qualityDistribution: QualityDistribution;
  contentTypeScores: Map<string, number>;
  validationResults: Map<string, ValidationResult>;
  improvementSuggestions: string[];
}

export interface QualityDistribution {
  excellent: number; // 90-100%
  good: number;      // 80-89%
  acceptable: number; // 70-79%
  poor: number;      // 60-69%
  unacceptable: number; // <60%
}

export interface BatchPerformanceReport {
  totalDuration: number;
  averageTaskDuration: number;
  peakConcurrency: number;
  bottlenecks: PerformanceBottleneck[];
  optimizationSuggestions: string[];
}

export interface PerformanceBottleneck {
  type: 'api_rate_limit' | 'token_limit' | 'validation' | 'dependency' | 'network';
  impact: number; // seconds of delay
  frequency: number; // how often it occurred
  suggestion: string;
}

export interface BatchErrorSummary {
  totalErrors: number;
  errorsByType: Map<string, number>;
  recoverableErrors: number;
  criticalErrors: number;
  errorPatterns: ErrorPattern[];
}

export interface ErrorPattern {
  pattern: string;
  frequency: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

// ============================================================================
// BATCH CONTENT GENERATOR CLASS
// ============================================================================

export class BatchContentGenerator extends EventEmitter {
  private aiService: AIService;
  private activeJobs: Map<string, BatchGenerationJob>;
  private jobHistory: Map<string, BatchGenerationJob[]>;
  private defaultBatchSize: number = 5;
  private defaultConcurrency: number = 3;
  private maxRetryAttempts: number = 3;
  
  constructor() {
    super();
    this.aiService = AIService.getInstance();
    this.activeJobs = new Map();
    this.jobHistory = new Map();
  }
  
  // ========================================================================
  // JOB CREATION AND MANAGEMENT
  // ========================================================================
  
  /**
   * Create a new batch generation job from a pipeline's tasks
   */
  async createBatchJob(
    pipeline: GenerationPipeline,
    options: {
      batchSize?: number;
      maxConcurrency?: number;
      retryAttempts?: number;
      timeout?: number;
      taskFilter?: (task: GenerationTask) => boolean;
    } = {}
  ): Promise<BatchGenerationJob> {
    const jobId = `batch_${pipeline.pipelineId}_${Date.now()}`;
    
    // Filter and prioritize tasks
    let tasksToProcess = pipeline.contentPlan.generationSequence;
    if (options.taskFilter) {
      tasksToProcess = tasksToProcess.filter(options.taskFilter);
    }
    
    // Sort by priority and dependencies
    tasksToProcess = this.sortTasksByPriorityAndDependencies(tasksToProcess);
    
    const job: BatchGenerationJob = {
      jobId,
      pipelineId: pipeline.pipelineId,
      jobName: `Batch Generation: ${pipeline.projectName}`,
      batchSize: options.batchSize || this.defaultBatchSize,
      maxConcurrency: options.maxConcurrency || this.defaultConcurrency,
      retryAttempts: options.retryAttempts || this.maxRetryAttempts,
      timeout: options.timeout || 300, // 5 minutes
      tasks: tasksToProcess,
      completedTasks: [],
      failedTasks: [],
      status: 'queued',
      currentBatch: [],
      processingStarted: new Date(),
      metrics: this.initializeMetrics(tasksToProcess.length),
      errors: [],
      warnings: []
    };
    
    this.activeJobs.set(jobId, job);
    this.emit('jobCreated', job);
    
    return job;
  }
  
  /**
   * Start processing a batch job
   */
  async startBatchJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      throw new Error(`Batch job ${jobId} not found`);
    }
    
    if (job.status !== 'queued') {
      throw new Error(`Cannot start job ${jobId} - current status: ${job.status}`);
    }
    
    job.status = 'processing';
    job.processingStarted = new Date();
    
    this.emit('jobStarted', job);
    
    try {
      await this.processBatchJob(job);
      
      job.status = 'completed';
      job.processingCompleted = new Date();
      job.metrics.totalProcessingTime = 
        (job.processingCompleted.getTime() - job.processingStarted.getTime()) / 1000;
      
      this.emit('jobCompleted', job);
      
      // Move to history after completion
      setTimeout(() => this.moveJobToHistory(jobId), 60000); // 1 minute
      
    } catch (error) {
      job.status = 'failed';
      job.errors.push({
        errorId: `error_${Date.now()}`,
        taskId: 'batch_job',
        errorType: 'job_failure',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryCount: 0,
        recoverable: false
      });
      
      this.emit('jobFailed', job, error);
    }
  }
  
  /**
   * Process all tasks in a batch job
   */
  private async processBatchJob(job: BatchGenerationJob): Promise<void> {
    const remainingTasks = [...job.tasks];
    
    while (remainingTasks.length > 0 && job.status === 'processing') {
      // Create next batch
      const batch = this.createNextBatch(remainingTasks, job);
      job.currentBatch = batch;
      
      this.emit('batchStarted', job, batch);
      
      // Process batch with concurrency control
      const batchResults = await this.processBatch(batch, job);
      
      // Update job state based on results
      this.updateJobFromBatchResults(job, batchResults);
      
      // Remove processed tasks from remaining
      batch.forEach(task => {
        const index = remainingTasks.findIndex(t => t.taskId === task.taskId);
        if (index !== -1) {
          remainingTasks.splice(index, 1);
        }
      });
      
      this.emit('batchCompleted', job, batchResults);
      
      // Brief pause between batches to avoid overwhelming the API
      if (remainingTasks.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  /**
   * Create the next batch of tasks to process
   */
  private createNextBatch(remainingTasks: GenerationTask[], job: BatchGenerationJob): GenerationTask[] {
    const availableTasks = remainingTasks.filter(task => 
      this.areTaskDependenciesMet(task, job.completedTasks)
    );
    
    return availableTasks.slice(0, job.batchSize);
  }
  
  /**
   * Check if all dependencies for a task are met
   */
  private areTaskDependenciesMet(task: GenerationTask, completedTasks: GenerationTask[]): boolean {
    return task.dependsOn.every(depId => 
      completedTasks.some(completed => completed.taskId === depId)
    );
  }
  
  /**
   * Process a single batch with concurrency control
   */
  private async processBatch(
    batch: GenerationTask[], 
    job: BatchGenerationJob
  ): Promise<BatchTaskResult[]> {
    const semaphore = new Semaphore(job.maxConcurrency);
    
    const batchPromises = batch.map(async (task) => {
      return semaphore.acquire(async () => {
        const startTime = Date.now();
        
        try {
          const result = await this.processTask(task, job);
          const duration = (Date.now() - startTime) / 1000;
          
          return {
            task,
            success: true,
            result,
            duration,
            error: null
          } as BatchTaskResult;
          
        } catch (error) {
          const duration = (Date.now() - startTime) / 1000;
          
          return {
            task,
            success: false,
            result: null,
            duration,
            error: error instanceof Error ? error : new Error('Unknown error')
          } as BatchTaskResult;
        }
      });
    });
    
    return Promise.all(batchPromises);
  }
  
  /**
   * Process a single generation task
   */
  private async processTask(task: GenerationTask, job: BatchGenerationJob): Promise<any> {
    const maxAttempts = job.retryAttempts + 1;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        task.attempts = attempt;
        task.status = 'running';
        
        this.emit('taskStarted', job, task);
        
        // Generate content based on task type
        const result = await this.generateContentForTask(task);
        
        // Validate the result
        const validationResult = await this.validateGeneratedContent(result, task);
        
        if (validationResult.passed) {
          task.status = 'completed';
          this.emit('taskCompleted', job, task, result);
          return result;
        } else {
          throw new Error(`Content validation failed: ${validationResult.errors.join(', ')}`);
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxAttempts) {
          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          this.emit('taskRetry', job, task, attempt, lastError);
        }
      }
    }
    
    // All attempts failed
    task.status = 'failed';
    task.lastError = lastError?.message || 'Unknown error';
    
    job.errors.push({
      errorId: `error_${Date.now()}`,
      taskId: task.taskId,
      errorType: 'task_failure',
      message: lastError?.message || 'Task failed after all retry attempts',
      timestamp: new Date(),
      retryCount: maxAttempts - 1,
      recoverable: this.isErrorRecoverable(lastError)
    });
    
    this.emit('taskFailed', job, task, lastError);
    throw lastError;
  }
  
  /**
   * Generate content for a specific task type
   */
  private async generateContentForTask(task: GenerationTask): Promise<any> {
    const parameters = task.parameters;
    
    switch (task.taskType) {
      case 'encounter':
        return await this.aiService.generateEncounter({
          encounterType: parameters.encounter.encounterType,
          difficulty: parameters.encounter.difficulty,
          partyLevel: parameters.encounter.partyLevel,
          partySize: 4, // Default
          theme: parameters.encounter.theme || 'adventure',
          environment: parameters.encounter.environment?.setting || 'dungeon',
          objectives: parameters.encounter.objectives?.map((obj: any) => obj.description) || ['Defeat enemies']
        });
        
      case 'npc':
        return await this.aiService.generateNPC({
          role: parameters.npc.role,
          importance: parameters.npc.importance,
          level: parameters.npc.level,
          theme: parameters.npc.theme || 'adventure',
          personality: parameters.npc.personality || ['friendly'],
          background: parameters.npc.background || 'commoner'
        });
        
      case 'magic_item':
        return await this.aiService.generateMagicItem({
          rarity: parameters.item.rarity,
          itemType: parameters.item.itemType,
          level: parameters.item.level,
          theme: parameters.item.theme || 'adventure',
          attunementRequired: parameters.item.attunementRequired || false,
          cursed: parameters.item.cursed || false
        });
        
      case 'chapter':
        // For now, create a basic chapter structure
        // This would be expanded with narrative generation
        return {
          id: parameters.chapter.chapterId,
          title: parameters.chapter.title,
          content: `# ${parameters.chapter.title}\n\nThis chapter covers levels ${parameters.chapter.levelRange[0]}-${parameters.chapter.levelRange[1]}.`,
          theme: parameters.chapter.theme,
          metadata: parameters.chapter
        };
        
      case 'narrative':
        return await this.aiService.generateNarrative({
          chapterNumber: parameters.chapterNumber || 1,
          title: parameters.title || 'Untitled',
          theme: parameters.theme || 'adventure',
          wordCount: parameters.wordCount || 500,
          tone: parameters.tone || 'heroic',
          keyElements: parameters.keyElements || []
        });
        
      default:
        throw new Error(`Unknown task type: ${task.taskType}`);
    }
  }
  
  /**
   * Validate generated content
   */
  private async validateGeneratedContent(content: any, task: GenerationTask): Promise<ContentValidationResult> {
    const errors: string[] = [];
    
    // Basic validation
    if (!content) {
      errors.push('Content is null or undefined');
    }
    
    // Type-specific validation
    switch (task.taskType) {
      case 'encounter':
        if (!content.title) errors.push('Encounter missing title');
        if (!content.description) errors.push('Encounter missing description');
        if (!content.monsters || content.monsters.length === 0) errors.push('Encounter missing monsters');
        break;
        
      case 'npc':
        if (!content.name) errors.push('NPC missing name');
        if (!content.personality) errors.push('NPC missing personality');
        if (!content.background) errors.push('NPC missing background');
        break;
        
      case 'magic_item':
        if (!content.name) errors.push('Magic item missing name');
        if (!content.description) errors.push('Magic item missing description');
        if (!content.rarity) errors.push('Magic item missing rarity');
        break;
    }
    
    return {
      passed: errors.length === 0,
      errors,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 25))
    };
  }
  
  /**
   * Determine if an error is recoverable through retry
   */
  private isErrorRecoverable(error: Error | null): boolean {
    if (!error) return false;
    
    const message = error.message.toLowerCase();
    
    // Network and temporary API errors are usually recoverable
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('rate limit') ||
        message.includes('502') || 
        message.includes('503') || 
        message.includes('504')) {
      return true;
    }
    
    // Authentication and malformed request errors are not recoverable
    if (message.includes('unauthorized') || 
        message.includes('invalid request') ||
        message.includes('bad request')) {
      return false;
    }
    
    // Default to recoverable for unknown errors
    return true;
  }
  
  // ========================================================================
  // BATCH RESULTS PROCESSING
  // ========================================================================
  
  /**
   * Update job state from batch processing results
   */
  private updateJobFromBatchResults(job: BatchGenerationJob, results: BatchTaskResult[]): void {
    for (const result of results) {
      if (result.success) {
        job.completedTasks.push(result.task);
        job.metrics.completedTasks++;
      } else {
        job.failedTasks.push(result.task);
        job.metrics.failedTasks++;
      }
      
      // Update performance metrics
      job.metrics.averageTaskDuration = 
        (job.metrics.averageTaskDuration * (job.metrics.completedTasks + job.metrics.failedTasks - 1) + result.duration) / 
        (job.metrics.completedTasks + job.metrics.failedTasks);
    }
    
    // Calculate throughput
    const elapsedMinutes = (Date.now() - job.processingStarted.getTime()) / (1000 * 60);
    job.metrics.throughputPerMinute = (job.metrics.completedTasks + job.metrics.failedTasks) / Math.max(elapsedMinutes, 0.1);
    
    this.emit('jobProgressUpdated', job);
  }
  
  /**
   * Generate comprehensive batch generation result
   */
  async generateBatchResult(job: BatchGenerationJob): Promise<BatchGenerationResult> {
    const completionRate = (job.completedTasks.length / job.tasks.length) * 100;
    
    // Collect all generated content
    const generatedContent = new Map<string, any>();
    job.completedTasks.forEach(task => {
      // Content would be retrieved from the actual generation results
      // For now, we'll use placeholder data
      generatedContent.set(task.contentId, { taskId: task.taskId, type: task.taskType });
    });
    
    return {
      jobId: job.jobId,
      success: job.status === 'completed',
      completionRate,
      generatedContent,
      qualityAnalysis: await this.analyzeContentQuality(job),
      performanceReport: this.generatePerformanceReport(job),
      errorSummary: this.generateErrorSummary(job)
    };
  }
  
  /**
   * Analyze content quality across the batch
   */
  private async analyzeContentQuality(job: BatchGenerationJob): Promise<BatchQualityAnalysis> {
    // This would integrate with our content validation systems
    // For now, return placeholder analysis
    
    const totalTasks = job.completedTasks.length;
    const qualityScores = job.completedTasks.map(() => 75 + Math.random() * 20); // Mock scores
    const averageScore = qualityScores.reduce((sum, score) => sum + score, 0) / totalTasks;
    
    return {
      overallQualityScore: averageScore,
      qualityDistribution: {
        excellent: qualityScores.filter(s => s >= 90).length,
        good: qualityScores.filter(s => s >= 80 && s < 90).length,
        acceptable: qualityScores.filter(s => s >= 70 && s < 80).length,
        poor: qualityScores.filter(s => s >= 60 && s < 70).length,
        unacceptable: qualityScores.filter(s => s < 60).length
      },
      contentTypeScores: new Map([
        ['encounter', 82],
        ['npc', 78],
        ['magic_item', 85],
        ['narrative', 80]
      ]),
      validationResults: new Map(),
      improvementSuggestions: [
        'Consider adding more detailed environmental descriptions',
        'Enhance NPC personality traits for better consistency',
        'Add more variety to magic item descriptions'
      ]
    };
  }
  
  /**
   * Generate performance report for the batch job
   */
  private generatePerformanceReport(job: BatchGenerationJob): BatchPerformanceReport {
    return {
      totalDuration: job.metrics.totalProcessingTime,
      averageTaskDuration: job.metrics.averageTaskDuration,
      peakConcurrency: job.maxConcurrency,
      bottlenecks: [
        {
          type: 'api_rate_limit',
          impact: 15, // seconds
          frequency: 3,
          suggestion: 'Consider implementing exponential backoff for rate limits'
        }
      ],
      optimizationSuggestions: [
        'Increase batch size for better throughput',
        'Consider caching similar content generation requests',
        'Implement parallel validation processing'
      ]
    };
  }
  
  /**
   * Generate error summary for the batch job
   */
  private generateErrorSummary(job: BatchGenerationJob): BatchErrorSummary {
    const errorsByType = new Map<string, number>();
    let recoverableErrors = 0;
    let criticalErrors = 0;
    
    job.errors.forEach(error => {
      const count = errorsByType.get(error.errorType) || 0;
      errorsByType.set(error.errorType, count + 1);
      
      if (error.recoverable) {
        recoverableErrors++;
      } else {
        criticalErrors++;
      }
    });
    
    return {
      totalErrors: job.errors.length,
      errorsByType,
      recoverableErrors,
      criticalErrors,
      errorPatterns: [
        {
          pattern: 'Content validation failure',
          frequency: 2,
          impact: 'medium',
          recommendation: 'Improve prompt engineering for better content quality'
        }
      ]
    };
  }
  
  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  
  /**
   * Sort tasks by priority and resolve dependencies
   */
  private sortTasksByPriorityAndDependencies(tasks: GenerationTask[]): GenerationTask[] {
    // Create dependency graph
    const dependencyMap = new Map<string, string[]>();
    tasks.forEach(task => {
      dependencyMap.set(task.taskId, task.dependsOn);
    });
    
    // Topological sort with priority
    const sorted: GenerationTask[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) {
        throw new Error(`Circular dependency detected involving task ${taskId}`);
      }
      
      visiting.add(taskId);
      
      const dependencies = dependencyMap.get(taskId) || [];
      dependencies.forEach(depId => visit(depId));
      
      visiting.delete(taskId);
      visited.add(taskId);
      
      const task = tasks.find(t => t.taskId === taskId);
      if (task) {
        sorted.push(task);
      }
    };
    
    // Sort by priority first, then visit
    const prioritizedTasks = [...tasks].sort((a, b) => b.priority - a.priority);
    prioritizedTasks.forEach(task => visit(task.taskId));
    
    return sorted;
  }
  
  /**
   * Initialize metrics for a new job
   */
  private initializeMetrics(totalTasks: number): BatchJobMetrics {
    return {
      totalTasks,
      completedTasks: 0,
      failedTasks: 0,
      skippedTasks: 0,
      averageTaskDuration: 0,
      totalProcessingTime: 0,
      throughputPerMinute: 0,
      totalTokensUsed: 0,
      totalCostIncurred: 0,
      averageCostPerTask: 0,
      averageQualityScore: 0,
      contentPassRate: 0,
      retryRate: 0
    };
  }
  
  /**
   * Move completed job to history
   */
  private moveJobToHistory(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (!job) return;
    
    const projectHistory = this.jobHistory.get(job.pipelineId) || [];
    projectHistory.push(job);
    this.jobHistory.set(job.pipelineId, projectHistory);
    
    this.activeJobs.delete(jobId);
    this.emit('jobMovedToHistory', job);
  }
  
  /**
   * Get active batch jobs
   */
  getActiveJobs(): BatchGenerationJob[] {
    return Array.from(this.activeJobs.values());
  }
  
  /**
   * Get job by ID
   */
  getJob(jobId: string): BatchGenerationJob | null {
    return this.activeJobs.get(jobId) || null;
  }
  
  /**
   * Pause a running job
   */
  async pauseJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    if (job.status === 'processing') {
      job.status = 'paused';
      this.emit('jobPaused', job);
    }
  }
  
  /**
   * Resume a paused job
   */
  async resumeJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    if (job.status === 'paused') {
      job.status = 'processing';
      this.emit('jobResumed', job);
      
      // Continue processing from where we left off
      await this.processBatchJob(job);
    }
  }
  
  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    job.status = 'cancelled';
    this.emit('jobCancelled', job);
    
    // Move to history
    setTimeout(() => this.moveJobToHistory(jobId), 5000);
  }
}

// ============================================================================
// SUPPORTING CLASSES AND INTERFACES
// ============================================================================

/**
 * Semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];
  
  constructor(permits: number) {
    this.permits = permits;
  }
  
  async acquire<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.permits > 0) {
        this.permits--;
        this.executeTask(task, resolve, reject);
      } else {
        this.waiting.push(() => {
          this.permits--;
          this.executeTask(task, resolve, reject);
        });
      }
    });
  }
  
  private async executeTask<T>(
    task: () => Promise<T>, 
    resolve: (value: T) => void, 
    reject: (reason: any) => void
  ): Promise<void> {
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.permits++;
      if (this.waiting.length > 0) {
        const next = this.waiting.shift();
        if (next) next();
      }
    }
  }
}

interface BatchTaskResult {
  task: GenerationTask;
  success: boolean;
  result: any;
  duration: number;
  error: Error | null;
}

interface ContentValidationResult {
  passed: boolean;
  errors: string[];
  score: number;
}

interface ValidationResult {
  contentId: string;
  passed: boolean;
  score: number;
  issues: string[];
}

// Export the batch generator
export default BatchContentGenerator;
