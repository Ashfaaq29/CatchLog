export function formatRelative(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const diffMs = Date.now() - date.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec.toString().padStart(2, '0')}S AGO`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min.toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}M AGO`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}H AGO`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}D AGO`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}W AGO`;
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' }).toUpperCase();
}

export function formatDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatLongDate(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeight(kg?: number | null): string {
  if (kg === undefined || kg === null) return '—';
  return `${kg.toFixed(1)} KG`;
}

export function formatLength(cm?: number | null): string {
  if (cm === undefined || cm === null) return '—';
  return `${cm.toFixed(0)} CM`;
}

export function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const SECTOR_PREFIXES = ['SECTOR', 'BAY', 'CHANNEL', 'REEF', 'SHORE'];
export function locationToSector(location: string): string {
  const cleaned = location.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (!cleaned) return 'SECTOR_00';
  const stableHash = Array.from(cleaned).reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) >>> 0, 5381);
  const prefix = SECTOR_PREFIXES[stableHash % SECTOR_PREFIXES.length];
  const num = (stableHash % 99) + 1;
  return `${prefix}_${num.toString().padStart(2, '0')}`;
}

export function sectorTagFor(seed: string): string {
  const hash = Array.from(seed).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const num = (hash % 12) + 1;
  return `SECTOR_${num.toString().padStart(2, '0')}`;
}
