import { api } from './api';
import type { WeatherSnapshot } from '../types';

export interface WeatherQuery {
  location?: string;
  tripId?: string;
  lat?: number;
  lon?: number;
}

export async function getWeather(query: WeatherQuery = {}): Promise<WeatherSnapshot> {
  const { data } = await api.get<WeatherSnapshot>('/weather', { params: query });
  return data;
}
