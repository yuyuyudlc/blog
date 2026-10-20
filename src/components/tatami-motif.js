export function TatamiMark({ className = '' }) {
  return (
    <span className={`tatami-mark ${className}`.trim()} aria-hidden="true">
      <span className="tatami-mark-line tatami-mark-line-top"></span>
      <span className="tatami-mark-line tatami-mark-line-right"></span>
      <span className="tatami-mark-line tatami-mark-line-bottom"></span>
      <span className="tatami-mark-line tatami-mark-line-left"></span>
    </span>
  );
}

export function TatamiChip({ label, className = '' }) {
  return (
    <span className={`post-row-category ${className}`.trim()}>
      <span className="tatami-chip-icon" aria-hidden="true"></span>
      {label && <span>{label}</span>}
    </span>
  );
}

export function InfiniteRoom({ layers = 9 }) {
  const rings = Array.from({ length: layers }, (_, index) => {
    const size = Math.round(980 * Math.pow(0.72, index));
    const opacity = Math.max(0.32, Number((1 - index * 0.08).toFixed(2)));
    const borderWidth = Math.max(1, Number((2.5 - index * 0.2).toFixed(2)));
    const rotation = (index * 90) % 360;

    return {
      index,
      size,
      opacity,
      borderWidth,
      rotation,
    };
  });

  return (
    <>
      {rings.map((ring) => (
        <div
          key={ring.index}
          className="infinite-room-ring"
          style={{
            width: `${ring.size}px`,
            opacity: ring.opacity,
            borderWidth: `${ring.borderWidth}px`,
            transform: `rotate(${ring.rotation}deg)`,
          }}
          aria-hidden="true"
        >
          <span className="infinite-room-seam infinite-room-seam-top"></span>
          <span className="infinite-room-seam infinite-room-seam-right"></span>
          <span className="infinite-room-seam infinite-room-seam-bottom"></span>
          <span className="infinite-room-seam infinite-room-seam-left"></span>
        </div>
      ))}
    </>
  );
}
