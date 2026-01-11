# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2023-12-17

### Added
- Initial release of @tradmangh/windy-api-client
- TypeScript client for Windy.com Point Forecast API
- Support for point forecast data retrieval
- Support for webcam search near location
- Map link generator (pure function, no API call)
- Pluggable cache interface with in-memory implementation
- Rate limiting with configurable daily quota
- Comprehensive error handling (WindyApiError, RateLimitError, ValidationError, NetworkError)
- Full TypeScript type definitions
- ESM and CommonJS module formats
- Zero runtime dependencies (uses native fetch)
- Complete test suite with Vitest
- API documentation in README

### Features
- **Point Forecast**: Get weather forecasts for specific coordinates
- **Webcams**: Find webcams near a location
- **Map Links**: Generate Windy.com map URLs
- **Caching**: Optional caching support to reduce API calls
- **Rate Limiting**: Built-in rate limit tracking
- **Type Safety**: Full TypeScript support with comprehensive types

[0.1.0]: https://github.com/tradmangh/windy-api-client/releases/tag/v0.1.0
