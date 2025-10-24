// Mythwright AI Retry Handler - Exponential Backoff & Error Recovery
import type { AIGenerationRequest, AIGenerationResponse } from './index.js';

// ============================================================================
// RETRY CONFIGURATION TYPES
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number; // Random factor to avoid thundering herd
  retryableErrors: string[];
  nonRetryableErrors: string[];
  timeoutMs: number;
}

export interface RetryAttempt {
  attemptNumber: number;
  timestamp: Date;
  delayMs: number;
  error?: string;
  success: boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: RetryAttempt[];
  totalDuration: number;
  finalAttempt: number;
}

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

export class RetryableError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class NonRetryableError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// RETRY HANDLER CLASS
// ============================================================================

export class RetryHandler {
  private config: RetryConfig;
  
  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
      initialDelayMs: parseInt(process.env.AI_INITIAL_DELAY_MS || '1000'),
      maxDelayMs: parseInt(process.env.AI_MAX_DELAY_MS || '30000'),
      backoffMultiplier: parseFloat(process.env.AI_BACKOFF_MULTIPLIER || '2.0'),
      jitterFactor: parseFloat(process.env.AI_JITTER_FACTOR || '0.1'),
      timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '60000'),
      retryableErrors: [
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'EAI_AGAIN',
        'rate_limit_exceeded',
        'server_error',
        'service_unavailable',
        'timeout',
        'network_error',
        'temporary_failure',
        '429', // Too Many Requests
        '500', // Internal Server Error
        '502', // Bad Gateway
        '503', // Service Unavailable
        '504'  // Gateway Timeout
      ],
      nonRetryableErrors: [
        'invalid_api_key',
        'insufficient_quota',
        'model_not_found',
        'invalid_request_error',
        'authentication_error',
        'permission_denied',
        '400', // Bad Request
        '401', // Unauthorized
        '403', // Forbidden
        '404'  // Not Found
      ],
      ...config
    };
  }
  
  // ============================================================================
  // MAIN RETRY LOGIC
  // ============================================================================
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const attempts: RetryAttempt[] = [];
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      const attemptStart = Date.now();
      
      try {
        // Add timeout wrapper
        const result = await this.withTimeout(operation(), this.config.timeoutMs);
        
        // Success!
        attempts.push({
          attemptNumber: attempt,
          timestamp: new Date(attemptStart),
          delayMs: 0,
          success: true
        });
        
        return {
          success: true,
          result,
          attempts,
          totalDuration: Date.now() - startTime,
          finalAttempt: attempt
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Classify error
        const errorClassification = this.classifyError(error);
        
        attempts.push({
          attemptNumber: attempt,
          timestamp: new Date(attemptStart),
          delayMs: 0,
          error: errorMessage,
          success: false
        });
        
        // Log attempt
        console.warn(`🔄 Retry attempt ${attempt}/${this.config.maxRetries + 1} failed${context ? ` (${context})` : ''}: ${errorMessage}`);
        
        // Don't retry non-retryable errors
        if (errorClassification === 'non-retryable') {
          console.error(`❌ Non-retryable error encountered: ${errorMessage}`);
          break;
        }
        
        // Don't delay after the last attempt
        if (attempt <= this.config.maxRetries) {
          const delay = this.calculateDelay(attempt);
          attempts[attempts.length - 1].delayMs = delay;
          
          console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}...`);
          await this.sleep(delay);
        }
      }
    }
    
    // All retries exhausted
    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts,
      totalDuration: Date.now() - startTime,
      finalAttempt: attempts.length
    };
  }
  
  // ============================================================================
  // AI-SPECIFIC RETRY WRAPPER
  // ============================================================================
  
  async executeAIRequest(
    operation: () => Promise<AIGenerationResponse>,
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    const context = `${request.type} generation`;
    
    const result = await this.executeWithRetry(operation, context);
    
    if (result.success && result.result) {
      // Add retry metadata to successful response
      const response = result.result;
      response.metadata = {
        ...response.metadata,
        retryInfo: {
          attempts: result.finalAttempt,
          totalDuration: result.totalDuration,
          hadRetries: result.finalAttempt > 1
        }
      };
      
      return response;
    } else {
      // Return error response with retry information
      return {
        success: false,
        metadata: {
          provider: 'unknown',
          model: 'unknown',
          tokensUsed: 0,
          cost: 0,
          duration: result.totalDuration,
          timestamp: new Date(),
          retryInfo: {
            attempts: result.finalAttempt,
            totalDuration: result.totalDuration,
            hadRetries: result.finalAttempt > 1,
            retryAttempts: result.attempts
          }
        },
        error: {
          code: result.error?.name || 'RETRY_EXHAUSTED',
          message: result.error?.message || 'All retry attempts failed',
          details: {
            attempts: result.attempts,
            maxRetries: this.config.maxRetries
          }
        }
      };
    }
  }
  
  // ============================================================================
  // ERROR CLASSIFICATION
  // ============================================================================
  
  private classifyError(error: unknown): 'retryable' | 'non-retryable' | 'timeout' {
    if (error instanceof TimeoutError) {
      return 'timeout';
    }
    
    const errorString = error instanceof Error ? error.message : String(error);
    const errorCode = this.extractErrorCode(error);
    
    // Check non-retryable errors first (more specific)
    for (const nonRetryablePattern of this.config.nonRetryableErrors) {
      if (errorString.toLowerCase().includes(nonRetryablePattern.toLowerCase()) ||
          errorCode === nonRetryablePattern) {
        return 'non-retryable';
      }
    }
    
    // Check retryable errors
    for (const retryablePattern of this.config.retryableErrors) {
      if (errorString.toLowerCase().includes(retryablePattern.toLowerCase()) ||
          errorCode === retryablePattern) {
        return 'retryable';
      }
    }
    
    // Default: treat unknown errors as retryable (conservative approach)
    return 'retryable';
  }
  
  private extractErrorCode(error: unknown): string | null {
    if (error && typeof error === 'object') {
      const err = error as any;
      
      // Check common error code properties
      if (err.code) return String(err.code);
      if (err.status) return String(err.status);
      if (err.statusCode) return String(err.statusCode);
      if (err.response?.status) return String(err.response.status);
      if (err.response?.statusCode) return String(err.response.statusCode);
    }
    
    return null;
  }
  
  // ============================================================================
  // DELAY CALCULATION
  // ============================================================================
  
  private calculateDelay(attemptNumber: number): number {
    // Exponential backoff: delay = initialDelay * (multiplier ^ (attempt - 1))
    let delay = this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, attemptNumber - 1);
    
    // Apply maximum delay cap
    delay = Math.min(delay, this.config.maxDelayMs);
    
    // Add jitter to avoid thundering herd problem
    const jitter = delay * this.config.jitterFactor * (Math.random() * 2 - 1); // ±jitterFactor
    delay = Math.max(0, delay + jitter);
    
    return Math.round(delay);
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`, timeoutMs));
      }, timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }
  
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================
  
  updateConfig(newConfig: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  getConfig(): RetryConfig {
    return { ...this.config };
  }
  
  // ============================================================================
  // ANALYTICS & MONITORING
  // ============================================================================
  
  analyzeRetryPattern(attempts: RetryAttempt[]): {
    totalAttempts: number;
    successRate: number;
    averageDelayMs: number;
    totalDelayMs: number;
    errorPattern: string[];
    recommendation: string;
  } {
    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => a.success).length;
    const successRate = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;
    
    const delays = attempts.filter(a => a.delayMs > 0).map(a => a.delayMs);
    const averageDelayMs = delays.length > 0 ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length : 0;
    const totalDelayMs = delays.reduce((sum, delay) => sum + delay, 0);
    
    const errorPattern = attempts
      .filter(a => !a.success && a.error)
      .map(a => a.error!)
      .reduce((pattern: string[], error) => {
        const errorType = this.categorizeError(error);
        if (!pattern.includes(errorType)) {
          pattern.push(errorType);
        }
        return pattern;
      }, []);
    
    let recommendation = 'Normal operation';
    
    if (successRate < 0.5) {
      recommendation = 'High failure rate detected. Consider investigating underlying issues.';
    } else if (averageDelayMs > this.config.maxDelayMs * 0.8) {
      recommendation = 'Long delays detected. Consider increasing maxDelayMs or reducing backoffMultiplier.';
    } else if (errorPattern.includes('rate_limit')) {
      recommendation = 'Rate limiting detected. Consider implementing request queuing or reducing request frequency.';
    } else if (errorPattern.includes('timeout')) {
      recommendation = 'Timeouts detected. Consider increasing timeout values or optimizing requests.';
    }
    
    return {
      totalAttempts,
      successRate,
      averageDelayMs,
      totalDelayMs,
      errorPattern,
      recommendation
    };
  }
  
  private categorizeError(error: string): string {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('rate') || errorLower.includes('429')) return 'rate_limit';
    if (errorLower.includes('timeout') || errorLower.includes('504')) return 'timeout';
    if (errorLower.includes('network') || errorLower.includes('connection')) return 'network';
    if (errorLower.includes('server') || errorLower.includes('5')) return 'server_error';
    if (errorLower.includes('auth') || errorLower.includes('401')) return 'authentication';
    if (errorLower.includes('quota') || errorLower.includes('limit')) return 'quota';
    
    return 'unknown';
  }
  
  // ============================================================================
  // CIRCUIT BREAKER PATTERN (ADVANCED)
  // ============================================================================
  
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly circuitBreakerThreshold = 5; // failures before opening
  private readonly circuitBreakerTimeout = 60000; // 1 minute
  
  private shouldCircuitBreakerAllow(): boolean {
    const now = Date.now();
    
    switch (this.circuitBreakerState) {
      case 'closed':
        return true;
        
      case 'open':
        if (now - this.lastFailureTime > this.circuitBreakerTimeout) {
          this.circuitBreakerState = 'half-open';
          return true;
        }
        return false;
        
      case 'half-open':
        return true;
        
      default:
        return true;
    }
  }
  
  private recordCircuitBreakerResult(success: boolean): void {
    if (success) {
      this.failureCount = 0;
      this.circuitBreakerState = 'closed';
    } else {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= this.circuitBreakerThreshold) {
        this.circuitBreakerState = 'open';
        console.warn(`🔴 Circuit breaker opened after ${this.failureCount} failures`);
      }
    }
  }
  
  getCircuitBreakerStatus(): {
    state: string;
    failureCount: number;
    lastFailureTime: number;
    nextAllowedTime?: number;
  } {
    return {
      state: this.circuitBreakerState,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAllowedTime: this.circuitBreakerState === 'open' 
        ? this.lastFailureTime + this.circuitBreakerTimeout 
        : undefined
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default RetryHandler;
