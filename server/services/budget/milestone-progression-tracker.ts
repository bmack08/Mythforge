// Mythwright Milestone Progression Tracker - Task 78
// Campaign progression tracking with milestone-based advancement and story pacing

import type { SystemDesignBudget } from '../../types/content.types.js';

// ============================================================================
// MILESTONE PROGRESSION TYPES
// ============================================================================

export interface MilestoneProgressionTracker {
  // Campaign Information
  campaignId: string;
  campaignName: string;
  startLevel: number;
  targetLevel: number;
  currentLevel: number;
  
  // Progression System
  progressionType: ProgressionType;
  milestones: Milestone[];
  currentMilestone: number;
  
  // Session Tracking
  totalSessions: number;
  sessionsCompleted: number;
  averageSessionLength: number; // in hours
  
  // Experience Tracking (for hybrid systems)
  totalXPEarned: number;
  xpToNextLevel: number;
  xpThresholds: XPThreshold[];
  
  // Story Arc Tracking
  storyArcs: StoryArc[];
  currentArc: number;
  
  // Analysis
  progressionAnalysis: ProgressionAnalysis;
  pacing: PacingMetrics;
  recommendations: ProgressionRecommendation[];
  warnings: ProgressionWarning[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  level: number;
  type: MilestoneType;
  storyArcId?: string;
  
  // Requirements
  requirements: MilestoneRequirement[];
  optional: boolean;
  
  // Progress
  completed: boolean;
  completionDate?: Date;
  sessionCompleted?: number;
  
  // Rewards
  rewards: MilestoneReward[];
  
  // Analysis
  estimatedSessions: number;
  actualSessions?: number;
  difficultyLevel: number; // 1-10
  importance: MilestoneImportance;
}

export interface MilestoneRequirement {
  type: RequirementType;
  description: string;
  target: string | number;
  completed: boolean;
  progress?: number; // 0-100
}

export interface MilestoneReward {
  type: RewardType;
  description: string;
  value: number | string;
  automatic: boolean;
}

export interface StoryArc {
  id: string;
  name: string;
  description: string;
  theme: StoryTheme;
  
  // Level Range
  startLevel: number;
  endLevel: number;
  
  // Progress
  milestoneIds: string[];
  completed: boolean;
  currentPhase: ArcPhase;
  
  // Structure
  acts: StoryAct[];
  
  // Analysis
  estimatedLength: number; // sessions
  actualLength?: number;
  intensity: IntensityLevel;
  playerEngagement: number; // 0-100
}

export interface StoryAct {
  id: string;
  name: string;
  description: string;
  actNumber: number;
  
  // Structure
  scenes: Scene[];
  climax: Scene;
  
  // Progress
  completed: boolean;
  currentScene: number;
  
  // Analysis
  estimatedSessions: number;
  actualSessions?: number;
  intensity: IntensityLevel;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  type: SceneType;
  
  // Requirements
  level: number;
  prerequisites: string[];
  
  // Content
  encounters: string[]; // encounter IDs
  npcs: string[]; // NPC IDs
  locations: string[]; // location IDs
  
  // Progress
  completed: boolean;
  playerChoices: PlayerChoice[];
  
  // Analysis
  estimatedDuration: number; // hours
  actualDuration?: number;
  playerSatisfaction: number; // 0-100
}

export interface PlayerChoice {
  choiceId: string;
  description: string;
  consequences: string[];
  impact: ChoiceImpact;
  timestamp: Date;
}

export interface XPThreshold {
  level: number;
  xpRequired: number;
  xpTotal: number; // cumulative XP to reach this level
}

export interface ProgressionAnalysis {
  overallPace: PaceRating;
  levelingSpeed: number; // levels per session
  storyCoherence: number; // 0-100
  playerEngagement: number; // 0-100
  challengeProgression: number; // 0-100
  narrativeFlow: number; // 0-100
  
  // Predictions
  estimatedCompletionSessions: number;
  estimatedCompletionDate: Date;
  riskFactors: RiskFactor[];
}

export interface PacingMetrics {
  sessionsPerLevel: number;
  hoursPerLevel: number;
  milestonesPerSession: number;
  
  // Intensity Tracking
  combatIntensity: IntensityTrend;
  socialIntensity: IntensityTrend;
  explorationIntensity: IntensityTrend;
  
  // Variety Metrics
  encounterVariety: number; // 0-100
  locationVariety: number; // 0-100
  npcVariety: number; // 0-100
  
  // Player Metrics
  decisionPoints: number;
  agencyLevel: number; // 0-100
  consequenceWeight: number; // 0-100
}

export interface IntensityTrend {
  current: IntensityLevel;
  trend: TrendDirection;
  recentSessions: IntensityLevel[];
  average: number;
  peaks: number[];
  valleys: number[];
}

export interface RiskFactor {
  type: RiskType;
  severity: RiskSeverity;
  description: string;
  likelihood: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
}

export interface ProgressionRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  description: string;
  implementation: string;
  expectedImpact: string;
}

export interface ProgressionWarning {
  type: WarningType;
  severity: WarningSeverity;
  message: string;
  suggestion: string;
  deadline?: Date;
}

// Enums and Types
export type ProgressionType = 'milestone' | 'xp' | 'hybrid' | 'session_based' | 'story_based';
export type MilestoneType = 'story' | 'character' | 'exploration' | 'social' | 'combat' | 'puzzle' | 'achievement';
export type MilestoneImportance = 'critical' | 'major' | 'minor' | 'optional';
export type RequirementType = 'defeat_enemy' | 'reach_location' | 'complete_quest' | 'social_interaction' | 'discovery' | 'choice' | 'skill_check' | 'time_passage';
export type RewardType = 'level_up' | 'magic_item' | 'gold' | 'reputation' | 'ability' | 'knowledge' | 'ally' | 'resource';
export type StoryTheme = 'heroic_journey' | 'mystery' | 'political_intrigue' | 'exploration' | 'survival' | 'romance' | 'redemption' | 'revenge';
export type ArcPhase = 'setup' | 'rising_action' | 'climax' | 'falling_action' | 'resolution';
export type SceneType = 'combat' | 'social' | 'exploration' | 'puzzle' | 'roleplay' | 'investigation' | 'travel' | 'downtime';
export type ChoiceImpact = 'minor' | 'moderate' | 'major' | 'campaign_changing';
export type PaceRating = 'too_slow' | 'slow' | 'good' | 'fast' | 'too_fast';
export type IntensityLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
export type TrendDirection = 'declining' | 'stable' | 'rising';
export type RiskType = 'pacing' | 'engagement' | 'difficulty' | 'story_coherence' | 'player_agency' | 'campaign_length';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationType = 'pacing_adjustment' | 'story_development' | 'challenge_scaling' | 'player_engagement' | 'narrative_focus';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WarningType = 'slow_progression' | 'fast_progression' | 'story_disconnect' | 'player_disengagement' | 'difficulty_spike' | 'milestone_overdue';
export type WarningSeverity = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// XP THRESHOLDS (PHB PAGE 15)
// ============================================================================

const XP_THRESHOLDS: XPThreshold[] = [
  { level: 1, xpRequired: 0, xpTotal: 0 },
  { level: 2, xpRequired: 300, xpTotal: 300 },
  { level: 3, xpRequired: 600, xpTotal: 900 },
  { level: 4, xpRequired: 1800, xpTotal: 2700 },
  { level: 5, xpRequired: 3800, xpTotal: 6500 },
  { level: 6, xpRequired: 7500, xpTotal: 14000 },
  { level: 7, xpRequired: 9000, xpTotal: 23000 },
  { level: 8, xpRequired: 11000, xpTotal: 34000 },
  { level: 9, xpRequired: 14000, xpTotal: 48000 },
  { level: 10, xpRequired: 21000, xpTotal: 64000 },
  { level: 11, xpRequired: 15000, xpTotal: 85000 },
  { level: 12, xpRequired: 20000, xpTotal: 100000 },
  { level: 13, xpRequired: 20000, xpTotal: 120000 },
  { level: 14, xpRequired: 25000, xpTotal: 140000 },
  { level: 15, xpRequired: 30000, xpTotal: 165000 },
  { level: 16, xpRequired: 30000, xpTotal: 195000 },
  { level: 17, xpRequired: 40000, xpTotal: 225000 },
  { level: 18, xpRequired: 40000, xpTotal: 265000 },
  { level: 19, xpRequired: 50000, xpTotal: 305000 },
  { level: 20, xpRequired: 50000, xpTotal: 355000 }
];

// ============================================================================
// MILESTONE PROGRESSION TRACKER CLASS
// ============================================================================

export class MilestoneProgressionTracker {
  
  // ============================================================================
  // MAIN TRACKING METHODS
  // ============================================================================
  
  static createProgressionTracker(
    campaignId: string,
    campaignName: string,
    startLevel: number,
    targetLevel: number,
    progressionType: ProgressionType,
    systemBudget?: SystemDesignBudget
  ): MilestoneProgressionTracker {
    
    // Validate inputs
    this.validateInputs(startLevel, targetLevel, progressionType);
    
    // Generate initial milestones based on level progression
    const milestones = this.generateLevelMilestones(startLevel, targetLevel, progressionType);
    
    // Create story arcs based on level ranges
    const storyArcs = this.generateStoryArcs(startLevel, targetLevel, systemBudget);
    
    // Calculate initial progression analysis
    const progressionAnalysis = this.analyzeProgression(
      startLevel, 
      targetLevel, 
      milestones, 
      storyArcs, 
      0, // sessions completed
      systemBudget
    );
    
    // Initialize pacing metrics
    const pacing = this.initializePacingMetrics(startLevel, targetLevel);
    
    return {
      campaignId,
      campaignName,
      startLevel,
      targetLevel,
      currentLevel: startLevel,
      progressionType,
      milestones,
      currentMilestone: 0,
      totalSessions: progressionAnalysis.estimatedCompletionSessions,
      sessionsCompleted: 0,
      averageSessionLength: 4, // 4 hours default
      totalXPEarned: XP_THRESHOLDS[startLevel - 1]?.xpTotal || 0,
      xpToNextLevel: XP_THRESHOLDS[startLevel]?.xpRequired || 0,
      xpThresholds: XP_THRESHOLDS.slice(startLevel - 1, targetLevel),
      storyArcs,
      currentArc: 0,
      progressionAnalysis,
      pacing,
      recommendations: [],
      warnings: []
    };
  }
  
  static updateProgression(
    tracker: MilestoneProgressionTracker,
    completedMilestones: string[],
    xpGained: number = 0,
    sessionData?: SessionData
  ): MilestoneProgressionTracker {
    
    const updatedTracker = { ...tracker };
    
    // Update completed milestones
    completedMilestones.forEach(milestoneId => {
      const milestone = updatedTracker.milestones.find(m => m.id === milestoneId);
      if (milestone && !milestone.completed) {
        milestone.completed = true;
        milestone.completionDate = new Date();
        milestone.sessionCompleted = updatedTracker.sessionsCompleted + 1;
        
        // Process milestone rewards
        this.processMilestoneRewards(updatedTracker, milestone);
      }
    });
    
    // Update XP if using XP or hybrid system
    if (tracker.progressionType === 'xp' || tracker.progressionType === 'hybrid') {
      updatedTracker.totalXPEarned += xpGained;
      this.checkLevelUp(updatedTracker);
    }
    
    // Update session data
    if (sessionData) {
      updatedTracker.sessionsCompleted++;
      updatedTracker.averageSessionLength = (
        (updatedTracker.averageSessionLength * (updatedTracker.sessionsCompleted - 1) + sessionData.duration) / 
        updatedTracker.sessionsCompleted
      );
      
      // Update pacing metrics
      this.updatePacingMetrics(updatedTracker, sessionData);
    }
    
    // Recalculate progression analysis
    updatedTracker.progressionAnalysis = this.analyzeProgression(
      updatedTracker.startLevel,
      updatedTracker.targetLevel,
      updatedTracker.milestones,
      updatedTracker.storyArcs,
      updatedTracker.sessionsCompleted
    );
    
    // Generate new recommendations and warnings
    updatedTracker.recommendations = this.generateRecommendations(updatedTracker);
    updatedTracker.warnings = this.generateWarnings(updatedTracker);
    
    return updatedTracker;
  }
  
  // ============================================================================
  // MILESTONE GENERATION
  // ============================================================================
  
  private static generateLevelMilestones(
    startLevel: number,
    targetLevel: number,
    progressionType: ProgressionType
  ): Milestone[] {
    const milestones: Milestone[] = [];
    
    for (let level = startLevel + 1; level <= targetLevel; level++) {
      // Major story milestone for each level
      milestones.push({
        id: `level_${level}_story`,
        name: `Reach Level ${level}`,
        description: `Complete the major story milestone to advance to level ${level}`,
        level,
        type: 'story',
        requirements: [
          {
            type: 'complete_quest',
            description: `Complete level ${level} main quest`,
            target: `main_quest_level_${level}`,
            completed: false
          }
        ],
        optional: false,
        completed: false,
        rewards: [
          {
            type: 'level_up',
            description: `Advance to level ${level}`,
            value: level,
            automatic: true
          }
        ],
        estimatedSessions: this.estimateSessionsForLevel(level),
        difficultyLevel: Math.min(10, level),
        importance: level % 5 === 0 ? 'critical' : level % 2 === 0 ? 'major' : 'minor'
      });
      
      // Optional character development milestone
      if (level % 2 === 0) {
        milestones.push({
          id: `level_${level}_character`,
          name: `Character Development (Level ${level})`,
          description: `Personal character growth and development milestone`,
          level,
          type: 'character',
          requirements: [
            {
              type: 'social_interaction',
              description: 'Meaningful character development interaction',
              target: 'character_growth',
              completed: false
            }
          ],
          optional: true,
          completed: false,
          rewards: [
            {
              type: 'ability',
              description: 'Character insight or special ability',
              value: 'character_development_bonus',
              automatic: false
            }
          ],
          estimatedSessions: 1,
          difficultyLevel: 3,
          importance: 'minor'
        });
      }
      
      // Exploration milestone for certain levels
      if (level % 3 === 0) {
        milestones.push({
          id: `level_${level}_exploration`,
          name: `Discovery Milestone (Level ${level})`,
          description: `Discover important location or secret`,
          level,
          type: 'exploration',
          requirements: [
            {
              type: 'reach_location',
              description: 'Discover significant location',
              target: `discovery_level_${level}`,
              completed: false
            }
          ],
          optional: true,
          completed: false,
          rewards: [
            {
              type: 'knowledge',
              description: 'Important campaign information',
              value: 'discovery_knowledge',
              automatic: true
            }
          ],
          estimatedSessions: 2,
          difficultyLevel: 5,
          importance: 'minor'
        });
      }
    }
    
    return milestones;
  }
  
  private static generateStoryArcs(
    startLevel: number,
    targetLevel: number,
    systemBudget?: SystemDesignBudget
  ): StoryArc[] {
    const storyArcs: StoryArc[] = [];
    const levelRange = targetLevel - startLevel;
    
    // Determine number of arcs based on level range
    const arcCount = Math.max(1, Math.ceil(levelRange / 5));
    const levelsPerArc = Math.ceil(levelRange / arcCount);
    
    for (let i = 0; i < arcCount; i++) {
      const arcStartLevel = startLevel + (i * levelsPerArc);
      const arcEndLevel = Math.min(targetLevel, arcStartLevel + levelsPerArc - 1);
      
      // Determine arc theme based on level range and system budget
      const theme = this.selectArcTheme(arcStartLevel, arcEndLevel, systemBudget);
      const intensity = this.calculateArcIntensity(i, arcCount, arcStartLevel);
      
      storyArcs.push({
        id: `arc_${i + 1}`,
        name: `${theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Arc`,
        description: `Story arc covering levels ${arcStartLevel} to ${arcEndLevel}`,
        theme,
        startLevel: arcStartLevel,
        endLevel: arcEndLevel,
        milestoneIds: [], // Will be populated with relevant milestone IDs
        completed: false,
        currentPhase: 'setup',
        acts: this.generateStoryActs(arcStartLevel, arcEndLevel, theme),
        estimatedLength: (arcEndLevel - arcStartLevel + 1) * 4, // 4 sessions per level
        intensity,
        playerEngagement: 75 // Default good engagement
      });
    }
    
    return storyArcs;
  }
  
  private static generateStoryActs(startLevel: number, endLevel: number, theme: StoryTheme): StoryAct[] {
    const acts: StoryAct[] = [];
    const levelRange = endLevel - startLevel + 1;
    
    // Three-act structure
    const actStructure = [
      { name: 'Setup', phase: 'setup', portion: 0.25 },
      { name: 'Development', phase: 'rising_action', portion: 0.5 },
      { name: 'Resolution', phase: 'climax', portion: 0.25 }
    ];
    
    actStructure.forEach((actInfo, index) => {
      const actLevels = Math.ceil(levelRange * actInfo.portion);
      const actStartLevel = startLevel + (index === 0 ? 0 : Math.floor(levelRange * (index === 1 ? 0.25 : 0.75)));
      
      acts.push({
        id: `act_${index + 1}`,
        name: `Act ${index + 1}: ${actInfo.name}`,
        description: `${actInfo.name} phase of the ${theme} story arc`,
        actNumber: index + 1,
        scenes: this.generateScenes(actStartLevel, actLevels, theme, actInfo.phase),
        climax: this.generateClimaxScene(actStartLevel + actLevels - 1, theme),
        completed: false,
        currentScene: 0,
        estimatedSessions: actLevels * 4,
        intensity: index === 2 ? 'very_high' : index === 1 ? 'high' : 'moderate'
      });
    });
    
    return acts;
  }
  
  // ============================================================================
  // ANALYSIS AND CALCULATIONS
  // ============================================================================
  
  private static analyzeProgression(
    startLevel: number,
    targetLevel: number,
    milestones: Milestone[],
    storyArcs: StoryArc[],
    sessionsCompleted: number,
    systemBudget?: SystemDesignBudget
  ): ProgressionAnalysis {
    
    const totalLevels = targetLevel - startLevel;
    const completedMilestones = milestones.filter(m => m.completed).length;
    const totalMilestones = milestones.length;
    
    // Calculate overall pace
    const sessionsPerLevel = sessionsCompleted > 0 ? sessionsCompleted / Math.max(1, totalLevels) : 4;
    const overallPace = this.calculatePaceRating(sessionsPerLevel);
    
    // Calculate leveling speed
    const levelingSpeed = sessionsCompleted > 0 ? totalLevels / sessionsCompleted : 0.25;
    
    // Story coherence based on milestone completion patterns
    const storyCoherence = Math.min(100, (completedMilestones / Math.max(1, totalMilestones)) * 100);
    
    // Player engagement (placeholder - would be updated with real data)
    const playerEngagement = 75;
    
    // Challenge progression (increases with level)
    const challengeProgression = Math.min(100, (targetLevel / 20) * 100);
    
    // Narrative flow (based on story arc progression)
    const completedArcs = storyArcs.filter(arc => arc.completed).length;
    const narrativeFlow = Math.min(100, (completedArcs / Math.max(1, storyArcs.length)) * 100);
    
    // Estimate completion
    const remainingLevels = Math.max(0, targetLevel - startLevel);
    const estimatedCompletionSessions = Math.ceil(remainingLevels * sessionsPerLevel);
    
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + (estimatedCompletionSessions * 7)); // Weekly sessions
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(
      overallPace, 
      storyCoherence, 
      playerEngagement, 
      challengeProgression
    );
    
    return {
      overallPace,
      levelingSpeed,
      storyCoherence,
      playerEngagement,
      challengeProgression,
      narrativeFlow,
      estimatedCompletionSessions,
      estimatedCompletionDate,
      riskFactors
    };
  }
  
  private static calculatePaceRating(sessionsPerLevel: number): PaceRating {
    if (sessionsPerLevel < 2) return 'too_fast';
    if (sessionsPerLevel < 3) return 'fast';
    if (sessionsPerLevel <= 5) return 'good';
    if (sessionsPerLevel <= 7) return 'slow';
    return 'too_slow';
  }
  
  private static identifyRiskFactors(
    pace: PaceRating,
    storyCoherence: number,
    playerEngagement: number,
    challengeProgression: number
  ): RiskFactor[] {
    const risks: RiskFactor[] = [];
    
    if (pace === 'too_fast' || pace === 'too_slow') {
      risks.push({
        type: 'pacing',
        severity: pace === 'too_fast' || pace === 'too_slow' ? 'high' : 'medium',
        description: `Campaign pacing is ${pace.replace('_', ' ')}`,
        likelihood: 80,
        impact: 70,
        mitigation: pace === 'too_fast' ? 'Add more character development and exploration' : 'Streamline encounters and focus on main story'
      });
    }
    
    if (playerEngagement < 60) {
      risks.push({
        type: 'engagement',
        severity: playerEngagement < 40 ? 'critical' : 'high',
        description: 'Player engagement is below optimal levels',
        likelihood: 90,
        impact: 90,
        mitigation: 'Increase player agency and add personal stakes to the story'
      });
    }
    
    if (storyCoherence < 50) {
      risks.push({
        type: 'story_coherence',
        severity: 'medium',
        description: 'Story coherence may be suffering from inconsistent progression',
        likelihood: 70,
        impact: 60,
        mitigation: 'Review and reinforce main story themes and connections'
      });
    }
    
    return risks;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private static validateInputs(startLevel: number, targetLevel: number, progressionType: ProgressionType): void {
    if (startLevel < 1 || startLevel > 20) {
      throw new Error(`Invalid start level: ${startLevel}. Must be 1-20.`);
    }
    if (targetLevel < startLevel || targetLevel > 20) {
      throw new Error(`Invalid target level: ${targetLevel}. Must be >= start level and <= 20.`);
    }
    const validTypes: ProgressionType[] = ['milestone', 'xp', 'hybrid', 'session_based', 'story_based'];
    if (!validTypes.includes(progressionType)) {
      throw new Error(`Invalid progression type: ${progressionType}. Must be one of: ${validTypes.join(', ')}`);
    }
  }
  
  private static estimateSessionsForLevel(level: number): number {
    // Early levels are faster, higher levels take longer
    if (level <= 3) return 2;
    if (level <= 6) return 3;
    if (level <= 10) return 4;
    if (level <= 15) return 5;
    return 6;
  }
  
  private static selectArcTheme(startLevel: number, endLevel: number, systemBudget?: SystemDesignBudget): StoryTheme {
    const themes: StoryTheme[] = ['heroic_journey', 'mystery', 'political_intrigue', 'exploration', 'survival'];
    
    // Adjust theme selection based on level range and tone
    const tone = systemBudget?.tone || 'heroic';
    if (tone === 'gritty') {
      return Math.random() > 0.5 ? 'survival' : 'political_intrigue';
    } else if (tone === 'horror') {
      return Math.random() > 0.5 ? 'mystery' : 'survival';
    } else {
      return themes[Math.floor(Math.random() * themes.length)];
    }
  }
  
  private static calculateArcIntensity(arcIndex: number, totalArcs: number, startLevel: number): IntensityLevel {
    // Intensity generally increases throughout the campaign
    const progressRatio = arcIndex / (totalArcs - 1);
    const levelFactor = startLevel / 20;
    
    const intensityScore = (progressRatio * 0.6) + (levelFactor * 0.4);
    
    if (intensityScore < 0.2) return 'low';
    if (intensityScore < 0.4) return 'moderate';
    if (intensityScore < 0.6) return 'high';
    if (intensityScore < 0.8) return 'very_high';
    return 'very_high';
  }
  
  private static generateScenes(startLevel: number, levelCount: number, theme: StoryTheme, phase: string): Scene[] {
    const scenes: Scene[] = [];
    const sceneTypes: SceneType[] = ['combat', 'social', 'exploration', 'roleplay', 'investigation'];
    
    // Generate 2-3 scenes per level
    const sceneCount = levelCount * 2 + Math.floor(Math.random() * levelCount);
    
    for (let i = 0; i < sceneCount; i++) {
      const sceneType = sceneTypes[Math.floor(Math.random() * sceneTypes.length)];
      
      scenes.push({
        id: `scene_${i + 1}`,
        name: `${sceneType.charAt(0).toUpperCase() + sceneType.slice(1)} Scene ${i + 1}`,
        description: `A ${sceneType} scene in the ${theme} arc`,
        type: sceneType,
        level: startLevel + Math.floor(i / 2),
        prerequisites: i > 0 ? [`scene_${i}`] : [],
        encounters: [],
        npcs: [],
        locations: [],
        completed: false,
        playerChoices: [],
        estimatedDuration: sceneType === 'combat' ? 2 : sceneType === 'social' ? 1 : 1.5,
        playerSatisfaction: 75
      });
    }
    
    return scenes;
  }
  
  private static generateClimaxScene(level: number, theme: StoryTheme): Scene {
    return {
      id: `climax_${level}`,
      name: `Climax: ${theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      description: `The climactic scene of the ${theme} story arc`,
      type: 'combat',
      level,
      prerequisites: [],
      encounters: [`boss_encounter_${level}`],
      npcs: [`main_antagonist_${level}`],
      locations: [`climax_location_${level}`],
      completed: false,
      playerChoices: [],
      estimatedDuration: 3,
      playerSatisfaction: 85
    };
  }
  
  private static initializePacingMetrics(startLevel: number, targetLevel: number): PacingMetrics {
    return {
      sessionsPerLevel: 4,
      hoursPerLevel: 16,
      milestonesPerSession: 0.5,
      combatIntensity: {
        current: 'moderate',
        trend: 'stable',
        recentSessions: [],
        average: 3,
        peaks: [],
        valleys: []
      },
      socialIntensity: {
        current: 'moderate',
        trend: 'stable',
        recentSessions: [],
        average: 3,
        peaks: [],
        valleys: []
      },
      explorationIntensity: {
        current: 'moderate',
        trend: 'stable',
        recentSessions: [],
        average: 3,
        peaks: [],
        valleys: []
      },
      encounterVariety: 75,
      locationVariety: 75,
      npcVariety: 75,
      decisionPoints: 0,
      agencyLevel: 75,
      consequenceWeight: 50
    };
  }
  
  private static processMilestoneRewards(tracker: MilestoneProgressionTracker, milestone: Milestone): void {
    milestone.rewards.forEach(reward => {
      if (reward.automatic) {
        if (reward.type === 'level_up') {
          tracker.currentLevel = Math.min(tracker.targetLevel, tracker.currentLevel + 1);
        }
        // Process other automatic rewards...
      }
    });
  }
  
  private static checkLevelUp(tracker: MilestoneProgressionTracker): void {
    const nextLevelThreshold = XP_THRESHOLDS.find(t => t.level === tracker.currentLevel + 1);
    if (nextLevelThreshold && tracker.totalXPEarned >= nextLevelThreshold.xpTotal) {
      tracker.currentLevel++;
      tracker.xpToNextLevel = XP_THRESHOLDS.find(t => t.level === tracker.currentLevel + 1)?.xpRequired || 0;
    }
  }
  
  private static updatePacingMetrics(tracker: MilestoneProgressionTracker, sessionData: SessionData): void {
    // Update intensity trends based on session data
    // This would be implemented with actual session data
  }
  
  private static generateRecommendations(tracker: MilestoneProgressionTracker): ProgressionRecommendation[] {
    const recommendations: ProgressionRecommendation[] = [];
    
    if (tracker.progressionAnalysis.overallPace === 'too_slow') {
      recommendations.push({
        type: 'pacing_adjustment',
        priority: 'high',
        description: 'Increase campaign pacing',
        implementation: 'Reduce encounter complexity or increase milestone frequency',
        expectedImpact: 'Faster progression and improved player engagement'
      });
    }
    
    if (tracker.progressionAnalysis.playerEngagement < 60) {
      recommendations.push({
        type: 'player_engagement',
        priority: 'urgent',
        description: 'Improve player engagement',
        implementation: 'Add personal stakes and player choice consequences',
        expectedImpact: 'Increased investment and session satisfaction'
      });
    }
    
    return recommendations;
  }
  
  private static generateWarnings(tracker: MilestoneProgressionTracker): ProgressionWarning[] {
    const warnings: ProgressionWarning[] = [];
    
    // Check for overdue milestones
    const overdueMilestones = tracker.milestones.filter(m => 
      !m.completed && 
      tracker.sessionsCompleted > m.estimatedSessions * 2
    );
    
    if (overdueMilestones.length > 0) {
      warnings.push({
        type: 'milestone_overdue',
        severity: 'medium',
        message: `${overdueMilestones.length} milestone(s) are significantly overdue`,
        suggestion: 'Review milestone requirements and consider adjusting difficulty or providing additional guidance'
      });
    }
    
    return warnings;
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface SessionData {
  sessionNumber: number;
  duration: number; // hours
  combatEncounters: number;
  socialEncounters: number;
  explorationEncounters: number;
  majorDecisions: number;
  playerSatisfaction: number; // 0-100
  storyProgression: number; // 0-100
}

// ============================================================================
// EXPORT
// ============================================================================

export default MilestoneProgressionTracker;
