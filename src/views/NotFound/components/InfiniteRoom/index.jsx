import './index.css';

/**
 * Nested 4.5-tatami rooms, each a quarter turn from the last — the
 * corridor of identical rooms you fall into in the novel's last episode.
 */
export default function InfiniteRoom({ layers = 9 }) {
  const rings = Array.from({ length: layers }, (_, index) => ({
    index,
    size: Math.round(980 * Math.pow(0.72, index)),
    opacity: Math.max(0.2, Number((0.7 - index * 0.06).toFixed(2))),
    rotation: (index * 90) % 360,
  }));

  return (
    <div className="infinite-room" aria-hidden="true">
      {rings.map((ring) => (
        <div
          key={ring.index}
          className="infinite-room-ring"
          style={{
            width: `${ring.size}px`,
            opacity: ring.opacity,
            transform: `rotate(${ring.rotation}deg)`,
          }}
        >
          <span className="infinite-room-seam infinite-room-seam-top" />
          <span className="infinite-room-seam infinite-room-seam-right" />
          <span className="infinite-room-seam infinite-room-seam-bottom" />
          <span className="infinite-room-seam infinite-room-seam-left" />
        </div>
      ))}
    </div>
  );
}
