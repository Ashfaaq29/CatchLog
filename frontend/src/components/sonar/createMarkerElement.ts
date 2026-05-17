export type SonarMarkerTone = 'cyan' | 'orange';

export function createMarkerElement(tone: SonarMarkerTone): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `sonar-marker sonar-marker-${tone === 'cyan' ? 'cyan' : 'orange'}`;
  return el;
}
