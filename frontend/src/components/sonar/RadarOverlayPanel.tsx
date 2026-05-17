export function RadarOverlayPanel(): JSX.Element {
  return (
    <div className="glass-panel sonar-inner-glow bg-surface-container/60 rounded-lg p-md w-48 pointer-events-auto">
      <h3 className="font-label-caps text-label-caps text-primary mb-md">RADAR_OVERLAY</h3>
      <div className="flex items-center gap-md mb-sm">
        <div className="h-2 w-2 rounded-full bg-secondary-container shadow-[0_0_8px_rgba(0,244,254,1)] animate-pulse" />
        <span className="font-label-caps text-[11px] text-on-surface">TRANSDUCER: OK</span>
      </div>
      <div className="flex items-center gap-md mb-sm">
        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,198,139,1)]" />
        <span className="font-label-caps text-[11px] text-on-surface">CHIRP: ACTIVE</span>
      </div>
      <div className="mt-md pt-md border-t border-outline-variant/30">
        <div className="flex justify-between font-data-sm text-[10px] text-on-surface-variant">
          <span>FREQ</span>
          <span>200 KHZ</span>
        </div>
        <div className="flex justify-between font-data-sm text-[10px] text-on-surface-variant mt-xs">
          <span>GAIN</span>
          <span>82%</span>
        </div>
      </div>
    </div>
  );
}
