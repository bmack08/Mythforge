// Mythwright AI Cost Optimization & Usage Tracking System
import type { AIGenerationRequest, AIGenerationResponse } from './index.js';

// ============================================================================
// COST OPTIMIZATION TYPES
// ============================================================================

export interface UsageLimits {
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
  dailyCostLimit: number; // in USD
  monthlyCostLimit: number; // in USD
  maxConcurrentRequests: number;
  cooldownPeriod: number; // milliseconds between requests
}

export interface CostOptimizationSettings {
  enableCostOptimization: boolean;
  maxCostPerRequest: number;
  preferCheaperModels: boolean;
  budgetAlertThreshold: number; // percentage of budget used
  enableUsageLimits: boolean;
  enableCaching: boolean;
  enableBatching: boolean;
}

export interface UsageMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  averageCost: number;
  averageTokens: number;
  
  // Time-based metrics
  dailyUsage: DailyUsageStats[];
  monthlyUsage: MonthlyUsageStats[];
  
  // Model-specific metrics
  modelUsage: Record<string, ModelUsageStats>;
  
  // Content type metrics
  contentTypeUsage: Record<string, ContentTypeUsageStats>;
}

export interface DailyUsageStats {
  date: string; // YYYY-MM-DD
  requests: number;
  tokens: number;
  cost: number;
  successRate: number;
  averageResponseTime: number;
  peakHour: number; // 0-23
  modelBreakdown: Record<string, { requests: number; cost: number }>;
}

export interface MonthlyUsageStats {
  month: string; // YYYY-MM
  requests: number;
  tokens: number;
  cost: number;
  successRate: number;
  averageResponseTime: number;
  peakDay: number; // 1-31
  costTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface ModelUsageStats {
  requests: number;
  tokens: number;
  cost: number;
  successRate: number;
  averageResponseTime: number;
  averageQualityScore: number;
  lastUsed: Date;
}

export interface ContentTypeUsageStats {
  requests: number;
  tokens: number;
  cost: number;
  successRate: number;
  averageComplexity: string;
  averageQualityScore: number;
}

export interface CostAlert {
  id: string;
  type: 'budget_threshold' | 'daily_limit' | 'monthly_limit' | 'cost_spike' | 'efficiency_drop';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'model_switch' | 'batch_requests' | 'cache_hit' | 'prompt_optimization' | 'usage_pattern';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  potentialSavings: number; // in USD
  implementationEffort: 'easy' | 'medium' | 'hard';
  estimatedImpact: string;
}

// ============================================================================
// COST OPTIMIZER CLASS
// ============================================================================

export class CostOptimizer {
  private usageMetrics: UsageMetrics;
  private settings: CostOptimizationSettings;
  private limits: UsageLimits;
  private alerts: CostAlert[] = [];
  private recommendations: OptimizationRecommendation[] = [];
  
  constructor(settings?: Partial<CostOptimizationSettings>, limits?: Partial<UsageLimits>) {
    this.settings = {
      enableCostOptimization: true,
      maxCostPerRequest: 0.10,
      preferCheaperModels: false,
      budgetAlertThreshold: 80, // 80% of budget
      enableUsageLimits: true,
      enableCaching: true,
      enableBatching: false,
      ...settings
    };
    
    this.limits = {
      dailyTokenLimit: parseInt(process.env.AI_DAILY_TOKEN_LIMIT || '100000'),
      monthlyTokenLimit: parseInt(process.env.AI_MONTHLY_TOKEN_LIMIT || '2000000'),
      dailyCostLimit: parseFloat(process.env.AI_DAILY_COST_LIMIT || '50.00'),
      monthlyCostLimit: parseFloat(process.env.AI_MONTHLY_COST_LIMIT || '500.00'),
      maxConcurrentRequests: parseInt(process.env.AI_MAX_CONCURRENT_REQUESTS || '10'),
      cooldownPeriod: parseInt(process.env.AI_COOLDOWN_PERIOD || '100'),
      ...limits
    };
    
    this.initializeMetrics();
  }
  
  private initializeMetrics(): void {
    this.usageMetrics = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      averageCost: 0,
      averageTokens: 0,
      dailyUsage: [],
      monthlyUsage: [],
      modelUsage: {},
      contentTypeUsage: {}
    };
  }
  
  // ============================================================================
  // USAGE LIMIT CHECKING
  // ============================================================================
  
  checkUsageLimits(): { allowed: boolean; reason?: string; waitTime?: number } {
    if (!this.settings.enableUsageLimits) {
      return { allowed: true };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // Get today's usage
    const todayUsage = this.usageMetrics.dailyUsage.find(d => d.date === today);
    const thisMonthUsage = this.usageMetrics.monthlyUsage.find(m => m.month === currentMonth);
    
    // Check daily token limit
    if (todayUsage && todayUsage.tokens >= this.limits.dailyTokenLimit) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const waitTime = tomorrow.getTime() - Date.now();
      
      return { 
        allowed: false, 
        reason: `Daily token limit of ${this.limits.dailyTokenLimit} exceeded`,
        waitTime 
      };
    }
    
    // Check daily cost limit
    if (todayUsage && todayUsage.cost >= this.limits.dailyCostLimit) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const waitTime = tomorrow.getTime() - Date.now();
      
      return { 
        allowed: false, 
        reason: `Daily cost limit of $${this.limits.dailyCostLimit} exceeded`,
        waitTime 
      };
    }
    
    // Check monthly limits
    if (thisMonthUsage && thisMonthUsage.tokens >= this.limits.monthlyTokenLimit) {
      return { 
        allowed: false, 
        reason: `Monthly token limit of ${this.limits.monthlyTokenLimit} exceeded` 
      };
    }
    
    if (thisMonthUsage && thisMonthUsage.cost >= this.limits.monthlyCostLimit) {
      return { 
        allowed: false, 
        reason: `Monthly cost limit of $${this.limits.monthlyCostLimit} exceeded` 
      };
    }
    
    return { allowed: true };
  }
  
  // ============================================================================
  // COST OPTIMIZATION
  // ============================================================================
  
  optimizeRequest(request: AIGenerationRequest): AIGenerationRequest {
    if (!this.settings.enableCostOptimization) {
      return request;
    }
    
    const optimizedRequest = { ...request };
    
    // Optimize based on usage patterns
    if (this.settings.preferCheaperModels && !request.options?.model) {
      // Use cheaper models for simple tasks if we're over budget
      const budgetUsed = this.getBudgetUsagePercentage();
      if (budgetUsed > this.settings.budgetAlertThreshold) {
        optimizedRequest.options = {
          ...optimizedRequest.options,
          model: 'gpt-4o-mini' // Force cheaper model
        };
      }
    }
    
    // Optimize token limits based on content type
    if (!optimizedRequest.options?.maxTokens) {
      const contentTypeStats = this.usageMetrics.contentTypeUsage[request.type];
      if (contentTypeStats) {
        const avgTokens = contentTypeStats.tokens / contentTypeStats.requests;
        optimizedRequest.options = {
          ...optimizedRequest.options,
          maxTokens: Math.min(Math.ceil(avgTokens * 1.2), 2000) // 20% buffer
        };
      }
    }
    
    return optimizedRequest;
  }
  
  // ============================================================================
  // USAGE TRACKING
  // ============================================================================
  
  trackUsage(request: AIGenerationRequest, response: AIGenerationResponse): void {
    // Update total metrics
    this.usageMetrics.totalRequests++;
    this.usageMetrics.totalTokens += response.metadata.tokensUsed;
    this.usageMetrics.totalCost += response.metadata.cost;
    
    if (response.success) {
      this.usageMetrics.successfulRequests++;
    } else {
      this.usageMetrics.failedRequests++;
    }
    
    // Update averages
    this.usageMetrics.averageResponseTime = (
      this.usageMetrics.averageResponseTime * (this.usageMetrics.totalRequests - 1) + 
      response.metadata.duration
    ) / this.usageMetrics.totalRequests;
    
    this.usageMetrics.averageCost = this.usageMetrics.totalCost / this.usageMetrics.totalRequests;
    this.usageMetrics.averageTokens = this.usageMetrics.totalTokens / this.usageMetrics.totalRequests;
    
    // Update daily usage
    this.updateDailyUsage(request, response);
    
    // Update monthly usage
    this.updateMonthlyUsage(request, response);
    
    // Update model usage
    this.updateModelUsage(request, response);
    
    // Update content type usage
    this.updateContentTypeUsage(request, response);
    
    // Check for alerts
    this.checkForAlerts();
    
    // Generate recommendations
    this.generateRecommendations();
  }
  
  private updateDailyUsage(request: AIGenerationRequest, response: AIGenerationResponse): void {
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    
    let todayUsage = this.usageMetrics.dailyUsage.find(d => d.date === today);
    
    if (!todayUsage) {
      todayUsage = {
        date: today,
        requests: 0,
        tokens: 0,
        cost: 0,
        successRate: 0,
        averageResponseTime: 0,
        peakHour: currentHour,
        modelBreakdown: {}
      };
      this.usageMetrics.dailyUsage.push(todayUsage);
    }
    
    todayUsage.requests++;
    todayUsage.tokens += response.metadata.tokensUsed;
    todayUsage.cost += response.metadata.cost;
    todayUsage.successRate = (todayUsage.successRate * (todayUsage.requests - 1) + (response.success ? 1 : 0)) / todayUsage.requests;
    todayUsage.averageResponseTime = (todayUsage.averageResponseTime * (todayUsage.requests - 1) + response.metadata.duration) / todayUsage.requests;
    
    // Update model breakdown
    const model = response.metadata.model;
    if (!todayUsage.modelBreakdown[model]) {
      todayUsage.modelBreakdown[model] = { requests: 0, cost: 0 };
    }
    todayUsage.modelBreakdown[model].requests++;
    todayUsage.modelBreakdown[model].cost += response.metadata.cost;
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.usageMetrics.dailyUsage = this.usageMetrics.dailyUsage.filter(
      d => new Date(d.date) >= thirtyDaysAgo
    );
  }
  
  private updateMonthlyUsage(request: AIGenerationRequest, response: AIGenerationResponse): void {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentDay = new Date().getDate();
    
    let monthUsage = this.usageMetrics.monthlyUsage.find(m => m.month === currentMonth);
    
    if (!monthUsage) {
      monthUsage = {
        month: currentMonth,
        requests: 0,
        tokens: 0,
        cost: 0,
        successRate: 0,
        averageResponseTime: 0,
        peakDay: currentDay,
        costTrend: 'stable'
      };
      this.usageMetrics.monthlyUsage.push(monthUsage);
    }
    
    monthUsage.requests++;
    monthUsage.tokens += response.metadata.tokensUsed;
    monthUsage.cost += response.metadata.cost;
    monthUsage.successRate = (monthUsage.successRate * (monthUsage.requests - 1) + (response.success ? 1 : 0)) / monthUsage.requests;
    monthUsage.averageResponseTime = (monthUsage.averageResponseTime * (monthUsage.requests - 1) + response.metadata.duration) / monthUsage.requests;
    
    // Calculate cost trend
    if (this.usageMetrics.monthlyUsage.length > 1) {
      const previousMonth = this.usageMetrics.monthlyUsage[this.usageMetrics.monthlyUsage.length - 2];
      const costChange = (monthUsage.cost - previousMonth.cost) / previousMonth.cost;
      
      if (costChange > 0.1) monthUsage.costTrend = 'increasing';
      else if (costChange < -0.1) monthUsage.costTrend = 'decreasing';
      else monthUsage.costTrend = 'stable';
    }
    
    // Keep only last 12 months
    this.usageMetrics.monthlyUsage = this.usageMetrics.monthlyUsage.slice(-12);
  }
  
  private updateModelUsage(request: AIGenerationRequest, response: AIGenerationResponse): void {
    const model = response.metadata.model;
    
    if (!this.usageMetrics.modelUsage[model]) {
      this.usageMetrics.modelUsage[model] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        successRate: 0,
        averageResponseTime: 0,
        averageQualityScore: 0,
        lastUsed: new Date()
      };
    }
    
    const modelStats = this.usageMetrics.modelUsage[model];
    modelStats.requests++;
    modelStats.tokens += response.metadata.tokensUsed;
    modelStats.cost += response.metadata.cost;
    modelStats.successRate = (modelStats.successRate * (modelStats.requests - 1) + (response.success ? 1 : 0)) / modelStats.requests;
    modelStats.averageResponseTime = (modelStats.averageResponseTime * (modelStats.requests - 1) + response.metadata.duration) / modelStats.requests;
    modelStats.lastUsed = new Date();
  }
  
  private updateContentTypeUsage(request: AIGenerationRequest, response: AIGenerationResponse): void {
    const contentType = request.type;
    
    if (!this.usageMetrics.contentTypeUsage[contentType]) {
      this.usageMetrics.contentTypeUsage[contentType] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        successRate: 0,
        averageComplexity: 'moderate',
        averageQualityScore: 0
      };
    }
    
    const typeStats = this.usageMetrics.contentTypeUsage[contentType];
    typeStats.requests++;
    typeStats.tokens += response.metadata.tokensUsed;
    typeStats.cost += response.metadata.cost;
    typeStats.successRate = (typeStats.successRate * (typeStats.requests - 1) + (response.success ? 1 : 0)) / typeStats.requests;
  }
  
  // ============================================================================
  // ALERTS & RECOMMENDATIONS
  // ============================================================================
  
  private checkForAlerts(): void {
    const budgetUsed = this.getBudgetUsagePercentage();
    
    // Budget threshold alert
    if (budgetUsed > this.settings.budgetAlertThreshold) {
      this.addAlert({
        type: 'budget_threshold',
        severity: budgetUsed > 95 ? 'critical' : 'warning',
        message: `Monthly budget ${budgetUsed.toFixed(1)}% used ($${this.getMonthlySpend().toFixed(2)} of $${this.limits.monthlyCostLimit})`,
        currentValue: budgetUsed,
        threshold: this.settings.budgetAlertThreshold
      });
    }
    
    // Cost spike detection
    const recentCostTrend = this.detectCostSpike();
    if (recentCostTrend > 50) { // 50% increase
      this.addAlert({
        type: 'cost_spike',
        severity: 'warning',
        message: `Cost spike detected: ${recentCostTrend.toFixed(1)}% increase in recent usage`,
        currentValue: recentCostTrend,
        threshold: 50
      });
    }
  }
  
  private generateRecommendations(): void {
    this.recommendations = [];
    
    // Model optimization recommendations
    const modelEfficiency = this.analyzeModelEfficiency();
    if (modelEfficiency.recommendation) {
      this.recommendations.push(modelEfficiency.recommendation);
    }
    
    // Batch processing recommendation
    if (this.usageMetrics.totalRequests > 100) {
      const avgRequestsPerHour = this.getAverageRequestsPerHour();
      if (avgRequestsPerHour > 10) {
        this.recommendations.push({
          id: 'batch_processing',
          type: 'batch_requests',
          priority: 'medium',
          title: 'Enable Batch Processing',
          description: 'High request volume detected. Batch processing could reduce costs by up to 20%.',
          potentialSavings: this.usageMetrics.totalCost * 0.2,
          implementationEffort: 'medium',
          estimatedImpact: 'Reduce API costs by batching similar requests together'
        });
      }
    }
    
    // Caching recommendation
    const cacheHitPotential = this.analyzeCacheHitPotential();
    if (cacheHitPotential > 0.3) {
      this.recommendations.push({
        id: 'enable_caching',
        type: 'cache_hit',
        priority: 'high',
        title: 'Enable Response Caching',
        description: `${(cacheHitPotential * 100).toFixed(1)}% of requests could benefit from caching.`,
        potentialSavings: this.usageMetrics.totalCost * cacheHitPotential,
        implementationEffort: 'easy',
        estimatedImpact: 'Significant cost reduction for repeated content generation'
      });
    }
  }
  
  private addAlert(alertData: Omit<CostAlert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const alert: CostAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
      ...alertData
    };
    
    // Avoid duplicate alerts
    const existingAlert = this.alerts.find(a => 
      a.type === alert.type && 
      !a.acknowledged && 
      Math.abs(a.timestamp.getTime() - alert.timestamp.getTime()) < 3600000 // 1 hour
    );
    
    if (!existingAlert) {
      this.alerts.push(alert);
      
      // Keep only last 100 alerts
      this.alerts = this.alerts.slice(-100);
    }
  }
  
  // ============================================================================
  // ANALYTICS METHODS
  // ============================================================================
  
  getBudgetUsagePercentage(): number {
    const monthlySpend = this.getMonthlySpend();
    return (monthlySpend / this.limits.monthlyCostLimit) * 100;
  }
  
  getMonthlySpend(): number {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthUsage = this.usageMetrics.monthlyUsage.find(m => m.month === currentMonth);
    return monthUsage ? monthUsage.cost : 0;
  }
  
  getDailySpend(): number {
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = this.usageMetrics.dailyUsage.find(d => d.date === today);
    return todayUsage ? todayUsage.cost : 0;
  }
  
  getEfficiencyScore(): number {
    const successRate = this.usageMetrics.totalRequests > 0 ? 
      this.usageMetrics.successfulRequests / this.usageMetrics.totalRequests : 0;
    
    const costEfficiency = this.usageMetrics.averageCost > 0 ? 
      Math.min(1, 0.01 / this.usageMetrics.averageCost) : 0; // Target: $0.01 per request
    
    return ((successRate * 0.7) + (costEfficiency * 0.3)) * 100;
  }
  
  private detectCostSpike(): number {
    if (this.usageMetrics.dailyUsage.length < 7) return 0;
    
    const recentWeek = this.usageMetrics.dailyUsage.slice(-7);
    const previousWeek = this.usageMetrics.dailyUsage.slice(-14, -7);
    
    if (previousWeek.length === 0) return 0;
    
    const recentAvg = recentWeek.reduce((sum, day) => sum + day.cost, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, day) => sum + day.cost, 0) / previousWeek.length;
    
    if (previousAvg === 0) return 0;
    
    return ((recentAvg - previousAvg) / previousAvg) * 100;
  }
  
  private analyzeModelEfficiency(): { recommendation?: OptimizationRecommendation } {
    const models = Object.entries(this.usageMetrics.modelUsage);
    if (models.length < 2) return {};
    
    // Find most cost-effective model
    const modelEfficiency = models.map(([model, stats]) => ({
      model,
      efficiency: stats.successRate / (stats.cost / stats.requests),
      ...stats
    })).sort((a, b) => b.efficiency - a.efficiency);
    
    const bestModel = modelEfficiency[0];
    const currentMainModel = modelEfficiency.find(m => m.requests === Math.max(...modelEfficiency.map(me => me.requests)));
    
    if (bestModel && currentMainModel && bestModel.model !== currentMainModel.model) {
      const potentialSavings = (currentMainModel.cost / currentMainModel.requests - bestModel.cost / bestModel.requests) * 
                              this.usageMetrics.totalRequests;
      
      if (potentialSavings > 1) { // $1+ savings potential
        return {
          recommendation: {
            id: 'model_optimization',
            type: 'model_switch',
            priority: 'high',
            title: `Switch to ${bestModel.model}`,
            description: `${bestModel.model} shows ${(bestModel.efficiency / currentMainModel.efficiency * 100 - 100).toFixed(1)}% better cost efficiency`,
            potentialSavings,
            implementationEffort: 'easy',
            estimatedImpact: 'Automatic model selection will optimize costs while maintaining quality'
          }
        };
      }
    }
    
    return {};
  }
  
  private getAverageRequestsPerHour(): number {
    if (this.usageMetrics.dailyUsage.length === 0) return 0;
    
    const totalRequests = this.usageMetrics.dailyUsage.reduce((sum, day) => sum + day.requests, 0);
    const totalDays = this.usageMetrics.dailyUsage.length;
    
    return (totalRequests / totalDays) / 24; // requests per hour
  }
  
  private analyzeCacheHitPotential(): number {
    // Simplified analysis - in reality would look at request similarity
    const contentTypes = Object.values(this.usageMetrics.contentTypeUsage);
    if (contentTypes.length === 0) return 0;
    
    // Estimate based on repeated patterns
    const totalRequests = contentTypes.reduce((sum, type) => sum + type.requests, 0);
    const averageRequestsPerType = totalRequests / contentTypes.length;
    
    // If we have many requests per content type, caching could help
    return Math.min(0.5, averageRequestsPerType / 50); // Max 50% cache hit potential
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  getUsageMetrics(): UsageMetrics {
    return { ...this.usageMetrics };
  }
  
  getAlerts(): CostAlert[] {
    return [...this.alerts];
  }
  
  getRecommendations(): OptimizationRecommendation[] {
    return [...this.recommendations];
  }
  
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }
  
  updateSettings(newSettings: Partial<CostOptimizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
  
  updateLimits(newLimits: Partial<UsageLimits>): void {
    this.limits = { ...this.limits, ...newLimits };
  }
  
  exportMetrics(): string {
    return JSON.stringify({
      usageMetrics: this.usageMetrics,
      settings: this.settings,
      limits: this.limits,
      alerts: this.alerts.filter(a => !a.acknowledged),
      recommendations: this.recommendations,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  reset(): void {
    this.initializeMetrics();
    this.alerts = [];
    this.recommendations = [];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CostOptimizer;
