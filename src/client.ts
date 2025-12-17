import { PointForecastParams, PointForecast } from './types/forecast';
import { WebcamParams, Webcam } from './types/webcam';
import { MapLinkParams } from './types/maps';
import { ValidationError } from './errors';
import { CacheAdapter } from './utils/cache';
import { RateLimiter } from './utils/rate-limiter';
import { getPointForecast } from './endpoints/forecast';
import { getWebcams } from './endpoints/webcams';
import { generateMapLink } from './endpoints/maps';

export interface WindyClientConfig {
  apiKey: string;
  baseUrl?: string;
  cache?: CacheAdapter;
  defaultCacheTtl?: number;        // Default: 300 (5 minutes)
  rateLimitPerDay?: number;        // Default: 1000 (free tier)
  timeout?: number;                // Default: 10000ms
}

export class WindyClient {
  private readonly config: Required<Omit<WindyClientConfig, 'cache'>> & { cache?: CacheAdapter };
  private readonly rateLimiter: RateLimiter;

  constructor(config: WindyClientConfig) {
    if (!config.apiKey) {
      throw new ValidationError('API key is required');
    }

    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.windy.com/api',
      defaultCacheTtl: config.defaultCacheTtl ?? 300,
      rateLimitPerDay: config.rateLimitPerDay ?? 1000,
      timeout: config.timeout ?? 10000,
      cache: config.cache,
    };

    this.rateLimiter = new RateLimiter(this.config.rateLimitPerDay);
  }

  /**
   * Get point forecast for specific coordinates
   */
  async getPointForecast(params: PointForecastParams): Promise<PointForecast> {
    this.rateLimiter.checkLimit();
    return getPointForecast(
      params,
      this.config.apiKey,
      this.config.baseUrl,
      this.config.cache,
      this.config.defaultCacheTtl,
      this.config.timeout
    );
  }

  /**
   * Find webcams near a location
   */
  async getWebcams(params: WebcamParams): Promise<Webcam[]> {
    this.rateLimiter.checkLimit();
    return getWebcams(
      params,
      this.config.apiKey,
      this.config.baseUrl,
      this.config.cache,
      this.config.defaultCacheTtl,
      this.config.timeout
    );
  }

  /**
   * Generate a Windy.com map URL (no API call required)
   */
  generateMapLink(params: MapLinkParams): string {
    return generateMapLink(params);
  }

  /**
   * Check remaining API quota
   */
  getRemainingQuota(): { remaining: number; resetsAt: Date } {
    return this.rateLimiter.getRemainingQuota();
  }
}
