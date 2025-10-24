// Mythwright Content Generation Pipeline Orchestrator - Task 83
// Central coordinator for all AI content generation across projects

import { EventEmitter } from 'events';
import type { 
  SystemDesignBudget,
  Project,
  Chapter,
  Section,
  StatBlock,
  NPC,
  MagicItem,
  Encounter,
  GenerationSettings
} from '../../types/content.types.js';
import { AIService } from '../ai/index.js';
import { EncounterXPCalculator } from '../budget/encounter-xp-calculator.js';
import { TreasureAllocationSystem } from '../budget/treasure-allocation-system.js';
import { MilestoneProgressionTracker } from '../budget/milestone-progression-tracker.js';

// ============================================================================
// PIPELINE ORCHESTRATOR TYPES
// ============================================================================

export interface GenerationPipeline {
  // Pipeline Identity
  pipelineId: string;
  projectId: string;
  projectName: string;
  
  // Generation Configuration
  systemDesignBudget: SystemDesignBudget;
  generationSettings: GenerationSettings;
  
  // Pipeline State
  status: PipelineStatus;
  currentPhase: GenerationPhase;
  progress: PipelineProgress;
  
  // Content Structure
  contentPlan: ContentGenerationPlan;
  generatedContent: GeneratedContent;
  
  // Quality Control
  validationResults: ValidationResults;
  qualityMetrics: QualityMetrics;
  
  // Timeline
  startedAt: Date;
  estimatedCompletion: Date;
  completedAt?: Date;
  
  // Error Handling
  errors: GenerationError[];
  warnings: GenerationWarning[];
}

export type PipelineStatus = 
  | 'planning'      // Analyzing budget and creating generation plan
  | 'generating'    // Actively generating content
  | 'validating'    // Running quality checks and validation
  | 'reviewing'     // Waiting for user review/approval
  | 'finalizing'    // Applying final formatting and integration
  | 'completed'     // Successfully completed
  | 'paused'        // Temporarily paused by user
  | 'failed'        // Failed with errors
  | 'cancelled';    // Cancelled by user

export type GenerationPhase = 
  | 'budget_analysis'     // Analyzing system design budget
  | 'content_planning'    // Creating detailed content plan
  | 'structure_generation' // Generating chapter/section structure
  | 'encounter_creation'  // Creating encounters and combat
  | 'npc_generation'      // Generating NPCs and characters
  | 'treasure_allocation' // Creating treasure and magic items
  | 'narrative_writing'   // Writing story and descriptive text
  | 'integration'         // Integrating all content together
  | 'quality_assurance'   // Final quality checks
  | 'formatting'          // Converting to Homebrewery format
  | 'completion';         // Pipeline completed

export interface PipelineProgress {
  // Overall Progress
  overallProgress: number; // 0-100%
  currentPhase: GenerationPhase;
  phaseProgress: number; // 0-100% of current phase
  
  // Phase Breakdown
  phaseCompletion: Record<GenerationPhase, number>;
  
  // Content Metrics
  totalContentItems: number;
  generatedContentItems: number;
  validatedContentItems: number;
  
  // Time Estimates
  estimatedTimeRemaining: number; // minutes
  averageGenerationTime: number; // seconds per item
  
  // Resource Usage
  tokensUsed: number;
  estimatedCost: number;
  
  // Quality Metrics
  averageQualityScore: number; // 0-100%
  contentPassRate: number; // % passing validation
}

export interface ContentGenerationPlan {
  // High-Level Structure
  totalChapters: number;
  totalSections: number;
  totalEncounters: number;
  
  // Content Breakdown
  chapters: ChapterPlan[];
  encounters: EncounterPlan[];
  npcs: NPCPlan[];
  magicItems: MagicItemPlan[];
  
  // Generation Order
  generationSequence: GenerationTask[];
  dependencies: ContentDependency[];
  
  // Resource Planning
  estimatedTokens: number;
  estimatedCost: number;
  estimatedDuration: number; // minutes
  
  // Quality Targets
  targetQualityScore: number;
  validationCriteria: ValidationCriteria[];
}

export interface ChapterPlan {
  chapterId: string;
  chapterNumber: number;
  title: string;
  theme: string;
  levelRange: [number, number];
  
  // Content Requirements
  sections: SectionPlan[];
  encounters: string[]; // encounter IDs
  npcs: string[]; // NPC IDs
  magicItems: string[]; // magic item IDs
  
  // Narrative Structure
  introduction: NarrativePlan;
  climax: NarrativePlan;
  resolution: NarrativePlan;
  
  // Budget Allocation
  xpBudget: number;
  treasureBudget: number;
  difficultyProgression: DifficultyProgression;
}

export interface SectionPlan {
  sectionId: string;
  title: string;
  type: 'encounter' | 'exploration' | 'social' | 'puzzle' | 'narrative';
  estimatedDuration: number; // minutes of gameplay
  
  // Content Requirements
  primaryContent: ContentRequirement[];
  supportingContent: ContentRequirement[];
  
  // Dependencies
  prerequisites: string[]; // section IDs that must be completed first
  unlocks: string[]; // section IDs this unlocks
}

export interface EncounterPlan {
  encounterId: string;
  chapterId: string;
  sectionId: string;
  
  // Encounter Details
  encounterType: 'combat' | 'social' | 'exploration' | 'puzzle';
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  partyLevel: number;
  
  // Budget Requirements
  xpBudget: number;
  treasureBudget: number;
  
  // Content Requirements
  monsters: MonsterRequirement[];
  npcs: NPCRequirement[];
  environment: EnvironmentRequirement;
  objectives: ObjectiveRequirement[];
  
  // Narrative Integration
  storyContext: string;
  consequences: ConsequenceRequirement[];
}

export interface GenerationTask {
  taskId: string;
  taskType: 'chapter' | 'section' | 'encounter' | 'npc' | 'magic_item' | 'narrative';
  contentId: string;
  
  // Task Configuration
  generationType: string;
  parameters: Record<string, any>;
  
  // Dependencies
  dependsOn: string[]; // task IDs
  priority: number; // 1-10, higher = more important
  
  // Resource Requirements
  estimatedTokens: number;
  estimatedDuration: number; // seconds
  
  // Status
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  attempts: number;
  lastError?: string;
}

export interface GeneratedContent {
  // Content Storage
  chapters: Map<string, Chapter>;
  sections: Map<string, Section>;
  encounters: Map<string, Encounter>;
  npcs: Map<string, NPC>;
  magicItems: Map<string, MagicItem>;
  statBlocks: Map<string, StatBlock>;
  
  // Content Relationships
  contentGraph: ContentGraph;
  
  // Metadata
  generationMetadata: GenerationMetadata;
  
  // Quality Tracking
  qualityScores: Map<string, number>;
  validationResults: Map<string, ValidationResult>;
}

export interface ContentGraph {
  nodes: ContentNode[];
  edges: ContentEdge[];
}

export interface ContentNode {
  id: string;
  type: string;
  content: any;
  metadata: Record<string, any>;
}

export interface ContentEdge {
  from: string;
  to: string;
  relationship: 'contains' | 'references' | 'depends_on' | 'unlocks' | 'triggers';
  weight?: number;
}

// ============================================================================
// CONTENT GENERATION ORCHESTRATOR CLASS
// ============================================================================

export class ContentGenerationOrchestrator extends EventEmitter {
  private aiService: AIService;
  private activePipelines: Map<string, GenerationPipeline>;
  private pipelineHistory: Map<string, GenerationPipeline[]>;
  
  constructor() {
    super();
    this.aiService = AIService.getInstance();
    this.activePipelines = new Map();
    this.pipelineHistory = new Map();
  }
  
  // ========================================================================
  // PIPELINE CREATION AND MANAGEMENT
  // ========================================================================
  
  /**
   * Create a new content generation pipeline for a project
   */
  async createPipeline(
    projectId: string,
    projectName: string,
    systemDesignBudget: SystemDesignBudget,
    generationSettings: GenerationSettings
  ): Promise<GenerationPipeline> {
    const pipelineId = `pipeline_${projectId}_${Date.now()}`;
    
    // Create initial pipeline structure
    const pipeline: GenerationPipeline = {
      pipelineId,
      projectId,
      projectName,
      systemDesignBudget,
      generationSettings,
      status: 'planning',
      currentPhase: 'budget_analysis',
      progress: this.initializeProgress(),
      contentPlan: await this.createContentPlan(systemDesignBudget, generationSettings),
      generatedContent: this.initializeGeneratedContent(),
      validationResults: this.initializeValidationResults(),
      qualityMetrics: this.initializeQualityMetrics(),
      startedAt: new Date(),
      estimatedCompletion: new Date(Date.now() + 60 * 60 * 1000), // 1 hour estimate
      errors: [],
      warnings: []
    };
    
    // Store pipeline
    this.activePipelines.set(pipelineId, pipeline);
    
    // Emit pipeline created event
    this.emit('pipelineCreated', pipeline);
    
    // Start the generation process
    this.startPipelineExecution(pipelineId);
    
    return pipeline;
  }
  
  /**
   * Get pipeline status and progress
   */
  getPipeline(pipelineId: string): GenerationPipeline | null {
    return this.activePipelines.get(pipelineId) || null;
  }
  
  /**
   * Get all active pipelines
   */
  getActivePipelines(): GenerationPipeline[] {
    return Array.from(this.activePipelines.values());
  }
  
  /**
   * Pause a running pipeline
   */
  async pausePipeline(pipelineId: string): Promise<void> {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }
    
    if (pipeline.status === 'generating') {
      pipeline.status = 'paused';
      this.emit('pipelinePaused', pipeline);
    }
  }
  
  /**
   * Resume a paused pipeline
   */
  async resumePipeline(pipelineId: string): Promise<void> {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }
    
    if (pipeline.status === 'paused') {
      pipeline.status = 'generating';
      this.emit('pipelineResumed', pipeline);
      this.continuePipelineExecution(pipelineId);
    }
  }
  
  /**
   * Cancel a pipeline
   */
  async cancelPipeline(pipelineId: string): Promise<void> {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }
    
    pipeline.status = 'cancelled';
    pipeline.completedAt = new Date();
    
    // Move to history
    this.movePipelineToHistory(pipelineId);
    
    this.emit('pipelineCancelled', pipeline);
  }
  
  // ========================================================================
  // CONTENT PLANNING
  // ========================================================================
  
  /**
   * Create a detailed content generation plan from the system design budget
   */
  private async createContentPlan(
    budget: SystemDesignBudget,
    settings: GenerationSettings
  ): Promise<ContentGenerationPlan> {
    // Analyze the budget to determine content requirements
    const budgetAnalysis = await this.analyzeBudget(budget);
    
    // Create chapter structure
    const chapters = await this.planChapters(budget, budgetAnalysis);
    
    // Plan encounters based on XP budget
    const encounters = await this.planEncounters(budget, chapters);
    
    // Plan NPCs based on story requirements
    const npcs = await this.planNPCs(budget, chapters, encounters);
    
    // Plan magic items based on treasure budget
    const magicItems = await this.planMagicItems(budget, encounters);
    
    // Create generation sequence with dependencies
    const generationSequence = this.createGenerationSequence(chapters, encounters, npcs, magicItems);
    
    // Calculate resource estimates
    const resourceEstimates = this.calculateResourceEstimates(generationSequence);
    
    return {
      totalChapters: chapters.length,
      totalSections: chapters.reduce((sum, chapter) => sum + chapter.sections.length, 0),
      totalEncounters: encounters.length,
      chapters,
      encounters,
      npcs,
      magicItems,
      generationSequence,
      dependencies: this.analyzeDependencies(generationSequence),
      estimatedTokens: resourceEstimates.tokens,
      estimatedCost: resourceEstimates.cost,
      estimatedDuration: resourceEstimates.duration,
      targetQualityScore: settings.qualityThreshold || 85,
      validationCriteria: this.createValidationCriteria(budget, settings)
    };
  }
  
  /**
   * Analyze the system design budget to understand content requirements
   */
  private async analyzeBudget(budget: SystemDesignBudget): Promise<BudgetAnalysis> {
    const analysis: BudgetAnalysis = {
      // Party Analysis
      partyLevel: budget.partyLevel,
      partySize: budget.partySize,
      levelProgression: budget.levelProgression,
      
      // XP Budget Analysis
      totalXPBudget: budget.encounterBudget.totalXPBudget,
      dailyXPBudget: budget.encounterBudget.dailyXPBudget,
      encounterDistribution: budget.encounterBudget.encounterDistribution,
      
      // Session Analysis
      totalSessions: budget.sessionStructure.totalSessions,
      sessionsPerLevel: budget.sessionStructure.sessionsPerLevel,
      averageSessionLength: budget.sessionStructure.averageSessionLength,
      
      // Content Requirements
      estimatedEncounters: Math.ceil(budget.encounterBudget.totalXPBudget / (budget.partyLevel * budget.partySize * 300)),
      estimatedNPCs: Math.ceil(budget.totalSessions * 2.5), // ~2.5 NPCs per session
      estimatedMagicItems: Math.ceil(budget.partyLevel * budget.partySize * 0.8), // Rough estimate
      
      // Difficulty Progression
      difficultyProgression: this.analyzeDifficultyProgression(budget),
      
      // Theme Analysis
      campaignThemes: budget.campaignThemes || ['adventure', 'heroic'],
      contentTone: budget.contentTone || 'balanced',
      
      // Pacing Requirements
      pacingProfile: budget.pacingPreferences || 'steady',
      intensityCurve: budget.intensityCurve || 'gradual_build'
    };
    
    return analysis;
  }
  
  /**
   * Plan the chapter structure based on budget analysis
   */
  private async planChapters(budget: SystemDesignBudget, analysis: BudgetAnalysis): Promise<ChapterPlan[]> {
    const chapters: ChapterPlan[] = [];
    
    // Determine number of chapters based on level progression and sessions
    const chaptersCount = Math.max(3, Math.ceil(analysis.totalSessions / 8)); // ~8 sessions per chapter
    const levelsPerChapter = Math.ceil((budget.targetLevel - budget.partyLevel) / chaptersCount);
    
    for (let i = 0; i < chaptersCount; i++) {
      const chapterStartLevel = budget.partyLevel + (i * levelsPerChapter);
      const chapterEndLevel = Math.min(budget.targetLevel, chapterStartLevel + levelsPerChapter);
      
      const chapter: ChapterPlan = {
        chapterId: `chapter_${i + 1}`,
        chapterNumber: i + 1,
        title: await this.generateChapterTitle(i + 1, analysis.campaignThemes),
        theme: analysis.campaignThemes[i % analysis.campaignThemes.length],
        levelRange: [chapterStartLevel, chapterEndLevel],
        sections: await this.planChapterSections(chapterStartLevel, chapterEndLevel, analysis),
        encounters: [], // Will be filled by encounter planning
        npcs: [], // Will be filled by NPC planning
        magicItems: [], // Will be filled by magic item planning
        introduction: await this.planNarrativeSection('introduction', i + 1, analysis),
        climax: await this.planNarrativeSection('climax', i + 1, analysis),
        resolution: await this.planNarrativeSection('resolution', i + 1, analysis),
        xpBudget: Math.ceil(analysis.totalXPBudget / chaptersCount),
        treasureBudget: Math.ceil((budget.treasureBudget?.totalBudget || 10000) / chaptersCount),
        difficultyProgression: this.planChapterDifficultyProgression(chapterStartLevel, chapterEndLevel)
      };
      
      chapters.push(chapter);
    }
    
    return chapters;
  }
  
  // ========================================================================
  // PIPELINE EXECUTION
  // ========================================================================
  
  /**
   * Start executing the generation pipeline
   */
  private async startPipelineExecution(pipelineId: string): Promise<void> {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) return;
    
    try {
      pipeline.status = 'generating';
      this.emit('pipelineStarted', pipeline);
      
      // Execute generation phases in sequence
      await this.executePhase(pipelineId, 'budget_analysis');
      await this.executePhase(pipelineId, 'content_planning');
      await this.executePhase(pipelineId, 'structure_generation');
      await this.executePhase(pipelineId, 'encounter_creation');
      await this.executePhase(pipelineId, 'npc_generation');
      await this.executePhase(pipelineId, 'treasure_allocation');
      await this.executePhase(pipelineId, 'narrative_writing');
      await this.executePhase(pipelineId, 'integration');
      await this.executePhase(pipelineId, 'quality_assurance');
      await this.executePhase(pipelineId, 'formatting');
      await this.executePhase(pipelineId, 'completion');
      
      // Mark as completed
      pipeline.status = 'completed';
      pipeline.completedAt = new Date();
      
      this.emit('pipelineCompleted', pipeline);
      
      // Move to history after a delay
      setTimeout(() => this.movePipelineToHistory(pipelineId), 60000); // 1 minute
      
    } catch (error) {
      pipeline.status = 'failed';
      pipeline.errors.push({
        errorId: `error_${Date.now()}`,
        phase: pipeline.currentPhase,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        severity: 'critical'
      });
      
      this.emit('pipelineFailed', pipeline, error);
    }
  }
  
  /**
   * Execute a specific generation phase
   */
  private async executePhase(pipelineId: string, phase: GenerationPhase): Promise<void> {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline || pipeline.status !== 'generating') return;
    
    pipeline.currentPhase = phase;
    pipeline.progress.phaseProgress = 0;
    
    this.emit('phaseStarted', pipeline, phase);
    
    switch (phase) {
      case 'budget_analysis':
        await this.executeBudgetAnalysis(pipeline);
        break;
      case 'content_planning':
        await this.executeContentPlanning(pipeline);
        break;
      case 'structure_generation':
        await this.executeStructureGeneration(pipeline);
        break;
      case 'encounter_creation':
        await this.executeEncounterCreation(pipeline);
        break;
      case 'npc_generation':
        await this.executeNPCGeneration(pipeline);
        break;
      case 'treasure_allocation':
        await this.executeTreasureAllocation(pipeline);
        break;
      case 'narrative_writing':
        await this.executeNarrativeWriting(pipeline);
        break;
      case 'integration':
        await this.executeIntegration(pipeline);
        break;
      case 'quality_assurance':
        await this.executeQualityAssurance(pipeline);
        break;
      case 'formatting':
        await this.executeFormatting(pipeline);
        break;
      case 'completion':
        await this.executeCompletion(pipeline);
        break;
    }
    
    pipeline.progress.phaseCompletion[phase] = 100;
    this.updateOverallProgress(pipeline);
    
    this.emit('phaseCompleted', pipeline, phase);
  }
  
  // ========================================================================
  // PHASE EXECUTION METHODS
  // ========================================================================
  
  /**
   * Execute budget analysis phase
   */
  private async executeBudgetAnalysis(pipeline: GenerationPipeline): Promise<void> {
    // Analyze XP budget distribution
    const xpAnalysis = EncounterXPCalculator.calculateEncounterBudget(
      pipeline.systemDesignBudget.partyLevel,
      pipeline.systemDesignBudget.partySize,
      'medium',
      'combat'
    );
    
    // Analyze treasure budget
    const treasureAnalysis = TreasureAllocationSystem.allocateTreasure(
      pipeline.systemDesignBudget.partyLevel,
      pipeline.systemDesignBudget.partySize,
      'combat',
      'medium',
      xpAnalysis.encounterXPBudget
    );
    
    // Store analysis results
    pipeline.generatedContent.generationMetadata.budgetAnalysis = {
      xpAnalysis,
      treasureAnalysis,
      analysisTimestamp: new Date()
    };
    
    pipeline.progress.phaseProgress = 100;
  }
  
  /**
   * Execute content planning phase
   */
  private async executeContentPlanning(pipeline: GenerationPipeline): Promise<void> {
    // Content planning is already done in createContentPlan
    // This phase focuses on validation and refinement
    
    const plan = pipeline.contentPlan;
    
    // Validate content plan against budget
    const validationResults = await this.validateContentPlan(plan, pipeline.systemDesignBudget);
    
    // Store validation results
    pipeline.validationResults.planValidation = validationResults;
    
    pipeline.progress.phaseProgress = 100;
  }
  
  /**
   * Execute structure generation phase
   */
  private async executeStructureGeneration(pipeline: GenerationPipeline): Promise<void> {
    const totalTasks = pipeline.contentPlan.chapters.length;
    let completedTasks = 0;
    
    // Generate chapter structures
    for (const chapterPlan of pipeline.contentPlan.chapters) {
      const chapter: Chapter = {
        id: chapterPlan.chapterId,
        projectId: pipeline.projectId,
        chapterNumber: chapterPlan.chapterNumber,
        title: chapterPlan.title,
        description: `Chapter ${chapterPlan.chapterNumber}: ${chapterPlan.title}`,
        content: '',
        sections: [],
        metadata: {
          theme: chapterPlan.theme,
          levelRange: chapterPlan.levelRange,
          xpBudget: chapterPlan.xpBudget,
          treasureBudget: chapterPlan.treasureBudget
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      pipeline.generatedContent.chapters.set(chapterPlan.chapterId, chapter);
      
      completedTasks++;
      pipeline.progress.phaseProgress = (completedTasks / totalTasks) * 100;
    }
  }
  
  /**
   * Execute encounter creation phase
   */
  private async executeEncounterCreation(pipeline: GenerationPipeline): Promise<void> {
    const totalEncounters = pipeline.contentPlan.encounters.length;
    let completedEncounters = 0;
    
    for (const encounterPlan of pipeline.contentPlan.encounters) {
      try {
        // Generate encounter using AI service
        const encounter = await this.aiService.generateEncounter({
          encounterType: encounterPlan.encounterType,
          difficulty: encounterPlan.difficulty,
          partyLevel: encounterPlan.partyLevel,
          partySize: pipeline.systemDesignBudget.partySize,
          theme: pipeline.systemDesignBudget.campaignThemes?.[0] || 'adventure',
          environment: encounterPlan.environment?.setting || 'dungeon',
          objectives: encounterPlan.objectives?.map(obj => obj.description) || ['Defeat enemies']
        });
        
        pipeline.generatedContent.encounters.set(encounterPlan.encounterId, encounter);
        
        completedEncounters++;
        pipeline.progress.phaseProgress = (completedEncounters / totalEncounters) * 100;
        
        // Update progress tracking
        pipeline.progress.generatedContentItems++;
        
      } catch (error) {
        pipeline.warnings.push({
          warningId: `warning_${Date.now()}`,
          phase: 'encounter_creation',
          message: `Failed to generate encounter ${encounterPlan.encounterId}: ${error}`,
          timestamp: new Date(),
          category: 'generation_failure'
        });
      }
    }
  }
  
  /**
   * Execute NPC generation phase
   */
  private async executeNPCGeneration(pipeline: GenerationPipeline): Promise<void> {
    const totalNPCs = pipeline.contentPlan.npcs.length;
    let completedNPCs = 0;
    
    for (const npcPlan of pipeline.contentPlan.npcs) {
      try {
        // Generate NPC using AI service
        const npc = await this.aiService.generateNPC({
          role: npcPlan.role,
          importance: npcPlan.importance,
          level: pipeline.systemDesignBudget.partyLevel,
          theme: pipeline.systemDesignBudget.campaignThemes?.[0] || 'adventure',
          personality: npcPlan.personality || ['friendly', 'helpful'],
          background: npcPlan.background || 'commoner'
        });
        
        pipeline.generatedContent.npcs.set(npcPlan.npcId, npc);
        
        completedNPCs++;
        pipeline.progress.phaseProgress = (completedNPCs / totalNPCs) * 100;
        
        // Update progress tracking
        pipeline.progress.generatedContentItems++;
        
      } catch (error) {
        pipeline.warnings.push({
          warningId: `warning_${Date.now()}`,
          phase: 'npc_generation',
          message: `Failed to generate NPC ${npcPlan.npcId}: ${error}`,
          timestamp: new Date(),
          category: 'generation_failure'
        });
      }
    }
  }
  
  /**
   * Execute treasure allocation phase
   */
  private async executeTreasureAllocation(pipeline: GenerationPipeline): Promise<void> {
    const totalItems = pipeline.contentPlan.magicItems.length;
    let completedItems = 0;
    
    for (const itemPlan of pipeline.contentPlan.magicItems) {
      try {
        // Generate magic item using AI service
        const magicItem = await this.aiService.generateMagicItem({
          rarity: itemPlan.rarity,
          itemType: itemPlan.itemType,
          level: pipeline.systemDesignBudget.partyLevel,
          theme: pipeline.systemDesignBudget.campaignThemes?.[0] || 'adventure',
          attunementRequired: itemPlan.attunementRequired || false,
          cursed: itemPlan.cursed || false
        });
        
        pipeline.generatedContent.magicItems.set(itemPlan.itemId, magicItem);
        
        completedItems++;
        pipeline.progress.phaseProgress = (completedItems / totalItems) * 100;
        
        // Update progress tracking
        pipeline.progress.generatedContentItems++;
        
      } catch (error) {
        pipeline.warnings.push({
          warningId: `warning_${Date.now()}`,
          phase: 'treasure_allocation',
          message: `Failed to generate magic item ${itemPlan.itemId}: ${error}`,
          timestamp: new Date(),
          category: 'generation_failure'
        });
      }
    }
  }
  
  /**
   * Execute narrative writing phase
   */
  private async executeNarrativeWriting(pipeline: GenerationPipeline): Promise<void> {
    const totalChapters = pipeline.contentPlan.chapters.length;
    let completedChapters = 0;
    
    for (const chapterPlan of pipeline.contentPlan.chapters) {
      try {
        // Generate narrative content for chapter
        const narrativeContent = await this.aiService.generateNarrative({
          chapterNumber: chapterPlan.chapterNumber,
          title: chapterPlan.title,
          theme: chapterPlan.theme,
          levelRange: chapterPlan.levelRange,
          introduction: chapterPlan.introduction,
          climax: chapterPlan.climax,
          resolution: chapterPlan.resolution,
          encounters: chapterPlan.encounters,
          npcs: chapterPlan.npcs
        });
        
        // Update chapter with narrative content
        const chapter = pipeline.generatedContent.chapters.get(chapterPlan.chapterId);
        if (chapter) {
          chapter.content = narrativeContent.content;
          chapter.description = narrativeContent.description;
          chapter.updatedAt = new Date();
        }
        
        completedChapters++;
        pipeline.progress.phaseProgress = (completedChapters / totalChapters) * 100;
        
      } catch (error) {
        pipeline.warnings.push({
          warningId: `warning_${Date.now()}`,
          phase: 'narrative_writing',
          message: `Failed to generate narrative for chapter ${chapterPlan.chapterId}: ${error}`,
          timestamp: new Date(),
          category: 'generation_failure'
        });
      }
    }
  }
  
  /**
   * Execute integration phase
   */
  private async executeIntegration(pipeline: GenerationPipeline): Promise<void> {
    // Build content graph to show relationships
    const contentGraph = this.buildContentGraph(pipeline.generatedContent);
    pipeline.generatedContent.contentGraph = contentGraph;
    
    // Cross-reference content
    await this.crossReferenceContent(pipeline);
    
    // Validate content consistency
    await this.validateContentConsistency(pipeline);
    
    pipeline.progress.phaseProgress = 100;
  }
  
  /**
   * Execute quality assurance phase
   */
  private async executeQualityAssurance(pipeline: GenerationPipeline): Promise<void> {
    // Run comprehensive quality checks
    const qualityResults = await this.runQualityAssurance(pipeline);
    
    pipeline.qualityMetrics = qualityResults.metrics;
    pipeline.validationResults = { ...pipeline.validationResults, ...qualityResults.validation };
    
    // Calculate overall quality score
    const overallScore = this.calculateOverallQualityScore(qualityResults.metrics);
    pipeline.progress.averageQualityScore = overallScore;
    
    pipeline.progress.phaseProgress = 100;
  }
  
  /**
   * Execute formatting phase
   */
  private async executeFormatting(pipeline: GenerationPipeline): Promise<void> {
    // Convert all content to Homebrewery format
    await this.convertToHomebreweryFormat(pipeline);
    
    // Apply consistent styling
    await this.applyContentStyling(pipeline);
    
    // Generate final document structure
    await this.generateFinalDocumentStructure(pipeline);
    
    pipeline.progress.phaseProgress = 100;
  }
  
  /**
   * Execute completion phase
   */
  private async executeCompletion(pipeline: GenerationPipeline): Promise<void> {
    // Final validation
    const finalValidation = await this.runFinalValidation(pipeline);
    
    // Generate completion report
    const completionReport = this.generateCompletionReport(pipeline);
    
    // Store final metadata
    pipeline.generatedContent.generationMetadata.completionReport = completionReport;
    pipeline.generatedContent.generationMetadata.finalValidation = finalValidation;
    
    pipeline.progress.phaseProgress = 100;
    pipeline.progress.overallProgress = 100;
  }
  
  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  
  private initializeProgress(): PipelineProgress {
    return {
      overallProgress: 0,
      currentPhase: 'budget_analysis',
      phaseProgress: 0,
      phaseCompletion: {
        budget_analysis: 0,
        content_planning: 0,
        structure_generation: 0,
        encounter_creation: 0,
        npc_generation: 0,
        treasure_allocation: 0,
        narrative_writing: 0,
        integration: 0,
        quality_assurance: 0,
        formatting: 0,
        completion: 0
      },
      totalContentItems: 0,
      generatedContentItems: 0,
      validatedContentItems: 0,
      estimatedTimeRemaining: 60,
      averageGenerationTime: 30,
      tokensUsed: 0,
      estimatedCost: 0,
      averageQualityScore: 0,
      contentPassRate: 0
    };
  }
  
  private initializeGeneratedContent(): GeneratedContent {
    return {
      chapters: new Map(),
      sections: new Map(),
      encounters: new Map(),
      npcs: new Map(),
      magicItems: new Map(),
      statBlocks: new Map(),
      contentGraph: { nodes: [], edges: [] },
      generationMetadata: {
        generatedAt: new Date(),
        generatorVersion: '1.0.0',
        totalGenerationTime: 0,
        totalTokensUsed: 0,
        totalCost: 0
      },
      qualityScores: new Map(),
      validationResults: new Map()
    };
  }
  
  private initializeValidationResults(): ValidationResults {
    return {
      overallScore: 0,
      passRate: 0,
      criticalIssues: 0,
      warnings: 0,
      suggestions: 0,
      validationDetails: new Map()
    };
  }
  
  private initializeQualityMetrics(): QualityMetrics {
    return {
      balanceScore: 0,
      narrativeCoherence: 0,
      mechanicalAccuracy: 0,
      thematicConsistency: 0,
      playerEngagement: 0,
      dmUsability: 0,
      overallQuality: 0
    };
  }
  
  private updateOverallProgress(pipeline: GenerationPipeline): void {
    const phases = Object.keys(pipeline.progress.phaseCompletion) as GenerationPhase[];
    const totalProgress = phases.reduce((sum, phase) => sum + pipeline.progress.phaseCompletion[phase], 0);
    pipeline.progress.overallProgress = totalProgress / phases.length;
  }
  
  private movePipelineToHistory(pipelineId: string): void {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) return;
    
    const projectHistory = this.pipelineHistory.get(pipeline.projectId) || [];
    projectHistory.push(pipeline);
    this.pipelineHistory.set(pipeline.projectId, projectHistory);
    
    this.activePipelines.delete(pipelineId);
  }
  
  // ========================================================================
  // PLANNING UTILITY METHODS
  // ========================================================================
  
  private async generateChapterTitle(chapterNumber: number, themes: string[]): Promise<string> {
    const themeWords = {
      adventure: ['Quest', 'Journey', 'Expedition', 'Discovery', 'Adventure'],
      mystery: ['Mystery', 'Secret', 'Enigma', 'Puzzle', 'Riddle'],
      horror: ['Nightmare', 'Terror', 'Darkness', 'Shadow', 'Fear'],
      political: ['Intrigue', 'Alliance', 'Betrayal', 'Power', 'Conspiracy'],
      exploration: ['Wilderness', 'Unknown', 'Frontier', 'Depths', 'Heights']
    };
    
    const primaryTheme = themes[0] || 'adventure';
    const words = themeWords[primaryTheme as keyof typeof themeWords] || themeWords.adventure;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    return `The ${randomWord} ${chapterNumber > 1 ? 'Continues' : 'Begins'}`;
  }
  
  private async planChapterSections(startLevel: number, endLevel: number, analysis: BudgetAnalysis): Promise<SectionPlan[]> {
    const sections: SectionPlan[] = [];
    const sectionCount = Math.max(3, Math.ceil((endLevel - startLevel + 1) * 2)); // ~2 sections per level
    
    for (let i = 0; i < sectionCount; i++) {
      const sectionTypes = ['encounter', 'exploration', 'social', 'narrative'];
      const sectionType = sectionTypes[i % sectionTypes.length] as any;
      
      sections.push({
        sectionId: `section_${i + 1}`,
        title: `Section ${i + 1}`,
        type: sectionType,
        estimatedDuration: 60 + (Math.random() * 60), // 60-120 minutes
        primaryContent: [
          {
            type: sectionType,
            parameters: { level: startLevel + Math.floor(i / 2) },
            priority: 8
          }
        ],
        supportingContent: [],
        prerequisites: i > 0 ? [`section_${i}`] : [],
        unlocks: i < sectionCount - 1 ? [`section_${i + 2}`] : []
      });
    }
    
    return sections;
  }
  
  private async planNarrativeSection(type: 'introduction' | 'climax' | 'resolution', chapterNumber: number, analysis: BudgetAnalysis): Promise<NarrativePlan> {
    const wordCounts = {
      introduction: 300 + (chapterNumber * 50),
      climax: 500 + (chapterNumber * 75),
      resolution: 200 + (chapterNumber * 25)
    };
    
    return {
      type,
      wordCount: wordCounts[type],
      keyElements: this.generateNarrativeElements(type, analysis.campaignThemes),
      tone: analysis.contentTone,
      pacing: type === 'climax' ? 'fast' : 'moderate'
    };
  }
  
  private generateNarrativeElements(type: 'introduction' | 'climax' | 'resolution', themes: string[]): string[] {
    const elements = {
      introduction: ['setting_establishment', 'character_introduction', 'conflict_setup', 'mood_setting'],
      climax: ['tension_peak', 'major_conflict', 'character_decisions', 'action_sequence'],
      resolution: ['conflict_resolution', 'character_growth', 'consequences', 'setup_next_chapter']
    };
    
    return elements[type];
  }
  
  private planChapterDifficultyProgression(startLevel: number, endLevel: number): DifficultyProgression {
    return {
      startDifficulty: startLevel <= 2 ? 'easy' : 'medium',
      endDifficulty: endLevel >= 10 ? 'deadly' : 'hard',
      progressionCurve: 'gradual',
      milestoneEncounters: [`level_${startLevel}_boss`, `level_${endLevel}_finale`]
    };
  }
  
  private async planEncounters(budget: SystemDesignBudget, chapters: ChapterPlan[]): Promise<EncounterPlan[]> {
    const encounters: EncounterPlan[] = [];
    
    for (const chapter of chapters) {
      const encountersPerChapter = Math.ceil(chapter.xpBudget / (budget.partyLevel * budget.partySize * 300));
      
      for (let i = 0; i < encountersPerChapter; i++) {
        const difficulty = this.calculateEncounterDifficulty(i, encountersPerChapter, chapter.difficultyProgression);
        
        encounters.push({
          encounterId: `${chapter.chapterId}_encounter_${i + 1}`,
          chapterId: chapter.chapterId,
          sectionId: chapter.sections[i % chapter.sections.length]?.sectionId || 'section_1',
          encounterType: this.selectEncounterType(i, encountersPerChapter),
          difficulty,
          partyLevel: chapter.levelRange[0] + Math.floor(i / 2),
          xpBudget: Math.ceil(chapter.xpBudget / encountersPerChapter),
          treasureBudget: Math.ceil(chapter.treasureBudget / encountersPerChapter),
          monsters: await this.planMonsters(difficulty, budget.partyLevel, budget.partySize),
          npcs: await this.planEncounterNPCs(chapter.theme),
          environment: await this.planEnvironment(chapter.theme),
          objectives: await this.planObjectives(this.selectEncounterType(i, encountersPerChapter)),
          storyContext: `Chapter ${chapter.chapterNumber} encounter ${i + 1}`,
          consequences: await this.planConsequences(difficulty)
        });
      }
    }
    
    return encounters;
  }
  
  private calculateEncounterDifficulty(index: number, total: number, progression: DifficultyProgression): 'easy' | 'medium' | 'hard' | 'deadly' {
    const progress = index / (total - 1);
    
    if (progress < 0.3) return 'easy';
    if (progress < 0.6) return 'medium';
    if (progress < 0.9) return 'hard';
    return 'deadly';
  }
  
  private selectEncounterType(index: number, total: number): 'combat' | 'social' | 'exploration' | 'puzzle' {
    const types: ('combat' | 'social' | 'exploration' | 'puzzle')[] = ['combat', 'social', 'exploration', 'puzzle'];
    
    // Ensure variety but favor combat
    if (index === 0) return 'combat'; // Start with combat
    if (index === total - 1) return 'combat'; // End with combat
    
    return types[index % types.length];
  }
  
  private async planMonsters(difficulty: string, partyLevel: number, partySize: number): Promise<MonsterRequirement[]> {
    const crByDifficulty = {
      easy: Math.max(0.125, partyLevel * 0.5),
      medium: Math.max(0.25, partyLevel * 0.75),
      hard: Math.max(0.5, partyLevel * 1.0),
      deadly: Math.max(1, partyLevel * 1.25)
    };
    
    const targetCR = crByDifficulty[difficulty as keyof typeof crByDifficulty];
    
    return [
      {
        cr: targetCR,
        type: 'humanoid',
        role: 'soldier',
        count: Math.max(1, Math.floor(partySize / 2))
      }
    ];
  }
  
  private async planEncounterNPCs(theme: string): Promise<NPCRequirement[]> {
    return [
      {
        role: 'antagonist',
        importance: 'primary' as const,
        personality: [theme, 'determined']
      }
    ];
  }
  
  private async planEnvironment(theme: string): Promise<EnvironmentRequirement> {
    const environments = {
      adventure: 'dungeon',
      mystery: 'urban',
      horror: 'haunted_location',
      political: 'court',
      exploration: 'wilderness'
    };
    
    return {
      setting: environments[theme as keyof typeof environments] || 'dungeon',
      features: ['cover', 'elevation_changes'],
      hazards: ['difficult_terrain'],
      atmosphere: theme
    };
  }
  
  private async planObjectives(encounterType: string): Promise<ObjectiveRequirement[]> {
    const objectives = {
      combat: [{ type: 'defeat', description: 'Defeat all enemies', successCriteria: ['All enemies defeated'], failureConsequences: ['Party retreat', 'Casualties'] }],
      social: [{ type: 'persuasion', description: 'Convince the NPC', successCriteria: ['Successful persuasion'], failureConsequences: ['Hostile relations'] }],
      exploration: [{ type: 'discovery', description: 'Find the hidden passage', successCriteria: ['Passage discovered'], failureConsequences: ['Must find alternative route'] }],
      puzzle: [{ type: 'solve', description: 'Solve the ancient riddle', successCriteria: ['Riddle solved'], failureConsequences: ['Trap activated'] }]
    };
    
    return objectives[encounterType as keyof typeof objectives] || objectives.combat;
  }
  
  private async planConsequences(difficulty: string): Promise<ConsequenceRequirement[]> {
    return [
      {
        type: 'success' as const,
        impact: 'positive',
        narrativeEffect: 'Story progresses forward'
      },
      {
        type: 'failure' as const,
        impact: 'negative',
        narrativeEffect: difficulty === 'deadly' ? 'Major setback' : 'Minor complication'
      }
    ];
  }
  
  private async planNPCs(budget: SystemDesignBudget, chapters: ChapterPlan[], encounters: EncounterPlan[]): Promise<NPCPlan[]> {
    const npcs: NPCPlan[] = [];
    
    // Plan major NPCs for each chapter
    for (const chapter of chapters) {
      npcs.push({
        npcId: `${chapter.chapterId}_major_npc`,
        chapterId: chapter.chapterId,
        role: 'quest_giver',
        importance: 'primary' as const,
        personality: [chapter.theme, 'wise'],
        background: 'noble',
        level: chapter.levelRange[0]
      });
    }
    
    // Plan encounter-specific NPCs
    for (const encounter of encounters) {
      if (encounter.encounterType === 'social') {
        npcs.push({
          npcId: `${encounter.encounterId}_social_npc`,
          chapterId: encounter.chapterId,
          role: 'conversation_partner',
          importance: 'secondary' as const,
          personality: ['helpful', 'knowledgeable'],
          background: 'commoner',
          level: encounter.partyLevel
        });
      }
    }
    
    return npcs;
  }
  
  private async planMagicItems(budget: SystemDesignBudget, encounters: EncounterPlan[]): Promise<MagicItemPlan[]> {
    const items: MagicItemPlan[] = [];
    
    // Distribute magic items based on party level and encounter rewards
    const itemsPerLevel = Math.max(1, Math.floor(budget.partySize * 0.75));
    
    for (let level = budget.partyLevel; level <= budget.targetLevel; level++) {
      for (let i = 0; i < itemsPerLevel; i++) {
        const rarity = this.determineItemRarity(level);
        
        items.push({
          itemId: `magic_item_level_${level}_${i + 1}`,
          level,
          rarity,
          itemType: this.selectItemType(i, itemsPerLevel),
          attunementRequired: rarity !== 'common' && Math.random() > 0.6,
          cursed: Math.random() > 0.9, // 10% chance of cursed items
          sourceEncounter: encounters[Math.floor(Math.random() * encounters.length)]?.encounterId
        });
      }
    }
    
    return items;
  }
  
  private determineItemRarity(level: number): 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' {
    if (level <= 4) return Math.random() > 0.7 ? 'uncommon' : 'common';
    if (level <= 10) return Math.random() > 0.6 ? 'rare' : 'uncommon';
    if (level <= 16) return Math.random() > 0.7 ? 'very_rare' : 'rare';
    return Math.random() > 0.8 ? 'legendary' : 'very_rare';
  }
  
  private selectItemType(index: number, total: number): string {
    const types = ['weapon', 'armor', 'wondrous', 'potion', 'scroll', 'ring', 'rod', 'staff', 'wand'];
    return types[index % types.length];
  }
  
  private createGenerationSequence(chapters: ChapterPlan[], encounters: EncounterPlan[], npcs: NPCPlan[], magicItems: MagicItemPlan[]): GenerationTask[] {
    const tasks: GenerationTask[] = [];
    
    // Chapter structure tasks
    chapters.forEach((chapter, index) => {
      tasks.push({
        taskId: `task_chapter_${chapter.chapterId}`,
        taskType: 'chapter',
        contentId: chapter.chapterId,
        generationType: 'chapter_structure',
        parameters: { chapter },
        dependsOn: index > 0 ? [`task_chapter_${chapters[index - 1].chapterId}`] : [],
        priority: 10,
        estimatedTokens: 500,
        estimatedDuration: 30,
        status: 'pending',
        attempts: 0
      });
    });
    
    // Encounter tasks
    encounters.forEach(encounter => {
      tasks.push({
        taskId: `task_encounter_${encounter.encounterId}`,
        taskType: 'encounter',
        contentId: encounter.encounterId,
        generationType: 'encounter_creation',
        parameters: { encounter },
        dependsOn: [`task_chapter_${encounter.chapterId}`],
        priority: 8,
        estimatedTokens: 800,
        estimatedDuration: 60,
        status: 'pending',
        attempts: 0
      });
    });
    
    // NPC tasks
    npcs.forEach(npc => {
      tasks.push({
        taskId: `task_npc_${npc.npcId}`,
        taskType: 'npc',
        contentId: npc.npcId,
        generationType: 'npc_creation',
        parameters: { npc },
        dependsOn: [`task_chapter_${npc.chapterId}`],
        priority: 6,
        estimatedTokens: 600,
        estimatedDuration: 45,
        status: 'pending',
        attempts: 0
      });
    });
    
    // Magic item tasks
    magicItems.forEach(item => {
      tasks.push({
        taskId: `task_item_${item.itemId}`,
        taskType: 'magic_item',
        contentId: item.itemId,
        generationType: 'magic_item_creation',
        parameters: { item },
        dependsOn: item.sourceEncounter ? [`task_encounter_${item.sourceEncounter}`] : [],
        priority: 4,
        estimatedTokens: 400,
        estimatedDuration: 30,
        status: 'pending',
        attempts: 0
      });
    });
    
    return tasks.sort((a, b) => b.priority - a.priority);
  }
  
  private analyzeDependencies(tasks: GenerationTask[]): ContentDependency[] {
    const dependencies: ContentDependency[] = [];
    
    tasks.forEach(task => {
      task.dependsOn.forEach(prerequisiteId => {
        dependencies.push({
          dependentId: task.taskId,
          prerequisiteId,
          dependencyType: 'hard',
          reason: 'Content structure dependency'
        });
      });
    });
    
    return dependencies;
  }
  
  private calculateResourceEstimates(tasks: GenerationTask[]): { tokens: number; cost: number; duration: number } {
    const totalTokens = tasks.reduce((sum, task) => sum + task.estimatedTokens, 0);
    const totalDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0) / 60; // Convert to minutes
    
    // Rough cost estimate: $0.002 per 1K tokens for GPT-4o-mini
    const estimatedCost = (totalTokens / 1000) * 0.002;
    
    return {
      tokens: totalTokens,
      cost: estimatedCost,
      duration: totalDuration
    };
  }
  
  private createValidationCriteria(budget: SystemDesignBudget, settings: GenerationSettings): ValidationCriteria[] {
    return [
      { criterion: 'mechanical_balance', weight: 0.3, threshold: 80, validator: 'balance_validator' },
      { criterion: 'narrative_coherence', weight: 0.25, threshold: 75, validator: 'narrative_validator' },
      { criterion: 'thematic_consistency', weight: 0.2, threshold: 70, validator: 'theme_validator' },
      { criterion: 'player_engagement', weight: 0.15, threshold: 65, validator: 'engagement_validator' },
      { criterion: 'dm_usability', weight: 0.1, threshold: 80, validator: 'usability_validator' }
    ];
  }
  
  private analyzeDifficultyProgression(budget: SystemDesignBudget): DifficultyProgression {
    return {
      startDifficulty: budget.partyLevel <= 2 ? 'easy' : 'medium',
      endDifficulty: budget.targetLevel >= 15 ? 'deadly' : 'hard',
      progressionCurve: 'gradual',
      milestoneEncounters: [`level_${budget.partyLevel}_start`, `level_${budget.targetLevel}_finale`]
    };
  }
  
  // Stub methods for compilation - these would be implemented in subsequent tasks
  private async continuePipelineExecution(pipelineId: string): Promise<void> {
    // Implementation in Task 84
  }
  
  private async validateContentPlan(plan: ContentGenerationPlan, budget: SystemDesignBudget): Promise<any> {
    return { valid: true, score: 85 };
  }
  
  private buildContentGraph(content: GeneratedContent): ContentGraph {
    return { nodes: [], edges: [] };
  }
  
  private async crossReferenceContent(pipeline: GenerationPipeline): Promise<void> {
    // Implementation in Task 86
  }
  
  private async validateContentConsistency(pipeline: GenerationPipeline): Promise<void> {
    // Implementation in Task 85
  }
  
  private async runQualityAssurance(pipeline: GenerationPipeline): Promise<any> {
    return { metrics: this.initializeQualityMetrics(), validation: {} };
  }
  
  private calculateOverallQualityScore(metrics: QualityMetrics): number {
    return (metrics.balanceScore + metrics.narrativeCoherence + metrics.mechanicalAccuracy + 
            metrics.thematicConsistency + metrics.playerEngagement + metrics.dmUsability) / 6;
  }
  
  private async convertToHomebreweryFormat(pipeline: GenerationPipeline): Promise<void> {
    // Implementation in Task 88
  }
  
  private async applyContentStyling(pipeline: GenerationPipeline): Promise<void> {
    // Implementation in Task 88
  }
  
  private async generateFinalDocumentStructure(pipeline: GenerationPipeline): Promise<void> {
    // Implementation in Task 88
  }
  
  private async runFinalValidation(pipeline: GenerationPipeline): Promise<any> {
    return { valid: true, score: 90 };
  }
  
  private generateCompletionReport(pipeline: GenerationPipeline): any {
    return {
      pipelineId: pipeline.pipelineId,
      completedAt: new Date(),
      totalContent: pipeline.progress.generatedContentItems,
      qualityScore: pipeline.progress.averageQualityScore,
      tokensUsed: pipeline.progress.tokensUsed,
      estimatedCost: pipeline.progress.estimatedCost
    };
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface BudgetAnalysis {
  partyLevel: number;
  partySize: number;
  levelProgression: string;
  totalXPBudget: number;
  dailyXPBudget: number;
  encounterDistribution: Record<string, number>;
  totalSessions: number;
  sessionsPerLevel: number;
  averageSessionLength: number;
  estimatedEncounters: number;
  estimatedNPCs: number;
  estimatedMagicItems: number;
  difficultyProgression: DifficultyProgression;
  campaignThemes: string[];
  contentTone: string;
  pacingProfile: string;
  intensityCurve: string;
}

interface DifficultyProgression {
  startDifficulty: string;
  endDifficulty: string;
  progressionCurve: string;
  milestoneEncounters: string[];
}

interface NarrativePlan {
  type: 'introduction' | 'climax' | 'resolution';
  wordCount: number;
  keyElements: string[];
  tone: string;
  pacing: string;
}

interface ContentRequirement {
  type: string;
  parameters: Record<string, any>;
  priority: number;
}

interface MonsterRequirement {
  cr: number;
  type: string;
  role: string;
  count: number;
}

interface NPCRequirement {
  role: string;
  importance: 'primary' | 'secondary' | 'minor';
  personality: string[];
}

interface EnvironmentRequirement {
  setting: string;
  features: string[];
  hazards: string[];
  atmosphere: string;
}

interface ObjectiveRequirement {
  type: string;
  description: string;
  successCriteria: string[];
  failureConsequences: string[];
}

interface ConsequenceRequirement {
  type: 'success' | 'failure' | 'partial';
  impact: string;
  narrativeEffect: string;
}

interface ContentDependency {
  dependentId: string;
  prerequisiteId: string;
  dependencyType: 'hard' | 'soft';
  reason: string;
}

interface ValidationResults {
  overallScore: number;
  passRate: number;
  criticalIssues: number;
  warnings: number;
  suggestions: number;
  validationDetails: Map<string, ValidationResult>;
}

interface ValidationResult {
  contentId: string;
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

interface ValidationIssue {
  severity: 'critical' | 'warning' | 'suggestion';
  category: string;
  message: string;
  fix?: string;
}

interface QualityMetrics {
  balanceScore: number;
  narrativeCoherence: number;
  mechanicalAccuracy: number;
  thematicConsistency: number;
  playerEngagement: number;
  dmUsability: number;
  overallQuality: number;
}

interface GenerationMetadata {
  generatedAt: Date;
  generatorVersion: string;
  totalGenerationTime: number;
  totalTokensUsed: number;
  totalCost: number;
}

interface GenerationError {
  errorId: string;
  phase: GenerationPhase;
  message: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface GenerationWarning {
  warningId: string;
  phase: GenerationPhase;
  message: string;
  timestamp: Date;
  category: string;
}

interface ValidationCriteria {
  criterion: string;
  weight: number;
  threshold: number;
  validator: string;
}

interface NPCPlan {
  npcId: string;
  chapterId: string;
  role: string;
  importance: 'primary' | 'secondary' | 'minor';
  personality: string[];
  background: string;
  level: number;
}

interface MagicItemPlan {
  itemId: string;
  level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  itemType: string;
  attunementRequired: boolean;
  cursed: boolean;
  sourceEncounter?: string;
}

// Export the orchestrator as default
export default ContentGenerationOrchestrator;
