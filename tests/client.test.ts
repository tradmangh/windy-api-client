import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WindyClient } from '../src/client';
import { ValidationError, RateLimitError } from '../src/errors';
import { InMemoryCache } from '../src/utils/cache';

describe('WindyClient', () => {
  describe('constructor', () => {
    it('should throw ValidationError if no API key is provided', () => {
      expect(() => new WindyClient({ apiKey: '' })).toThrow(ValidationError);
      expect(() => new WindyClient({ apiKey: '' })).toThrow('API key is required');
    });

    it('should create client with valid API key', () => {
      const client = new WindyClient({ apiKey: 'test-key' });
      expect(client).toBeInstanceOf(WindyClient);
    });

    it('should use default configuration values', () => {
      const client = new WindyClient({ apiKey: 'test-key' });
      expect(client).toBeDefined();
      // Config is private, but we can test behavior
      const quota = client.getRemainingQuota();
      expect(quota.remaining).toBe(1000); // default rate limit
    });

    it('should accept custom configuration', () => {
      const cache = new InMemoryCache();
      const client = new WindyClient({
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.url',
        cache,
        defaultCacheTtl: 600,
        rateLimitPerDay: 500,
        timeout: 5000,
      });
      expect(client).toBeDefined();
      const quota = client.getRemainingQuota();
      expect(quota.remaining).toBe(500); // custom rate limit
    });
  });

  describe('getRemainingQuota', () => {
    it('should return initial quota', () => {
      const client = new WindyClient({ apiKey: 'test-key', rateLimitPerDay: 1000 });
      const quota = client.getRemainingQuota();
      
      expect(quota.remaining).toBe(1000);
      expect(quota.resetsAt).toBeInstanceOf(Date);
      expect(quota.resetsAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should decrease quota after API calls', async () => {
      const client = new WindyClient({ apiKey: 'test-key', rateLimitPerDay: 1000 });
      
      // Mock fetch to avoid actual API calls
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            ts: [],
            units: {},
          }),
        } as Response)
      );

      await client.getPointForecast({ lat: 45.5, lon: -122.6 });
      
      const quota = client.getRemainingQuota();
      expect(quota.remaining).toBe(999);
    });
  });

  describe('generateMapLink', () => {
    it('should generate basic map link', () => {
      const client = new WindyClient({ apiKey: 'test-key' });
      const url = client.generateMapLink({ lat: 45.5, lon: -122.6 });
      
      expect(url).toContain('https://www.windy.com');
      expect(url).toContain('45.500');
      expect(url).toContain('-122.600');
      expect(url).toContain('/wind/');
    });

    it('should respect layer parameter', () => {
      const client = new WindyClient({ apiKey: 'test-key' });
      const url = client.generateMapLink({ lat: 45.5, lon: -122.6, layer: 'temp' });
      
      expect(url).toContain('/temp/');
    });

    it('should respect zoom parameter', () => {
      const client = new WindyClient({ apiKey: 'test-key' });
      const url = client.generateMapLink({ lat: 45.5, lon: -122.6, zoom: 15 });
      
      expect(url).toContain('/15');
    });

    it('should clamp zoom to valid range', () => {
      const client = new WindyClient({ apiKey: 'test-key' });
      
      const url1 = client.generateMapLink({ lat: 45.5, lon: -122.6, zoom: 1 });
      expect(url1).toContain('/3'); // minimum zoom
      
      const url2 = client.generateMapLink({ lat: 45.5, lon: -122.6, zoom: 20 });
      expect(url2).toContain('/17'); // maximum zoom
    });

    it('should add timestamp if provided', () => {
      const client = new WindyClient({ apiKey: 'test-key' });
      const timestamp = new Date('2023-12-17T12:00:00Z');
      const url = client.generateMapLink({ lat: 45.5, lon: -122.6, timestamp });
      
      expect(url).toContain('timestamp=');
      expect(url).toContain('2023-12-17');
    });

    it('should hide menu if menu=false', () => {
      const client = new WindyClient({ apiKey: 'test-key' });
      const url = client.generateMapLink({ lat: 45.5, lon: -122.6, menu: false });
      
      expect(url).toContain('menu=false');
    });
  });

  describe('rate limiting', () => {
    it('should throw RateLimitError when quota exceeded', async () => {
      const client = new WindyClient({ apiKey: 'test-key', rateLimitPerDay: 2 });
      
      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            ts: [],
            units: {},
          }),
        } as Response)
      );

      // Make two requests (should succeed)
      await client.getPointForecast({ lat: 45.5, lon: -122.6 });
      await client.getPointForecast({ lat: 45.5, lon: -122.6 });
      
      // Third request should fail
      await expect(
        client.getPointForecast({ lat: 45.5, lon: -122.6 })
      ).rejects.toThrow(RateLimitError);
    });
  });
});
