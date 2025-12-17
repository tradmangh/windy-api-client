import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPointForecast } from '../src/endpoints/forecast';
import { WindyApiError, NetworkError } from '../src/errors';
import { InMemoryCache } from '../src/utils/cache';
import { mockPointForecastResponse } from './mocks/responses';

describe('Point Forecast API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPointForecast', () => {
    it('should validate latitude', async () => {
      await expect(
        getPointForecast(
          { lat: 100, lon: 0 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow('Latitude must be between -90 and 90');

      await expect(
        getPointForecast(
          { lat: -100, lon: 0 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow('Latitude must be between -90 and 90');
    });

    it('should validate longitude', async () => {
      await expect(
        getPointForecast(
          { lat: 0, lon: 200 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow('Longitude must be between -180 and 180');

      await expect(
        getPointForecast(
          { lat: 0, lon: -200 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow('Longitude must be between -180 and 180');
    });

    it('should make API request with correct parameters', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockPointForecastResponse,
        } as Response)
      );
      global.fetch = mockFetch;

      await getPointForecast(
        { lat: 45.5, lon: -122.6, model: 'ecmwf' },
        'test-key',
        'https://api.windy.com/api'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.windy.com/api/point-forecast/v2',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"lat":45.5'),
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.lat).toBe(45.5);
      expect(callBody.lon).toBe(-122.6);
      expect(callBody.model).toBe('ecmwf');
      expect(callBody.key).toBe('test-key');
    });

    it('should compute wind speed and direction from u,v components', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockPointForecastResponse,
        } as Response)
      );

      const result = await getPointForecast(
        { lat: 45.5, lon: -122.6 },
        'test-key',
        'https://api.windy.com/api'
      );

      expect(result.windSpeed).toBeDefined();
      expect(result.windDirection).toBeDefined();
      expect(result.windSpeed?.length).toBe(3);
      expect(result.windDirection?.length).toBe(3);
      
      // Check first value computation
      const u = mockPointForecastResponse['wind_u-surface'][0];
      const v = mockPointForecastResponse['wind_v-surface'][0];
      const expectedSpeed = Math.sqrt(u * u + v * v);
      expect(result.windSpeed?.[0]).toBeCloseTo(expectedSpeed, 2);
    });

    it('should use cache if available', async () => {
      const cache = new InMemoryCache();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockPointForecastResponse,
        } as Response)
      );
      global.fetch = mockFetch;

      // First call should hit API
      await getPointForecast(
        { lat: 45.5, lon: -122.6 },
        'test-key',
        'https://api.windy.com/api',
        cache,
        300
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await getPointForecast(
        { lat: 45.5, lon: -122.6 },
        'test-key',
        'https://api.windy.com/api',
        cache,
        300
      );
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should handle API errors', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => 'Invalid API key',
        } as Response)
      );

      await expect(
        getPointForecast(
          { lat: 45.5, lon: -122.6 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow(WindyApiError);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network failure')));

      await expect(
        getPointForecast(
          { lat: 45.5, lon: -122.6 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow(NetworkError);
    });

    it('should handle timeout', async () => {
      global.fetch = vi.fn(
        (_url, options) =>
          new Promise((resolve, reject) => {
            const signal = options?.signal as AbortSignal;
            if (signal) {
              signal.addEventListener('abort', () => {
                reject(new Error('The operation was aborted'));
              });
            }
            // Never resolve to simulate long request
          })
      );

      await expect(
        getPointForecast(
          { lat: 45.5, lon: -122.6 },
          'test-key',
          'https://api.windy.com/api',
          undefined,
          undefined,
          100 // 100ms timeout
        )
      ).rejects.toThrow(NetworkError);
    });
  });
});
