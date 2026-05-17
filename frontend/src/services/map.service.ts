import { api } from './api';
import type { GeocodeResult, GeocodeSuggestion, SonarMapPayload } from '../types';

export async function getSonarMap(): Promise<SonarMapPayload> {
  const { data } = await api.get<SonarMapPayload>('/map/sonar');
  return data;
}

export async function geocodeMapSearch(q: string): Promise<GeocodeResult> {
  const { data } = await api.get<GeocodeResult>('/map/geocode', { params: { q } });
  return data;
}

export async function geocodeSuggest(q: string): Promise<GeocodeSuggestion[]> {
  const { data } = await api.get<{ results: GeocodeSuggestion[] }>('/map/geocode/suggest', {
    params: { q },
  });
  return data.results;
}
