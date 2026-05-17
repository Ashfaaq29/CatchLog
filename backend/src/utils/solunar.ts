import SunCalc from 'suncalc';

export interface SolunarDay {
  sunrise: string;
  sunset: string;
  moonPhase: string;
  lunarDay: number;
}

export function moonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'NEW';
  if (phase < 0.22) return 'WAXING_CRESCENT';
  if (phase < 0.28) return 'FIRST_QUARTER';
  if (phase < 0.47) return 'WAXING_GIBBOUS';
  if (phase < 0.53) return 'FULL';
  if (phase < 0.72) return 'WANING_GIBBOUS';
  if (phase < 0.78) return 'LAST_QUARTER';
  return 'WANING_CRESCENT';
}

function formatTimeLocal(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function getSolunarForDate(lat: number, lon: number, when: Date): SolunarDay {
  const times = SunCalc.getTimes(when, lat, lon);
  const illum = SunCalc.getMoonIllumination(when);
  const lunarDay = Math.min(30, Math.max(1, Math.floor(illum.phase * 29.53) + 1));
  return {
    sunrise: formatTimeLocal(times.sunrise),
    sunset: formatTimeLocal(times.sunset),
    moonPhase: moonPhaseName(illum.phase),
    lunarDay,
  };
}

/** Major feeding windows: within 2h of sunrise or sunset. */
export function isSolunarWindow(when: Date, lat: number, lon: number): boolean {
  const times = SunCalc.getTimes(when, lat, lon);
  const windowMs = 2 * 60 * 60 * 1000;
  const t = when.getTime();
  return (
    Math.abs(times.sunrise.getTime() - t) <= windowMs ||
    Math.abs(times.sunset.getTime() - t) <= windowMs
  );
}
