import { PointForecastParams, PointForecast } from '../types/forecast';
import { WindyApiError, NetworkError } from '../errors';
import { CacheAdapter } from '../utils/cache';

export async function getPointForecast(
  params: PointForecastParams,
  apiKey: string,
  baseUrl: string,
  cache?: CacheAdapter,
  cacheTtl?: number,
  timeout?: number
): Promise<PointForecast> {
  // Validate coordinates
  if (params.lat < -90 || params.lat > 90) {
    throw new WindyApiError('Latitude must be between -90 and 90');
  }
  if (params.lon < -180 || params.lon > 180) {
    throw new WindyApiError('Longitude must be between -180 and 180');
  }

  // Generate cache key
  const cacheKey = `forecast:${params.lat}:${params.lon}:${params.model || 'gfs'}`;

  // Check cache if available
  if (cache) {
    const cached = await cache.get<PointForecast>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Prepare request body
  const requestBody = {
    lat: params.lat,
    lon: params.lon,
    model: params.model || 'gfs',
    parameters: params.parameters || ['wind', 'temp', 'precip'],
    levels: params.levels || ['surface'],
    key: apiKey,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 10000);

    const response = await fetch(`${baseUrl}/point-forecast/v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new WindyApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        errorText
      );
    }

    const data = await response.json();

    // Compute wind speed and direction from u,v components
    if (data['wind_u-surface'] && data['wind_v-surface']) {
      data.windSpeed = data['wind_u-surface'].map((u: number, i: number) => {
        const v = data['wind_v-surface'][i];
        return Math.sqrt(u * u + v * v);
      });

      data.windDirection = data['wind_u-surface'].map((u: number, i: number) => {
        const v = data['wind_v-surface'][i];
        let direction = (Math.atan2(u, v) * 180) / Math.PI;
        if (direction < 0) direction += 360;
        return direction;
      });
    }

    // Cache the result
    if (cache && cacheTtl) {
      await cache.set(cacheKey, data, cacheTtl);
    }

    return data;
  } catch (error) {
    if (error instanceof WindyApiError) {
      throw error;
    }
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout', error);
      }
      throw new NetworkError(`Network request failed: ${error.message}`, error);
    }
    throw new NetworkError('Unknown error occurred');
  }
}
