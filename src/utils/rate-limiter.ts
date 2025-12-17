import { RateLimitError } from '../errors';

export class RateLimiter {
  private requestCount: number = 0;
  private requestCountResetTime: number;

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number = 86400000 // 24 hours
  ) {
    this.requestCountResetTime = Date.now() + windowMs;
  }

  checkLimit(): void {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now >= this.requestCountResetTime) {
      this.requestCount = 0;
      this.requestCountResetTime = now + this.windowMs;
    }

    // Check if limit exceeded
    if (this.requestCount >= this.maxRequests) {
      throw new RateLimitError(
        0,
        new Date(this.requestCountResetTime)
      );
    }

    this.requestCount++;
  }

  getRemainingQuota(): { remaining: number; resetsAt: Date } {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now >= this.requestCountResetTime) {
      this.requestCount = 0;
      this.requestCountResetTime = now + this.windowMs;
    }

    return {
      remaining: Math.max(0, this.maxRequests - this.requestCount),
      resetsAt: new Date(this.requestCountResetTime),
    };
  }
}
