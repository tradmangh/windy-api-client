import { Coordinates } from './common';

export interface WebcamParams extends Coordinates {
  radius?: number;          // Search radius in km (default: 50)
  limit?: number;           // Max results (default: 10)
}

export interface Webcam {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  location: Coordinates & {
    city?: string;
    country?: string;
  };
  lastUpdated: Date;
  status: 'active' | 'inactive';
}
