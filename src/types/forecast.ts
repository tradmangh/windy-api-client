import { Coordinates, WindyModel, WeatherParameter } from './common';

export interface PointForecastParams extends Coordinates {
  model?: WindyModel;
  parameters?: WeatherParameter[];
  levels?: string[];              // Pressure levels: '850h', '500h', etc.
}

export interface PointForecast {
  ts: number[];                   // Timestamps
  units: Record<string, string>;  // Unit definitions
  
  // Wind data
  'wind_u-surface'?: number[];    // U component of wind
  'wind_v-surface'?: number[];    // V component of wind
  windGust?: number[];            // Wind gusts
  
  // Temperature
  temp?: number[];
  dewpoint?: number[];
  rh?: number[];                  // Relative humidity
  
  // Pressure & clouds
  pressure?: number[];
  clouds?: number[];
  
  // Precipitation
  precip?: number[];
  
  // Marine (if applicable)
  waves?: number[];
  swell1?: number[];
  swell2?: number[];
  
  // Computed helpers (added by client)
  windSpeed?: number[];           // Computed from u,v components
  windDirection?: number[];       // Computed from u,v components
}
