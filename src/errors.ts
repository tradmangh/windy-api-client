export class WindyApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = 'WindyApiError';
  }
}

export class RateLimitError extends WindyApiError {
  constructor(
    public readonly remaining: number,
    public readonly resetsAt: Date
  ) {
    super(`Rate limit exceeded. Resets at ${resetsAt.toISOString()}`);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends WindyApiError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends WindyApiError {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}
