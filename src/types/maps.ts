import { Coordinates } from './common';

export type MapLayer = 
  | 'wind'
  | 'gust'
  | 'rain'
  | 'temp'
  | 'pressure'
  | 'clouds'
  | 'waves'
  | 'swell';

export interface MapLinkParams extends Coordinates {
  zoom?: number;            // 3-17 (default: 10)
  layer?: MapLayer;         // Default: 'wind'
  timestamp?: Date;         // Specific forecast time
  menu?: boolean;           // Show menu (default: true)
}
