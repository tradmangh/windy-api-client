import { WebcamParams, Webcam } from '../types/webcam';
import { WindyApiError, NetworkError } from '../errors';
import { CacheAdapter } from '../utils/cache';

interface WebcamApiResponse {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  location?: {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
  };
  lat?: number;
  lon?: number;
  lastUpdated?: string;
  updated?: string;
  status?: 'active' | 'inactive';
}

export async function getWebcams(
  params: WebcamParams,
  apiKey: string,
  baseUrl: string,
  cache?: CacheAdapter,
  cacheTtl?: number,
  timeout?: number
): Promise<Webcam[]> {
  // Validate coordinates
  if (params.lat < -90 || params.lat > 90) {
    throw new WindyApiError('Latitude must be between -90 and 90');
  }
  if (params.lon < -180 || params.lon > 180) {
    throw new WindyApiError('Longitude must be between -180 and 180');
  }

  const radius = params.radius || 50;
  const limit = params.limit || 10;

  // Generate cache key
  const cacheKey = `webcams:${params.lat}:${params.lon}:${radius}:${limit}`;

  // Check cache if available
  if (cache) {
    const cached = await cache.get<Webcam[]>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Prepare request body
  const requestBody = {
    lat: params.lat,
    lon: params.lon,
    radius,
    limit,
    key: apiKey,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 10000);

    const response = await fetch(`${baseUrl}/webcams/v2`, {
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

    const data = await response.json() as { webcams?: WebcamApiResponse[] };

    // Transform the response to match our Webcam interface
    const webcams: Webcam[] = (data.webcams || []).map((item: WebcamApiResponse) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      thumbnailUrl: item.thumbnail || item.thumbnailUrl || '',
      location: {
        lat: item.location?.lat ?? item.lat ?? 0,
        lon: item.location?.lon ?? item.lon ?? 0,
        city: item.location?.city,
        country: item.location?.country,
      },
      lastUpdated: new Date(item.lastUpdated || item.updated || Date.now()),
      status: item.status || 'active',
    }));

    // Cache the result
    if (cache && cacheTtl) {
      await cache.set(cacheKey, webcams, cacheTtl);
    }

    return webcams;
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
