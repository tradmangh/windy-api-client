import { MapLinkParams } from '../types/maps';

/**
 * Generate a Windy.com map URL (no API call required)
 * Pure function implementation
 */
export function generateMapLink(params: MapLinkParams): string {
  const zoom = params.zoom !== undefined ? Math.max(3, Math.min(17, params.zoom)) : 10;
  const layer = params.layer || 'wind';
  const showMenu = params.menu !== undefined ? params.menu : true;

  // Base URL
  let url = `https://www.windy.com/${layer}`;

  // Add coordinates and zoom
  url += `/${params.lat.toFixed(3)}/${params.lon.toFixed(3)}/${zoom}`;

  // Add timestamp if provided
  if (params.timestamp) {
    const timestamp = params.timestamp instanceof Date 
      ? params.timestamp.toISOString() 
      : params.timestamp;
    url += `?timestamp=${encodeURIComponent(timestamp)}`;
  }

  // Add menu parameter
  if (!showMenu) {
    url += (url.includes('?') ? '&' : '?') + 'menu=false';
  }

  return url;
}
