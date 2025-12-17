export const mockPointForecastResponse = {
  ts: [
    1702800000000,
    1702803600000,
    1702807200000,
  ],
  units: {
    temp: '°C',
    'wind_u-surface': 'm/s',
    'wind_v-surface': 'm/s',
    precip: 'mm',
  },
  'wind_u-surface': [5.2, 6.1, 4.8],
  'wind_v-surface': [3.4, 4.2, 3.9],
  temp: [15.5, 16.2, 15.8],
  precip: [0, 0.2, 0.5],
};

export const mockWebcamsResponse = {
  webcams: [
    {
      id: 'webcam-001',
      title: 'Beach View Camera',
      url: 'https://example.com/webcam/001',
      thumbnail: 'https://example.com/webcam/001/thumb.jpg',
      location: {
        lat: 45.5,
        lon: -122.6,
        city: 'Portland',
        country: 'USA',
      },
      lastUpdated: '2023-12-17T12:00:00Z',
      status: 'active',
    },
    {
      id: 'webcam-002',
      title: 'Harbor Camera',
      url: 'https://example.com/webcam/002',
      thumbnail: 'https://example.com/webcam/002/thumb.jpg',
      location: {
        lat: 45.52,
        lon: -122.58,
        city: 'Portland',
        country: 'USA',
      },
      lastUpdated: '2023-12-17T11:55:00Z',
      status: 'active',
    },
  ],
};
