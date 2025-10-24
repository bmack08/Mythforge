// Mythwright Pacing Engine - Task 81
// Campaign pacing management with intensity curves and dramatic flow optimization

import type { SystemDesignBudget } from '../../types/content.types.js';

// ============================================================================
// PACING ENGINE TYPES
// ============================================================================

export interface PacingEngine {
  // Campaign Information
  campaignId: string;
  sessionCount: number;
  currentSession: number;
  
  // Pacing Configuration
  pacingProfile: PacingProfile;
  intensityCurve: IntensityCurve;
  
  // Current State
  currentIntensity: IntensityLevel;
  recentIntensityHistory: IntensityDataPoint[];
  
  // Analysis
  pacingAnalysis: PacingAnalysis;
  flowMetrics: FlowMetrics;
  
  // Predictions
  intensityProjections: IntensityProjection[];
  pacingRecommendations: PacingRecommendation[];
  
  // Warnings and Adjustments
  pacingWarnings: PacingWarning[];
  suggestedAdjustments: PacingAdjustment[];
}

export interface PacingProfile {
  profileType: PacingProfileType;
  name: string;
  description: string;
  
  // Curve Parameters
  baseIntensity: number; // 0-100
  peakIntensity: number; // 0-100
  valleyIntensity: number; // 0-100
  
  // Timing Parameters
  buildupRate: number; // Intensity increase per session
  cooldownRate: number; // Intensity decrease per session
  peakDuration: number; // Sessions at peak intensity
  restDuration: number; // Sessions at valley intensity
  
  // Flexibility
  varianceAllowed: number; // How much deviation is acceptable
  adaptability: number; // How quickly to adapt to player responses
}

export interface IntensityCurve {
  curveType: CurveType;
  dataPoints: IntensityDataPoint[];
  smoothingFactor: number;
  
  // Curve Analysis
  peaks: IntensityPeak[];
  valleys: IntensityValley[];
  trends: IntensityTrend[];
  
  // Optimization
  optimalPath: IntensityDataPoint[];
  deviationScore: number; // How far from optimal
}

export interface IntensityDataPoint {
  session: number;
  timestamp: Date;
  
  // Intensity Measurements
  combatIntensity: number; // 0-100
  socialIntensity: number; // 0-100
  explorationIntensity: number; // 0-100
  mysteryIntensity: number; // 0-100
  
  // Aggregate Metrics
  overallIntensity: number; // 0-100
  emotionalImpact: number; // 0-100
  playerEngagement: number; // 0-100
  
  // Context
  sessionType: SessionType;
  majorEvents: string[];
  playerReactions: PlayerReaction[];
}

export interface IntensityPeak {
  session: number;
  intensity: number;
  duration: number; // sessions
  peakType: PeakType;
  context: string;
  playerResponse: PlayerResponseLevel;
}

export interface IntensityValley {
  session: number;
  intensity: number;
  duration: number; // sessions
  valleyType: ValleyType;
  purpose: ValleyPurpose;
  recoveryRate: number;
}

export interface IntensityTrend {
  startSession: number;
  endSession: number;
  direction: TrendDirection;
  slope: number; // Intensity change per session
  consistency: number; // 0-100, how consistent the trend is
  significance: TrendSignificance;
}

export interface PacingAnalysis {
  // Overall Health
  pacingHealth: number; // 0-100
  flowConsistency: number; // 0-100
  playerSatisfaction: number; // 0-100
  
  // Timing Analysis
  sessionLength: SessionLengthAnalysis;
  breakPoints: BreakPointAnalysis;
  climaxTiming: ClimaxTimingAnalysis;
  
  // Balance Analysis
  pillarBalance: PillarBalanceAnalysis;
  intensityDistribution: IntensityDistribution;
  
  // Engagement Metrics
  attentionSpan: AttentionSpanMetrics;
  fatigueLevels: FatigueLevelAnalysis;
  excitementCurve: ExcitementCurveAnalysis;
}

export interface FlowMetrics {
  // Flow State Indicators
  challengeSkillBalance: number; // 0-100
  clearGoals: number; // 0-100
  immediateFeedback: number; // 0-100
  concentrationLevel: number; // 0-100
  
  // Disruption Tracking
  flowDisruptions: FlowDisruption[];
  recoveryTime: number; // Average minutes to recover flow
  
  // Optimization
  flowOptimization: number; // 0-100
  recommendedAdjustments: FlowAdjustment[];
}

export interface IntensityProjection {
  session: number;
  projectedIntensity: number;
  confidence: number; // 0-100
  
  // Factors
  influencingFactors: ProjectionFactor[];
  assumptions: string[];
  
  // Alternatives
  alternativeScenarios: AlternativeScenario[];
}

export interface PacingRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  timing: RecommendationTiming;
  
  // Content
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
  
  // Metrics
  confidenceLevel: number; // 0-100
  implementationDifficulty: ImplementationDifficulty;
  reversibility: boolean;
}

export interface PacingWarning {
  type: WarningType;
  severity: WarningSeverity;
  urgency: WarningUrgency;
  
  // Content
  message: string;
  consequence: string;
  timeframe: string;
  
  // Mitigation
  mitigationStrategies: MitigationStrategy[];
  preventionMeasures: string[];
}

export interface PacingAdjustment {
  adjustmentType: AdjustmentType;
  target: AdjustmentTarget;
  magnitude: number; // -100 to +100
  
  // Implementation
  method: AdjustmentMethod;
  timing: AdjustmentTiming;
  duration: AdjustmentDuration;
  
  // Analysis
  expectedEffect: AdjustmentEffect;
  riskAssessment: RiskAssessment;
  successProbability: number; // 0-100
}

// Supporting Interfaces
export interface PlayerReaction {
  type: ReactionType;
  intensity: number; // 0-100
  duration: number; // minutes
  context: string;
}

export interface SessionLengthAnalysis {
  averageLength: number; // hours
  optimalLength: number; // hours
  lengthVariance: number;
  playerFatiguePoint: number; // hours
}

export interface BreakPointAnalysis {
  naturalBreaks: BreakPoint[];
  forcedBreaks: BreakPoint[];
  breakEffectiveness: number; // 0-100
}

export interface BreakPoint {
  session: number;
  timestamp: Date;
  breakType: BreakType;
  duration: number; // minutes
  recoveryEffect: number; // 0-100
}

export interface ClimaxTimingAnalysis {
  sessionClimaxes: SessionClimax[];
  arcClimaxes: ArcClimax[];
  campaignClimax?: CampaignClimax;
  timingOptimization: number; // 0-100
}

export interface SessionClimax {
  session: number;
  timestamp: Date;
  intensity: number;
  buildup: number; // sessions of buildup
  resolution: number; // sessions of resolution
  playerSatisfaction: number; // 0-100
}

export interface PillarBalanceAnalysis {
  combatPercentage: number;
  socialPercentage: number;
  explorationPercentage: number;
  
  // Balance Metrics
  balanceScore: number; // 0-100
  playerPreferences: PillarPreference[];
  recommendedDistribution: PillarDistribution;
}

export interface IntensityDistribution {
  lowIntensity: number; // percentage of sessions
  mediumIntensity: number; // percentage of sessions
  highIntensity: number; // percentage of sessions
  
  // Analysis
  distributionHealth: number; // 0-100
  burnoutRisk: number; // 0-100
  boredomRisk: number; // 0-100
}

export interface FlowDisruption {
  session: number;
  timestamp: Date;
  disruptionType: DisruptionType;
  severity: DisruptionSeverity;
  duration: number; // minutes
  cause: string;
  resolution: string;
}

// Enums and Types
export type PacingProfileType = 'steady_build' | 'episodic' | 'roller_coaster' | 'slow_burn' | 'action_packed' | 'mystery_driven' | 'character_focused';
export type CurveType = 'linear' | 'exponential' | 'logarithmic' | 'sinusoidal' | 'custom';
export type IntensityLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
export type SessionType = 'combat_heavy' | 'roleplay_heavy' | 'exploration_heavy' | 'mixed' | 'downtime' | 'climax';
export type PeakType = 'combat_climax' | 'story_revelation' | 'character_moment' | 'boss_fight' | 'plot_twist';
export type ValleyType = 'rest_recovery' | 'character_development' | 'world_building' | 'preparation' | 'travel';
export type ValleyPurpose = 'tension_relief' | 'character_growth' | 'information_gathering' | 'resource_recovery' | 'plot_setup';
export type TrendDirection = 'rising' | 'falling' | 'stable' | 'oscillating';
export type TrendSignificance = 'minor' | 'moderate' | 'major' | 'critical';
export type PlayerResponseLevel = 'negative' | 'neutral' | 'positive' | 'enthusiastic' | 'overwhelming';
export type ReactionType = 'excitement' | 'tension' | 'relief' | 'surprise' | 'confusion' | 'frustration' | 'satisfaction';
export type BreakType = 'natural_pause' | 'cliffhanger' | 'resolution' | 'transition' | 'emergency_break';
export type RecommendationType = 'intensity_adjustment' | 'pacing_change' | 'content_modification' | 'structural_change' | 'player_engagement';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationTiming = 'immediate' | 'next_session' | 'next_arc' | 'long_term';
export type ImplementationDifficulty = 'trivial' | 'easy' | 'moderate' | 'hard' | 'very_hard';
export type WarningType = 'pacing_fatigue' | 'intensity_overload' | 'boredom_risk' | 'flow_disruption' | 'player_disengagement';
export type WarningSeverity = 'low' | 'medium' | 'high' | 'critical';
export type WarningUrgency = 'low' | 'medium' | 'high' | 'immediate';
export type AdjustmentType = 'intensity_increase' | 'intensity_decrease' | 'pacing_acceleration' | 'pacing_deceleration' | 'flow_optimization';
export type AdjustmentTarget = 'current_session' | 'next_session' | 'current_arc' | 'campaign_overall';
export type AdjustmentMethod = 'content_modification' | 'encounter_adjustment' | 'narrative_pacing' | 'break_timing' | 'player_agency';
export type AdjustmentTiming = 'immediate' | 'next_break' | 'next_scene' | 'next_session';
export type AdjustmentDuration = 'temporary' | 'short_term' | 'medium_term' | 'permanent';
export type DisruptionType = 'technical_issue' | 'player_absence' | 'rule_confusion' | 'out_of_character' | 'pacing_mismatch';
export type DisruptionSeverity = 'minor' | 'moderate' | 'major' | 'severe';

// Additional supporting types
export interface ProjectionFactor {
  factor: string;
  impact: number; // -100 to +100
  confidence: number; // 0-100
}

export interface AlternativeScenario {
  name: string;
  projectedIntensity: number;
  probability: number; // 0-100
  conditions: string[];
}

export interface MitigationStrategy {
  strategy: string;
  effectiveness: number; // 0-100
  implementationCost: ImplementationCost;
  timeRequired: number; // sessions
}

export interface AdjustmentEffect {
  intensityChange: number; // -100 to +100
  playerEngagementChange: number; // -100 to +100
  flowImpact: number; // -100 to +100
  duration: number; // sessions
}

export interface RiskAssessment {
  riskLevel: RiskLevel;
  potentialNegatives: string[];
  mitigationOptions: string[];
  reversibilityOptions: string[];
}

export interface ArcClimax {
  arc: number;
  session: number;
  intensity: number;
  buildup: number;
  resolution: number;
  satisfaction: number;
}

export interface CampaignClimax {
  session: number;
  intensity: number;
  buildup: number;
  resolution: number;
  satisfaction: number;
}

export interface PillarPreference {
  pillar: 'combat' | 'social' | 'exploration';
  playerPreference: number; // 0-100
  actualDistribution: number; // 0-100
  satisfaction: number; // 0-100
}

export interface PillarDistribution {
  combat: number; // 0-100
  social: number; // 0-100
  exploration: number; // 0-100
}

export interface AttentionSpanMetrics {
  averageAttentionSpan: number; // minutes
  optimalSessionLength: number; // minutes
  fatigueOnsetTime: number; // minutes
  recoveryTime: number; // minutes
}

export interface FatigueLevelAnalysis {
  currentFatigueLevel: number; // 0-100
  fatigueAccumulation: number; // per session
  recoveryRate: number; // per rest day
  burnoutRisk: number; // 0-100
}

export interface ExcitementCurveAnalysis {
  baselineExcitement: number; // 0-100
  peakExcitement: number; // 0-100
  excitementVariability: number; // 0-100
  sustainabilityScore: number; // 0-100
}

export interface FlowAdjustment {
  adjustmentType: FlowAdjustmentType;
  description: string;
  expectedImprovement: number; // 0-100
  implementationDifficulty: ImplementationDifficulty;
}

export type FlowAdjustmentType = 'challenge_adjustment' | 'goal_clarification' | 'feedback_improvement' | 'distraction_removal';
export type ImplementationCost = 'none' | 'minimal' | 'moderate' | 'significant' | 'major';
export type RiskLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

// ============================================================================
// PACING PROFILES
// ============================================================================

const PACING_PROFILES: Record<PacingProfileType, PacingProfile> = {
  steady_build: {
    profileType: 'steady_build',
    name: 'Steady Build',
    description: 'Gradual intensity increase toward campaign climax',
    baseIntensity: 30,
    peakIntensity: 90,
    valleyIntensity: 20,
    buildupRate: 3,
    cooldownRate: 1,
    peakDuration: 2,
    restDuration: 1,
    varianceAllowed: 15,
    adaptability: 70
  },
  episodic: {
    profileType: 'episodic',
    name: 'Episodic',
    description: 'Self-contained episodes with regular peaks and valleys',
    baseIntensity: 40,
    peakIntensity: 85,
    valleyIntensity: 25,
    buildupRate: 8,
    cooldownRate: 6,
    peakDuration: 1,
    restDuration: 1,
    varianceAllowed: 20,
    adaptability: 80
  },
  roller_coaster: {
    profileType: 'roller_coaster',
    name: 'Roller Coaster',
    description: 'High intensity variation with dramatic peaks and valleys',
    baseIntensity: 50,
    peakIntensity: 95,
    valleyIntensity: 15,
    buildupRate: 12,
    cooldownRate: 10,
    peakDuration: 1,
    restDuration: 2,
    varianceAllowed: 30,
    adaptability: 90
  },
  slow_burn: {
    profileType: 'slow_burn',
    name: 'Slow Burn',
    description: 'Low intensity with gradual buildup to major climaxes',
    baseIntensity: 25,
    peakIntensity: 80,
    valleyIntensity: 15,
    buildupRate: 1,
    cooldownRate: 0.5,
    peakDuration: 3,
    restDuration: 3,
    varianceAllowed: 10,
    adaptability: 50
  },
  action_packed: {
    profileType: 'action_packed',
    name: 'Action Packed',
    description: 'High baseline intensity with frequent peaks',
    baseIntensity: 60,
    peakIntensity: 95,
    valleyIntensity: 40,
    buildupRate: 5,
    cooldownRate: 3,
    peakDuration: 2,
    restDuration: 1,
    varianceAllowed: 25,
    adaptability: 75
  },
  mystery_driven: {
    profileType: 'mystery_driven',
    name: 'Mystery Driven',
    description: 'Tension building through revelation and discovery',
    baseIntensity: 35,
    peakIntensity: 85,
    valleyIntensity: 20,
    buildupRate: 2,
    cooldownRate: 1,
    peakDuration: 2,
    restDuration: 2,
    varianceAllowed: 15,
    adaptability: 65
  },
  character_focused: {
    profileType: 'character_focused',
    name: 'Character Focused',
    description: 'Emotional intensity through character development',
    baseIntensity: 40,
    peakIntensity: 80,
    valleyIntensity: 30,
    buildupRate: 2,
    cooldownRate: 2,
    peakDuration: 2,
    restDuration: 2,
    varianceAllowed: 20,
    adaptability: 85
  }
};

// ============================================================================
// PACING ENGINE CLASS
// ============================================================================

export class PacingEngine {
  
  // ============================================================================
  // MAIN ENGINE METHODS
  // ============================================================================
  
  static createPacingEngine(
    campaignId: string,
    sessionCount: number,
    pacingProfileType: PacingProfileType,
    systemBudget?: SystemDesignBudget
  ): PacingEngine {
    
    // Get pacing profile
    const pacingProfile = PACING_PROFILES[pacingProfileType];
    
    // Generate intensity curve
    const intensityCurve = this.generateIntensityCurve(
      sessionCount,
      pacingProfile,
      systemBudget
    );
    
    // Initialize current state
    const currentIntensity = this.calculateCurrentIntensity(intensityCurve, 1);
    const recentIntensityHistory: IntensityDataPoint[] = [];
    
    // Perform initial analysis
    const pacingAnalysis = this.analyzePacing(
      intensityCurve,
      recentIntensityHistory,
      pacingProfile
    );
    
    // Calculate flow metrics
    const flowMetrics = this.calculateFlowMetrics(
      recentIntensityHistory,
      pacingProfile
    );
    
    // Generate projections
    const intensityProjections = this.generateIntensityProjections(
      intensityCurve,
      1,
      sessionCount
    );
    
    // Generate initial recommendations
    const pacingRecommendations = this.generatePacingRecommendations(
      pacingAnalysis,
      intensityCurve,
      1
    );
    
    return {
      campaignId,
      sessionCount,
      currentSession: 1,
      pacingProfile,
      intensityCurve,
      currentIntensity,
      recentIntensityHistory,
      pacingAnalysis,
      flowMetrics,
      intensityProjections,
      pacingRecommendations,
      pacingWarnings: [],
      suggestedAdjustments: []
    };
  }
  
  static updatePacingEngine(
    engine: PacingEngine,
    sessionData: SessionPacingData
  ): PacingEngine {
    
    const updatedEngine = { ...engine };
    
    // Update current session
    updatedEngine.currentSession = sessionData.sessionNumber;
    
    // Add new intensity data point
    const newDataPoint = this.createIntensityDataPoint(sessionData);
    updatedEngine.recentIntensityHistory.push(newDataPoint);
    
    // Keep only recent history (last 10 sessions)
    if (updatedEngine.recentIntensityHistory.length > 10) {
      updatedEngine.recentIntensityHistory = updatedEngine.recentIntensityHistory.slice(-10);
    }
    
    // Update current intensity
    updatedEngine.currentIntensity = this.calculateCurrentIntensity(
      updatedEngine.intensityCurve,
      sessionData.sessionNumber
    );
    
    // Recalculate analysis
    updatedEngine.pacingAnalysis = this.analyzePacing(
      updatedEngine.intensityCurve,
      updatedEngine.recentIntensityHistory,
      updatedEngine.pacingProfile
    );
    
    // Update flow metrics
    updatedEngine.flowMetrics = this.calculateFlowMetrics(
      updatedEngine.recentIntensityHistory,
      updatedEngine.pacingProfile
    );
    
    // Regenerate projections
    updatedEngine.intensityProjections = this.generateIntensityProjections(
      updatedEngine.intensityCurve,
      sessionData.sessionNumber,
      updatedEngine.sessionCount
    );
    
    // Update recommendations
    updatedEngine.pacingRecommendations = this.generatePacingRecommendations(
      updatedEngine.pacingAnalysis,
      updatedEngine.intensityCurve,
      sessionData.sessionNumber
    );
    
    // Generate warnings
    updatedEngine.pacingWarnings = this.generatePacingWarnings(
      updatedEngine.pacingAnalysis,
      updatedEngine.recentIntensityHistory
    );
    
    // Generate adjustments
    updatedEngine.suggestedAdjustments = this.generatePacingAdjustments(
      updatedEngine.pacingAnalysis,
      updatedEngine.intensityCurve,
      sessionData.sessionNumber
    );
    
    return updatedEngine;
  }
  
  // ============================================================================
  // INTENSITY CURVE GENERATION
  // ============================================================================
  
  private static generateIntensityCurve(
    sessionCount: number,
    profile: PacingProfile,
    systemBudget?: SystemDesignBudget
  ): IntensityCurve {
    
    const dataPoints: IntensityDataPoint[] = [];
    
    // Generate base curve based on profile
    for (let session = 1; session <= sessionCount; session++) {
      const intensity = this.calculateSessionIntensity(session, sessionCount, profile);
      
      dataPoints.push({
        session,
        timestamp: new Date(), // Would be actual session dates
        combatIntensity: intensity * 0.4 + Math.random() * 20,
        socialIntensity: intensity * 0.3 + Math.random() * 20,
        explorationIntensity: intensity * 0.2 + Math.random() * 20,
        mysteryIntensity: intensity * 0.1 + Math.random() * 20,
        overallIntensity: intensity,
        emotionalImpact: intensity * 0.8 + Math.random() * 20,
        playerEngagement: intensity * 0.9 + Math.random() * 10,
        sessionType: this.determineSessionType(intensity),
        majorEvents: [],
        playerReactions: []
      });
    }
    
    // Identify peaks and valleys
    const peaks = this.identifyPeaks(dataPoints);
    const valleys = this.identifyValleys(dataPoints);
    const trends = this.identifyTrends(dataPoints);
    
    // Generate optimal path
    const optimalPath = this.generateOptimalPath(dataPoints, profile);
    const deviationScore = this.calculateDeviationScore(dataPoints, optimalPath);
    
    return {
      curveType: 'custom',
      dataPoints,
      smoothingFactor: 0.3,
      peaks,
      valleys,
      trends,
      optimalPath,
      deviationScore
    };
  }
  
  private static calculateSessionIntensity(
    session: number,
    totalSessions: number,
    profile: PacingProfile
  ): number {
    
    const progress = session / totalSessions;
    let intensity = profile.baseIntensity;
    
    switch (profile.profileType) {
      case 'steady_build':
        intensity = profile.valleyIntensity + 
                   (profile.peakIntensity - profile.valleyIntensity) * progress;
        break;
        
      case 'episodic':
        const episodeLength = 4; // 4 sessions per episode
        const episodeProgress = (session % episodeLength) / episodeLength;
        intensity = profile.valleyIntensity + 
                   (profile.peakIntensity - profile.valleyIntensity) * 
                   Math.sin(episodeProgress * Math.PI);
        break;
        
      case 'roller_coaster':
        intensity = profile.baseIntensity + 
                   (profile.peakIntensity - profile.baseIntensity) * 
                   Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
        break;
        
      case 'slow_burn':
        intensity = profile.valleyIntensity + 
                   (profile.peakIntensity - profile.valleyIntensity) * 
                   Math.pow(progress, 2);
        break;
        
      case 'action_packed':
        intensity = profile.baseIntensity + 
                   Math.random() * (profile.peakIntensity - profile.baseIntensity) * 0.5;
        break;
        
      case 'mystery_driven':
        // Stair-step pattern with revelation peaks
        const step = Math.floor(progress * 5) / 5;
        intensity = profile.valleyIntensity + 
                   (profile.peakIntensity - profile.valleyIntensity) * step;
        break;
        
      case 'character_focused':
        // Sine wave with character arc peaks
        intensity = profile.baseIntensity + 
                   (profile.peakIntensity - profile.baseIntensity) * 
                   (Math.sin(progress * Math.PI * 2) * 0.3 + 0.7);
        break;
    }
    
    // Add variance
    const variance = (Math.random() - 0.5) * profile.varianceAllowed;
    intensity = Math.max(0, Math.min(100, intensity + variance));
    
    return intensity;
  }
  
  // ============================================================================
  // ANALYSIS METHODS
  // ============================================================================
  
  private static analyzePacing(
    curve: IntensityCurve,
    recentHistory: IntensityDataPoint[],
    profile: PacingProfile
  ): PacingAnalysis {
    
    // Calculate pacing health
    const pacingHealth = this.calculatePacingHealth(curve, profile);
    const flowConsistency = this.calculateFlowConsistency(recentHistory);
    const playerSatisfaction = this.estimatePlayerSatisfaction(recentHistory);
    
    // Analyze session length
    const sessionLength = this.analyzeSessionLength(recentHistory);
    
    // Analyze break points
    const breakPoints = this.analyzeBreakPoints(recentHistory);
    
    // Analyze climax timing
    const climaxTiming = this.analyzeClimaxTiming(curve);
    
    // Analyze pillar balance
    const pillarBalance = this.analyzePillarBalance(recentHistory);
    
    // Analyze intensity distribution
    const intensityDistribution = this.analyzeIntensityDistribution(curve);
    
    // Analyze attention span
    const attentionSpan = this.analyzeAttentionSpan(recentHistory);
    
    // Analyze fatigue levels
    const fatigueLevels = this.analyzeFatigueLevels(recentHistory);
    
    // Analyze excitement curve
    const excitementCurve = this.analyzeExcitementCurve(recentHistory);
    
    return {
      pacingHealth,
      flowConsistency,
      playerSatisfaction,
      sessionLength,
      breakPoints,
      climaxTiming,
      pillarBalance,
      intensityDistribution,
      attentionSpan,
      fatigueLevels,
      excitementCurve
    };
  }
  
  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================
  
  private static generatePacingRecommendations(
    analysis: PacingAnalysis,
    curve: IntensityCurve,
    currentSession: number
  ): PacingRecommendation[] {
    
    const recommendations: PacingRecommendation[] = [];
    
    // Pacing health recommendations
    if (analysis.pacingHealth < 70) {
      recommendations.push({
        type: 'intensity_adjustment',
        priority: 'high',
        timing: 'next_session',
        title: 'Improve Pacing Health',
        description: 'Current pacing is suboptimal and may affect player engagement',
        implementation: 'Adjust intensity levels to better match the intended pacing profile',
        expectedImpact: 'Improved player engagement and session flow',
        confidenceLevel: 80,
        implementationDifficulty: 'moderate',
        reversibility: true
      });
    }
    
    // Flow consistency recommendations
    if (analysis.flowConsistency < 60) {
      recommendations.push({
        type: 'pacing_change',
        priority: 'medium',
        timing: 'immediate',
        title: 'Improve Flow Consistency',
        description: 'Sessions show inconsistent flow patterns',
        implementation: 'Establish more consistent pacing rhythms and transition patterns',
        expectedImpact: 'Smoother session flow and better player immersion',
        confidenceLevel: 75,
        implementationDifficulty: 'easy',
        reversibility: true
      });
    }
    
    // Intensity distribution recommendations
    if (analysis.intensityDistribution.burnoutRisk > 70) {
      recommendations.push({
        type: 'intensity_adjustment',
        priority: 'high',
        timing: 'immediate',
        title: 'Reduce Burnout Risk',
        description: 'High intensity levels may lead to player fatigue',
        implementation: 'Introduce more low-intensity recovery sessions',
        expectedImpact: 'Reduced player fatigue and sustained engagement',
        confidenceLevel: 90,
        implementationDifficulty: 'easy',
        reversibility: true
      });
    }
    
    if (analysis.intensityDistribution.boredomRisk > 70) {
      recommendations.push({
        type: 'intensity_adjustment',
        priority: 'medium',
        timing: 'next_session',
        title: 'Increase Engagement',
        description: 'Low intensity levels may lead to player boredom',
        implementation: 'Add more high-intensity moments and dramatic peaks',
        expectedImpact: 'Increased player excitement and engagement',
        confidenceLevel: 85,
        implementationDifficulty: 'moderate',
        reversibility: true
      });
    }
    
    return recommendations;
  }
  
  // ============================================================================
  // WARNING GENERATION
  // ============================================================================
  
  private static generatePacingWarnings(
    analysis: PacingAnalysis,
    recentHistory: IntensityDataPoint[]
  ): PacingWarning[] {
    
    const warnings: PacingWarning[] = [];
    
    // Fatigue warnings
    if (analysis.fatigueLevels.burnoutRisk > 80) {
      warnings.push({
        type: 'pacing_fatigue',
        severity: 'high',
        urgency: 'immediate',
        message: 'Players showing signs of high fatigue and potential burnout',
        consequence: 'Reduced engagement, session cancellations, or player dropout',
        timeframe: 'Within 1-2 sessions',
        mitigationStrategies: [{
          strategy: 'Schedule recovery sessions with low intensity',
          effectiveness: 90,
          implementationCost: 'minimal',
          timeRequired: 1
        }],
        preventionMeasures: [
          'Monitor player energy levels',
          'Include regular downtime sessions',
          'Vary intensity levels more effectively'
        ]
      });
    }
    
    // Intensity overload warnings
    if (analysis.intensityDistribution.burnoutRisk > 70) {
      warnings.push({
        type: 'intensity_overload',
        severity: 'medium',
        urgency: 'medium',
        message: 'Sustained high intensity may overwhelm players',
        consequence: 'Decision paralysis, reduced enjoyment, stress',
        timeframe: 'Within 2-3 sessions',
        mitigationStrategies: [{
          strategy: 'Introduce calm moments and character interaction',
          effectiveness: 85,
          implementationCost: 'minimal',
          timeRequired: 1
        }],
        preventionMeasures: [
          'Balance high intensity with recovery periods',
          'Monitor player stress indicators',
          'Provide clear objectives during complex situations'
        ]
      });
    }
    
    // Boredom risk warnings
    if (analysis.intensityDistribution.boredomRisk > 70) {
      warnings.push({
        type: 'boredom_risk',
        severity: 'medium',
        urgency: 'medium',
        message: 'Extended low intensity periods may cause disengagement',
        consequence: 'Player distraction, reduced investment, attendance issues',
        timeframe: 'Within 2-4 sessions',
        mitigationStrategies: [{
          strategy: 'Introduce unexpected complications or opportunities',
          effectiveness: 80,
          implementationCost: 'moderate',
          timeRequired: 1
        }],
        preventionMeasures: [
          'Maintain minimum baseline excitement',
          'Include player agency moments',
          'Add periodic surprises or revelations'
        ]
      });
    }
    
    return warnings;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private static createIntensityDataPoint(sessionData: SessionPacingData): IntensityDataPoint {
    return {
      session: sessionData.sessionNumber,
      timestamp: sessionData.timestamp || new Date(),
      combatIntensity: sessionData.combatIntensity || 50,
      socialIntensity: sessionData.socialIntensity || 50,
      explorationIntensity: sessionData.explorationIntensity || 50,
      mysteryIntensity: sessionData.mysteryIntensity || 50,
      overallIntensity: sessionData.overallIntensity || 50,
      emotionalImpact: sessionData.emotionalImpact || 50,
      playerEngagement: sessionData.playerEngagement || 50,
      sessionType: sessionData.sessionType || 'mixed',
      majorEvents: sessionData.majorEvents || [],
      playerReactions: sessionData.playerReactions || []
    };
  }
  
  private static calculateCurrentIntensity(
    curve: IntensityCurve,
    session: number
  ): IntensityLevel {
    const dataPoint = curve.dataPoints.find(dp => dp.session === session);
    if (!dataPoint) return 'moderate';
    
    const intensity = dataPoint.overallIntensity;
    if (intensity < 20) return 'very_low';
    if (intensity < 40) return 'low';
    if (intensity < 60) return 'moderate';
    if (intensity < 80) return 'high';
    if (intensity < 95) return 'very_high';
    return 'extreme';
  }
  
  private static determineSessionType(intensity: number): SessionType {
    if (intensity > 80) return 'climax';
    if (intensity > 60) return 'combat_heavy';
    if (intensity > 40) return 'mixed';
    if (intensity > 20) return 'roleplay_heavy';
    return 'downtime';
  }
  
  private static identifyPeaks(dataPoints: IntensityDataPoint[]): IntensityPeak[] {
    const peaks: IntensityPeak[] = [];
    
    for (let i = 1; i < dataPoints.length - 1; i++) {
      const current = dataPoints[i];
      const prev = dataPoints[i - 1];
      const next = dataPoints[i + 1];
      
      if (current.overallIntensity > prev.overallIntensity && 
          current.overallIntensity > next.overallIntensity &&
          current.overallIntensity > 60) {
        
        peaks.push({
          session: current.session,
          intensity: current.overallIntensity,
          duration: 1, // Simplified
          peakType: current.combatIntensity > 70 ? 'boss_fight' : 'story_revelation',
          context: 'Generated peak',
          playerResponse: 'positive'
        });
      }
    }
    
    return peaks;
  }
  
  private static identifyValleys(dataPoints: IntensityDataPoint[]): IntensityValley[] {
    const valleys: IntensityValley[] = [];
    
    for (let i = 1; i < dataPoints.length - 1; i++) {
      const current = dataPoints[i];
      const prev = dataPoints[i - 1];
      const next = dataPoints[i + 1];
      
      if (current.overallIntensity < prev.overallIntensity && 
          current.overallIntensity < next.overallIntensity &&
          current.overallIntensity < 40) {
        
        valleys.push({
          session: current.session,
          intensity: current.overallIntensity,
          duration: 1, // Simplified
          valleyType: 'rest_recovery',
          purpose: 'tension_relief',
          recoveryRate: 10
        });
      }
    }
    
    return valleys;
  }
  
  private static identifyTrends(dataPoints: IntensityDataPoint[]): IntensityTrend[] {
    const trends: IntensityTrend[] = [];
    const windowSize = 3;
    
    for (let i = 0; i <= dataPoints.length - windowSize; i++) {
      const window = dataPoints.slice(i, i + windowSize);
      const startIntensity = window[0].overallIntensity;
      const endIntensity = window[window.length - 1].overallIntensity;
      const slope = (endIntensity - startIntensity) / (windowSize - 1);
      
      let direction: TrendDirection = 'stable';
      if (Math.abs(slope) > 5) {
        direction = slope > 0 ? 'rising' : 'falling';
      }
      
      trends.push({
        startSession: window[0].session,
        endSession: window[window.length - 1].session,
        direction,
        slope,
        consistency: 75, // Simplified
        significance: Math.abs(slope) > 10 ? 'major' : 'minor'
      });
    }
    
    return trends;
  }
  
  private static generateOptimalPath(
    dataPoints: IntensityDataPoint[],
    profile: PacingProfile
  ): IntensityDataPoint[] {
    // Simplified optimal path generation
    return dataPoints.map(dp => ({
      ...dp,
      overallIntensity: Math.max(profile.valleyIntensity, 
                                Math.min(profile.peakIntensity, dp.overallIntensity))
    }));
  }
  
  private static calculateDeviationScore(
    actual: IntensityDataPoint[],
    optimal: IntensityDataPoint[]
  ): number {
    if (actual.length !== optimal.length) return 100;
    
    let totalDeviation = 0;
    for (let i = 0; i < actual.length; i++) {
      totalDeviation += Math.abs(actual[i].overallIntensity - optimal[i].overallIntensity);
    }
    
    return Math.min(100, (totalDeviation / actual.length) * 2);
  }
  
  // Placeholder implementations for analysis methods
  private static calculatePacingHealth(curve: IntensityCurve, profile: PacingProfile): number {
    return Math.max(0, 100 - curve.deviationScore);
  }
  
  private static calculateFlowConsistency(history: IntensityDataPoint[]): number {
    if (history.length < 2) return 100;
    
    let variance = 0;
    for (let i = 1; i < history.length; i++) {
      const diff = Math.abs(history[i].overallIntensity - history[i-1].overallIntensity);
      variance += diff;
    }
    
    const avgVariance = variance / (history.length - 1);
    return Math.max(0, 100 - avgVariance * 2);
  }
  
  private static estimatePlayerSatisfaction(history: IntensityDataPoint[]): number {
    if (history.length === 0) return 75;
    
    const avgEngagement = history.reduce((sum, dp) => sum + dp.playerEngagement, 0) / history.length;
    return avgEngagement;
  }
  
  private static analyzeSessionLength(history: IntensityDataPoint[]): SessionLengthAnalysis {
    return {
      averageLength: 4,
      optimalLength: 4,
      lengthVariance: 0.5,
      playerFatiguePoint: 5
    };
  }
  
  private static analyzeBreakPoints(history: IntensityDataPoint[]): BreakPointAnalysis {
    return {
      naturalBreaks: [],
      forcedBreaks: [],
      breakEffectiveness: 75
    };
  }
  
  private static analyzeClimaxTiming(curve: IntensityCurve): ClimaxTimingAnalysis {
    const sessionClimaxes = curve.peaks.map(peak => ({
      session: peak.session,
      timestamp: new Date(),
      intensity: peak.intensity,
      buildup: 2,
      resolution: 1,
      playerSatisfaction: 80
    }));
    
    return {
      sessionClimaxes,
      arcClimaxes: [],
      timingOptimization: 75
    };
  }
  
  private static analyzePillarBalance(history: IntensityDataPoint[]): PillarBalanceAnalysis {
    return {
      combatPercentage: 40,
      socialPercentage: 35,
      explorationPercentage: 25,
      balanceScore: 80,
      playerPreferences: [],
      recommendedDistribution: { combat: 40, social: 35, exploration: 25 }
    };
  }
  
  private static analyzeIntensityDistribution(curve: IntensityCurve): IntensityDistribution {
    const dataPoints = curve.dataPoints;
    let low = 0, medium = 0, high = 0;
    
    dataPoints.forEach(dp => {
      if (dp.overallIntensity < 40) low++;
      else if (dp.overallIntensity < 70) medium++;
      else high++;
    });
    
    const total = dataPoints.length;
    return {
      lowIntensity: (low / total) * 100,
      mediumIntensity: (medium / total) * 100,
      highIntensity: (high / total) * 100,
      distributionHealth: 75,
      burnoutRisk: high / total > 0.6 ? 80 : 30,
      boredomRisk: low / total > 0.6 ? 80 : 30
    };
  }
  
  private static analyzeAttentionSpan(history: IntensityDataPoint[]): AttentionSpanMetrics {
    return {
      averageAttentionSpan: 45,
      optimalSessionLength: 240,
      fatigueOnsetTime: 180,
      recoveryTime: 15
    };
  }
  
  private static analyzeFatigueLevels(history: IntensityDataPoint[]): FatigueLevelAnalysis {
    const recentIntensity = history.slice(-3);
    const avgIntensity = recentIntensity.reduce((sum, dp) => sum + dp.overallIntensity, 0) / Math.max(1, recentIntensity.length);
    
    return {
      currentFatigueLevel: Math.max(0, avgIntensity - 50),
      fatigueAccumulation: 5,
      recoveryRate: 10,
      burnoutRisk: avgIntensity > 80 ? 80 : 20
    };
  }
  
  private static analyzeExcitementCurve(history: IntensityDataPoint[]): ExcitementCurveAnalysis {
    const excitementLevels = history.map(dp => dp.playerEngagement);
    const baseline = Math.min(...excitementLevels);
    const peak = Math.max(...excitementLevels);
    const variance = this.calculateVariance(excitementLevels);
    
    return {
      baselineExcitement: baseline,
      peakExcitement: peak,
      excitementVariability: variance,
      sustainabilityScore: 100 - variance
    };
  }
  
  private static calculateFlowMetrics(
    history: IntensityDataPoint[],
    profile: PacingProfile
  ): FlowMetrics {
    return {
      challengeSkillBalance: 75,
      clearGoals: 80,
      immediateFeedback: 70,
      concentrationLevel: 75,
      flowDisruptions: [],
      recoveryTime: 5,
      flowOptimization: 75,
      recommendedAdjustments: []
    };
  }
  
  private static generateIntensityProjections(
    curve: IntensityCurve,
    currentSession: number,
    totalSessions: number
  ): IntensityProjection[] {
    const projections: IntensityProjection[] = [];
    
    for (let session = currentSession + 1; session <= Math.min(currentSession + 5, totalSessions); session++) {
      const dataPoint = curve.dataPoints.find(dp => dp.session === session);
      
      projections.push({
        session,
        projectedIntensity: dataPoint?.overallIntensity || 50,
        confidence: Math.max(20, 100 - (session - currentSession) * 15),
        influencingFactors: [],
        assumptions: ['Players maintain current engagement', 'No major disruptions'],
        alternativeScenarios: []
      });
    }
    
    return projections;
  }
  
  private static generatePacingAdjustments(
    analysis: PacingAnalysis,
    curve: IntensityCurve,
    currentSession: number
  ): PacingAdjustment[] {
    const adjustments: PacingAdjustment[] = [];
    
    if (analysis.pacingHealth < 70) {
      adjustments.push({
        adjustmentType: 'intensity_increase',
        target: 'next_session',
        magnitude: 20,
        method: 'content_modification',
        timing: 'immediate',
        duration: 'short_term',
        expectedEffect: {
          intensityChange: 20,
          playerEngagementChange: 15,
          flowImpact: 10,
          duration: 2
        },
        riskAssessment: {
          riskLevel: 'low',
          potentialNegatives: ['Slight pacing disruption'],
          mitigationOptions: ['Gradual implementation'],
          reversibilityOptions: ['Return to baseline next session']
        },
        successProbability: 85
      });
    }
    
    return adjustments;
  }
  
  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

export interface SessionPacingData {
  sessionNumber: number;
  timestamp?: Date;
  
  // Intensity Measurements
  combatIntensity?: number;
  socialIntensity?: number;
  explorationIntensity?: number;
  mysteryIntensity?: number;
  overallIntensity?: number;
  emotionalImpact?: number;
  playerEngagement?: number;
  
  // Session Context
  sessionType?: SessionType;
  majorEvents?: string[];
  playerReactions?: PlayerReaction[];
  
  // Timing Data
  sessionDuration?: number; // minutes
  breakCount?: number;
  breakDuration?: number; // total minutes
}

// ============================================================================
// EXPORT
// ============================================================================

export default PacingEngine;
