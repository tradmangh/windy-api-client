import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWebcams } from '../src/endpoints/webcams';
import { WindyApiError, NetworkError } from '../src/errors';
import { InMemoryCache } from '../src/utils/cache';
import { mockWebcamsResponse } from './mocks/responses';

describe('Webcams API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getWebcams', () => {
    it('should validate latitude', async () => {
      await expect(
        getWebcams(
          { lat: 100, lon: 0 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow('Latitude must be between -90 and 90');
    });

    it('should validate longitude', async () => {
      await expect(
        getWebcams(
          { lat: 0, lon: 200 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow('Longitude must be between -180 and 180');
    });

    it('should make API request with correct parameters', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockWebcamsResponse,
        } as Response)
      );
      global.fetch = mockFetch;

      await getWebcams(
        { lat: 45.5, lon: -122.6, radius: 100, limit: 5 },
        'test-key',
        'https://api.windy.com/api'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.windy.com/api/webcams/v2',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.lat).toBe(45.5);
      expect(callBody.lon).toBe(-122.6);
      expect(callBody.radius).toBe(100);
      expect(callBody.limit).toBe(5);
      expect(callBody.key).toBe('test-key');
    });

    it('should use default radius and limit', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockWebcamsResponse,
        } as Response)
      );
      global.fetch = mockFetch;

      await getWebcams(
        { lat: 45.5, lon: -122.6 },
        'test-key',
        'https://api.windy.com/api'
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.radius).toBe(50); // default
      expect(callBody.limit).toBe(10); // default
    });

    it('should transform response to Webcam interface', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockWebcamsResponse,
        } as Response)
      );

      const result = await getWebcams(
        { lat: 45.5, lon: -122.6 },
        'test-key',
        'https://api.windy.com/api'
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'webcam-001',
        title: 'Beach View Camera',
        url: 'https://example.com/webcam/001',
        thumbnailUrl: 'https://example.com/webcam/001/thumb.jpg',
        location: {
          lat: 45.5,
          lon: -122.6,
          city: 'Portland',
          country: 'USA',
        },
        status: 'active',
      });
      expect(result[0].lastUpdated).toBeInstanceOf(Date);
    });

    it('should use cache if available', async () => {
      const cache = new InMemoryCache();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockWebcamsResponse,
        } as Response)
      );
      global.fetch = mockFetch;

      // First call should hit API
      await getWebcams(
        { lat: 45.5, lon: -122.6 },
        'test-key',
        'https://api.windy.com/api',
        cache,
        300
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await getWebcams(
        { lat: 45.5, lon: -122.6 },
        'test-key',
        'https://api.windy.com/api',
        cache,
        300
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: async () => 'Endpoint not found',
        } as Response)
      );

      await expect(
        getWebcams(
          { lat: 45.5, lon: -122.6 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow(WindyApiError);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network failure')));

      await expect(
        getWebcams(
          { lat: 45.5, lon: -122.6 },
          'test-key',
          'https://api.windy.com/api'
        )
      ).rejects.toThrow(NetworkError);
    });
  });
});
