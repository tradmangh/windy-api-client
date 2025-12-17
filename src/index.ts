// Main exports
export { WindyClient, type WindyClientConfig } from './client';

// Types
export type {
  Coordinates,
  WindyModel,
  WeatherParameter,
  PointForecastParams,
  PointForecast,
  WebcamParams,
  Webcam,
  MapLinkParams,
  MapLayer,
} from './types';

// Errors
export {
  WindyApiError,
  RateLimitError,
  ValidationError,
  NetworkError,
} from './errors';

// Utilities
export { type CacheAdapter, InMemoryCache } from './utils/cache';
