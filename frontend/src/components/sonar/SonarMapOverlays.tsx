/** Decorative sonar HUD — sits behind the MapLibre canvas (lower z-index). */
export function SonarMapOverlays(): JSX.Element {
  return (
    <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 topo-bg opacity-[0.12]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="sonar-hud-radar relative w-[min(90vw,520px)] h-[min(90vw,520px)]">
          <span className="sonar-hud-ring absolute inset-[15%] rounded-full border border-secondary-container/15" />
          <span className="sonar-hud-ring absolute inset-[30%] rounded-full border border-secondary-container/20" />
          <span className="sonar-hud-ring absolute inset-[45%] rounded-full border border-secondary-container/25" />
          <div className="sonar-hud-sweep absolute inset-0">
            <span className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left -translate-y-1/2 bg-gradient-to-r from-secondary-container to-transparent shadow-[0_0_12px_rgba(0,244,254,0.5)]" />
          </div>
          <span className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-container shadow-[0_0_10px_rgba(0,244,254,0.8)]" />
        </div>
      </div>
    </div>
  );
}
