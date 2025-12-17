# @tradmangh/windy-api-client

[![npm version](https://img.shields.io/npm/v/@tradmangh/windy-api-client.svg)](https://www.npmjs.com/package/@tradmangh/windy-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A TypeScript client for the [Windy.com](https://windy.com) Point Forecast API. Get weather forecasts, find webcams, and generate map links with a clean, type-safe interface.

## Features

- 🌍 **Point Forecast API** - Get detailed weather forecasts for any location
- 📹 **Webcams API** - Find webcams near a location
- 🗺️ **Map Link Generator** - Create Windy.com map URLs (no API call required)
- 💾 **Pluggable Caching** - Built-in cache interface with in-memory implementation
- 🔒 **Rate Limiting** - Automatic rate limit tracking to prevent quota exhaustion
- 📦 **Zero Dependencies** - Uses native fetch (Node.js 18+)
- 🎯 **Full TypeScript Support** - Complete type definitions for all APIs
- 🌲 **Tree-shakeable** - Import only what you need
- 📚 **Dual Format** - ESM and CommonJS support

## Installation

```bash
# npm
npm install @tradmangh/windy-api-client

# pnpm
pnpm add @tradmangh/windy-api-client

# yarn
yarn add @tradmangh/windy-api-client
```

## Quick Start

```typescript
import { WindyClient } from '@tradmangh/windy-api-client';

// Initialize the client
const client = new WindyClient({
  apiKey: 'your-api-key-here',
});

// Get weather forecast
const forecast = await client.getPointForecast({
  lat: 45.5,
  lon: -122.6,
  model: 'gfs',
  parameters: ['wind', 'temp', 'precip'],
});

console.log('Temperature:', forecast.temp);
console.log('Wind Speed:', forecast.windSpeed);

// Find nearby webcams
const webcams = await client.getWebcams({
  lat: 45.5,
  lon: -122.6,
  radius: 50, // km
  limit: 10,
});

console.log('Found webcams:', webcams.length);

// Generate a map link (no API call)
const mapUrl = client.generateMapLink({
  lat: 45.5,
  lon: -122.6,
  zoom: 12,
  layer: 'wind',
});

console.log('Map URL:', mapUrl);
```

## API Documentation

### Client Configuration

```typescript
interface WindyClientConfig {
  apiKey: string;              // Required: Your Windy API key
  baseUrl?: string;            // Optional: API base URL (default: 'https://api.windy.com/api')
  cache?: CacheAdapter;        // Optional: Cache implementation
  defaultCacheTtl?: number;    // Optional: Cache TTL in seconds (default: 300)
  rateLimitPerDay?: number;    // Optional: Daily rate limit (default: 1000)
  timeout?: number;            // Optional: Request timeout in ms (default: 10000)
}
```

### Methods

#### `getPointForecast(params: PointForecastParams): Promise<PointForecast>`

Get weather forecast for a specific location.

**Parameters:**
```typescript
interface PointForecastParams {
  lat: number;                    // Latitude (-90 to 90)
  lon: number;                    // Longitude (-180 to 180)
  model?: WindyModel;             // Weather model (default: 'gfs')
  parameters?: WeatherParameter[]; // Data to retrieve
  levels?: string[];              // Pressure levels
}

type WindyModel = 'gfs' | 'ecmwf' | 'iconEu' | 'namConus' | 'namHawaii' | 'namAlaska';

type WeatherParameter = 
  | 'wind' | 'windGust' | 'temp' | 'dewpoint' | 'rh' 
  | 'pressure' | 'clouds' | 'precip' | 'waves' | 'swell1' | 'swell2';
```

**Returns:**
```typescript
interface PointForecast {
  ts: number[];                   // Timestamps (Unix ms)
  units: Record<string, string>;  // Unit definitions
  
  // Weather data (arrays aligned with timestamps)
  'wind_u-surface'?: number[];    // Wind U component
  'wind_v-surface'?: number[];    // Wind V component
  windSpeed?: number[];           // Computed wind speed
  windDirection?: number[];       // Computed wind direction (degrees)
  windGust?: number[];
  temp?: number[];
  dewpoint?: number[];
  rh?: number[];                  // Relative humidity
  pressure?: number[];
  clouds?: number[];
  precip?: number[];
  waves?: number[];
  swell1?: number[];
  swell2?: number[];
}
```

**Example:**
```typescript
const forecast = await client.getPointForecast({
  lat: 45.5231,
  lon: -122.6765,
  model: 'ecmwf',
  parameters: ['wind', 'temp', 'precip', 'clouds'],
});

// Access forecast data
forecast.ts.forEach((timestamp, i) => {
  console.log(new Date(timestamp));
  console.log('Temperature:', forecast.temp?.[i], forecast.units.temp);
  console.log('Wind Speed:', forecast.windSpeed?.[i], 'm/s');
  console.log('Wind Direction:', forecast.windDirection?.[i], '°');
});
```

#### `getWebcams(params: WebcamParams): Promise<Webcam[]>`

Find webcams near a location.

**Parameters:**
```typescript
interface WebcamParams {
  lat: number;      // Latitude
  lon: number;      // Longitude
  radius?: number;  // Search radius in km (default: 50)
  limit?: number;   // Max results (default: 10)
}
```

**Returns:**
```typescript
interface Webcam {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  location: {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
  };
  lastUpdated: Date;
  status: 'active' | 'inactive';
}
```

**Example:**
```typescript
const webcams = await client.getWebcams({
  lat: 45.5231,
  lon: -122.6765,
  radius: 100,
  limit: 5,
});

webcams.forEach(cam => {
  console.log(`${cam.title} (${cam.location.city})`);
  console.log(`URL: ${cam.url}`);
  console.log(`Last updated: ${cam.lastUpdated}`);
});
```

#### `generateMapLink(params: MapLinkParams): string`

Generate a Windy.com map URL. This is a pure function that doesn't make API calls.

**Parameters:**
```typescript
interface MapLinkParams {
  lat: number;
  lon: number;
  zoom?: number;        // 3-17 (default: 10)
  layer?: MapLayer;     // Default: 'wind'
  timestamp?: Date;     // Specific forecast time
  menu?: boolean;       // Show menu (default: true)
}

type MapLayer = 
  | 'wind' | 'gust' | 'rain' | 'temp' 
  | 'pressure' | 'clouds' | 'waves' | 'swell';
```

**Example:**
```typescript
const mapUrl = client.generateMapLink({
  lat: 45.5231,
  lon: -122.6765,
  zoom: 12,
  layer: 'wind',
  timestamp: new Date('2023-12-20T12:00:00Z'),
  menu: true,
});

console.log(mapUrl);
// https://www.windy.com/wind/45.523/-122.677/12?timestamp=2023-12-20T12:00:00.000Z
```

#### `getRemainingQuota(): { remaining: number; resetsAt: Date }`

Check remaining API quota for the current period.

**Example:**
```typescript
const quota = client.getRemainingQuota();
console.log(`Remaining requests: ${quota.remaining}`);
console.log(`Resets at: ${quota.resetsAt}`);
```

## Caching

The client supports pluggable caching to reduce API calls and improve performance.

### In-Memory Cache (Built-in)

```typescript
import { WindyClient, InMemoryCache } from '@tradmangh/windy-api-client';

const cache = new InMemoryCache();
const client = new WindyClient({
  apiKey: 'your-api-key',
  cache,
  defaultCacheTtl: 600, // 10 minutes
});

// Periodically prune expired entries
setInterval(() => cache.prune(), 60000); // Every minute
```

### Custom Cache (e.g., Redis)

```typescript
import { CacheAdapter } from '@tradmangh/windy-api-client';
import Redis from 'ioredis';

class RedisCache implements CacheAdapter {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

const cache = new RedisCache('redis://localhost:6379');
const client = new WindyClient({
  apiKey: 'your-api-key',
  cache,
});
```

## Error Handling

The client provides specific error types for different failure scenarios:

```typescript
import { 
  WindyApiError, 
  RateLimitError, 
  ValidationError, 
  NetworkError 
} from '@tradmangh/windy-api-client';

try {
  const forecast = await client.getPointForecast({
    lat: 45.5,
    lon: -122.6,
  });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
    console.error('Resets at:', error.resetsAt);
  } else if (error instanceof ValidationError) {
    console.error('Invalid parameters:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    console.error('Cause:', error.cause);
  } else if (error instanceof WindyApiError) {
    console.error('API error:', error.message);
    console.error('Status code:', error.statusCode);
  }
}
```

### Error Types

- **`WindyApiError`** - Base error class for all API errors
- **`RateLimitError`** - Rate limit exceeded
- **`ValidationError`** - Invalid parameters
- **`NetworkError`** - Network/connection issues

## TypeScript Support

The package is written in TypeScript and includes comprehensive type definitions:

```typescript
import type {
  WindyClient,
  WindyClientConfig,
  Coordinates,
  WindyModel,
  WeatherParameter,
  PointForecastParams,
  PointForecast,
  WebcamParams,
  Webcam,
  MapLinkParams,
  MapLayer,
  CacheAdapter,
} from '@tradmangh/windy-api-client';
```

## Related Projects

- **[windy.at](https://windy.at)** - Weather portal using this client
- **[Windy MCP Server](https://github.com/tradmangh/at-xpo-windy-mcpserver)** - AI integration using this client

## API Key

To use this client, you need a Windy API key. Get one from:
- [Windy API Documentation](https://api.windy.com/)

## Requirements

- Node.js >= 18.0.0 (uses native fetch)
- TypeScript >= 5.0 (for type definitions)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © Thomas Radman - see [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Support

- 🐛 [Report a bug](https://github.com/tradmangh/windy-api-client/issues)
- 💡 [Request a feature](https://github.com/tradmangh/windy-api-client/issues)
- 📖 [Documentation](https://github.com/tradmangh/windy-api-client#readme)
