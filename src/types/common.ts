export interface Coordinates {
  lat: number;
  lon: number;
}

export type WindyModel = 
  | 'gfs'           // Global Forecast System
  | 'ecmwf'         // European Centre
  | 'iconEu'        // ICON Europe
  | 'namConus'      // NAM CONUS
  | 'namHawaii'     // NAM Hawaii
  | 'namAlaska';    // NAM Alaska

export type WeatherParameter =
  | 'wind'
  | 'windGust'
  | 'temp'
  | 'dewpoint'
  | 'rh'            // Relative humidity
  | 'pressure'
  | 'clouds'
  | 'precip'
  | 'waves'
  | 'swell1'
  | 'swell2';
